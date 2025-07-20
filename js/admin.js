// PANEL ADMINISTRADOR - RESTAURANTE JS
// Sistema de administración completo

var usuarioLogueado = null;
var empleadosData = [];
var mesasData = [];
var pedidosData = [];
var empleadoEditando = null;
var menuData = [];

// Verificar autenticación de administrador
function verificarAdminLogin() {
    var sesion = localStorage.getItem('sesionRestaurante');
    if (!sesion) {
        window.location.href = '../index.html';
        return false;
    }
    usuarioLogueado = JSON.parse(sesion);
    if (usuarioLogueado.rol !== 'administrador') {
        Swal.fire('Acceso Denegado', 'Solo administradores pueden acceder', 'error').then(function () {
            window.location.href = '../index.html';
        });
        return false;
    }
    document.getElementById('nombre-usuario').textContent = usuarioLogueado.nombre;
    return true;
}

// Inicializar aplicación
function inicializar() {
    if (!verificarAdminLogin()) return;
    configurarEventos();
    cargarDatos();
    actualizarFecha();
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('cerrar-sesion').onclick = cerrarSesion;
    document.getElementById('agregar-empleado').onclick = mostrarModalEmpleado;
    document.getElementById('guardar-empleado').onclick = guardarEmpleado;
    document.getElementById('agregar-plato').onclick = mostrarModalPlato;
    document.getElementById('guardar-plato').onclick = guardarPlato;
    document.getElementById('limpiar-pedidos').onclick = limpiarPedidos;
}

// Cargar todos los datos
function cargarDatos() {
    cargarEmpleados();
    cargarMesas();
    cargarPedidos();
    cargarMenu();
}

// Cargar empleados
function cargarEmpleados() {
    fetch('../data/empleados.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            empleadosData = data.empleados;
            mostrarEmpleados();
            actualizarEstadisticas();
        })
        .catch(function (error) {
            console.log('Error cargando empleados:', error);
            empleadosData = [];
            mostrarEmpleados();
        });
}

// Cargar mesas
function cargarMesas() {
    var estadoGuardado = localStorage.getItem('estadoMesas');
    if (estadoGuardado) {
        mesasData = JSON.parse(estadoGuardado);
    } else {
        fetch('../data/mesas.json')
            .then(function (response) { return response.json(); })
            .then(function (data) {
                mesasData = data.mesas;
                mostrarMesas();
            })
            .catch(function (error) {
                console.log('Error cargando mesas:', error);
                mesasData = [];
            });
    }
    mostrarMesas();
}

// Cargar pedidos
function cargarPedidos() {
    var pedidosGuardados = localStorage.getItem('pedidosRestaurante');
    if (pedidosGuardados) {
        pedidosData = JSON.parse(pedidosGuardados);
        // Filtrar solo pedidos de hoy
        var hoy = new Date().toDateString();
        pedidosData = pedidosData.filter(function (pedido) {
            var fechaPedido = new Date(pedido.fecha).toDateString();
            return fechaPedido === hoy;
        });
    } else {
        pedidosData = [];
    }
    mostrarPedidos();
    calcularVentas();
}

// Cargar menú
function cargarMenu() {
    var menuGuardado = localStorage.getItem('menuRestaurante');
    if (menuGuardado) {
        menuData = JSON.parse(menuGuardado);
        mostrarMenuAdmin();
        return;
    }

    fetch('../data/menu.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            menuData = data.platos;
            localStorage.setItem('menuRestaurante', JSON.stringify(menuData));
            mostrarMenuAdmin();
        })
        .catch(function (error) {
            console.log('Error cargando menú:', error);
            menuData = [];
            mostrarMenuAdmin();
        });
}

