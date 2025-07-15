// ============================================
// SISTEMA EMPLEADOS - TOMA DE PEDIDOS
// ============================================

// Variables globales
let usuarioActual = null;
let menu = [];
let mesas = [];
let carrito = [];
let mesaActual = null;

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

// Verificar autenticación
const verificarAutenticacion = () => {
    const sesion = localStorage.getItem('sesionRestaurante');
    if (!sesion) {
        window.location.href = '../index.html';
        return false;
    }
    
    usuarioActual = JSON.parse(sesion);
    document.getElementById('nombre-usuario').textContent = usuarioActual.nombre;
    return true;
};

// Inicializar aplicación
const inicializarApp = () => {
    if (!verificarAutenticacion()) return;
    
    configurarEventos();
    cargarDatos();
    actualizarEstadisticas();
};

// Configurar eventos
const configurarEventos = () => {
    // Cerrar sesión
    document.getElementById('cerrar-sesion').addEventListener('click', cerrarSesion);
    
    // Gestión de mesas
    document.getElementById('asignar-mesa').addEventListener('click', asignarMesa);
    document.getElementById('liberar-mesa').addEventListener('click', liberarMesa);
    
    // Carrito
    document.getElementById('confirmar-pedido').addEventListener('click', confirmarPedido);
    document.getElementById('limpiar-carrito').addEventListener('click', limpiarCarrito);
};

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

