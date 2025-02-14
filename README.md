# Calculadora de Propinas

## Descripción
Este proyecto es una aplicación web que permite gestionar órdenes en un restaurante y calcular propinas con base en el consumo del cliente. 
Utiliza un servidor JSON para simular una API que proporciona la información de los platillos.

## Características
- Nueva Orden: Al iniciar, solo aparece un botón de "Nueva Orden".
- Al hacer clic, se muestra un modal con dos campos de entrada(campos validados):
  - Número de mesa.
  - Hora de la orden.
- Botones para cerrar o crear la orden.
- Carga de Platillos: Al crear una orden, se conecta a un archivo JSON (mediante json-server) para cargar y mostrar los platillos disponibles.
 -Selección de Platillos: Los platillos se muestran con su nombre, precio y categoría (comida, bebida o postre). Se incluye un campo numérico para indicar la cantidad deseada.
- Resumen de Consumo: Se actualiza dinámicamente con la información del número de mesa, la hora, los platillos seleccionados, cantidad, precio y subtotal. Permite eliminar platillos.
- Cálculo de Propinas: Al finalizar la orden, el usuario puede seleccionar un porcentaje de propina (10%, 25%, 50%). Se calcula y muestra el subtotal, el monto de la propina y el total a pagar.

## Tecnologías
- HTML: Estructura de la página.
- Bootstrap: Estilos y modal (bootstrap.bundle.min.js).
- JavaScript (app.js): Lógica de la aplicación.
- JSON Server: Simulación de API (db.json).

## Instalación
- Clona este repositorio.
  -git clone https://github.com/Hugo9591/Propinas.git 
- Instala JSON Server si no lo tienes:
  - npm install -g json-server
- Inicia el servidor JSON:
  - json-server --watch js/db.json --port 4000
- Abre el archivo index.html en un navegador.

## Próximas Mejoras
- Permitir agregar múltiples órdenes.
- Mejorar la interfaz de usuario y la experiencia de usuario.
Optimizar el almacenamiento de datos para mantener registros de órdenes pasadas.

