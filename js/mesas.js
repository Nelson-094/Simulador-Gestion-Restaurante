// GESTIÓN DE MESAS - SISTEMA RESTAURANTE

// Variables globales
let usuarioActual = null;
let mesas = [];
let empleados = [];
let mesaSeleccionada = null;


// 🎯 FUNCIÓN UNIVERSAL PARA RUTAS - AGREGAR AL INICIO DE CADA JS
const construirRutaImagen = (rutaImagen) => {
    if (!rutaImagen) return null;

    // Detectar automáticamente la ubicación
    const estaEnPages = window.location.pathname.includes('/pages/');

    return estaEnPages ? `../${rutaImagen}` : `./${rutaImagen}`;
};

// FUNCIONES DE INICIALIZACIÓN

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
    actualizarTiempo();

    // Actualizar tiempo cada minuto
    setInterval(actualizarTiempo, 60000);
};

// Configurar eventos
const configurarEventos = () => {
    // Cerrar sesión
    document.getElementById('cerrar-sesion').addEventListener('click', cerrarSesion);

    // Actualizar mesas
    document.getElementById('actualizar-mesas').addEventListener('click', actualizarMesas);

    // Guardar cambios en modal
    document.getElementById('guardar-cambios-mesa').addEventListener('click', guardarCambiosMesa);

    // Cambio de estado en modal
    document.getElementById('nuevo-estado').addEventListener('change', manejarCambioEstado);
};

// FUNCIONES DE CARGA DE DATOS

// Cargar todos los datos
const cargarDatos = async () => {
    try {
        await Promise.all([
            cargarMesas(),
            cargarEmpleados()
        ]);

        generarGridMesas();
        actualizarResumen();
        actualizarMisMesas();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los datos del sistema'
        });
    }
};

// Cargar mesas
const cargarMesas = async () => {
    try {
        // Primero intentar cargar desde localStorage (estado actual)
        const estadoGuardado = localStorage.getItem('estadoMesas');
        if (estadoGuardado) {
            mesas = JSON.parse(estadoGuardado);
            return;
        }

        // Si no hay estado guardado, cargar desde JSON
        const response = await fetch('../data/mesas.json');
        const data = await response.json();
        mesas = data.mesas;

    } catch (error) {
        console.error('Error al cargar mesas:', error);
        // Datos de respaldo
        mesas = [
            { id: 1, capacidad: 2, estado: "libre", meseroAsignado: null, ubicacion: "Ventana" },
            { id: 2, capacidad: 4, estado: "libre", meseroAsignado: null, ubicacion: "Centro" }
        ];
    }
};

// Cargar empleados
const cargarEmpleados = async () => {
    try {
        const response = await fetch('../data/empleados.json');
        const data = await response.json();
        empleados = data.empleados.filter(emp => emp.rol === 'mesero' && emp.activo);

        // Generar opciones para el select de meseros
        const selectMesero = document.getElementById('asignar-mesero');
        selectMesero.innerHTML = '<option value="">Seleccionar mesero...</option>';

        empleados.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id;
            option.textContent = empleado.nombre;
            selectMesero.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar empleados:', error);
        empleados = [];
    }
};

// FUNCIONES DE INTERFAZ

// Generar grid de mesas
const generarGridMesas = () => {
    const container = document.getElementById('table-grid');
    container.innerHTML = '';

    mesas.forEach(mesa => {
        const mesaElement = document.createElement('div');
        mesaElement.className = `table-item ${mesa.estado}`;
        mesaElement.setAttribute('data-mesa-id', mesa.id);

        let meseroInfo = '';
        if (mesa.meseroAsignado) {
            const mesero = empleados.find(emp => emp.id === mesa.meseroAsignado);
            meseroInfo = mesero ? `<small>${mesero.nombre}</small>` : '';
        }

        mesaElement.innerHTML = `
            <div>
                <div style="font-weight: bold;">Mesa ${mesa.id}</div>
                <small>${mesa.capacidad} pers.</small>
                <small>${mesa.ubicacion}</small>
                ${meseroInfo}
                ${mesa.nombreReserva ? `<small class="weight"> 📋${mesa.nombreReserva}</small>` : ''}
            </div>
        `;

        // Agregar evento click
        mesaElement.addEventListener('click', () => abrirModalGestionar(mesa));

        container.appendChild(mesaElement);
    });
};

