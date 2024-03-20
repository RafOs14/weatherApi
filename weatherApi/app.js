let ciudadActual = null;
const mainDiv = document.getElementById("main");
const tempNav = document.getElementById("tempNav");
const alerta = document.getElementById("msg");
const apiKey = "17e6eaf116115cca17826c12cb7b2337"; // Clave de API de OpenWeatherMap

// Definir iconos para cada tipo de clima
const iconos = {
  Mist: "foggy.png", // Niebla
  Sunny: "sunny.png", // Soleado
  Clear: "sunny.png", // Despejado
  Clouds: "cloud.png", // Nublado
  Rain: "rain.png", // Lluvia
  Drizzle: "rain.png", // Llovizna
  Thunderstorm: "storm.png", // Tormenta eléctrica
  Fog: "foggy.png" // Niebla
};

// Obtener la ubicación actual
async function obtenerCiudad() {
  try {
    // Obtiene la posición actual del usuario
    const posicion = await obtenerPosicion();

    // Obtiene el nombre de la ciudad utilizando la geocodificación inversa
    const ciudad = await obtenerNombreCiudad(
      posicion.coords.latitude,
      posicion.coords.longitude
    );

    return ciudad;
  } catch (error) {
    console.error("Error al obtener la ciudad:", error.message);
    return null;
  }
}

// Función para obtener la posición actual del usuario
function obtenerPosicion() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Función para obtener el nombre de la ciudad mediante geocodificación inversa
function obtenerNombreCiudad(latitud, longitud) {
  const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&zoom=18&addressdetails=1`;

  return fetch(apiUrl).then(response => response.json()).then(data => {
    const ciudad =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.hamlet;
    return ciudad;
  });
}

// Función para buscar la ciudad
async function buscarCiudad(ciudadBuscada) {
  try {
    ciudadActual = ciudadBuscada;
    if (ciudadActual) {
      alerta.innerHTML = `Buscando el clima en: ${ciudadActual}`;
      await obtenerClima2(); // Llamada a la función para obtener el clima
    } else {
      console.log("No se especificó una ciudad.");
    }
  } catch (error) {
    console.error("Error al buscar la ciudad:", error.message);
  }
}

// Función para obtener y guardar la ciudad actual
async function obtenerYGuardarCiudadActual() {
  ciudadActual = await obtenerCiudad();

  if (ciudadActual) {
    obtenerClima(); // Llamada a la función para obtener el clima
  } else {
    console.log("No se pudo obtener la ciudad actual.");
  }
}

async function obtenerClima2() {
  if (ciudadActual) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudadActual}&appid=${apiKey}&units=metric&lang=es`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Solicitud fallida con estado ${response.status}`);
      }

      const data = await response.json();
      mostrarClima(data); // Llama a la función para mostrar el clima
      setTimeout((alerta.innerHTML = ""), 6000);
    } catch (error) {
      alerta.innerHTML = `Error al buscar el clima en: ${ciudadActual}, indique otra ciudad.`; // Muestra el mensaje de error
      console.error(error);
    }
  } else {
    console.log("No se puede obtener el clima sin la ciudad.");
  }
}

// Función para obtener el clima
async function obtenerClima() {
  if (ciudadActual) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudadActual}&appid=${apiKey}&units=metric&lang=es`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Solicitud fallida con estado ${response.status}`);
      }

      const data = await response.json();
      mostrarClimaNav(data); // Llama a la función para mostrar el clima
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("No se puede obtener el clima sin la ciudad.");
  }
}

// Función para mostrar el clima
function mostrarClima(data) {
  const icono = iconos[data.weather[0].main];
  const iconoURL = `./assets/icons/${icono}`;
  let climaDesc = data.weather[0].description.toUpperCase();
  let temp = Math.floor(data.main.temp);
  let feels_like = Math.floor(data.main.feels_like);
  let temp_min = Math.floor(data.main.temp_min);
  let temp_max = Math.floor(data.main.temp_max);

  mainDiv.innerHTML = `
    <div class="card mt-4">
      <div class="card-body card">
        <h5 class="card-title d-flex justify-content-between align-items-center">
          <span>${data.name}</span>
          <img src="${iconoURL}" alt="${data.weather[0]
    .main}" class="weather-icon">
        </h5>
        <span class="card-subtitle mb-2 text-muted">${climaDesc}</span>
        <p class="card-text mt-3">Temperatura: ${temp}°C</p>
        <p class="card-text">Sensación térmica: ${feels_like}°C</p>
        <p class="card-text">Temperatura máxima: ${temp_min}°C</p>
        <p class="card-text">Temperatura mínima: ${temp_max}°C</p>
        <p class="card-text">Humedad: ${data.main.humidity}%</p>
        <p class="card-text">Velocidad del viento: ${data.wind.speed} m/s</p>
      </div>
    </div>
  `;
}

// Función para mostrar el clima en el navbar
function mostrarClimaNav(data) {
  const icono = iconos[data.weather[0].main];
  const iconoURL = `./assets/icons/${icono}`;
  let temp = Math.floor(data.main.temp);

  tempNav.innerHTML = `
    <span style="color:white;">${data.name} - ${data.weather[0]
    .description} &nbsp; ${temp} °C
    &nbsp; <img src="${iconoURL}" alt="${data.weather[0]
    .main}" class="weather-icon" style="width: 30px; height: 30px;">    
    </span>
  `;
}

// Evento DOMContentLoaded para ejecutar las funciones al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function(e) {
    e.preventDefault(); // Para prevenir el comportamiento por defecto del formulario

    const ciudadBuscada = document.getElementById("search").value;
    await buscarCiudad(ciudadBuscada);
  });

  obtenerYGuardarCiudadActual(); // Llamada a la función para obtener y guardar la ciudad actual
});

// Llama a la función para obtener y guardar la ciudad actual al cargar la página
obtenerYGuardarCiudadActual();
