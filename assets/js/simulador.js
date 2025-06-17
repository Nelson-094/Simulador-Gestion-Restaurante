// Constructor de platos
function Plato(nombre, precio, descripcion) {
    this.nombre = nombre;
    this.precio = precio;
    this.descripcion = descripcion;
}

// Menú inicial
const menu = [
    new Plato("Milanesa con papas", 2500, "Clásica milanesa con papas fritas."),
    new Plato("Ravioles con tuco", 2300, "Pasta casera con salsa."),
    new Plato("Hamburguesa completa", 2000, "Con cheddar, lechuga y tomate."),
    new Plato("Ensalada César", 1800, "Fresca y liviana.")
];

let pedido = [];

// Mostrar menú en el HTML
function mostrarMenu() {
    const contenedor = document.getElementById("menu-container");
    contenedor.innerHTML = ""; // Limpiar contenido anterior

    menu.forEach((plato, index) => {
        const card = document.createElement("div");
        card.className = "card col-md-5 m-2 p-2";
        card.innerHTML = `
            <h5 class="card-title">${plato.nombre}</h5>
            <p class="card-text">${plato.descripcion}</p>
            <p class="text-primary">$${plato.precio}</p>
            <button class="btn btn-success agregar-btn" data-index="${index}">Agregar</button>
        `;
        contenedor.appendChild(card);
    });

    // Agregar evento a botones
    document.querySelectorAll(".agregar-btn").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            agregarAlPedido(index);
        });
    });
}

function agregarAlPedido(index) {
    const plato = menu[index];
    pedido.push(plato);
    guardarPedido();
    mostrarPedido();
}

function mostrarPedido() {
    const lista = document.getElementById("pedido-lista");
    lista.innerHTML = "";

    pedido.forEach((plato, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerHTML = `${plato.nombre} - $${plato.precio}
            <button class="btn btn-sm btn-danger" onclick="eliminarDelPedido(${i})">Eliminar</button>`;
        lista.appendChild(li);
    });

    actualizarTotal();
}

function eliminarDelPedido(i) {
    pedido.splice(i, 1);
    guardarPedido();
    mostrarPedido();
}

function actualizarTotal() {
    const total = pedido.reduce((acc, plato) => acc + plato.precio, 0);
    document.getElementById("total-pedido").innerText = `$${total}`;
}

// Guardar pedido en localStorage
function guardarPedido() {
    localStorage.setItem("pedidoGuardado", JSON.stringify(pedido));
}

// Cargar pedido si existe
function cargarPedidoGuardado() {
    const guardado = localStorage.getItem("pedidoGuardado");
    if (guardado) {
        pedido = JSON.parse(guardado);
        mostrarPedido();
    }
}

// Confirmar pedido
document.addEventListener("DOMContentLoaded", () => {
    cargarPedidoGuardado();
    mostrarMenu();

    document.getElementById("confirmar-pedido").addEventListener("click", () => {
        if (pedido.length === 0) {
            alert("¡No hay platos en el pedido!");
            return;
        }

        // Agrupar platos repetidos
        const resumen = {};
        pedido.forEach(plato => {
            if (resumen[plato.nombre]) {
                resumen[plato.nombre].cantidad += 1;
            } else {
                resumen[plato.nombre] = {
                    cantidad: 1,
                    precio: plato.precio
                };
            }
        });

        let mensaje = "Pedido confirmado:\n\n";
        let total = 0;
        for (let nombre in resumen) {
            const item = resumen[nombre];
            mensaje += `- ${nombre} (x${item.cantidad}) - $${item.precio * item.cantidad}\n`;
            total += item.precio * item.cantidad;
        }
        mensaje += `\nTotal: $${total}`;

        alert(mensaje);
        pedido = [];
        localStorage.removeItem("pedidoGuardado");
        mostrarPedido();
    });
});