// Actualizar resumen
const actualizarResumen = () => {
    const total = mesas.length;
    const libres = mesas.filter(m => m.estado === 'libre').length;
    const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const reservadas = mesas.filter(m => m.estado === 'reservada').length;

    document.getElementById('total-mesas').textContent = total;
    document.getElementById('mesas-libres').textContent = libres;
    document.getElementById('mesas-ocupadas').textContent = ocupadas;
    document.getElementById('mesas-reservadas').textContent = reservadas;
};

// Actualizar mis mesas
const actualizarMisMesas = () => {
    const container = document.getElementById('mis-mesas-hoy');
    const misMesas = mesas.filter(m => m.meseroAsignado === usuarioActual.id);

    if (misMesas.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes mesas asignadas</p>';
        return;
    }

    container.innerHTML = '';
    misMesas.forEach(mesa => {
        const mesaElement = document.createElement('div');
        mesaElement.className = `d-flex justify-content-between align-items-center mb-2 p-2 rounded ${mesa.estado}`;
        mesaElement.style.backgroundColor = getEstadoColor(mesa.estado);
        mesaElement.style.color = 'white';
        mesaElement.innerHTML = `
            <span>Mesa ${mesa.id}</span>
            <span>${mesa.capacidad} pers.</span>
        `;
        container.appendChild(mesaElement);
    });
};

// Obtener color del estado
const getEstadoColor = (estado) => {
    switch (estado) {
        case 'libre': return '#28a745';
        case 'ocupada': return '#dc3545';
        case 'reservada': return '#ffc107';
        default: return '#6c757d';
    }
};

// Actualizar tiempo
const actualizarTiempo = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('ultima-actualizacion').textContent = timeString;
};

// FUNCIONES DE GESTIÓN DE MESAS

// Abrir modal para gestionar mesa
const abrirModalGestionar = (mesa) => {
    mesaSeleccionada = mesa;

    // Llenar datos del modal
    document.getElementById('modal-mesa-numero').textContent = mesa.id;
    document.getElementById('modal-capacidad').textContent = `${mesa.capacidad} personas`;

    // Estado actual
    const estadoElement = document.getElementById('modal-estado-actual');
    estadoElement.textContent = getEstadoTexto(mesa.estado);
    estadoElement.className = `current-status ${mesa.estado}`;

    // Información del mesero
    const meseroInfo = document.getElementById('modal-mesero-info');
    const meseroNombre = document.getElementById('modal-mesero-nombre');

    if (mesa.meseroAsignado) {
        const mesero = empleados.find(emp => emp.id === mesa.meseroAsignado);
        meseroNombre.textContent = mesero ? mesero.nombre : 'No encontrado';
        meseroInfo.style.display = 'block';
    } else {
        meseroInfo.style.display = 'none';
    }

    // Resetear selects
    document.getElementById('nuevo-estado').value = '';
    document.getElementById('asignar-mesero').value = '';
    document.getElementById('div-asignar-mesero').style.display = 'none';

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modal-gestionar-mesa'));
    modal.show();
};

// Manejar cambio de estado
const manejarCambioEstado = (e) => {
    const nuevoEstado = e.target.value;
    const divMesero = document.getElementById('div-asignar-mesero');
    const divReserva = document.getElementById('div-nombre-reserva');

    if (nuevoEstado === 'ocupada') {
        divMesero.style.display = 'block';
        divReserva.style.display = 'none';

    } else if (nuevoEstado === 'reservada') {
        divMesero.style.display = 'none';
        divReserva.style.display = 'block';
    } else {
        divMesero.style.display = 'none';
        divReserva.style.display = 'none';
    }
};

