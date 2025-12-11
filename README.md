# FlujoDatosSensorAPI

Sistema full-stack para **administrar pacientes y muestras** y **capturar datos crudos (RawData) desde un ESP32 con MPU6050**, almacenarlos en una BD mediante **Spring Boot + JPA**, y visualizarlos en un **frontend web** con **gráfico en el tiempo** y **espectro (FFT)** usando Chart.js.

---

## Arquitectura

- **ESP32 (Arduino + PlatformIO)**  
  Lee acelerómetro/giroscopio (MPU6050), construye un arreglo JSON y lo envía por HTTP al backend.
- **Backend (Spring Boot)**  
  Expone endpoints REST para Pacientes, Muestras y RawData. Persiste con JPA.
- **Frontend (HTML/CSS/JS)**  
  Permite crear pacientes, crear muestras, enviar comandos al ESP32 por Web Serial, listar muestras y visualizar:
  - Señal en el tiempo (ax, ay, az)
  - FFT sobre la magnitud del vector de aceleración

---

## Tecnologías

- Java + Spring Boot (REST, JPA)
- Arduino/ESP32 (WiFi, HTTPClient, Arduino_JSON, Adafruit_MPU6050)
- Frontend: HTML, CSS, JavaScript, Chart.js
- Web Serial API (Chrome/Edge en **https o localhost**)

---

## Estructura lógica del modelo

- `Patient (1) ---- (N) Sample`
- `Sample (1) ---- (N) RawData`

Entidades:
- **Patient**: id, name, lastName, nationalId, imageUrl
- **Sample**: id, samplingRate, timestamp, patient
- **RawData**: id, ax, ay, az, gx, gy, gz, sample

---

## Endpoints principales (Backend)

### Pacientes (`/patients`)
- `GET /patients/{id}` → obtener paciente por id
- `GET /patients/all` → listar todos
- `POST /patients` → crear paciente (JSON)
- `DELETE /patients/{id}` → eliminar paciente

### Muestras (`/samples`)
- `POST /samples/create?patientId={id}` → crea muestra para paciente  
  - si no llega body, crea por defecto
  - defaults: `timestamp=now`, `samplingRate=20.0`
- `GET /samples/all` → listar todas
- `GET /samples/by-patient/{patientId}` → listar por paciente
- `DELETE /samples/{id}` → eliminar muestra

### RawData por muestra (`/api/v1`)
- `POST /api/v1/samples/{sampleId}/raw` → guarda lista de RawData asociada a una muestra
- `GET /api/v1/samples/{sampleId}/raw` → lista RawData de una muestra
- `DELETE /api/v1/raw/{id}` → elimina RawData por id

### Endpoints “rápidos” (`/`)
- `POST /sensors` → crea (si no existe) un paciente fijo + crea una muestra + guarda lista de RawData
- `POST /sensor` → guarda un RawData suelto
- `GET /sample/{id}` → devuelve un Sample
- `GET /getAllSamples` → lista samples
- `GET /hello` → health check

---

## Cómo ejecutar

### 1) Backend (Spring Boot)
Requisitos:
- JDK 17+ (recomendado)
- Una BD configurada en `application.properties` (no incluida aquí)

Ejecutar:
```bash
./mvnw spring-boot:run
# o desde tu IDE: Run FlujodatossensorapiApplication
```

Por defecto corre en:
- `http://localhost:8080`

---

### 2) Frontend (HTML/CSS/JS)
Requisitos:
- Live Server (VSCode) o cualquier servidor estático

Ejemplo con VSCode:
- Abrir la carpeta del frontend
- Click derecho en `index.html` → **Open with Live Server**

⚠️ Web Serial API:
- Para “Conectar ESP32 (USB)”, usa **Chrome/Edge** y ejecuta el frontend en **localhost** o **https**.

---

### 3) ESP32 (PlatformIO)
Requisitos:
- PlatformIO instalado
- Conexión WiFi disponible (por defecto: `IASLAB` / `Sys-2019`)
- MPU6050 conectado por I2C (SDA=21, SCL=22)

Config clave (en el código):
- `BACKEND_BASE = "http://192.168.131.158:8080"`  ← cambia a la IP real de tu backend (misma red)

Compilar y subir desde PlatformIO:
- Build & Upload al ESP32
- Abrir monitor serial a 115200

Comandos en Serial Monitor:
- `wifi` → conectar WiFi
- `sid <ID>` → fijar `sampleId` destino
- `samp` → tomar N muestras y enviarlas al backend

Notas:
- Si `currentSampleId > 0` envía a:  
  `POST /api/v1/samples/{sampleId}/raw`
- Si no hay sampleId, envía a:  
  `POST /sensors`

---

## Flujo de uso (recomendado)

1. **Crear paciente** (Frontend → Gestión de Pacientes)
2. **Ir a Gestión de Muestras**
3. Conectar ESP32 por USB (Web Serial)
4. Ingresar `patientId`
5. Click en **Crear muestra**
   - Frontend crea la muestra: `POST /samples/create?patientId=...`
   - Obtiene `sampleId`
   - Envía por Serial al ESP:
     - `sid <sampleId>`
     - `wifi`
     - `samp`
   - ESP32 toma lecturas y hace `POST /api/v1/samples/{sampleId}/raw`
6. Frontend redirige a `graph.html?sampleId=...` y muestra:
   - Señal en tiempo (ax, ay, az)
   - FFT (magnitud)

---

## Visualización (gráficas)

En `graph.js`:
- Se consulta RawData:
  - `GET http://localhost:8080/api/v1/samples/{sampleId}/raw`
- Se consulta metadata de la muestra (samplingRate):
  - `GET http://localhost:8080/samples/{sampleId}` (si falla, usa 20 Hz)
- FFT:
  - Se calcula una DFT simple (hasta 512 puntos) sobre `|a| = sqrt(ax²+ay²+az²)`
  - Se grafica magnitud vs frecuencia (0 a fs/2)

---

## Configuración y notas importantes

- **CORS**:
  - `/patients` y `/samples` tienen `origins="*"`
  - `/api/v1` permite `127.0.0.1:5500`, `localhost:4200`, `localhost:5173`
- **Campos JSON**:
  - Para crear paciente desde frontend: `name`, `lastName`, `nationalId`, `imageUrl`
- **Rutas base**:
  - Backend: `http://localhost:8080`
  - ESP32 debe apuntar a la IP del backend en la red local (`BACKEND_BASE`)

---

## Ejemplos rápidos (cURL)

Crear paciente:
```bash
curl -X POST http://localhost:8080/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Gonzalo","lastName":"Llano","nationalId":"123","imageUrl":""}'
```

Crear muestra para paciente 1:
```bash
curl -X POST "http://localhost:8080/samples/create?patientId=1" \
  -H "Content-Type: application/json" \
  -d '{"samplingRate":20.0}'
```

Listar RawData de una muestra:
```bash
curl http://localhost:8080/api/v1/samples/1/raw
```

---


Backend + ESP32 + Frontend: Flujo de datos de sensor (MPU6050), almacenamiento y visualización con FFT.
