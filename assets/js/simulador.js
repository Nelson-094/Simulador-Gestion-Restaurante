// Variables
let menu = [
    { id: 1, nombre: "Milanesa con puré", precio: 15000 },
    { id: 2, nombre: "Pasta con salsa", precio: 12000 },
    { id: 3, nombre: "Ensalada mixta", precio: 9500 }
];
let pedidoActual = [];
let ventasDiarias = [];
let totalVentas = 0;
let nombreCliente = "";

// Función para iniciar
function iniciarSimulador() {
    let continuar = true;

    // Bienvenida
    alert("¡Bienvenido al Simulador de Gestión de Restaurante!");

    while (continuar) {
        let opcion = mostrarMenuPrincipal();

        switch (opcion) {
            case "1":
                mostrarMenu();
                break;
            case "2":
                agregarPlato();
                break;
            case "3":
                tomarPedido();
                break;
            case "4":
                mostrarVentasDiarias();
                break;
            case "5":
                continuar = false;
                alert("¡Gracias por usar el Simulador de Gestión de Restaurante!");
                break;
            default:
                alert("Opción no válida. Por favor, intente nuevamente.");
        }
    }
}

// Función para mostrar el menú principal
function mostrarMenuPrincipal() {
    let mensaje = "MENÚ PRINCIPAL\n\n" +
        "1. Ver menú del restaurante\n" +
        "2. Agregar plato al menú\n" +
        "3. Tomar pedido\n" +
        "4. Ver ventas diarias\n" +
        "5. Salir\n\n" +
        "Ingrese el número de la opción deseada:";

    return prompt(mensaje);
}

// Función para mostrar el menú del restaurante
function mostrarMenu() {
    let mensaje = "MENÚ DEL RESTAURANTE\n\n";

    for (let i = 0; i < menu.length; i++) {
        mensaje += `${menu[i].id}. ${menu[i].nombre} - $${menu[i].precio}\n`;
    }

    alert(mensaje);
    console.log("Menú del restaurante:");
    console.table(menu);
}

// Función para agregar un plato al menú
function agregarPlato() {
    let nombre = prompt("Ingrese el nombre del nuevo plato:");

    if (nombre === null || nombre.trim() === "") {
        alert("Operación cancelada o nombre inválido.");
        return;
    }

    let precioStr = prompt("Ingrese el precio del plato:");
    let precio = parseFloat(precioStr);

    if (isNaN(precio) || precio <= 0) {
        alert("Precio inválido. Debe ser un número mayor a cero.");
        return;
    }

    // Generar un nuevo ID (el siguiente al último plato)
    let nuevoId = menu.length > 0 ? menu[menu.length - 1].id + 1 : 1;

    // Agregar el nuevo plato al menú
    let nuevoPlato = {
        id: nuevoId,
        nombre: nombre,
        precio: precio
    };

    menu.push(nuevoPlato);

    alert(`¡Plato "${nombre}" agregado al menú con éxito!`);
    console.log("Plato agregado al menú:", nuevoPlato);
    console.table(menu);
}

// Función para tomar un pedido
function tomarPedido() {
    if (menu.length === 0) {
        alert("No hay platos en el menú para tomar un pedido.");
        return;
    }

    // Reiniciar el pedido actual
    pedidoActual = [];

    // Pedir nombre del cliente
    nombreCliente = prompt("Ingrese el nombre del cliente:");

    if (nombreCliente === null || nombreCliente.trim() === "") {
        alert("Pedido cancelado.");
        return;
    }

    let agregarMasPlatos = true;

    while (agregarMasPlatos) {
        // Mostrar menú para selección
        let mensajeSeleccion = "MENÚ (Ingrese el número del plato):\n\n";

        for (let i = 0; i < menu.length; i++) {
            mensajeSeleccion += `${menu[i].id}. ${menu[i].nombre} - $${menu[i].precio}\n`;
        }

        let seleccion = prompt(mensajeSeleccion);
        let platoSeleccionado = null;

        // Buscar el plato seleccionado
        for (let i = 0; i < menu.length; i++) {
            if (menu[i].id.toString() === seleccion) {
                platoSeleccionado = menu[i];
                break;
            }
        }

        if (platoSeleccionado === null) {
            alert("Plato no encontrado. Por favor, intente nuevamente.");
        } else {
            // Agregar al pedido
            pedidoActual.push(platoSeleccionado);
            alert(`¡${platoSeleccionado.nombre} agregado al pedido!`);

            // Preguntar si desea agregar más platos
            agregarMasPlatos = confirm("¿Desea agregar otro plato al pedido?");
        }
    }

    // Calcular y mostrar el pedido
    if (pedidoActual.length > 0) {
        calcularCuenta();
    } else {
        alert("No se agregaron platos al pedido.");
    }
}

// Función para calcular la cuenta
function calcularCuenta() {
    let total = 0;
    let detallePedido = `PEDIDO DE ${nombreCliente}\n\n`;

    for (let i = 0; i < pedidoActual.length; i++) {
        detallePedido += `${i + 1}. ${pedidoActual[i].nombre} - $${pedidoActual[i].precio}\n`;
        total += pedidoActual[i].precio;
    }

    detallePedido += `\nTOTAL: $${total}`;

    alert(detallePedido);
    console.log(`Pedido de ${nombreCliente}:`);
    console.table(pedidoActual);
    console.log(`Total: $${total}`);

    // Confirmar y registrar venta
    let confirmarVenta = confirm("¿Confirmar venta?");

    if (confirmarVenta) {
        let venta = {
            cliente: nombreCliente,
            platos: pedidoActual.slice(), // Copia del array
            total: total,
            fecha: new Date().toLocaleString()
        };

        ventasDiarias.push(venta);
        totalVentas += total;

        alert(`¡Venta registrada! Total acumulado del día: $${totalVentas}`);
        console.log("Venta registrada:", venta);
    } else {
        alert("Venta cancelada.");
    }
}

// Función para mostrar las ventas diarias
function mostrarVentasDiarias() {
    if (ventasDiarias.length === 0) {
        alert("No hay ventas registradas para el día de hoy.");
        return;
    }

    let mensaje = `VENTAS DEL DÍA (${ventasDiarias.length} ventas)\n\n`;

    for (let i = 0; i < ventasDiarias.length; i++) {
        let venta = ventasDiarias[i];
        mensaje += `Venta #${i + 1} - ${venta.cliente} - $${venta.total} - ${venta.fecha}\n`;
    }

    mensaje += `\nTOTAL DE VENTAS: $${totalVentas}`;

    alert(mensaje);
    console.log("Ventas diarias:");
    console.table(ventasDiarias);
    console.log(`Total de ventas: $${totalVentas}`);
}

// Iniciar el simulador automáticamente cuando la página cargue
document.addEventListener('DOMContentLoaded', function () {
    console.log("Simulador de Gestión de Restaurante cargado. Haga clic en 'Iniciar Simulador' para comenzar.");
});