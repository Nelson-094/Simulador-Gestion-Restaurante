// GESTION DE MESAS - SISTEMA RESTAURANTE
// Este archivo maneja la gestión de mesas

var usuarioLogueado = null;
var mesasDelSistema = [];
var empleadosDelSistema = [];
var mesaSeleccionada = null;

// Función para construir rutas de imágenes
function obtenerRutaImagen(rutaImagen) {
    if (!rutaImagen) return null;
    var estaEnPages = window.location.pathname.indexOf('/pages/') !== -1;
    return estaEnPages ? '../' + rutaImagen : './' + rutaImagen;
}

// Verificar autenticación
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

// Inicializar aplicación
function inicializar() {
    if (!verificarLogin()) return;
    configurarEventos();
    cargarDatos();
    actualizarHora();
    setInterval(actualizarHora, 60000);
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('cerrar-sesion').onclick = cerrarSesion;
    document.getElementById('actualizar-mesas').onclick = actualizarMesas;
    document.getElementById('guardar-cambios-mesa').onclick = guardarCambios;
    document.getElementById('nuevo-estado').onchange = cambioEstado;
}

// Cargar datos
function cargarDatos() {
    cargarMesas();
    cargarEmpleados();
}

// Cargar mesas
function cargarMesas() {
    var estadoGuardado = localStorage.getItem('estadoMesas');
    if (estadoGuardado) {
        mesasDelSistema = JSON.parse(estadoGuardado);
        mostrarTodo();
        return;
    }

    fetch('../data/mesas.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            mesasDelSistema = data.mesas;
            mostrarTodo();
        })
        .catch(function (error) {
            console.log('Error cargando mesas:', error);
            mesasDelSistema = [
                { id: 1, capacidad: 2, estado: "libre", meseroAsignado: null, ubicacion: "Ventana" },
                { id: 2, capacidad: 4, estado: "libre", meseroAsignado: null, ubicacion: "Centro" }
            ];
            mostrarTodo();
        });
}

// Cargar empleados
function cargarEmpleados() {
    fetch('../data/empleados.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            empleadosDelSistema = data.empleados.filter(function (emp) {
                return emp.rol === 'mesero' && emp.activo;
            });
            llenarSelectMeseros();
        })
        .catch(function (error) {
            console.log('Error cargando empleados:', error);
            empleadosDelSistema = [];
        });
}

// Llenar select de meseros
function llenarSelectMeseros() {
    var select = document.getElementById('asignar-mesero');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar mesero...</option>';
    for (var i = 0; i < empleadosDelSistema.length; i++) {
        var empleado = empleadosDelSistema[i];
        var option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = empleado.nombre;
        select.appendChild(option);
    }
}

// Mostrar todo
function mostrarTodo() {
    mostrarGrilla();
    mostrarResumen();
    mostrarMisMesas();
}

// Mostrar grilla de mesas
function mostrarGrilla() {
    var contenedor = document.getElementById('table-grid');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    for (var i = 0; i < mesasDelSistema.length; i++) {
        var mesa = mesasDelSistema[i];
        var div = document.createElement('div');
        div.className = 'table-item ' + mesa.estado;
        div.setAttribute('data-mesa-id', mesa.id);

        var meseroInfo = '';
        if (mesa.meseroAsignado) {
            for (var j = 0; j < empleadosDelSistema.length; j++) {
                if (empleadosDelSistema[j].id === mesa.meseroAsignado) {
                    meseroInfo = '<small>' + empleadosDelSistema[j].nombre + '</small>';
                    break;
                }
            }
        }

        div.innerHTML = '<div>' +
            '<div style="font-weight: bold;">Mesa ' + mesa.id + '</div>' +
            '<small>' + mesa.capacidad + ' pers.</small>' +
            '<small>' + mesa.ubicacion + '</small>' +
            meseroInfo +
            (mesa.nombreReserva ? '<small>📋' + mesa.nombreReserva + '</small>' : '') +
            '</div>';

        div.onclick = function () {
            var mesaId = this.getAttribute('data-mesa-id');
            for (var k = 0; k < mesasDelSistema.length; k++) {
                if (mesasDelSistema[k].id == mesaId) {
                    abrirModal(mesasDelSistema[k]);
                    break;
                }
            }
        };

        contenedor.appendChild(div);
    }
}

// Mostrar resumen
function mostrarResumen() {
    var total = mesasDelSistema.length;
    var libres = 0, ocupadas = 0, reservadas = 0;

    for (var i = 0; i < mesasDelSistema.length; i++) {
        var estado = mesasDelSistema[i].estado;
        if (estado === 'libre') libres++;
        else if (estado === 'ocupada') ocupadas++;
        else if (estado === 'reservada') reservadas++;
    }

    document.getElementById('total-mesas').textContent = total;
    document.getElementById('mesas-libres').textContent = libres;
    document.getElementById('mesas-ocupadas').textContent = ocupadas;
    document.getElementById('mesas-reservadas').textContent = reservadas;
}

// Mostrar mis mesas
function mostrarMisMesas() {
    var contenedor = document.getElementById('mis-mesas-hoy');
    if (!contenedor) return;

    var misMesas = mesasDelSistema.filter(function (mesa) {
        return mesa.meseroAsignado === usuarioLogueado.id;
    });

    if (misMesas.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No tienes mesas asignadas</p>';
        return;
    }

    contenedor.innerHTML = '';
    for (var i = 0; i < misMesas.length; i++) {
        var mesa = misMesas[i];
        var div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-2 p-2 rounded';
        div.style.backgroundColor = obtenerColor(mesa.estado);
        div.style.color = 'white';
        div.innerHTML = '<span>Mesa ' + mesa.id + '</span><span>' + mesa.capacidad + ' pers.</span>';
        contenedor.appendChild(div);
    }
}

