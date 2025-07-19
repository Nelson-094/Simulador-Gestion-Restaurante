// MENÚ CLIENTE - VISTA PÚBLICA

// Variables globales
let menu = [];
let mesas = [];


// 🎯 FUNCIÓN UNIVERSAL PARA RUTAS - AGREGAR AL INICIO DE CADA JS
const construirRutaImagen = (rutaImagen) => {
    if (!rutaImagen) return null;
    
    // Detectar automáticamente la ubicación
    const estaEnPages = window.location.pathname.includes('/pages/');
    
    return estaEnPages ? `../${rutaImagen}` : `./${rutaImagen}`;
};

// FUNCIONES DE INICIALIZACIÓN

// Inicializar aplicación
const inicializarApp = () => {
    cargarDatos();
    configurarEventos();
    verificarHorario();

    // Actualizar cada 5 minutos
    setInterval(actualizarDisponibilidad, 300000);
};

// Configurar eventos
const configurarEventos = () => {
    
    // Actualizar disponibilidad
    document.getElementById('actualizar-disponibilidad').addEventListener('click', actualizarDisponibilidad);

    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// FUNCIONES DE CARGA DE DATOS

// Cargar todos los datos
const cargarDatos = async () => {
    try {
        await Promise.all([
            cargarMenu(),
            cargarMesas()
        ]);

        generarMenuHTML();
        generarGridMesas();
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarError('Error al cargar los datos del menú');
    }
};

// Cargar menú
const cargarMenu = async () => {
    try {
        const response = await fetch('../data/menu.json');
        const data = await response.json();
        menu = data.platos;
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
            },
            {
                id: 2,
                nombre: "Ensalada César",
                precio: 1800,
                descripcion: "Fresca y liviana",
                categoria: "entradas"
            }
        ];
    }
};

// Cargar mesas
const cargarMesas = async () => {
    try {
        // Intentar cargar estado actual desde localStorage
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
            { id: 1, capacidad: 2, estado: "libre" },
            { id: 2, capacidad: 4, estado: "libre" }
        ];
    }
};

// FUNCIONES DE INTERFAZ - MENÚ

