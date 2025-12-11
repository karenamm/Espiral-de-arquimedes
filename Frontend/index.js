const title = document.getElementById("title");
const ActionButton = document.getElementById("ActionButton");
const nameInput = document.getElementById("nameInput");
const LastNameInput = document.getElementById("LastNameInput");
const cedulaInput = document.getElementById("cedulaInput");
ActionButton.addEventListener("click",createPatient); 



async function createPatient(event) {
    event.preventDefault(); //Evita que el formulario se envie y recargue la pagina
    console.log(nameInput.value);
    console.log(LastNameInput.value);
    console.log(cedulaInput.value);
    let patient = {
        name: nameInput.value,
        lastName: LastNameInput.value,
        cedula: cedulaInput.value,
    };
    console.log(patient);
    let json = JSON.stringify(patient); //Convierte el objeto a una cadena JSON
    console.log(json);
    localStorage.setItem("patient", json); //Guarda la cadena JSON en el almacenamiento local del navegador
    
    //GET request
    let response = await fetch("https://fakestoreapi.com/products")
    console.log(response)
    let data = await response.json();
    console.log(data)

    }

 



function alfa() {
    console.log("Hola Mundo");
    title.innerHTML = "Hola Mundo JAVASCRIPT";
}
function beta() {
    let a=1;  //Let se usa para variables locales
    let b= "icesi";
    let c= true;
    
    let d = {
        name: "Andres",
        username: "@andres",
        age: 21,
        isSingle: true,

        
    };

    let e= ["Mercurio", "Venus", "Tierra", "Marte", "Jupiter", "Saturno", "Urano", "Neptuno"];
    console.log(a);
    console.log(b);
    console.log(c);
    console.log(d);
    console.log(e);


}

function gamma() {
    let mensaje1 = {
        message : "Hola",
        from: "Andres",
      };
        let mensaje2 = {
        message : "Te",
        from: "Andres",
      };
      let mensaje3 = {
        message : "Odio",
        from: "Andres",
      };
      let array = [];
        array.push(mensaje1);
        array.push(mensaje2);
        array.push(mensaje3);
        console.log(array);
}
    



beta();
gamma();