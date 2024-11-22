import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { getWeatherInfo } from '../../../api/weather/weather';
import WeatherCard from './WeatherCard';

import '../CustomCard.css';

const WeatherWidgets = ({ devices }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises = devices.map((device) =>
          getWeatherInfo(device.chip_id)
        );
        const data = await Promise.all(promises);
        
        const combinedData = data.map((weather) => {
          const device = devices.find((d) => d.chip_id === weather.chip_id);
          return {
            ...weather,
            ...device,
          };
        });

        setWeatherData(combinedData);
      } catch (err) {
        setError('Failed to fetch weather data.');
      } finally {
        setLoading(false);
      }
    };

    if (devices?.length > 0) {
      fetchWeatherData();
    } else {
      setWeatherData([]);
      setLoading(false);
    }
  }, [devices]);

  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (weatherData.length === 0) {
    return <Alert variant="info">No weather devices found.</Alert>;
  }

  return (
    <div>
      <h3>Weather Devices</h3>
      {weatherData.map((data) => (
        <Card key={data.chip_id} className="mb-4 mt-3 rounded-pill custom-card" style={{ border: 'none', background: 'transparent' }}>
          <WeatherCard weather={data} />
        </Card>
      ))}
    </div>
  );
};

export default WeatherWidgets;