// Mostrar lista de empleados
function mostrarEmpleados() {
    var contenedor = document.getElementById('lista-empleados');
    if (!contenedor || empleadosData.length === 0) {
        if (contenedor) contenedor.innerHTML = '<p class="text-muted">No hay empleados registrados</p>';
        return;
    }

    contenedor.innerHTML = '';
    for (var i = 0; i < empleadosData.length; i++) {
        var empleado = empleadosData[i];
        var estadoClass = empleado.activo ? 'success' : 'danger';
        var estadoText = empleado.activo ? 'Activo' : 'Inactivo';
        var estadoIcon = empleado.activo ? 'check-circle' : 'times-circle';

        var div = document.createElement('div');
        div.className = 'card mb-2';
        div.innerHTML = '<div class="card-body py-2">' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<div>' +
            '<strong>' + empleado.nombre + '</strong>' +
            '<span class="badge bg-' + estadoClass + ' ms-2">' +
            '<i class="fas fa-' + estadoIcon + ' me-1"></i>' + estadoText +
            '</span>' +
            '<br><small class="text-muted">@' + empleado.usuario + ' - ' + empleado.rol + '</small>' +
            '</div>' +
            '<div>' +
            '<button class="btn btn-outline-primary btn-sm me-1" onclick="editarEmpleado(' + empleado.id + ')">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn btn-outline-' + (empleado.activo ? 'danger' : 'success') + ' btn-sm" onclick="toggleEmpleado(' + empleado.id + ')">' +
            '<i class="fas fa-' + (empleado.activo ? 'user-times' : 'user-check') + '"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>';
        contenedor.appendChild(div);
    }
    mostrarRendimiento();
}

// Mostrar rendimiento de empleados
function mostrarRendimiento() {
    var contenedor = document.getElementById('rendimiento-empleados');
    if (!contenedor) return;

    var empleadosActivos = empleadosData.filter(function (emp) { return emp.activo && emp.rol === 'mesero'; });

    if (empleadosActivos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No hay meseros activos</p>';
        return;
    }

    contenedor.innerHTML = '';
    for (var i = 0; i < empleadosActivos.length; i++) {
        var empleado = empleadosActivos[i];
        var pedidosEmpleado = pedidosData.filter(function (p) { return p.mesero === empleado.nombre; }).length;
        var mesasAsignadas = mesasData.filter(function (m) { return m.meseroAsignado === empleado.id; }).length;

        var div = document.createElement('div');
        div.className = 'mb-3 p-2 border rounded';
        div.innerHTML = '<strong>' + empleado.nombre + '</strong>' +
            '<div class="row text-center mt-2">' +
            '<div class="col-6">' +
            '<div class="stat-number text-primary">' + pedidosEmpleado + '</div>' +
            '<small>Pedidos</small>' +
            '</div>' +
            '<div class="col-6">' +
            '<div class="stat-number text-warning">' + mesasAsignadas + '</div>' +
            '<small>Mesas</small>' +
            '</div>' +
            '</div>';
        contenedor.appendChild(div);
    }
}

// Mostrar mesas
function mostrarMesas() {
    var contenedor = document.getElementById('mesas-admin-grid');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    for (var i = 0; i < mesasData.length; i++) {
        var mesa = mesasData[i];
        var empleadoNombre = '';

        if (mesa.meseroAsignado) {
            var empleado = empleadosData.find(function (emp) { return emp.id === mesa.meseroAsignado; });
            empleadoNombre = empleado ? empleado.nombre : 'Desconocido';
        }

        var div = document.createElement('div');
        div.className = 'table-item ' + mesa.estado;
        div.innerHTML = '<div>' +
            '<div style="font-weight: bold;">Mesa ' + mesa.id + '</div>' +
            '<small>' + mesa.capacidad + ' pers.</small>' +
            (mesa.ubicacion ? '<small>' + mesa.ubicacion + '</small>' : '') +
            (empleadoNombre ? '<small>' + empleadoNombre + '</small>' : '') +
            (mesa.nombreReserva ? '<small>📋 ' + mesa.nombreReserva + '</small>' : '') +
            '</div>';
        contenedor.appendChild(div);
    }
}

// Mostrar menú en admin
function mostrarMenuAdmin() {
    var contenedor = document.getElementById('lista-menu');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    for (var i = 0; i < menuData.length; i++) {
        var plato = menuData[i];
        var div = document.createElement('div');
        div.className = 'card mb-2';
        div.innerHTML = '<div class="card-body">' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<div>' +
            '<strong>' + plato.nombre + '</strong> - $' + plato.precio.toLocaleString() +
            '<br><small class="text-muted">' + plato.categoria + '</small>' +
            '<br><small>' + plato.descripcion + '</small>' +
            '</div>' +
            '<button class="btn btn-danger btn-sm" onclick="eliminarPlato(' + plato.id + ')">' +
            '<i class="fas fa-trash me-1"></i>Eliminar' +
            '</button>' +
            '</div>' +
            '</div>';
        contenedor.appendChild(div);
    }
}

