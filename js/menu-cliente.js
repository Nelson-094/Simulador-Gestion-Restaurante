// MENU CLIENTE - VISTA PUBLICA
// Este archivo maneja la vista del menú para clientes

var menuParaClientes = [];
var mesasParaClientes = [];

// Función para construir rutas de imágenes
function obtenerRutaImagen(rutaImagen) {
    if (!rutaImagen) return null;
    var estaEnPages = window.location.pathname.indexOf('/pages/') !== -1;
    return estaEnPages ? '../' + rutaImagen : './' + rutaImagen;
}

// Inicializar aplicación
function inicializar() {
    cargarDatos();
    configurarEventos();
    verificarHorario();
    setInterval(actualizarDisponibilidad, 300000); // 5 minutos
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('actualizar-disponibilidad').onclick = actualizarDisponibilidad;

    // Navegación suave
    var enlaces = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < enlaces.length; i++) {
        enlaces[i].onclick = function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
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
            menuParaClientes = data.platos;
            mostrarMenu();
        })
        .catch(function (error) {
            console.log('Error cargando menú:', error);
            menuParaClientes = [
                { id: 1, nombre: "Milanesa con papas", precio: 2500, descripcion: "Clásica milanesa", categoria: "platos principales" },
                { id: 2, nombre: "Ensalada César", precio: 1800, descripcion: "Fresca y liviana", categoria: "entradas" }
            ];
            mostrarMenu();
        });
}

// Cargar mesas
function cargarMesas() {
    var estadoGuardado = localStorage.getItem('estadoMesas');
    if (estadoGuardado) {
        mesasParaClientes = JSON.parse(estadoGuardado);
        mostrarMesas();
        return;
    }

    fetch('../data/mesas.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            mesasParaClientes = data.mesas;
            mostrarMesas();
        })
        .catch(function (error) {
            console.log('Error cargando mesas:', error);
            mesasParaClientes = [
                { id: 1, capacidad: 2, estado: "libre" },
                { id: 2, capacidad: 4, estado: "libre" }
            ];
            mostrarMesas();
        });
}

// Mostrar menú
function mostrarMenu() {
    var categorias = ['entradas', 'platos principales', 'postres', 'bebidas'];

    for (var i = 0; i < categorias.length; i++) {
        var categoria = categorias[i];
        var contenedor = document.getElementById(categoria.replace(' ', '-') + '-container');
        if (!contenedor) continue;

        contenedor.innerHTML = '';

        var platosCategoria = [];
        for (var j = 0; j < menuParaClientes.length; j++) {
            if (menuParaClientes[j].categoria === categoria) {
                platosCategoria.push(menuParaClientes[j]);
            }
        }

        if (platosCategoria.length === 0) {
            contenedor.innerHTML = '<div class="col-12"><p class="text-muted text-center">No hay platos disponibles en esta categoría</p></div>';
        } else {
            for (var k = 0; k < platosCategoria.length; k++) {
                var plato = platosCategoria[k];
                var div = document.createElement('div');
                div.className = 'col-md-6 col-lg-4';
                div.innerHTML = '<div class="menu-item animate-fade-in">' +
                    '<div class="menu-img">' +
                    (plato.imagen ? '<img src="' + obtenerRutaImagen(plato.imagen) + '" alt="' + plato.nombre + '" style="width: 100%; height: 100%; object-fit: cover;">' : '<i class="fas fa-utensils" style="font-size: 2rem; color: var(--primary);"></i>') +
                    '</div>' +
                    '<div class="menu-item-body">' +
                    '<h5 class="menu-item-title">' + plato.nombre + '</h5>' +
                    '<div class="menu-item-price">$' + plato.precio.toLocaleString() + '</div>' +
                    '<p class="menu-item-description">' + plato.descripcion + '</p>' +
                    '<div class="text-muted">' +
                    '<small><i class="fas fa-info-circle me-1"></i>Consulte disponibilidad con su mesero</small>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                contenedor.appendChild(div);
            }
        }
    }
}

