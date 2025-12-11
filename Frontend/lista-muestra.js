const params = new URLSearchParams(location.search);
const patientId = params.get("patientId");

const patientTitle = document.getElementById("patientTitle");
const patientMeta  = document.getElementById("patientMeta");
const samplesBody  = document.getElementById("samplesByPatient");
const statusEl     = document.getElementById("status");

init();

async function init(){
  if(!patientId){
    setStatus("Falta el parámetro ?patientId= en la URL", "error");
    renderEmpty();
    return;
  }

  const patient = await fetchPatient(patientId);
  if(!patient){
    setStatus("Paciente no encontrado", "error");
    renderEmpty();
    return;
  }

  renderPatient(patient);

  const samples = await fetchSamples(patientId);
  renderSamples(samples);
}

async function fetchPatient(id){
  try{
    const r = await fetch(`http://localhost:8080/patients/${id}`);
    if(!r.ok) return null;
    return await r.json();
  }catch{
    return null;
  }
}

async function fetchSamples(id){
  try{
    const r = await fetch(`http://localhost:8080/samples/by-patient/${id}`);
    if(!r.ok) return [];
    return await r.json();
  }catch{
    return [];
  }
}

function renderPatient(p){
  const full = `${p.name} ${p.lastName}`;
  patientTitle.textContent = full;
  patientMeta.textContent = `ID: ${p.id} · Cédula: ${p.nationalId || "—"}`;
}

function renderSamples(list){
  if(!list || list.length === 0){
    samplesBody.innerHTML = `<tr><td colspan="4">No hay muestras</td></tr>`;
    return;
  }

  let html = "";
  list.forEach(s => {
    const rate = (s.samplingRate ?? "—");
    const tsNum = s.timestamp ?? null;
    const tsFmt = tsNum ? new Date(Number(tsNum)).toLocaleString() : "—";

    html += `
      <tr>
        <td>${s.id}</td>
        <td>${rate}</td>
        <td title="${tsNum ?? ""}">${tsFmt}</td>
        <td>
          <a class="btn secondary" href="graph.html?sampleId=${s.id}&patientId=${patientId}">Ver gráfico</a>
          <button class="btn" data-action="delete" data-id="${s.id}">Eliminar</button>
        </td>
      </tr>
    `;
  });
  samplesBody.innerHTML = html;
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='delete']");
  if(!btn) return;

  const id = btn.getAttribute("data-id");
  if(!confirm(`¿Eliminar la muestra #${id}?`)) return;

  try{
    const r = await fetch(`http://localhost:8080/samples/${id}`, { method: "DELETE" });
    if(r.ok){
      setStatus("Muestra eliminada", "success");
      const refreshed = await fetchSamples(patientId);
      renderSamples(refreshed);
    }else{
      const t = await r.text();
      setStatus(t || "Error al eliminar", "error");
    }
  }catch{
    setStatus("Error de red al eliminar", "error");
  }
});

function renderEmpty(){
  samplesBody.innerHTML = `<tr><td colspan="4">Sin datos</td></tr>`;
}

function setStatus(msg, type){
  if(!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.display = "block";
  statusEl.className = "alert";
  if(type === "success") statusEl.classList.add("success");
  if(type === "error")   statusEl.classList.add("error");
  if(type === "warn")    statusEl.classList.add("warn");
  if(type === "info")    statusEl.classList.add("info");
}