// Mostrar pedidos
function mostrarPedidos() {
    var contenedor = document.getElementById('lista-pedidos');
    if (!contenedor) return;

    if (pedidosData.length === 0) {
        contenedor.innerHTML = '<p class="text-muted text-center">No hay pedidos registrados hoy</p>';
        return;
    }

    contenedor.innerHTML = '';
    // Mostrar los últimos 10 pedidos
    var pedidosRecientes = pedidosData.slice(-10).reverse();

    for (var i = 0; i < pedidosRecientes.length; i++) {
        var pedido = pedidosRecientes[i];
        var fecha = new Date(pedido.fecha);
        var hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        var div = document.createElement('div');
        div.className = 'card mb-2';
        div.innerHTML = '<div class="card-body py-2">' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<div>' +
            '<strong>Pedido #' + pedido.id + '</strong>' +
            '<br><small class="text-muted">Mesa ' + pedido.mesa + ' - ' + pedido.mesero + ' - ' + hora + '</small>' +
            '</div>' +
            '<div class="text-end">' +
            '<strong class="text-primary">$' + Math.round(pedido.total).toLocaleString() + '</strong>' +
            '<br><small class="text-muted">' + pedido.items.length + ' items</small>' +
            '</div>' +
            '</div>' +
            '</div>';
        contenedor.appendChild(div);
    }
}

// Calcular ventas del día
function calcularVentas() {
    var totalVentas = 0;
    for (var i = 0; i < pedidosData.length; i++) {
        totalVentas += pedidosData[i].total;
    }

    document.getElementById('ventas-hoy').textContent = '$' + Math.round(totalVentas).toLocaleString();
    document.getElementById('pedidos-totales').textContent = pedidosData.length;
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    var empleadosActivos = empleadosData.filter(function (emp) { return emp.activo; }).length;
    var mesasOcupadas = mesasData.filter(function (mesa) { return mesa.estado === 'ocupada'; }).length;

    document.getElementById('empleados-activos').textContent = empleadosActivos;
    document.getElementById('mesas-ocupadas-admin').textContent = mesasOcupadas;
}

// Mostrar modal para agregar empleado
function mostrarModalEmpleado() {
    empleadoEditando = null;
    document.getElementById('modal-empleado-title').innerHTML = '<i class="fas fa-user-plus me-2"></i>Agregar Empleado';
    document.getElementById('form-empleado').reset();
    var modal = new bootstrap.Modal(document.getElementById('modal-empleado'));
    modal.show();
}

// Mostrar modal para agregar plato
function mostrarModalPlato() {
    document.getElementById('plato-nombre').value = '';
    document.getElementById('plato-precio').value = '';
    document.getElementById('plato-descripcion').value = '';
    document.getElementById('plato-categoria').value = 'entradas';

    var modal = new bootstrap.Modal(document.getElementById('modal-plato'));
    modal.show();
}

// Editar empleado
function editarEmpleado(empleadoId) {
    empleadoEditando = empleadosData.find(function (emp) { return emp.id === empleadoId; });
    if (!empleadoEditando) return;

    document.getElementById('modal-empleado-title').innerHTML = '<i class="fas fa-user-edit me-2"></i>Editar Empleado';
    document.getElementById('empleado-nombre').value = empleadoEditando.nombre;
    document.getElementById('empleado-usuario').value = empleadoEditando.usuario;
    document.getElementById('empleado-password').value = empleadoEditando.password;
    document.getElementById('empleado-rol').value = empleadoEditando.rol;

    var modal = new bootstrap.Modal(document.getElementById('modal-empleado'));
    modal.show();
}

// Guardar empleado
function guardarEmpleado() {
    var nombre = document.getElementById('empleado-nombre').value;
    var usuario = document.getElementById('empleado-usuario').value;
    var password = document.getElementById('empleado-password').value;
    var rol = document.getElementById('empleado-rol').value;

    if (!nombre || !usuario || !password || !rol) {
        Swal.fire('Error', 'Complete todos los campos', 'warning');
        return;
    }

    // Verificar usuario único
    var usuarioExiste = empleadosData.find(function (emp) {
        return emp.usuario === usuario && (!empleadoEditando || emp.id !== empleadoEditando.id);
    });

    if (usuarioExiste) {
        Swal.fire('Error', 'El usuario ya existe', 'warning');
        return;
    }

    if (empleadoEditando) {
        // Actualizar empleado existente
        empleadoEditando.nombre = nombre;
        empleadoEditando.usuario = usuario;
        empleadoEditando.password = password;
        empleadoEditando.rol = rol;
        Swal.fire('Éxito', 'Empleado actualizado correctamente', 'success');
    } else {
        // Crear nuevo empleado
        var nuevoId = Math.max.apply(Math, empleadosData.map(function (emp) { return emp.id; })) + 1;
        empleadosData.push({
            id: nuevoId,
            nombre: nombre,
            usuario: usuario,
            password: password,
            rol: rol,
            activo: true
        });
        Swal.fire('Éxito', 'Empleado agregado correctamente', 'success');
    }

    mostrarEmpleados();
    actualizarEstadisticas();

    var modal = bootstrap.Modal.getInstance(document.getElementById('modal-empleado'));
    modal.hide();
}

