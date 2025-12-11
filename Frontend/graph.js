const qs = new URLSearchParams(location.search);
const sampleId = qs.get("sampleId");

const statusDiv = document.getElementById("status");
const titleEl = document.getElementById("sampleTitle");
const backBtn = document.getElementById("backToList");
const canvasTime = document.getElementById("timegraph");
const canvasFFT  = document.getElementById("fftgraph");

function setStatus(msg, type = "info") {
    statusDiv.textContent = msg;
    statusDiv.className = `alert ${type}`;
}

if (!sampleId) {
    setStatus("Falta sampleId en la URL.", "error");
    throw new Error("No sampleId");
}

backBtn.addEventListener("click", () => {
    const pid = qs.get("patientId");
    if (pid) location.href = `lista-muestra.html?patientId=${pid}`;
    else history.back();
});

async function fetchRaw(sampleId) {
    const r = await fetch(`http://localhost:8080/api/v1/samples/${sampleId}/raw`);
    if (!r.ok) throw new Error("No se pudo obtener RawData");
    return r.json();
}

async function fetchSampleMeta(sampleId) {
    try {
        const r = await fetch(`http://localhost:8080/samples/${sampleId}`);
        if (!r.ok) return null;
        return r.json();
    } catch {
        return null;
    }
}

function computeFFTMagnitude(signal, fs) {
    const N = signal.length;
    if (!N) return { freqs: [], mags: [] };

    const maxN = 512;
    const M = Math.min(N, maxN);

    const re = new Array(M).fill(0);
    const im = new Array(M).fill(0);

    for (let k = 0; k < M; k++) {
        for (let n = 0; n < M; n++) {
            const angle = -2 * Math.PI * k * n / M;
            const val = signal[n];
            re[k] += val * Math.cos(angle);
            im[k] += val * Math.sin(angle);
        }
    }

    const freqs = [];
    const mags  = [];
    const half = Math.floor(M / 2);

    for (let k = 0; k <= half; k++) {
        const freq = (k * fs) / M;
        const mag  = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
        freqs.push(freq);
        mags.push(mag);
    }

    return { freqs, mags };
}

function buildCharts(raw, samplingRate) {
    if (!raw || raw.length === 0) {
        setStatus("La muestra no tiene datos crudos.", "warn");
        return;
    }

    const labels = raw.map((_, i) => i);
    const ax = raw.map(d => d.ax ?? 0);
    const ay = raw.map(d => d.ay ?? 0);
    const az = raw.map(d => d.az ?? 0);

    new Chart(canvasTime, {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "ax", data: ax, tension: 0.2 },
                { label: "ay", data: ay, tension: 0.2 },
                { label: "az", data: az, tension: 0.2 },
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                x: { title: { display: true, text: "Índice de muestra" } },
                y: { title: { display: true, text: "Aceleración (g)" } }
            }
        }
    });

    const magSignal = raw.map(d => {
        const ax = d.ax ?? 0;
        const ay = d.ay ?? 0;
        const az = d.az ?? 0;
        return Math.sqrt(ax * ax + ay * ay + az * az);
    });

    const { freqs, mags } = computeFFTMagnitude(magSignal, samplingRate);

    if (freqs.length === 0) {
        setStatus("No se pudo calcular la FFT (pocas muestras).", "warn");
        return;
    }

    new Chart(canvasFFT, {
        type: "line",
        data: {
            labels: freqs,
            datasets: [
                {
                    label: "Espectro |X(f)|",
                    data: mags,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                x: {
                    title: { display: true, text: "Frecuencia (Hz)" },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: "Magnitud" }
                }
            }
        }
    });

    setStatus(`Listo. fs = ${samplingRate} Hz`, "success");
}

(async () => {
    titleEl.textContent = `Muestra #${sampleId}`;
    try {
        setStatus("Cargando datos…", "info");

        const [rawData, sampleMeta] = await Promise.all([
            fetchRaw(sampleId),
            fetchSampleMeta(sampleId)
        ]);

        const fs = (sampleMeta && typeof sampleMeta.samplingRate === "number")
            ? sampleMeta.samplingRate
            : 20;

        buildCharts(rawData, fs);
    } catch (e) {
        console.error(e);
        setStatus("Error cargando datos del gráfico.", "error");
    }
})();