// Obtener color del estado
function obtenerColor(estado) {
    if (estado === 'libre') return '#28a745';
    if (estado === 'ocupada') return '#dc3545';
    if (estado === 'reservada') return '#ffc107';
    return '#6c757d';
}

// Actualizar hora
function actualizarHora() {
    var ahora = new Date();
    var hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('ultima-actualizacion').textContent = hora;
}

// Abrir modal
function abrirModal(mesa) {
    mesaSeleccionada = mesa;

    document.getElementById('modal-mesa-numero').textContent = mesa.id;
    document.getElementById('modal-capacidad').textContent = mesa.capacidad + ' personas';

    var estadoElement = document.getElementById('modal-estado-actual');
    estadoElement.textContent = obtenerTextoEstado(mesa.estado);
    estadoElement.className = 'current-status ' + mesa.estado;

    var infoMesero = document.getElementById('modal-mesero-info');
    if (mesa.meseroAsignado) {
        var mesero = empleadosDelSistema.find(function (emp) { return emp.id === mesa.meseroAsignado; });
        document.getElementById('modal-mesero-nombre').textContent = mesero ? mesero.nombre : 'No encontrado';
        infoMesero.style.display = 'block';
    } else {
        infoMesero.style.display = 'none';
    }

    document.getElementById('nuevo-estado').value = '';
    document.getElementById('asignar-mesero').value = '';
    document.getElementById('div-asignar-mesero').style.display = 'none';

    var divReserva = document.getElementById('div-nombre-reserva');
    if (divReserva) divReserva.style.display = 'none';

    var modal = new bootstrap.Modal(document.getElementById('modal-gestionar-mesa'));
    modal.show();
}

// Cambio de estado
function cambioEstado(evento) {
    var nuevoEstado = evento.target.value;
    var divMesero = document.getElementById('div-asignar-mesero');
    var divReserva = document.getElementById('div-nombre-reserva');

    if (nuevoEstado === 'ocupada') {
        divMesero.style.display = 'block';
        if (divReserva) divReserva.style.display = 'none';
    } else if (nuevoEstado === 'reservada') {
        divMesero.style.display = 'none';
        if (divReserva) divReserva.style.display = 'block';
    } else {
        divMesero.style.display = 'none';
        if (divReserva) divReserva.style.display = 'none';
    }
}

// Guardar cambios
function guardarCambios() {
    if (!mesaSeleccionada) return;

    var nuevoEstado = document.getElementById('nuevo-estado').value;
    var meseroAsignado = document.getElementById('asignar-mesero').value;

    if (!nuevoEstado) {
        Swal.fire('Error', 'Selecciona un estado', 'warning');
        return;
    }

    if (nuevoEstado === 'ocupada' && !meseroAsignado) {
        Swal.fire('Error', 'Asigna un mesero', 'warning');
        return;
    }

    for (var i = 0; i < mesasDelSistema.length; i++) {
        if (mesasDelSistema[i].id === mesaSeleccionada.id) {
            mesasDelSistema[i].estado = nuevoEstado;
            mesasDelSistema[i].meseroAsignado = nuevoEstado === 'ocupada' ? parseInt(meseroAsignado) : null;

            if (nuevoEstado === 'reservada') {
                var nombreReserva = document.getElementById('nombre-reserva');
                if (nombreReserva) {
                    mesasDelSistema[i].nombreReserva = nombreReserva.value;
                }
            } else {
                mesasDelSistema[i].nombreReserva = null;
            }
            break;
        }
    }

    guardarEstado();
    mostrarTodo();

    var modal = bootstrap.Modal.getInstance(document.getElementById('modal-gestionar-mesa'));
    if (modal) modal.hide();

    var mensaje = nuevoEstado === 'ocupada' ?
        'Mesa asignada correctamente' :
        'Mesa marcada como ' + obtenerTextoEstado(nuevoEstado);

    Swal.fire('Éxito', mensaje, 'success');
}

// Actualizar mesas
function actualizarMesas() {
    var boton = document.getElementById('actualizar-mesas');
    var textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Actualizando...';
    boton.disabled = true;

    fetch('../data/mesas.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var estadosActuales = {};
            for (var i = 0; i < mesasDelSistema.length; i++) {
                var mesa = mesasDelSistema[i];
                estadosActuales[mesa.id] = {
                    estado: mesa.estado,
                    meseroAsignado: mesa.meseroAsignado,
                    nombreReserva: mesa.nombreReserva
                };
            }

            mesasDelSistema = data.mesas;
            for (var j = 0; j < mesasDelSistema.length; j++) {
                var mesaActual = mesasDelSistema[j];
                var estadoGuardado = estadosActuales[mesaActual.id];
                if (estadoGuardado) {
                    mesaActual.estado = estadoGuardado.estado;
                    mesaActual.meseroAsignado = estadoGuardado.meseroAsignado;
                    mesaActual.nombreReserva = estadoGuardado.nombreReserva;
                }
            }

            guardarEstado();
            mostrarTodo();
            actualizarHora();

            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            Swal.fire('Éxito', 'Mesas actualizadas', 'success');
        })
        .catch(function (error) {
            console.log('Error:', error);
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        });
}

// Obtener texto del estado
function obtenerTextoEstado(estado) {
    if (estado === 'libre') return 'Libre';
    if (estado === 'ocupada') return 'Ocupada';
    if (estado === 'reservada') return 'Reservada';
    return 'Desconocido';
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

// Guardar estado
function guardarEstado() {
    localStorage.setItem('estadoMesas', JSON.stringify(mesasDelSistema));
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}