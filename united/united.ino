#include <Arduino.h>

#if defined(ESP8266)
  /* ESP8266 Dependencies */
  #include <ESP8266WiFi.h>
  #include <ESPAsyncTCP.h>
  #include <ESPAsyncWebServer.h>
  #include <LittleFS.h>  // Remplacer SPIFFS par LittleFS pour ESP8266
  #include <ESP8266mDNS.h>  // Pour mDNS sur ESP8266
#elif defined(ESP32)
  /* ESP32 Dependencies */
  #include <WiFi.h>
  #include <AsyncTCP.h>
  #include <ESPAsyncWebServer.h>
  #include "SPIFFS.h"  // SPIFFS pour ESP32
  #include <ESPmDNS.h>  // Pour mDNS sur ESP32
#endif

#include <ESPConnect.h>
#include <PubSubClient.h> // Pour le MQTT
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN D2     // Pin connecté au DHT
#define DHTTYPE DHT11 // Utilisation du DHT11, c'est le nom de mon capteur

// Paramètre capteur
DHT_Unified dht(DHTPIN, DHTTYPE);
uint32_t delayMS;

// Paramètre MQTT
const char* mqttServer = "192.168.1.102"; // Remplace par l'adresse IP du broker MQTT, lance le docker mqtt et trouve l'ip de ta machine
const int mqttPort = 1883;  // Port par défaut pour MQTT
const char* mqttUser = "";
const char* mqttPassword = "";

// Parametre server
AsyncWebServer server(80);
WiFiClient espClient;  // Client WiFi
PubSubClient mqttClient(espClient);  // Client MQTT

void setup() {
  Serial.begin(115200);
  while (!Serial) { }  // Attendre l'ouverture du port série
  Serial.println("\nDémarrage de l'ESP8266/ESP32");
  
  dht.begin();
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  delayMS = sensor.min_delay / 1000;

  mqttClient.setServer(mqttServer, mqttPort);

#if defined(ESP8266)
  // Initialiser LittleFS
  Serial.println("Initialisation de LittleFS...");
  if (!LittleFS.begin()) {
    Serial.println("Erreur lors de l'initialisation de LittleFS");
    return;
  }
  Serial.println("LittleFS initialisé avec succès");
#elif defined(ESP32)
  // Initialiser SPIFFS pour ESP32
  Serial.println("Initialisation de SPIFFS...");
  if (!SPIFFS.begin()) {
    Serial.println("Erreur lors de l'initialisation de SPIFFS");
    return;
  }
  Serial.println("SPIFFS initialisé avec succès");
#endif

  /* AutoConnect Wi-Fi */
  String customSSID = "esp8266";  // SSID personnalisé pour le point d'accès Wi-Fi
  String password = "arnaud123";     // Mot de passe pour le point d'accès Wi-Fi
  ESPConnect.autoConnect(customSSID.c_str(), password.c_str());  

  if (ESPConnect.begin(&server)) {
    Serial.println("Connecté au Wi-Fi");
    Serial.println("Adresse IP: " + WiFi.localIP().toString());

    // Initialisation de mDNS
    if (MDNS.begin("esp8266")) {  
      Serial.println("mDNS démarré avec succès. Accédez à esp8266.local");
    } else {
      Serial.println("Erreur lors de l'initialisation de mDNS");
    }
  } else {
    Serial.println("Échec de la connexion au Wi-Fi");
  }

  server.on("/index.html", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });
  // j'ai fait des routes d'autres fichiers car si je ne le fais pas j'ai une erreur 500 du script dans la page html et quand j'appuie envoie ça ne fait rien
  server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/script.js", "application/javascript");
  });
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/style.css", "text/css");
  });
  // je récupere pour ensuite l'envoyer dans la DB
  server.on("/getChipId", HTTP_GET, [](AsyncWebServerRequest *request) {
    uint32_t chipId = ESP.getChipId();  
    String jsonResponse = "{\"chipId\": \"" + String(chipId) + "\"}";
    request->send(200, "application/json", jsonResponse);
  });

  server.begin();
  Serial.println("Serveur démarré");
}

void loop() {
  // Mise à jour de mDNS
  MDNS.update();

  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // à augmenter le delay plus tard pour ne pas spam le mqtt
  delay(delayMS);
  sendSensorData();
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.println("Tentative de connexion au broker MQTT");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str(), mqttUser, mqttPassword)) {
      Serial.println("Connecté au broker MQTT");
      mqttClient.publish("hello/world", "Hello world from ESP8266!");
    } else {
      Serial.print("Échec de la connexion, état: ");
      Serial.println(mqttClient.state());
      delay(3000);
    }
  }
}

// recupere la temperature puis l'envoie dans le mqtt sur le topic "device_xxxx" ou x est le chipId
void sendSensorData() {
  sensors_event_t event;

  // Récupérer la température
  dht.temperature().getEvent(&event);
  if (!isnan(event.temperature)) {
    String topic = "device_" + String(ESP.getChipId());
    String message = "{\"sensor\": \"temp\", \"valeur\": " + String(event.temperature) + "}";
    mqttClient.publish(topic.c_str(), message.c_str());
    Serial.println("Données de température envoyées : " + message);
  }

  // Récupérer l'humidité
  dht.humidity().getEvent(&event);
  if (!isnan(event.relative_humidity)) {
    String topic = "device_" + String(ESP.getChipId());
    String message = "{\"sensor\": \"humidity\", \"valeur\": " + String(event.relative_humidity) + "}";
    mqttClient.publish(topic.c_str(), message.c_str());
    Serial.println("Données d'humidité envoyées : " + message);
  }
}