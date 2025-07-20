// SISTEMA EMPLEADOS - TOMA DE PEDIDOS
// Este archivo maneja el sistema de empleados

var usuarioLogueado = null;
var menuRestaurante = [];
var mesasRestaurante = [];
var carritoActual = [];
var mesaAsignada = null;

// Función para construir rutas de imágenes
function obtenerRutaImagen(rutaImagen) {
    if (!rutaImagen) return null;
    var estaEnPages = window.location.pathname.indexOf('/pages/') !== -1;
    return estaEnPages ? '../' + rutaImagen : './' + rutaImagen;
}

// Verificar si el usuario está logueado
function verificarLogin() {
    var sesion = localStorage.getItem('sesionRestaurante');
    if (!sesion) {
        window.location.href = '../index.html';
        return false;
    }
    usuarioLogueado = JSON.parse(sesion);
    document.getElementById('nombre-usuario').textContent = usuarioLogueado.nombre;
    return true;
}

// Inicializar la aplicación
function inicializar() {
    if (!verificarLogin()) return;
    configurarEventos();
    cargarDatos();
    actualizarEstadisticas();
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('cerrar-sesion').onclick = cerrarSesion;
    document.getElementById('asignar-mesa').onclick = asignarMesa;
    document.getElementById('liberar-mesa').onclick = liberarMesa;
    document.getElementById('confirmar-pedido').onclick = confirmarPedido;
    document.getElementById('limpiar-carrito').onclick = limpiarCarrito;
}

// Cargar datos
function cargarDatos() {
    cargarMenu();
    cargarMesas();
}

// Cargar menú
function cargarMenu() {
    fetch('../data/menu.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            menuRestaurante = data.platos;
            mostrarMenu();
        })
        .catch(function (error) {
            console.log('Error cargando menú:', error);
            menuRestaurante = [
                { id: 1, nombre: "Milanesa con papas", precio: 2500, descripcion: "Clásica milanesa", categoria: "platos principales" }
            ];
            mostrarMenu();
        });
}

// Cargar mesas
function cargarMesas() {
    var estadoGuardado = localStorage.getItem('estadoMesas');
    if (estadoGuardado) {
        mesasRestaurante = JSON.parse(estadoGuardado);
        mostrarMesas();
        return;
    }

    fetch('../data/mesas.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            mesasRestaurante = data.mesas;
            mostrarMesas();
        })
        .catch(function (error) {
            console.log('Error cargando mesas:', error);
            mesasRestaurante = [
                { id: 1, capacidad: 2, estado: "libre", meseroAsignado: null },
                { id: 2, capacidad: 4, estado: "libre", meseroAsignado: null }
            ];
            mostrarMesas();
        });
}

// Mostrar menú en pantalla
function mostrarMenu() {
    var categorias = ['entradas', 'platos principales', 'postres', 'bebidas'];

    for (var i = 0; i < categorias.length; i++) {
        var categoria = categorias[i];
        var contenedor = document.getElementById(categoria.replace(' ', '-') + '-container');
        if (!contenedor) continue;

        contenedor.innerHTML = '';

        for (var j = 0; j < menuRestaurante.length; j++) {
            var plato = menuRestaurante[j];
            if (plato.categoria === categoria) {
                var div = document.createElement('div');
                div.className = 'col-md-6 col-lg-4';
                div.innerHTML = '<div class="menu-item">' +
                    '<div class="menu-img">' +
                    (plato.imagen ? '<img src="' + obtenerRutaImagen(plato.imagen) + '" alt="' + plato.nombre + '" style="width: 100%; height: 100%; object-fit: cover;">' : '<i class="fas fa-utensils" style="font-size: 2rem; color: var(--primary);"></i>') +
                    '</div>' +
                    '<div class="menu-item-body">' +
                    '<h5 class="menu-item-title">' + plato.nombre + '</h5>' +
                    '<div class="menu-item-price">$' + plato.precio.toLocaleString() + '</div>' +
                    '<p class="menu-item-description">' + plato.descripcion + '</p>' +
                    '<button class="btn btn-primary w-100" onclick="agregarAlCarrito(' + plato.id + ')">' +
                    '<i class="fas fa-plus me-2"></i>Agregar' +
                    '</button>' +
                    '</div>' +
                    '</div>';
                contenedor.appendChild(div);
            }
        }
    }
}

