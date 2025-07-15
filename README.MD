🍽️ Sistema de Gestión de Restaurante - Proyecto Final JavaScript

📋 Descripción del Proyecto
Sistema completo de gestión de restaurante desarrollado en JavaScript puro que simula el funcionamiento real de un restaurante con múltiples roles de usuario. El sistema incluye una landing page pública, sistema de autenticación para empleados, gestión de mesas en tiempo real y toma de pedidos completa.

✨ Características Principales

🌐 Landing page pública con menú y disponibilidad visible
🔐 Sistema de autenticación para empleados con diferentes roles
🍽️ Gestión completa de menú cargado desde JSON externo
🪑 Administración de mesas en tiempo real con estados dinámicos
🛒 Sistema de pedidos con carrito inteligente y cálculo de IVA
📊 Estadísticas de empleados y seguimiento de rendimiento
📱 Diseño completamente responsivo para todos los dispositivos
🎨 Interfaz moderna con SweetAlert2 y Bootstrap 5
💾 Persistencia de datos con localStorage
👥 Múltiples vistas: Landing, Empleados, Gestión y Clientes


🚀 Tecnologías Utilizadas

Frontend: HTML5, CSS3, JavaScript ES6+
Framework CSS: Bootstrap 5.3
Librerías: SweetAlert2, Font Awesome
Datos: JSON + Fetch API
Persistencia: localStorage (navegador)
Arquitectura: SPA (Single Page Application) modular

📁 Estructura del Proyecto

🔐 Credenciales de Acceso
Usuarios de Prueba
Usuario -  Contraseña -          Rol              -   Descripción 
mesero  -  1123456    -  Mesero Juan Pérez        -   Toma de pedidos
mesero  -  2123456    -  Mesero María González    -   Toma de pedidos 
mesero  -  3123456    -  Mesero Carlos Rodríguez  -   Toma de pedidos
admin   -  admin123   -  Administrador Nelson     -   Acceso completo

🎮 Guía de Uso

🌐 Landing Page (Público)

1-Navegación Principal
-Ver menú completo con precios
-Consultar disponibilidad de mesas en tiempo real
-Información de contacto y horarios
-Acceso a empleados via botón "Acceso Empleados"

2-Funcionalidades Públicas

-Navegación suave entre secciones
-Actualización de disponibilidad de mesas
-Menú organizado por categorías
-Diseño responsivo completo

👨‍💼 Para Empleados (Sistema de Pedidos)

1-Iniciar Sesión

-Desde landing page, click "Acceso Empleados"
-Ingresar credenciales en modal
-Redirección automática según rol

2-Asignar Mesa

-Seleccionar mesa disponible del dropdown
-Click en "Asignar Mesa"
-La mesa cambia a estado "Ocupada" automáticamente

3-Tomar Pedido

-Navegar por las categorías del menú (tabs)
-Agregar platos al carrito con un click
-Modificar cantidades con botones +/-
-Visualizar subtotal, IVA (21%) y total

4-Confirmar Pedido

-Revisar resumen completo con SweetAlert2
-Confirmar y generar número de operación
-El pedido se registra en historial
-Estadísticas actualizadas automáticamente

5-Liberar Mesa
-Click en "Liberar Mesa" cuando termine servicio
-La mesa vuelve a estado "Libre"


🏢 Para Gestión de Mesas

1-Acceder al Panel

-Login como administrador o desde navbar empleados
-Vista completa del estado del restaurante


2-Visualizar Estado Global

-Grid visual de todas las mesas (15 mesas)
-Estadísticas en tiempo real (libres/ocupadas/reservadas)
-Leyenda de colores intuitiva

3-Gestionar Mesa Individual

-Click en cualquier mesa para abrir modal
-Cambiar estado (Libre/Ocupada/Reservada)
-Asignar meseros específicos
-Historial de ocupación

4-Monitoreo en Tiempo Real

-Actualización automática del estado
-Sincronización con sistema de empleados
-Alertas de cambios importantes

🎯 Funcionalidades Detalladas
🔄 Sistema de Autenticación Avanzado

-Login modal desde landing page
-Validación de credenciales en JSON
-Sesiones persistentes con localStorage
-Redirección inteligente según rol:

-Meseros → Sistema de pedidos
-Administradores → Gestión de mesas

-Logout con confirmación y limpieza de sesión

🪑 Gestión Inteligente de Mesas

-15 mesas con capacidades variables (2-8 personas)
-Estados dinámicos: Libre, Ocupada, Reservada
-Asignación automática de meseros
-Ubicaciones específicas (Ventana, Centro, Privado, Barra)
-Persistencia completa en localStorage
-Sincronización entre vistas en tiempo real

🍽️ Sistema de Pedidos Profesional

-Carrito inteligente con gestión de cantidades
-Cálculo automático de subtotal e IVA (21%)
-Agrupación de items repetidos
-Validación obligatoria de mesa asignada
-Confirmación con resumen detallado
-Generación de números de operación únicos
-Historial completo de pedidos

📊 Estadísticas y Seguimiento Completo

-Contador de pedidos por empleado (diarios/totales)
-Métricas de rendimiento en tiempo real
-Historial de mesas atendidas por empleado
-Resumen ejecutivo de ocupación
-Tracking de ingresos por operación

🎨 Experiencia de Usuario Superior

