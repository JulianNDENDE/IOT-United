const express = require('express');
const axios = require("axios");
const bodyParser = require("body-parser");
const { createClient } = require('@supabase/supabase-js');
const mqtt = require('mqtt'); // For MQTT integration
const fs = require('fs'); // to read certificates
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MQTT broker details
const mqttOptions = {
  host: process.env.MQTT_BROKER_HOST, 
  port: 8883,
  protocol: 'mqtts',
  key: fs.readFileSync('./certs/mosq_client.key'),
  cert: fs.readFileSync('./certs/mosq_client.crt'),
  ca: fs.readFileSync('./certs/mosq_ca.crt'),
  rejectUnauthorized: false,
  clientId: "server",
};
const mqttClient = mqtt.connect(mqttOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// MQTT connection setup
mqttClient.on('connect', async () => {
  console.log('Connected to MQTT broker');

  // Fetch initial devices and subscribe
  await subscribeToExistingDevices();

  // Set up Supabase Realtime subscription to listen for new devices
  supabase
    .channel('public:chip_parameter') // Channel for listening to chip table
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chip_parameter' }, (payload) => {
      const newDevice = payload.new;
      const topic = `device: ${newDevice.chip_id}`;
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}`, err);
        } else {
          console.log(`Subscribed to new device topic ${topic}`);
        }
      });
    })
    .subscribe();

  // Start publishing periodic messages to each device's topic
  setInterval(publishToAllDevices, 1 * 10 * 1000); // 5 minutes interval
});

// Function to subscribe to existing devices
async function subscribeToExistingDevices() {
  const { data: devices, error } = await supabase
    .from('chip_parameter')
    .select('chip_id');

  if (error) {
    console.error('Error fetching devices from DB:', error);
    return;
  }

  // Subscribe to topics based on chip_ids
  devices.forEach((device) => {
    const topic = `device: ${device.chip_id}`;
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}`, err);
      } else {
        console.log(`Subscribed to topic ${topic}`);
      }
    });
  });
}

async function publishToRoomDevices() {
  const { data: roomChips, error: roomError } = await supabase
    .from('chip_parameter')
    .select('chip_id')
    .eq('category', 'room'); // Filtering for category 'room'

  if (roomError) {
    console.error('Error fetching room chips from DB:', roomError);
    return;
  }

  for (const chip of roomChips) {
    const chipId = chip.chip_id;
    // Fetch sensor data from `sensor_temps`
    const { data: sensorData, error: sensorError } = await supabase
      .from('sensor_temps')
      .select('temperature, humidity')
      .eq('chip_id', chipId)
      .single(); // Expecting a single row for each chip_id in sensor_temps

    if (sensorError) {
      console.error(`Error fetching sensor data for chip_id ${chipId}:`, sensorError);
      continue; // Skip to the next chip if there’s an error
    }
    sendDataToDevices(chipId, sensorData.temperature, sensorData.humidity);
  }
}

async function publishToWeatherDevices() {
  const { data: weatherChips, error: weatherError } = await supabase
    .from('chip_parameter')
    .select('chip_id')
    .eq('category', 'weather')

  if (weatherError) {
    console.error('Error fetching weather chips from DB:', weatherError);
    return;
  }

  for (const chip of weatherChips) {
    const chipId = chip.chip_id;
    // Fetch sensor data from `sensor_temps`
    const { data: weatherData, error: weatherError } = await supabase
      .from('weather_info')
      .select('continent, country, city')
      .eq('chip_id', chipId)
      .single(); // Expecting a single row for each chip_id

    if (weatherError) {
      console.error(`Error fetching weather information for chip_id ${chipId}:`, weatherError);
      continue; // Skip to the next chip if there’s an error
    }
    
    const location = `${weatherData.continent} ${weatherData.country} ${weatherData.city}`;

    // Construct the API URL
    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_KEY}&q=${encodeURIComponent(location)}&aqi=no`;

    try {
      // Fetch the weather data using axios
      const response = await axios.get(weatherApiUrl);

      // Check if the API response has the necessary data
      const weatherInfo = response.data;
      if (!weatherInfo || !weatherInfo.current) {
        console.error(`Invalid weather data for location: ${location}`);
        continue;
      }

      // Extract weather data
      const temperature = weatherInfo.current.temp_c; // Temperature in Celsius
      const humidity = weatherInfo.current.humidity; // Humidity percentage

      const { error: upsertError } = await supabase
        .from('weather_info')
        .upsert([
          {
            chip_id: chipId,
            temperature: temperature,
            humidity: humidity
          }
        ], { onConflict: ['chip_id'] }); // Use chip_id as the conflict target to update existing rows

      if (upsertError) {
        console.error(`Error inserting/updating weather data for chip_id ${chipId}:`, upsertError);
      } else {
        console.log(`Weather data for chip_id ${chipId} has been updated in weather_info table.`);
      }
      sendDataToDevices(chipId, temperature, humidity)
    } catch (apiError) {
      console.error(`Error fetching weather data from API for location: ${location}`);
    }
  }
}

async function sendDataToDevices(chipId, temperature, humidity) {
  const { data: ledParams, error: ledError } = await supabase
  .from('led_parameters')
  .select('tmp_max, tmp_min, rgb_max, rgb_mid, rgb_min')
  .eq('chip_id', chipId)
  .single();

if (ledError) {
  console.error(`Error fetching LED parameters for chip_id ${chipId}:`, ledError);
  return;
}

const parseRgb = (rgbString) => rgbString.split(',').map(Number);
const rgbMax = parseRgb(ledParams.rgb_max);
const rgbMid = parseRgb(ledParams.rgb_mid);
const rgbMin = parseRgb(ledParams.rgb_min);

// Construct the message
const message = JSON.stringify({
  for: 'chip',
  action: 'change',
  max: ledParams.tmp_max,
  min: ledParams.tmp_min,
  temperature: temperature,
  humidity: humidity,
  rgb_max: rgbMax,
  rgb_mid: rgbMid,
  rgb_min: rgbMin
});

// Publish to the device's MQTT topic
const topic = `device: ${chipId}`;
mqttClient.publish(topic, message, (err) => {
  if (err) {
    console.error(`Failed to publish to topic ${topic}`, err);
  } else {
    console.log(`Published change message to topic ${topic} with data:`, message);
  }
});
}

// Periodic message publishing function
async function publishToAllDevices() {
  publishToRoomDevices();
  publishToWeatherDevices();
}


// Handle incoming messages from MQTT
mqttClient.on('message', async (topic, message) => {
  console.log(`Received message from ${topic}`, message.toString());

  // Parse the message
  const payload = JSON.parse(message.toString());
  if (payload.for !== "server")
    return;
  const chipId = topic.split(' ')[1]; // Assuming topic is in the format "device: xxxx"

  const currentTime = new Date();

  // Create an object to hold the data to update
  const dataToUpdate = {
    changed_at: currentTime,
  };

  // Check the sensor type and update accordingly
  if (payload.sensor === "temp") {
    dataToUpdate.temperature = payload.valeur;
  } else if (payload.sensor === "humidity") {
    dataToUpdate.humidity = payload.valeur;
  }

  // Update or insert the sensor data in Supabase
  const { error } = await supabase
    .from('sensor_temps')
    .upsert([{ chip_id: chipId, ...dataToUpdate }]); // Use upsert to insert or update

  if (error) {
    console.error('Error inserting/updating sensor data in Supabase:', error);
  } else {
    console.log(`Updated sensor data for chip_id ${chipId}:`, dataToUpdate);
  }
});

app.get('/', (req, res) => {
  res.send('Hello, Express with Supabase and MQTT!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
