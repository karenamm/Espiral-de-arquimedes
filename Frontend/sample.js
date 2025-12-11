const ESP_BASE = "";

const patientIdInput = document.getElementById("patientIdInput");
const createSampleButton = document.getElementById("createSampleButton");
const samplesContainer = document.getElementById("samplesContainer");
const statusDiv = document.getElementById("status");

createSampleButton.addEventListener("click", onCreateSample);
patientIdInput.addEventListener("input", onPatientIdInput);
document.getElementById("connectSerialButton").addEventListener("click", connectSerial);

function setStatus(msg, type) {
  const colors = { ok: "#0a6d4b", error: "#8a0b0b", warn: "#8a5a0b", info: "#084c8a" };
  statusDiv.textContent = msg;
  statusDiv.style.color = colors[type] || "#08363b";
}

function fmtTs(ts) {
  if (!ts && ts !== 0) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts; // por si llega como string raro
  return d.toLocaleString();
}

function renderSamples(samples) {
  if (!samples || samples.length === 0) {
    samplesContainer.innerHTML = "<tr><td colspan='6' style='text-align:center'>No hay muestras</td></tr>";
    return;
  }
  let html = "";
  samples.forEach(s => {
    const hasPatient = !!s.patient;
    const pacienteNombre = hasPatient ? `${s.patient.name} ${s.patient.lastName}` : "Sin asignar";
    const pacienteId = hasPatient ? s.patient.id : "";

    const acciones = hasPatient
      ? `<a class="btn secondary" href="./lista-muestra.html?patientId=${pacienteId}">Ver muestras</a>`
      : `<span class="subtle">—</span>`;

    html += `
      <tr>
        <td>${s.id}</td>
        <td>${pacienteId || "—"}</td>
        <td>${pacienteNombre}</td>
        <td>${s.samplingRate ?? ""}</td>
        <td>${fmtTs(s.timestamp)}</td>
        <td>${acciones}</td>
      </tr>
    `;
  });
  samplesContainer.innerHTML = html;
}

async function patientExists(id) {
  try {
    const resp = await fetch(`http://localhost:8080/patients/${id}`);
    return resp.ok;
  } catch {
    return false;
  }
}

async function refreshSamples() {
  const id = patientIdInput.value.trim();
  const url = id ? `http://localhost:8080/samples/by-patient/${id}`
                : `http://localhost:8080/samples/all`;
  try {
    const resp = await fetch(url);
    const samples = await resp.json();
    renderSamples(samples);
  } catch {
    samplesContainer.innerHTML = "<tr><td colspan='6'>Error cargando muestras</td></tr>";
  }
}

let debounceTimer = null;
function onPatientIdInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(validatePatientId, 300);
}
async function validatePatientId() {
  const id = patientIdInput.value.trim();
  if (!id) {
    setStatus("Ingresa un ID de paciente.", "warn");
    createSampleButton.disabled = true;
    return;
  }
  const exists = await patientExists(id);
  if (exists) {
    setStatus("Paciente válido. Puedes iniciar la muestra.", "ok");
    createSampleButton.disabled = false;
  } else {
    setStatus("Paciente no encontrado. No puedes iniciar la muestra.", "error");
    createSampleButton.disabled = true;
  }
}

let serialPort = null;
let serialWriter = null;

async function connectSerial() {
  if (!("serial" in navigator)) {
    alert("Tu navegador no soporta Web Serial. Usa Chrome/Edge en https o localhost.");
    return;
  }
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });

    const enc = new TextEncoderStream();
    enc.readable.pipeTo(serialPort.writable);
    serialWriter = enc.writable.getWriter();

    setStatus("ESP32 conectado por USB. Listo para enviar comandos.", "ok");
  } catch (e) {
    console.error(e);
    setStatus("No se pudo abrir el puerto serie.", "error");
  }
}

async function sendSerialLine(line) {
  if (!serialWriter) {
    setStatus("Conecta primero el ESP32 por USB.", "warn");
    return false;
  }
  try {
    await serialWriter.write(line + "\n");
    return true;
  } catch (e) {
    console.error(e);
    setStatus("Error enviando por serie.", "error");
    return false;
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function onCreateSample() {
  const patientId = patientIdInput.value.trim();
  if (!patientId) { 
    setStatus("Ingresa un ID de paciente.", "warn"); 
    return; 
  }

  setStatus("Creando muestra…", "info");
  const resp = await fetch(`http://localhost:8080/samples/create?patientId=${patientId}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ samplingRate: 20.0 })
  });

  if (!resp.ok) { 
    setStatus("Error creando muestra.", "error"); 
    return; 
  }

  let sampleId = null;
  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const sampleObj = await resp.json();
    sampleId = sampleObj.id;
  } else {
    const txt = await resp.text();
    const m = txt.match(/(\d+)/);
    if (m) sampleId = parseInt(m[1],10);
  }

  if (!sampleId) {
    setStatus("No se obtuvo sampleId. Actualiza backend para devolver el objeto Sample.", "error");
    return;
  }

  setStatus(`Fijando sampleId=${sampleId} en el ESP…`, "info");
  if (!await sendSerialLine(`sid ${sampleId}`)) return;

  setStatus("Conectando WiFi del ESP…", "info");
  if (!await sendSerialLine("wifi")) return;
  await sleep(800);

  setStatus("Iniciando toma de muestra…", "info");
  if (!await sendSerialLine("samp")) return;

  await sleep(3500);
  await refreshSamples();
  setStatus("RawData guardado en la muestra creada. ✔️", "ok");

  location.href = `graph.html?sampleId=${sampleId}&patientId=${patientId}`;
}

refreshSamples();
validatePatientId();
