let cliente = {
    mesa:'',
    hora: '',
    pedido: []//(id, nombre, categoria, cantidad, precio, )
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const crearOrden = document.querySelector('#guardar-cliente');

crearOrden.addEventListener('click', guardarOrden);

function guardarOrden(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Validar campos vacios
    const camposVacios = [mesa, hora].some( campo => campo === '' );//Si almenos uno esta vacio regresa true

    if(camposVacios){

        //Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center', 'animacion');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return;
    }

    //Asignar datos del formulario al obj cliente
    cliente = {...cliente, mesa, hora};
    // console.log(cliente);

    //Ocultar modal
    const modalFormaulario = document.querySelector('#formulario');//Obtener el formulario
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormaulario);//Obtener el modal actual
    modalBootstrap.hide();

    //Mostrar secciones ocultas, en index estos elementos estan ocultos no display:none = d-none en bootstrap
    mostrarSecciones();//div (platillos, resumen de consumo)

    //Obtener platillos de la API jsonServer
    obtenerPlatillos();
}

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none'); //All porque hay mas de un elemento con esta clase
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos(){
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        //.then( respuesta => console.log(respuesta))
        .then( respuesta => respuesta.json())//Para leer el archivo regresando objetos de javascript o se puede poner text() pero te devuelve todo en un string
        // .then( resultado => console.log(resultado))
        .then( resultado => mostrarPlatillos(resultado))//[{},{}....{}]
        .catch( error => console.log(error));
}

function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        // console.log(platillo);//Nos devuelve los objetos por separado
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        //Mostrar nombre de platillos
        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        //Mostrar precio
        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        //Mostrar categoria
        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];//Va a imprimir numeros por lo que se generara otro objet especificando a que corresponde cada numero


        //Generar un input
        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function(){
            const cantidad = parseInt( inputCantidad.value );//Siempre que se leen datos de un input devuelve un sstring
            //console.log(cantidad);
            agregarPlatillo({...platillo, cantidad});
            //agregamos el valor al objeto platillo con ... para que sea un solo obj y agregamos el valor cantidad al objeto

        }//Al momneto de detectar un cambio se ejecuta la funcion

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);


        contenido.appendChild(row);

    });
}

function agregarPlatillo(producto){//{id, nombre, precio, categoria, cantidad}
    //console.log('desde agregar platillo', id);
    // console.log(producto);

    //extrae pedido
    let {pedido} = cliente;
    // console.log(pedido);

    //Revisa que la cantidad sea mayor a cero producto es inf del archivo json y articulo del objeto
    if(producto.cantidad > 0){//SI es mayor es porque ya hay platillos en el obj
        //verificar si un elemento ya esta en el arreglo
        if(pedido.some( articulo => articulo.id === producto.id)){
            //El articulo ya existe, actualizar solo la cantidad
            const pedidoActualizado = pedido.map( articulo => {//map crea un arreglo nuevo
                //Verificar cual es el elemento a actualizar
                if ( articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;//pasar la informacion del input al array
                }
                return articulo;//retornamos articulo para no perder la referencia de los objetos en la act
            });
            //Se asigna el nuevo array al cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        }else{
            //Si no existe se tiene  que agregar el elemento
            cliente.pedido = [...pedido, producto];
        }

    }else{
        //eliminar pedido cuando la cantidad sea cero, elminar el pedido del obj(En caso de que el usuario se equivoque y regrese a cero)
        // console.log('No es mayor a 0');
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];//Actualizar obj
        //console.log(resultado );
    }

    //Limpiar html previo(para que no se repita el codigo cada vez que se manda a llamar la funcion)
    limpiarHTML();


    //si hay cantidad muestra el resumen de consumo
    if(cliente.pedido.length){
        // console.log(cliente.pedido);
        actualizarResumen();//Mostrar pedidos en resumen de consumo
    }else{
        mensajePedidoVacio();//nos vuelva a mostrar el mesanje de agregar algo
    }

}

function actualizarResumen(){
    // console.log('Desde actualizar Resumen');

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    //Agreagr mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Agregar hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar al elemento padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id} = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Cantidad del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Precio del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        //Subtotal
        const subtotal = document.createElement('P');
        subtotal.classList.add('fw-bold');
        subtotal.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        //Boton para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = function (){
            eliminarProducto(id);
        }

        //Agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotal.appendChild(subtotalValor);

        //Agregar elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotal);
        lista.appendChild(btnEliminar);

        //Agregar lista al grupo principal
        grupo.appendChild(lista);

        // console.log(articulo);
    });


    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar forularios de propinas
    formularioPropinas();
}

function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    return `$${precio * cantidad}`;
}

function eliminarProducto(id){
    const {pedido} = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];//Actualizar obj

    //Actualizar el DOM
    limpiarHTML();

    if(cliente.pedido.length){
        //console.log(cliente.pedido);
        actualizarResumen();//Mostrar pedidos en resumen de consumo
    }else{
        mensajePedidoVacio();//nos vuelva a mostrar el mesanje de agregar algo
    }

    //Regresar formulario (input) a cero si el producto ha sido eliminado
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    // console.log(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');
    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');
    const formulario = document.createElement('DIV');

    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    //Agregar radioButon 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL')
    radio10Label.textContent = "10%";
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);



    //Agregar radioButon 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL')
    radio25Label.textContent = "25%";
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);


    //Agregar radioButon 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL')
    radio50Label.textContent = "50%";
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);


    //Agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    formulario.appendChild(divFormulario);

    //Agregarmal formulario
    contenido.appendChild(formulario);
}

function calcularPropina(){
    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el subtotal
    pedido.forEach( articulo => {
        const {cantidad, precio} = articulo;
        subtotal += cantidad * precio;
    });

    //Obtener el radio de propina seleccioando
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcula propina
    const propina = ((subtotal * parseInt( propinaSeleccionada )) / 100);

    //Calcula el total
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}

function mostrarTotalHTML(subtotal, total, propina){

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-5');

    //Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);



    //Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);



    //Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);


    //Eliminar el resultado anterior
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    //Agregar al contenedor
    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);
} 