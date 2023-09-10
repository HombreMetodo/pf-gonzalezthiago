document.addEventListener("DOMContentLoaded", () => {
  const apiKey = 'f4430673334e8bb915cc2073e26428c1';

  // URL base de la API de ExchangeRatesAPI.io
  const apiUrl = `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}`;

  // Elementos del DOM
  const btnConvertir = document.getElementById("btnConvertir");
  const resultadoDiv = document.getElementById("resultado");
  const modoOscuroBtn = document.getElementById("modoOscuroBtn");
  const deMonedaSelect = document.getElementById("deMoneda");
  const aMonedaSelect = document.getElementById("aMoneda");
  const cantidadInput = document.getElementById("cantidad");
  const historialDiv = document.getElementById("historial");

  // Historial de conversiones
  const historial = [];

  // Función para obtener las tasas de cambio desde la API
  function obtenerTasasDeCambio() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        monedasJSON = Object.keys(data.rates).map((abreviatura) => ({
          abreviatura,
          nombre: abreviatura,
          tasaCambio: data.rates[abreviatura],
        }));
      })
      .catch((error) => {
        console.error('Error al obtener las tasas de cambio:', error);
      });
  }

  // Llamar a la función para obtener las tasas de cambio al cargar la página
  obtenerTasasDeCambio();

  // Función para guardar la última conversión con fecha y hora
  function guardarUltimaConversion(cantidad, deMoneda, aMoneda, resultado) {
    const fechaHora = new Date().toLocaleString(); // Obtiene la fecha y hora actual
    const ultimaConversion = {
      cantidad,
      deMoneda,
      aMoneda,
      resultado,
      fecha: fechaHora, // Agrega la fecha y hora al objeto de conversión
    };
    localStorage.setItem('ultimaConversion', JSON.stringify(ultimaConversion));
  }

  btnConvertir.addEventListener("click", () => {
    const deMoneda = deMonedaSelect.value.toUpperCase();
    const aMoneda = aMonedaSelect.value.toUpperCase();
    const cantidad = parseFloat(cantidadInput.value);

    if (isNaN(cantidad) || cantidad <= 0) {
      Swal.fire('Error', 'Porfavor ingrese una cantidad mayor a cero.', 'error');
      return;
    }

    if (deMoneda === aMoneda) {
      Swal.fire('Error', 'Seleccione monedas de origen y destino diferentes.', 'error');
      return;
    }

    const monedaOrigen = monedasJSON.find((moneda) => moneda.abreviatura === deMoneda);
    const monedaDestino = monedasJSON.find((moneda) => moneda.abreviatura === aMoneda);

    if (!monedaOrigen || !monedaDestino) {
      Swal.fire('Error', 'Seleccione monedas de origen y destino válidas.', 'error');
      return;
    }

    const convertedAmount = cantidad * (monedaDestino.tasaCambio / monedaOrigen.tasaCambio);
    resultadoDiv.textContent = `${cantidad.toFixed(2)} ${deMoneda} son equivalentes a ${convertedAmount.toFixed(2)} ${aMoneda}`;
    guardarUltimaConversion(cantidad, deMoneda, aMoneda, convertedAmount);
    Swal.fire('¡Conversión exitosa!', '', 'success');

    // Agregar a historial
    const conversionHistorial = {
      cantidad,
      deMoneda,
      aMoneda,
      resultado: convertedAmount,
      fecha: new Date().toLocaleString(),
    };
    historial.push(conversionHistorial);
    mostrarHistorial();
  });

  function mostrarHistorial() {
    historialDiv.innerHTML = "<h2>Historial de Conversiones:</h2>";
    const ul = document.createElement('ul');
    historial.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.cantidad.toFixed(2)} ${item.deMoneda} a ${item.resultado.toFixed(2)} ${item.aMoneda} (${item.fecha})`;
      ul.appendChild(li);
    });
    historialDiv.appendChild(ul);
  }

  const ultimaConversionGuardada = localStorage.getItem('ultimaConversion');
  if (ultimaConversionGuardada) {
    const ultimaConversion = JSON.parse(ultimaConversionGuardada);
    const { cantidad, deMoneda, aMoneda, resultado } = ultimaConversion;

    deMonedaSelect.value = deMoneda;
    aMonedaSelect.value = aMoneda;
    cantidadInput.value = cantidad;
    resultadoDiv.textContent = `${cantidad.toFixed(2)} ${deMoneda} son equivalentes a ${resultado.toFixed(2)} ${aMoneda}`;
  }

  const modoOscuroActivado = localStorage.getItem('modoOscuroActivado');
  if (modoOscuroActivado === 'true') {
    document.body.classList.add('modo-oscuro-activado');
  }

  modoOscuroBtn.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro-activado');
    localStorage.setItem('modoOscuroActivado', document.body.classList.contains('modo-oscuro-activado'));
  });
});
