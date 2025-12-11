#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define WIFI_SSID "IASLAB"
#define WIFI_PASS "Sys-2019"

String BACKEND_BASE = "http://192.168.131.158:8080";   

String URL_SENSORS  = BACKEND_BASE + "/sensors";         
String URL_RAW_BASE = BACKEND_BASE + "/api/v1/samples/"; 

#define I2C_SDA 21
#define I2C_SCL 22

const size_t DEFAULT_N  = 40; 
const int    DEFAULT_HZ = 20; 

Adafruit_MPU6050 mpu;
int currentSampleId = -1;  

void connectWiFi();
void handleLine(const String& line);
void takeAndPost(size_t N = DEFAULT_N, int Hz = DEFAULT_HZ);
void initMPU();

void setup() {
  Serial.begin(115200);
  delay(500);

  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(400000);
  initMPU();

  WiFi.mode(WIFI_STA);

  Serial.println("\n=== ESP32 listo ===");
  Serial.println("Comandos:");
  Serial.println("  wifi           -> conectar WiFi");
  Serial.println("  sid <ID>       -> fijar sampleId destino");
  Serial.println("  samp           -> tomar muestra y subir datos");
  Serial.println();
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length()) handleLine(line);
  }
}


void initMPU() {
  
  const uint8_t ADDR1 = 0x68, ADDR2 = 0x69;
  if (!mpu.begin(ADDR1, &Wire)) {
    if (!mpu.begin(ADDR2, &Wire)) {
      Serial.println("[MPU] No se encontró el MPU6050 en 0x68/0x69.");
      while (true) delay(10);
    }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_260_HZ);
  Serial.println("[MPU] Listo.");
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WiFi] Ya conectado. IP: ");
    Serial.println(WiFi.localIP());
    return;
  }

  Serial.print("[WiFi] Conectando a "); Serial.print(WIFI_SSID); Serial.print(" ...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    Serial.print(".");
    delay(500);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\n[WiFi] Conectado. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] No se pudo conectar (timeout).");
  }
}

void handleLine(const String& line) {
  if (line == "wifi") {
    connectWiFi();
  } else if (line.startsWith("sid ")) {
    // Fijar sampleId
    String s = line.substring(4);
    s.trim();
    currentSampleId = s.toInt();
    Serial.print("[CMD] sampleId = ");
    Serial.println(currentSampleId);
  } else if (line == "samp") {
    takeAndPost(DEFAULT_N, DEFAULT_HZ);
  } else {
    Serial.print("[CMD] Desconocido: ");
    Serial.println(line);
  }
}

void takeAndPost(size_t N, int Hz) {
  if (Hz < 1) Hz = 1;
  if (N == 0) N = 1;

  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Sin conexión. Abortando muestreo.");
    return;
  }

  const uint16_t period_ms = (uint16_t) max(1, 1000 / Hz);

  JSONVar array;
  Serial.printf("[SAMPLE] Iniciando: N=%u, Hz=%d (~%u ms)\n", (unsigned)N, Hz, period_ms);

  for (size_t i = 0; i < N; i++) {
    uint32_t t0 = millis();

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    JSONVar raw;
    raw["ax"] = a.acceleration.x;
    raw["ay"] = a.acceleration.y;
    raw["az"] = a.acceleration.z;
    raw["gx"] = g.gyro.x;
    raw["gy"] = g.gyro.y;
    raw["gz"] = g.gyro.z;

    array[i] = raw;

    uint32_t dt = millis() - t0;
    if (dt < period_ms) delay(period_ms - dt);
  }

  Serial.println("[SAMPLE] Adquisición terminada. Enviando...");

  String url = (currentSampleId > 0)
                ? (URL_RAW_BASE + String(currentSampleId) + "/raw")
                : URL_SENSORS;

  String payload = JSON.stringify(array);

  HTTPClient http;
  http.setTimeout(15000);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  String resp = http.getString();
  http.end();

  Serial.print("[HTTP] POST "); Serial.print(url); Serial.print(" -> ");
  Serial.println(code);
  if (resp.length()) Serial.println(resp);
  if (code >= 200 && code < 300) Serial.println("[HTTP] Envío OK");
  else                           Serial.println("[HTTP] Error en envío");
}