// Cargar todos los datos necesarios
const cargarDatos = async () => {
    try {
        await Promise.all([
            cargarMenu(),
            cargarMesas()
        ]);
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

// Cargar menú
const cargarMenu = async () => {
    try {
        const response = await fetch('../data/menu.json');
        const data = await response.json();
        menu = data.platos;
        generarMenuHTML();
    } catch (error) {
        console.error('Error al cargar menú:', error);
        // Datos de respaldo
        menu = [
            {
                id: 1,
                nombre: "Milanesa con papas",
                precio: 2500,
                descripcion: "Clásica milanesa con papas fritas",
                categoria: "platos principales"
            }
        ];
        generarMenuHTML();
    }
};

// Cargar mesas
const cargarMesas = async () => {
    try {
        // Cargar estado actual desde localStorage
        const estadoGuardado = localStorage.getItem('estadoMesas');
        if (estadoGuardado) {
            mesas = JSON.parse(estadoGuardado);
        } else {
            const response = await fetch('../data/mesas.json');
            const data = await response.json();
            mesas = data.mesas;
        }
        generarSelectMesas();
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        // Datos de respaldo
        mesas = [
            { id: 1, capacidad: 2, estado: "libre", meseroAsignado: null },
            { id: 2, capacidad: 4, estado: "libre", meseroAsignado: null }
        ];
        generarSelectMesas();
    }
};

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

// Generar HTML del menú
const generarMenuHTML = () => {
    const categorias = ['entradas', 'platos principales', 'postres', 'bebidas'];
    
    categorias.forEach(categoria => {
        const container = document.getElementById(`${categoria.replace(' ', '-')}-container`);
        if (container) {
            container.innerHTML = '';
            
            const platosCategoria = menu.filter(plato => plato.categoria === categoria);
            
            platosCategoria.forEach(plato => {
                const platoHTML = crearTarjetaPlato(plato);
                container.appendChild(platoHTML);
            });
        }
    });
};

// Crear tarjeta de plato
const crearTarjetaPlato = (plato) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const card = document.createElement('div');
    card.className = 'menu-item animate-fade-in';
    
    card.innerHTML = `
        <div class="menu-img">
            <i class="fas fa-utensils" style="font-size: 2rem; color: var(--primary);"></i>
        </div>
        <div class="menu-item-body">
            <h5 class="menu-item-title">${plato.nombre}</h5>
            <div class="menu-item-price">$${plato.precio.toLocaleString()}</div>
            <p class="menu-item-description">${plato.descripcion}</p>
            <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${plato.id})">
                <i class="fas fa-plus me-2"></i>Agregar
            </button>
        </div>
    `;
    
    col.appendChild(card);
    return col;
};

// Generar select de mesas
const generarSelectMesas = () => {
    const select = document.getElementById('seleccionar-mesa');
    select.innerHTML = '<option value="">Seleccionar mesa...</option>';
    
    const mesasLibres = mesas.filter(mesa => mesa.estado === 'libre');
    
    mesasLibres.forEach(mesa => {
        const option = document.createElement('option');
        option.value = mesa.id;
        option.textContent = `Mesa ${mesa.id} (${mesa.capacidad} personas)`;
        select.appendChild(option);
    });
};

// ============================================
// FUNCIONES DE GESTIÓN DE MESAS
// ============================================

// Asignar mesa
const asignarMesa = () => {
    const mesaId = document.getElementById('seleccionar-mesa').value;
    
    if (!mesaId) {
        Swal.fire({
            icon: 'warning',
            title: 'Selecciona una mesa',
            text: 'Debes seleccionar una mesa para continuar'
        });
        return;
    }
    
    const mesa = mesas.find(m => m.id == mesaId);
    
    if (mesa && mesa.estado === 'libre') {
        mesa.estado = 'ocupada';
        mesa.meseroAsignado = usuarioActual.id;
        mesa.fechaUltimaOcupacion = new Date().toISOString();
        
        mesaActual = mesa;
        
        // Actualizar interfaz
        document.getElementById('mesa-actual').textContent = `Mesa ${mesa.id}`;
        document.getElementById('mesa-pedido').textContent = mesa.id;
        document.getElementById('mesa-info').style.display = 'block';
        document.getElementById('asignar-mesa').style.display = 'none';
        document.getElementById('liberar-mesa').style.display = 'inline-block';
        document.getElementById('confirmar-pedido').disabled = false;
        
        // Actualizar select
        generarSelectMesas();
        
        // Guardar estado
        guardarEstadoMesas();
        
        Swal.fire({
            icon: 'success',
            title: 'Mesa asignada',
            text: `Mesa ${mesa.id} asignada correctamente`,
            timer: 1500,
            showConfirmButton: false
        });
    }
};

// Liberar mesa
const liberarMesa = () => {
    if (!mesaActual) return;
    
    Swal.fire({
        title: '¿Liberar mesa?',
        text: `Se liberará la mesa ${mesaActual.id}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, liberar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            mesaActual.estado = 'libre';
            mesaActual.meseroAsignado = null;
            mesaActual = null;
            
            // Limpiar carrito
            carrito = [];
            actualizarCarrito();
            
            // Actualizar interfaz
            document.getElementById('mesa-actual').textContent = 'No asignada';
            document.getElementById('mesa-info').style.display = 'none';
            document.getElementById('asignar-mesa').style.display = 'inline-block';
            document.getElementById('liberar-mesa').style.display = 'none';
            document.getElementById('confirmar-pedido').disabled = true;
            
            // Actualizar select
            generarSelectMesas();
            
            // Guardar estado
            guardarEstadoMesas();
            
            Swal.fire({
                icon: 'success',
                title: 'Mesa liberada',
                text: 'La mesa ha sido liberada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
};

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

// Agregar al carrito
const agregarAlCarrito = (platoId) => {
    if (!mesaActual) {
        Swal.fire({
            icon: 'warning',
            title: 'Asigna una mesa',
            text: 'Primero debes asignar una mesa para tomar pedidos'
        });
        return;
    }
    
    const plato = menu.find(p => p.id === platoId);
    if (!plato) return;
    
    const itemExistente = carrito.find(item => item.id === platoId);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            ...plato,
            cantidad: 1
        });
    }
    
    actualizarCarrito();
    
    // Notificación
    Swal.fire({
        icon: 'success',
        title: 'Agregado al pedido',
        text: `${plato.nombre} agregado`,
        timer: 1000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
};

// Actualizar carrito
const actualizarCarrito = () => {
    const container = document.getElementById('cart-items');
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Selecciona una mesa y agrega platos</p>
            </div>
        `;
        actualizarTotales(0);
        return;
    }
    
    container.innerHTML = '';
    
    carrito.forEach(item => {
        const itemHTML = document.createElement('div');
        itemHTML.className = 'cart-item';
        itemHTML.innerHTML = `
            <div class="cart-item-name">${item.nombre}</div>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="cart-item-quantity">${item.cantidad}</span>
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString()}</div>
        `;
        container.appendChild(itemHTML);
    });
    
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    actualizarTotales(subtotal);
};

// Cambiar cantidad
const cambiarCantidad = (platoId, cambio) => {
    const item = carrito.find(item => item.id === platoId);
    if (!item) return;
    
    item.cantidad += cambio;
    
    if (item.cantidad <= 0) {
        const index = carrito.findIndex(item => item.id === platoId);
        carrito.splice(index, 1);
    }
    
    actualizarCarrito();
};

// Actualizar totales
const actualizarTotales = (subtotal) => {
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('iva').textContent = `$${iva.toLocaleString()}`;
    document.getElementById('total-final').textContent = `$${total.toLocaleString()}`;
};

// Limpiar carrito
const limpiarCarrito = () => {
    if (carrito.length === 0) return;
    
    Swal.fire({
        title: '¿Limpiar pedido?',
        text: 'Se eliminarán todos los items del pedido',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            
            Swal.fire({
                icon: 'success',
                title: 'Pedido limpiado',
                text: 'El pedido ha sido limpiado',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
};

// Confirmar pedido
const confirmarPedido = () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Pedido vacío',
            text: 'Agrega algunos platos antes de confirmar'
        });
        return;
    }
    
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    // Generar resumen
    let resumenHTML = '<div class="text-start"><h5>Resumen del pedido:</h5>';
    resumenHTML += `<p><strong>Mesa:</strong> ${mesaActual.id}</p>`;
    resumenHTML += `<p><strong>Mesero:</strong> ${usuarioActual.nombre}</p>`;
    resumenHTML += '<hr><table class="table table-sm">';
    resumenHTML += '<thead><tr><th>Plato</th><th>Cant.</th><th>Precio</th></tr></thead><tbody>';
    
    carrito.forEach(item => {
        resumenHTML += `<tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>$${(item.precio * item.cantidad).toLocaleString()}</td></tr>`;
    });
    
    resumenHTML += '</tbody></table>';
    resumenHTML += `<div class="text-end"><strong>Total: $${total.toLocaleString()}</strong></div></div>`;
    
    Swal.fire({
        title: '¿Confirmar pedido?',
        html: resumenHTML,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        width: '600px'
    }).then((result) => {
        if (result.isConfirmed) {
            procesarPedido();
        }
    });
};

// Procesar pedido
const procesarPedido = () => {
    // Guardar pedido
    const pedido = {
        id: Date.now(),
        mesa: mesaActual.id,
        mesero: usuarioActual.nombre,
        items: carrito,
        fecha: new Date().toISOString(),
        subtotal: carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0),
        iva: carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0) * 0.21,
        total: carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0) * 1.21
    };
    
    // Guardar en localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidosRestaurante') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidosRestaurante', JSON.stringify(pedidos));
    
    // Actualizar estadísticas
    usuarioActual.estadisticas = usuarioActual.estadisticas || { pedidosHoy: 0, pedidosTotal: 0 };
    usuarioActual.estadisticas.pedidosHoy += 1;
    usuarioActual.estadisticas.pedidosTotal += 1;
    
    // Actualizar sesión
    localStorage.setItem('sesionRestaurante', JSON.stringify(usuarioActual));
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    
    // Actualizar estadísticas en pantalla
    actualizarEstadisticas();
    
    Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        text: `Pedido #${pedido.id} procesado correctamente`,
        timer: 2000,
        showConfirmButton: false
    });
};

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

// Guardar estado de mesas
const guardarEstadoMesas = () => {
    localStorage.setItem('estadoMesas', JSON.stringify(mesas));
};

// Actualizar estadísticas
const actualizarEstadisticas = () => {
    if (usuarioActual && usuarioActual.estadisticas) {
        document.getElementById('pedidos-hoy').textContent = usuarioActual.estadisticas.pedidosHoy || 0;
    }
};

// Cerrar sesión
const cerrarSesion = () => {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Se perderán los datos no guardados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('sesionRestaurante');
            window.location.href = '../index.html';
        }
    });
};

// ============================================
// INICIALIZACIÓN
// ============================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}