// Mostrar mesas en select
function mostrarMesas() {
    var select = document.getElementById('seleccionar-mesa');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar mesa...</option>';

    for (var i = 0; i < mesasRestaurante.length; i++) {
        var mesa = mesasRestaurante[i];
        if (mesa.estado === 'libre') {
            var option = document.createElement('option');
            option.value = mesa.id;
            option.textContent = 'Mesa ' + mesa.id + ' (' + mesa.capacidad + ' personas)';
            select.appendChild(option);
        }
    }
}

// Asignar mesa
function asignarMesa() {
    var mesaId = document.getElementById('seleccionar-mesa').value;
    if (!mesaId) {
        Swal.fire('Error', 'Selecciona una mesa', 'warning');
        return;
    }

    for (var i = 0; i < mesasRestaurante.length; i++) {
        if (mesasRestaurante[i].id == mesaId && mesasRestaurante[i].estado === 'libre') {
            mesasRestaurante[i].estado = 'ocupada';
            mesasRestaurante[i].meseroAsignado = usuarioLogueado.id;
            mesaAsignada = mesasRestaurante[i];

            document.getElementById('mesa-actual').textContent = 'Mesa ' + mesaId;
            document.getElementById('mesa-pedido').textContent = mesaId;
            document.getElementById('mesa-info').style.display = 'block';
            document.getElementById('asignar-mesa').textContent = 'Cambiar mesa';
            document.getElementById('liberar-mesa').style.display = 'inline-block';
            document.getElementById('confirmar-pedido').disabled = false;

            mostrarMesas();
            guardarMesas();

            Swal.fire('Éxito', 'Mesa asignada correctamente', 'success');
            return;
        }
    }
}

// Liberar mesa
function liberarMesa() {
    if (!mesaAsignada) return;

    Swal.fire({
        title: '¿Liberar mesa?',
        text: 'Se liberará la mesa ' + mesaAsignada.id,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, liberar'
    }).then(function (result) {
        if (result.isConfirmed) {
            mesaAsignada.estado = 'libre';
            mesaAsignada.meseroAsignado = null;
            mesaAsignada = null;
            carritoActual = [];

            document.getElementById('mesa-actual').textContent = 'No asignada';
            document.getElementById('mesa-info').style.display = 'none';
            document.getElementById('asignar-mesa').textContent = 'Asignar mesa';
            document.getElementById('liberar-mesa').style.display = 'none';
            document.getElementById('confirmar-pedido').disabled = true;

            mostrarMesas();
            actualizarCarrito();
            guardarMesas();

            Swal.fire('Mesa liberada', '', 'success');
        }
    });
}

// Agregar al carrito
function agregarAlCarrito(platoId) {
    if (!mesaAsignada) {
        Swal.fire('Error', 'Primero asigna una mesa', 'warning');
        return;
    }

    var plato = null;
    for (var i = 0; i < menuRestaurante.length; i++) {
        if (menuRestaurante[i].id === platoId) {
            plato = menuRestaurante[i];
            break;
        }
    }

    if (!plato) return;

    var itemExistente = null;
    for (var j = 0; j < carritoActual.length; j++) {
        if (carritoActual[j].id === platoId) {
            itemExistente = carritoActual[j];
            break;
        }
    }

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carritoActual.push({
            id: plato.id,
            nombre: plato.nombre,
            precio: plato.precio,
            cantidad: 1
        });
    }

    actualizarCarrito();
    Swal.fire({
        title: 'Agregado',
        text: plato.nombre + ' agregado al pedido',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
    });
}

// Actualizar carrito
function actualizarCarrito() {
    var contenedor = document.getElementById('cart-items');
    if (!contenedor) return;

    if (carritoActual.length === 0) {
        contenedor.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Selecciona una mesa y agrega platos</p></div>';
        actualizarTotales(0);
        return;
    }

    contenedor.innerHTML = '';
    var subtotal = 0;

    for (var i = 0; i < carritoActual.length; i++) {
        var item = carritoActual[i];
        var itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = '<div class="cart-item-name">' + item.nombre + '</div>' +
            '<div class="quantity-control">' +
            '<button class="quantity-btn" onclick="cambiarCantidad(' + item.id + ', -1)"><i class="fas fa-minus"></i></button>' +
            '<span class="cart-item-quantity">' + item.cantidad + '</span>' +
            '<button class="quantity-btn" onclick="cambiarCantidad(' + item.id + ', 1)"><i class="fas fa-plus"></i></button>' +
            '</div>' +
            '<div class="cart-item-price">$' + (item.precio * item.cantidad).toLocaleString() + '</div>';
        contenedor.appendChild(itemDiv);
        subtotal += item.precio * item.cantidad;
    }

    actualizarTotales(subtotal);
}

