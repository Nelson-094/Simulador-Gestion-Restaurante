# 🍽️ Sistema de Restaurante - Proyecto Final JavaScript

## 📋 Descripción
Mi proyecto final del curso de JavaScript en CoderHouse. Es un sistema para manejar un restaurante donde los clientes pueden ver el menú y los empleados pueden tomar pedidos y gestionar mesas.

## ✨ Qué hace mi proyecto

- 🌐 **Página principal** donde todos pueden ver el menú
- 🔐 **Login para empleados** con usuario y contraseña
- 🍽️ **Menú interactivo** cargado desde archivos JSON
- 🪑 **Gestión de mesas** para ver cuáles están libres u ocupadas
- 🛒 **Carrito de pedidos** que suma precios automáticamente
- 👨‍💼 **Panel de administrador** para gestionar empleados y menú
- 📱 **Funciona en celular** (responsive)

## 🚀 Tecnologías que usé

- **HTML** - Para la estructura
- **CSS** - Para los estilos (con Bootstrap)
- **JavaScript** - Para toda la lógica
- **JSON** - Para guardar los datos
- **SweetAlert** - Para mensajes bonitos
- **localStorage** - Para guardar información

## 📁 Archivos importantes

```
📂 Proyecto/
├── 📄 index.html          # Página principal
├── 📂 pages/
│   ├── 📄 empleados.html  # Para tomar pedidos
│   ├── 📄 mesas.html      # Para gestionar mesas
│   ├── 📄 admin.html      # Panel administrador
│   └── 📄 clientes.html   # Menú para clientes
├── 📂 js/
│   ├── 📄 landing.js      # Lógica página principal
│   ├── 📄 empleados.js    # Lógica empleados
│   ├── 📄 mesas.js        # Lógica mesas
│   ├── 📄 admin.js        # Lógica administrador
│   └── 📄 menu-cliente.js # Lógica clientes
├── 📂 data/
│   ├── 📄 menu.json       # Platos del restaurante
│   ├── 📄 empleados.json  # Usuarios del sistema
│   └── 📄 mesas.json      # Información de mesas
└── 📂 assets/
    └── 📂 css/
        └── 📄 styles.css  # Estilos personalizados
```

## 🔐 Para probar el sistema

### Usuarios de prueba:
| Usuario | Contraseña | Rol | Para qué sirve |
|---------|------------|-----|----------------|
| mesero1 | 123456 | Mesero | Tomar pedidos |
| mesero2 | 123456 | Mesero | Tomar pedidos |
| admin | admin123 | Administrador | Gestionar todo |

## 🎮 Cómo usar

### 👥 Para clientes (cualquiera):
1. Entrar a `index.html`
2. Ver el menú y precios
3. Revisar qué mesas están libres

### 👨‍💼 Para empleados:
1. Click en "Acceso Empleados"
2. Poner usuario y contraseña
3. Elegir una mesa libre
4. Agregar platos al pedido
5. Confirmar cuando esté listo

### 🏢 Para administradores:
1. Login con usuario admin
2. **Panel Admin** con 4 secciones:
   - **Empleados**: Agregar, editar, activar/desactivar
   - **Mesas**: Ver estado en tiempo real
   - **Menú**: Agregar y eliminar platos
   - **Pedidos**: Ver ventas del día
3. Estadísticas en vivo (ventas, pedidos, empleados)

## 🔧 Funcionalidades principales

### 🛒 Sistema de pedidos:
- Seleccionar mesa
- Agregar platos con un click
- Cambiar cantidades con + y -
- Calcular IVA automáticamente
- Confirmar pedido

### 🪑 Gestión de mesas:
- 15 mesas con diferentes capacidades
- Estados: Libre, Ocupada, Reservada
- Asignar meseros a las mesas
- Actualización en tiempo real

### 👨‍💼 Panel administrador:
- Gestionar empleados (agregar, editar, desactivar)
- Administrar menú (agregar/eliminar platos)
- Ver estadísticas del día
- Monitorear estado de mesas

### 💾 Persistencia:
- Todo se guarda en localStorage
- Los datos persisten al recargar
- Sistema funciona offline

## 📱 Responsive Design

Funciona bien en:
- 💻 Computadoras
- 📱 Celulares
- 📟 Tablets

## 🛡️ Validaciones que incluí

- ✅ Login: Usuario y contraseña válidos
- ✅ Mesa: Tiene que estar libre para asignar
- ✅ Pedidos: Necesita mesa asignada
- ✅ Campos: No se pueden enviar vacíos
- ✅ Errores: Manejo si falla la carga de datos

## 🎯 Qué aprendí haciendo esto

- Como usar **fetch()** para cargar JSON
- Manipular el **DOM** con JavaScript
- Usar **localStorage** para guardar datos
- Hacer páginas **responsive** con CSS
- Validar formularios
- Organizar código en diferentes archivos
- Usar librerías externas como SweetAlert

## 🚀 Cosas que se podrían agregar después

- Base de datos real (no localStorage)
- Backend con Node.js
- Sistema de pagos
- Envío de emails
- App para celular
- Reportes con gráficos

## 🤔 Consideraciones

Este es un proyecto de aprendizaje. Para un restaurante real necesitaría:
- Seguridad más fuerte
- Base de datos profesional
- Servidor web
- Cifrado de contraseñas

## 🧪 Cómo probé que funciona

- ✅ Probé todos los usuarios
- ✅ Agregué y quité platos del carrito
- ✅ Cambié estados de mesas
- ✅ Confirmé pedidos completos
- ✅ Probé en celular y computadora
- ✅ Verifiqué que se guarden los datos

## 🎨 Diseño

- Colores: Dorado y negro (elegante)
- Tipografía: Playfair Display + Poppins
- Iconos: Font Awesome
- Framework: Bootstrap 5
- Efectos: Animaciones CSS suaves

## 👨‍💻 Autor

**Nelson Gabriel Sanchez**
- 📧 nelsonsanchez094@gmail.com
- 🔗 GitHub: [@Nelson-094](https://github.com/Nelson-094)
- 📍 Maipú, Mendoza, Argentina
- 🎓 Estudiante de JavaScript - CoderHouse

## 📚 Proyecto Académico

- **Institución**: CoderHouse
- **Curso**: JavaScript
- **Proyecto**: Final
- **Año**: 2025
- **Comisión**: 70035

## 📄 Licencia

MIT License - Libre para usar y modificar

---

**Hecho en Argentina 🇦🇷**
*Mi primer proyecto grande con JavaScript*