// Generar HTML del menú
const generarMenuHTML = () => {
    const categorias = ['entradas', 'platos principales', 'postres', 'bebidas'];

    categorias.forEach(categoria => {
        const container = document.getElementById(`${categoria.replace(' ', '-')}-container`);
        if (container) {
            container.innerHTML = '';

            const platosCategoria = menu.filter(plato => plato.categoria === categoria);

            if (platosCategoria.length === 0) {
                container.innerHTML = '<div class="col-12"><p class="text-muted text-center">No hay platos disponibles en esta categoría</p></div>';
                return;
            }

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

    // Icono según categoría
    const iconos = {
        'entradas': 'fas fa-leaf',
        'platos principales': 'fas fa-drumstick-bite',
        'postres': 'fas fa-ice-cream',
        'bebidas': 'fas fa-glass-cheers'
    };

    const icono = iconos[plato.categoria] || 'fas fa-utensils';

    card.innerHTML = `
    <div class="menu-img">
        ${plato.imagen ?
            `<img src="${construirRutaImagen(plato.imagen)}" alt="${plato.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` :
            `<i class="fas fa-utensils" style="font-size: 2rem; color: var(--primary);"></i>`
        }
        </div>
        <div class="menu-item-body">
            <h5 class="menu-item-title">${plato.nombre}</h5>
            <div class="menu-item-price">$${plato.precio.toLocaleString()}</div>
            <p class="menu-item-description">${plato.descripcion}</p>
            <div class="text-muted">
                <small><i class="fas fa-info-circle me-1"></i>Consulte disponibilidad con su mesero</small>
            </div>
        </div>
    `;

    col.appendChild(card);
    return col;
};

// FUNCIONES DE INTERFAZ - MESAS

// Generar grid de mesas
const generarGridMesas = () => {
    const container = document.getElementById('table-grid-cliente');
    container.innerHTML = '';

    mesas.forEach(mesa => {
        const mesaElement = document.createElement('div');
        mesaElement.className = `table-item ${mesa.estado}`;

        // Icono según capacidad
        let icono = 'fas fa-user';
        if (mesa.capacidad > 4) {
            icono = 'fas fa-users';
        } else if (mesa.capacidad > 2) {
            icono = 'fas fa-user-friends';
        }

        mesaElement.innerHTML = `
            <div>
                <i class="${icono} mb-1"></i>
                <div style="font-weight: bold;">Mesa ${mesa.id}</div>
                <small>${mesa.capacidad} personas</small>
            </div>
        `;

        // Tooltip
        mesaElement.setAttribute('title', `Mesa ${mesa.id} - ${getEstadoTexto(mesa.estado)} - ${mesa.capacidad} personas`);

        container.appendChild(mesaElement);
    });

    // Inicializar tooltips si Bootstrap está disponible
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
};

// Actualizar estadísticas de mesas
const actualizarEstadisticas = () => {
    const disponibles = mesas.filter(m => m.estado === 'libre').length;
    const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const reservadas = mesas.filter(m => m.estado === 'reservada').length;

    document.getElementById('mesas-disponibles').textContent = disponibles;
    document.getElementById('mesas-ocupadas-cliente').textContent = ocupadas;
    document.getElementById('mesas-reservadas-cliente').textContent = reservadas;

    // Actualizar tiempo
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('ultima-actualizacion-cliente').textContent = timeString;
};

// FUNCIONES DE ACTUALIZACIÓN

// Actualizar disponibilidad
const actualizarDisponibilidad = async () => {
    try {
        // Mostrar indicador de carga
        const btn = document.getElementById('actualizar-disponibilidad');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Actualizando...';
        btn.disabled = true;

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Intentar cargar estado actual
        const estadoGuardado = localStorage.getItem('estadoMesas');
        if (estadoGuardado) {
            mesas = JSON.parse(estadoGuardado);
        } else {
            // Cargar desde JSON si no hay estado guardado
            const response = await fetch('./mesas.json');
            const data = await response.json();
            mesas = data.mesas;
        }

        // Actualizar interfaz
        generarGridMesas();
        actualizarEstadisticas();

        // Mostrar notificación
        mostrarNotificacion('Disponibilidad actualizada correctamente', 'success');

        // Restaurar botón
        btn.innerHTML = originalText;
        btn.disabled = false;

    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);
        mostrarError('Error al actualizar la disponibilidad');

        // Restaurar botón
        const btn = document.getElementById('actualizar-disponibilidad');
        btn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Actualizar';
        btn.disabled = false;
    }
};

// FUNCIONES UTILITARIAS

// Obtener texto del estado
const getEstadoTexto = (estado) => {
    switch (estado) {
        case 'libre': return 'Disponible';
        case 'ocupada': return 'Ocupada';
        case 'reservada': return 'Reservada';
        default: return 'Desconocido';
    }
};

// Verificar horario
const verificarHorario = () => {
    const now = new Date();
    const hora = now.getHours();

    let estado = 'Abierto';
    let clase = 'text-success';

    if (hora < 12 || hora >= 24) {
        estado = 'Cerrado';
        clase = 'text-danger';
    } else if (hora >= 23) {
        estado = 'Próximo a cerrar';
        clase = 'text-warning';
    }

    const horarioElement = document.getElementById('horario-actual');
    horarioElement.textContent = estado;
    horarioElement.className = clase;
};

// Mostrar notificación
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Remover automáticamente después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
};

// Mostrar error
const mostrarError = (mensaje) => {
    mostrarNotificacion(mensaje, 'danger');
};

// ANIMACIONES Y EFECTOS

// Agregar animación al hacer scroll
const agregarAnimacionScroll = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        observer.observe(item);
    });
};

// Efecto parallax ligero en hero
const inicializarParallax = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
};

// INICIALIZACIÓN

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializarApp();
        agregarAnimacionScroll();
        inicializarParallax();
    });
} else {
    inicializarApp();
    agregarAnimacionScroll();
    inicializarParallax();
}