// Mostrar mesas
function mostrarMesas() {
    var contenedor = document.getElementById('table-grid-cliente');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    for (var i = 0; i < mesasParaClientes.length; i++) {
        var mesa = mesasParaClientes[i];
        var div = document.createElement('div');
        div.className = 'table-item ' + mesa.estado;

        var icono = 'fas fa-user';
        if (mesa.capacidad > 4) icono = 'fas fa-users';
        else if (mesa.capacidad > 2) icono = 'fas fa-user-friends';

        div.innerHTML = '<div>' +
            '<i class="' + icono + ' mb-1"></i>' +
            '<div style="font-weight: bold;">Mesa ' + mesa.id + '</div>' +
            '<small>' + mesa.capacidad + ' personas</small>' +
            '</div>';

        div.title = 'Mesa ' + mesa.id + ' - ' + obtenerTextoEstado(mesa.estado) + ' - ' + mesa.capacidad + ' personas';
        contenedor.appendChild(div);
    }

    // Inicializar tooltips si está disponible
    if (typeof bootstrap !== 'undefined') {
        var tooltips = document.querySelectorAll('[title]');
        for (var j = 0; j < tooltips.length; j++) {
            new bootstrap.Tooltip(tooltips[j]);
        }
    }

    actualizarEstadisticas();
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    var disponibles = 0, ocupadas = 0, reservadas = 0;

    for (var i = 0; i < mesasParaClientes.length; i++) {
        var estado = mesasParaClientes[i].estado;
        if (estado === 'libre') disponibles++;
        else if (estado === 'ocupada') ocupadas++;
        else if (estado === 'reservada') reservadas++;
    }

    document.getElementById('mesas-disponibles').textContent = disponibles;
    document.getElementById('mesas-ocupadas-cliente').textContent = ocupadas;
    document.getElementById('mesas-reservadas-cliente').textContent = reservadas;

    var ahora = new Date();
    var hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('ultima-actualizacion-cliente').textContent = hora;
}

// Actualizar disponibilidad
function actualizarDisponibilidad() {
    var boton = document.getElementById('actualizar-disponibilidad');
    var textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Actualizando...';
    boton.disabled = true;

    setTimeout(function () {
        var estadoGuardado = localStorage.getItem('estadoMesas');
        if (estadoGuardado) {
            mesasParaClientes = JSON.parse(estadoGuardado);
        } else {
            cargarMesas();
        }

        mostrarMesas();
        mostrarNotificacion('Disponibilidad actualizada correctamente');

        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }, 1000);
}

// Obtener texto del estado
function obtenerTextoEstado(estado) {
    if (estado === 'libre') return 'Disponible';
    if (estado === 'ocupada') return 'Ocupada';
    if (estado === 'reservada') return 'Reservada';
    return 'Desconocido';
}

// Verificar horario del restaurante
function verificarHorario() {
    var ahora = new Date();
    var hora = ahora.getHours();
    var estado = 'Abierto';
    var clase = 'text-success';

    if (hora < 12 || hora >= 24) {
        estado = 'Cerrado';
        clase = 'text-danger';
    } else if (hora >= 23) {
        estado = 'Próximo a cerrar';
        clase = 'text-warning';
    }

    var elemento = document.getElementById('horario-actual');
    if (elemento) {
        elemento.textContent = estado;
        elemento.className = clase;
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    var notificacion = document.createElement('div');
    notificacion.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    notificacion.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + mensaje +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';

    document.body.appendChild(notificacion);

    setTimeout(function () {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 3000);
}

// Agregar efectos de animación
function agregarAnimaciones() {
    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.classList.add('animate-fade-in');
            }
        }
    });

    var elementos = document.querySelectorAll('.menu-item');
    for (var j = 0; j < elementos.length; j++) {
        observer.observe(elementos[j]);
    }
}

// Inicializar efecto parallax
function iniciarParallax() {
    var hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function () {
            var scrolled = window.pageYOffset;
            hero.style.transform = 'translateY(' + (scrolled * -0.5) + 'px)';
        });
    }
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        inicializar();
        agregarAnimaciones();
        iniciarParallax();
    });
} else {
    inicializar();
    agregarAnimaciones();
    iniciarParallax();
}