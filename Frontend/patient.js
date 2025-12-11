const nameInput = document.getElementById("nameInput");
const lastNameInput = document.getElementById("lastNameInput");
const nationalIdInput = document.getElementById("nationalIdInput");
const imageUrlInput = document.getElementById("imageUrlInput");
const createPatientButton = document.getElementById("createPatientButton");

const deleteIdInput = document.getElementById("deleteIdInput");
const deletePatientButton = document.getElementById("deletePatientButton");

const patientsContainer = document.getElementById("patientsContainer");

createPatientButton.addEventListener("click", createPatient);
deletePatientButton.addEventListener("click", deletePatientById);

getPatients();

async function getPatients() {
  try {
    let response = await fetch("http://localhost:8080/patients/all");
    let list = await response.json();

    let content = "";
    for (let i = 0; i < list.length; i++) {
      content += `
        <tr>
          <td>${list[i].id}</td>
          <td>${list[i].name} ${list[i].lastName}</td>
          <td>${list[i].nationalId}</td>
          <td><img src="${list[i].imageUrl || ""}" width="80"></td>
          <td>
            <a href="lista-muestra.html?patientId=${list[i].id}" class="btn">Ver más detalles</a>
          </td>
        </tr>
      `;
    }
    patientsContainer.innerHTML = content;
  } catch (error) {
    console.error("Error obteniendo pacientes:", error);
  }
}

async function createPatient() {
  let newPatient = {
    name: nameInput.value,
    lastName: lastNameInput.value,
    nationalId: nationalIdInput.value,
    imageUrl: imageUrlInput.value
  };

  try {
    let response = await fetch("http://localhost:8080/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatient)
    });

    if (response.ok) {
      alert("Paciente creado correctamente");
      getPatients();
    } else {
      alert("Error al crear paciente");
    }
  } catch (error) {
    console.error("Error creando paciente:", error);
  }
}

async function deletePatientById() {
  const id = deleteIdInput.value.trim();
  if (!id) {
    alert("Por favor ingresa un ID válido");
    return;
  }

  if (!confirm(`¿Seguro que deseas eliminar al paciente con ID ${id}?`)) return;

  try {
    const response = await fetch(`http://localhost:8080/patients/${id}`, { method: "DELETE" });

    if (response.ok) {
      alert("Paciente eliminado correctamente");
      deleteIdInput.value = "";
      getPatients();
    } else {
      alert("Paciente no encontrado");
    }
  } catch (error) {
    console.error("Error eliminando paciente:", error);
  }
}