// Cambiar cantidad
function cambiarCantidad(platoId, cambio) {
    for (var i = 0; i < carritoActual.length; i++) {
        if (carritoActual[i].id === platoId) {
            carritoActual[i].cantidad += cambio;
            if (carritoActual[i].cantidad <= 0) {
                carritoActual.splice(i, 1);
            }
            break;
        }
    }
    actualizarCarrito();
}

// Actualizar totales
function actualizarTotales(subtotal) {
    var iva = subtotal * 0.21;
    var total = subtotal + iva;

    document.getElementById('subtotal').textContent = '$' + subtotal.toLocaleString();
    document.getElementById('iva').textContent = '$' + Math.round(iva).toLocaleString();
    document.getElementById('total-final').textContent = '$' + Math.round(total).toLocaleString();
}

// Limpiar carrito
function limpiarCarrito() {
    if (carritoActual.length === 0) return;

    Swal.fire({
        title: '¿Limpiar pedido?',
        text: 'Se eliminarán todos los items',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar'
    }).then(function (result) {
        if (result.isConfirmed) {
            carritoActual = [];
            actualizarCarrito();
            Swal.fire('Pedido limpiado', '', 'success');
        }
    });
}

// Confirmar pedido
function confirmarPedido() {
    if (carritoActual.length === 0) {
        Swal.fire('Error', 'Agrega algunos platos', 'warning');
        return;
    }

    var subtotal = 0;
    for (var i = 0; i < carritoActual.length; i++) {
        subtotal += carritoActual[i].precio * carritoActual[i].cantidad;
    }
    var total = subtotal * 1.21;

    var resumen = '<h5>Resumen del pedido:</h5>' +
        '<p><strong>Mesa:</strong> ' + mesaAsignada.id + '</p>' +
        '<p><strong>Mesero:</strong> ' + usuarioLogueado.nombre + '</p>' +
        '<table class="table table-sm"><thead><tr><th>Plato</th><th>Cant.</th><th>Precio</th></tr></thead><tbody>';

    for (var j = 0; j < carritoActual.length; j++) {
        var item = carritoActual[j];
        resumen += '<tr><td>' + item.nombre + '</td><td>' + item.cantidad + '</td><td>$' + (item.precio * item.cantidad).toLocaleString() + '</td></tr>';
    }

    resumen += '</tbody></table><div class="text-end"><strong>Total: $' + Math.round(total).toLocaleString() + '</strong></div>';

    Swal.fire({
        title: '¿Confirmar pedido?',
        html: resumen,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar'
    }).then(function (result) {
        if (result.isConfirmed) {
            procesarPedido();
        }
    });
}

// Procesar pedido
function procesarPedido() {
    var pedido = {
        id: Date.now(),
        mesa: mesaAsignada.id,
        mesero: usuarioLogueado.nombre,
        items: carritoActual.slice(),
        fecha: new Date().toISOString(),
        total: carritoActual.reduce(function (sum, item) { return sum + item.precio * item.cantidad; }, 0) * 1.21
    };

    var pedidos = JSON.parse(localStorage.getItem('pedidosRestaurante') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidosRestaurante', JSON.stringify(pedidos));

    if (!usuarioLogueado.estadisticas) {
        usuarioLogueado.estadisticas = { pedidosHoy: 0 };
    }
    usuarioLogueado.estadisticas.pedidosHoy++;
    localStorage.setItem('sesionRestaurante', JSON.stringify(usuarioLogueado));

    carritoActual = [];
    actualizarCarrito();
    actualizarEstadisticas();

    Swal.fire('¡Pedido confirmado!', 'Pedido #' + pedido.id + ' procesado', 'success');
}

// Guardar mesas
function guardarMesas() {
    localStorage.setItem('estadoMesas', JSON.stringify(mesasRestaurante));
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    if (usuarioLogueado && usuarioLogueado.estadisticas) {
        document.getElementById('pedidos-hoy').textContent = usuarioLogueado.estadisticas.pedidosHoy || 0;
    }
}

// Cerrar sesión
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión'
    }).then(function (result) {
        if (result.isConfirmed) {
            localStorage.removeItem('sesionRestaurante');
            window.location.href = '../index.html';
        }
    });
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}