// Guardar plato
function guardarPlato() {
    var nombre = document.getElementById('plato-nombre').value;
    var precio = document.getElementById('plato-precio').value;
    var descripcion = document.getElementById('plato-descripcion').value;
    var categoria = document.getElementById('plato-categoria').value;

    if (!nombre || !precio) {
        Swal.fire('Error', 'Complete los campos obligatorios', 'warning');
        return;
    }

    var nuevoPlato = {
        id: Date.now(),
        nombre: nombre,
        precio: parseInt(precio),
        descripcion: descripcion || 'Sin descripción',
        categoria: categoria
    };

    menuData.push(nuevoPlato);
    localStorage.setItem('menuRestaurante', JSON.stringify(menuData));
    mostrarMenuAdmin();

    var modal = bootstrap.Modal.getInstance(document.getElementById('modal-plato'));
    modal.hide();

    Swal.fire('Éxito', 'Plato agregado correctamente', 'success');
}

// Eliminar plato
function eliminarPlato(platoId) {
    var plato = menuData.find(function (p) { return p.id === platoId; });
    if (!plato) return;

    Swal.fire({
        title: '¿Eliminar plato?',
        text: '¿Estás seguro de eliminar "' + plato.nombre + '"?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar'
    }).then(function (result) {
        if (result.isConfirmed) {
            menuData = menuData.filter(function (p) { return p.id !== platoId; });
            localStorage.setItem('menuRestaurante', JSON.stringify(menuData));
            mostrarMenuAdmin();
            Swal.fire('Eliminado', 'Plato eliminado correctamente', 'success');
        }
    });
}

// Activar/Desactivar empleado
function toggleEmpleado(empleadoId) {
    var empleado = empleadosData.find(function (emp) { return emp.id === empleadoId; });
    if (!empleado) return;

    var accion = empleado.activo ? 'desactivar' : 'activar';
    var mensaje = empleado.activo ? 'El empleado no podrá acceder al sistema' : 'El empleado podrá acceder nuevamente';

    Swal.fire({
        title: '¿' + accion.charAt(0).toUpperCase() + accion.slice(1) + ' empleado?',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, ' + accion
    }).then(function (result) {
        if (result.isConfirmed) {
            empleado.activo = !empleado.activo;
            mostrarEmpleados();
            actualizarEstadisticas();
            Swal.fire('Éxito', 'Empleado ' + (empleado.activo ? 'activado' : 'desactivado'), 'success');
        }
    });
}

// Limpiar pedidos
function limpiarPedidos() {
    Swal.fire({
        title: '¿Limpiar histórico de pedidos?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        confirmButtonColor: '#dc3545'
    }).then(function (result) {
        if (result.isConfirmed) {
            localStorage.removeItem('pedidosRestaurante');
            pedidosData = [];
            mostrarPedidos();
            calcularVentas();
            Swal.fire('Limpiado', 'Histórico de pedidos eliminado', 'success');
        }
    });
}

// Actualizar fecha
function actualizarFecha() {
    var ahora = new Date();
    var opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('fecha-actual').textContent = ahora.toLocaleDateString('es-AR', opciones);
}

// Cerrar sesión
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión'
    }).then(function (result) {
        if (result.isConfirmed) {
            localStorage.removeItem('sesionRestaurante');
            window.location.href = '../index.html';
        }
    });
}

// Recargar datos automáticamente cada 30 segundos
function iniciarActualizacionAutomatica() {
    setInterval(function () {
        cargarMesas();
        cargarPedidos();
        actualizarEstadisticas();
    }, 30000);
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        inicializar();
        iniciarActualizacionAutomatica();
    });
} else {
    inicializar();
    iniciarActualizacionAutomatica();
}