-Diseño responsivo para todos los dispositivos
-Animaciones CSS suaves y profesionales
-Notificaciones elegantes con SweetAlert2
-Feedback visual constante
-Navegación intuitiva y coherente
-Efectos parallax y scroll suave

🔧 Arquitectura Técnica
📦 Módulos JavaScript Especializados landing.js - Landing Page Pública

🚨 Manejo de Errores Robusto
🛡️ Validaciones Implementadas

-Autenticación: Credenciales válidas y usuario activo
-Mesa: Verificación de disponibilidad antes de asignar
-Pedidos: Mesa asignada obligatoria para tomar pedidos
-Datos: Fallback automático a datos de respaldo
-Formularios: Validación HTML5 + JavaScript
-Rutas: Verificación de archivos JSON existentes

🔄 Recuperación Automática

-Datos de respaldo incluidos en cada módulo
-Manejo completo de errores de red con try-catch
-Notificaciones informativas al usuario
-Estado consistente del sistema
-Redirección automática en caso de sesión inválida

📱 Responsive Design Avanzado
📏 Breakpoints Optimizados

-Desktop: 1200px+ (experiencia completa)
-Tablet: 768px - 1199px (adaptado inteligentemente)
-Mobile: 320px - 767px (optimizado para touch)

🎨 Adaptaciones Específicas

-Hero section con alturas variables según dispositivo
-Carrito se reposiciona en móviles
-Grid de mesas ajustado automáticamente
-Navegación colapsable con hamburger menu
-Botones y texto optimizados para touch
-Modales adaptados a pantallas pequeñas

🔒 Seguridad y Buenas Prácticas
🛡️ Medidas Implementadas

-Validación de sesiones en cada página
-Verificación de roles y permisos
-Sanitización de inputs de usuario
-Timeouts de sesión implícitos
-Protección contra inyección de código

⚠️ Consideraciones de Producción

Nota: Este es un proyecto educativo. Para producción se requiere:

-Cifrado de contraseñas con hash
-Autenticación JWT con refresh tokens
-HTTPS obligatorio
-Validación del lado del servidor
-Base de datos real con transacciones
-Auditoría de seguridad completa

🧪 Testing y Validación Exhaustiva
✅ Casos de Prueba Implementados
✅ Login: Credenciales válidas/inválidas/usuarios inactivos
✅ Navegación: Entre todas las vistas y secciones
✅ Mesas: Asignación, liberación, cambios de estado
✅ Pedidos: Agregar, quitar, modificar cantidades
✅ Carrito: Cálculos, validaciones, persistencia
✅ Responsive: Funcionalidad en diferentes dispositivos
✅ Errores: Manejo de fallos de red y datos
✅ Persistencia: localStorage en diferentes escenarios

🚀 Mejoras Futuras y Roadmap

📈 Funcionalidades Planificadas

- Backend real con Node.js + Express
- Base de datos PostgreSQL/MySQL
- API REST completa con documentación
- Autenticación JWT con refresh tokens
- Sistema de reservas online
- Integración de pagos (Stripe/MercadoPago)
- Reportes avanzados con gráficos
- Notificaciones push para empleados
- App móvil nativa con React Native
- Panel administrativo avanzado

🎯 Optimizaciones Técnicas

- Service Workers para funcionamiento offline
- Progressive Web App (PWA)
- Lazy loading de componentes
- Bundle optimization con Webpack
- Tests automatizados con Jest
- CI/CD pipeline con GitHub Actions
- Monitoring y analytics
- Caching inteligente


📚 Recursos y Referencias
🔗 Tecnologías y Librerías

Bootstrap 5.3 - Framework CSS responsivo
SweetAlert2 - Modales y notificaciones elegantes
Font Awesome - Iconografía profesional
Google Fonts - Tipografías Playfair Display y Poppins

📖 Documentación Consultada

MDN Web Docs - Referencia completa JavaScript
W3Schools - Tutoriales HTML/CSS
ES6 Features - Características modernas JavaScript
Bootstrap Documentation - Guías y componentes

🎨 Recursos Visuales

Unsplash - Imágenes de alta calidad
Coolors - Paleta de colores
CSS Grid Generator - Layouts responsivos

👨‍💻 Autor
Nelson Gabriel Sanchez
📧 Email: [nelsonsanchez094@gmail.com]
🔗 GitHub: @Nelson-094 
📍 Argentina
💼 LinkedIn: [(https://www.linkedin.com/in/nelson-sanchez-1131a2141]
🎓 Contexto Académico

Institución: CoderHouse
Curso: JavaScript - Desarrollo Web
Proyecto: Final
Año: 2025


📄 Licencia
MIT License

Copyright (c) 2025 Nelson Gabriel Sanchez

🎯 Estado del Proyecto
✅ Completado (v1.0)

✅ Sistema completo de gestión de restaurante
✅ Landing page pública profesional
✅ Autenticación y autorización
✅ Gestión completa de mesas
✅ Sistema de pedidos con carrito
✅ Diseño responsivo
✅ Documentación completa

🚧 En Desarrollo (v1.1)

🚧 Optimizaciones de performance
🚧 Mejoras en UX/UI
🚧 Tests automatizados
🚧 Corrección de bugs menores

🔮 Planificado (v2.0)

🔮 Backend con Node.js
🔮 Base de datos real
🔮 Sistema de reservas
🔮 Integración de pagos

Desarrollado en Argentina 🇦🇷
Proyecto Final - Curso JavaScript - CoderHouse 2025