// Guardar cambios de mesa
const guardarCambiosMesa = () => {
    if (!mesaSeleccionada) return;

    const nuevoEstado = document.getElementById('nuevo-estado').value;
    const meseroAsignado = document.getElementById('asignar-mesero').value;

    if (!nuevoEstado) {
        Swal.fire({
            icon: 'warning',
            title: 'Selecciona un estado',
            text: 'Debes seleccionar un nuevo estado para la mesa'
        });
        return;
    }

    // Validar mesero si es necesario
    if (nuevoEstado === 'ocupada' && !meseroAsignado) {
        Swal.fire({
            icon: 'warning',
            title: 'Asigna un mesero',
            text: 'Debes asignar un mesero para marcar la mesa como ocupada'
        });
        return;
    }

    // Actualizar mesa
    const mesa = mesas.find(m => m.id === mesaSeleccionada.id);
    if (mesa) {
        mesa.estado = nuevoEstado;
        mesa.meseroAsignado = nuevoEstado === 'ocupada' ? parseInt(meseroAsignado) : null;
        if (nuevoEstado === 'reservada') {
            const nombreReserva = document.getElementById('nombre-reserva').value;
            mesa.nombreReserva = nombreReserva;
            mesa.fechaUltimaOcupacion = nuevoEstado === 'ocupada' ? new Date().toISOString() : mesa.fechaUltimaOcupacion;
        }

        // Guardar estado
        guardarEstadoMesas();

        // Actualizar interfaz
        generarGridMesas();
        actualizarResumen();
        actualizarMisMesas();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-gestionar-mesa'));
        modal.hide();

        const meseroNombre = meseroAsignado ? empleados.find(emp => emp.id == meseroAsignado)?.nombre : '';
        const mensaje = nuevoEstado === 'ocupada' ?
            `Mesa ${mesa.id} asignada a ${meseroNombre}` :
            `Mesa ${mesa.id} marcada como ${getEstadoTexto(nuevoEstado)}`;

        Swal.fire({
            icon: 'success',
            title: 'Mesa actualizada',
            text: mensaje,
            timer: 1500,
            showConfirmButton: false
        });
    }
};

// Actualizar mesas (refrescar desde servidor)
const actualizarMesas = async () => {
    try {
        const response = await fetch('../data/mesas.json');
        const data = await response.json();

        // Mantener estados actuales pero actualizar estructura
        const estadoActual = {};
        mesas.forEach(mesa => {
            estadoActual[mesa.id] = {
                estado: mesa.estado,
                meseroAsignado: mesa.meseroAsignado,
                fechaUltimaOcupacion: mesa.fechaUltimaOcupacion
            };
        });

        // Actualizar con nuevos datos
        mesas = data.mesas.map(mesa => ({
            ...mesa,
            ...estadoActual[mesa.id]
        }));

        // Guardar y actualizar interfaz
        guardarEstadoMesas();
        generarGridMesas();
        actualizarResumen();
        actualizarMisMesas();
        actualizarTiempo();

        Swal.fire({
            icon: 'success',
            title: 'Mesas actualizadas',
            text: 'El estado de las mesas ha sido actualizado',
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('Error al actualizar mesas:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado de las mesas'
        });
    }
};

// FUNCIONES UTILITARIAS

// Obtener texto del estado
const getEstadoTexto = (estado) => {
    switch (estado) {
        case 'libre': return 'Libre';
        case 'ocupada': return 'Ocupada';
        case 'reservada': return 'Reservada';
        default: return 'Desconocido';
    }
};

// Cerrar sesión
const cerrarSesion = () => {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Se cerrará la sesión actual',
        icon: 'question',
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

// FUNCIONES DE PERSISTENCIA

// Guardar estado de mesas
const guardarEstadoMesas = () => {
    localStorage.setItem('estadoMesas', JSON.stringify(mesas));
};

// INICIALIZACIÓN

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}