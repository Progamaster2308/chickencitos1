# Plan de Desarrollo: Marketplace de Comida Rápida (Asíncrono)

Este documento detalla la estructura, arquitectura y distribución del trabajo para el equipo de 6 personas, cumpliendo con todos los requerimientos obligatorios de operaciones asíncronas.

## 🛠️ Stack Tecnológico Acordado
- **Frontend:** React (Vite)
- **Estilos:** CSS Puro (Vanilla) con diseño premium
- **Enrutamiento:** React Router DOM
- **Estado Global:** React Context API + Custom Hooks
- **APIs:** `fakestoreapi.com/products`, `dummyjson.com/users`, `dummyjson.com/carts`
- **Asincronismo Obligatorio:** `async/await`, `Promise.all()`, `Promise.race()`, `Promise.any()`, `Promise.allSettled()`, `AbortController`, `setTimeout` envuelto en promesas.

---

## 👥 Sugerencia de División del Equipo (6 Personas)

Dado el tamaño del proyecto, sugerimos dividir al equipo en "Parejas" (Pair Programming) o asignar roles específicos:

### Equipo A (Core & Productos) - 2 Personas
- **Módulo 1:** Inicio y carga de Splash Screen (manejo de `Promise.any()` o `Promise.race()` para tiempos de carga).
- **Módulo 2:** Catálogo completo (conexión a FakeStore API), filtros, buscadores.
- **Funcionalidad 7:** Comparador Inteligente (uso de `Promise.all()` para cargar hasta 4 productos a la vez).

### Equipo B (Ventas & Usuarios) - 2 Personas
- **Módulo 4:** Login (conexión a DummyJSON, persistencia de sesión).
- **Módulo 3 y 5:** Carrito y Checkout (cálculos de IVA, envío asíncrono, generación de ticket).
- **Funcionalidad 2 y 13:** Sistema de Cupones y Recuperación de Sesión.

### Equipo C (Marketplace Avanzado & Logística) - 2 Personas
- **Funcionalidad 1 y 4:** Inventario Compartido y Seguimiento de Pedido (simulación con `setTimeout` y promesas).
- **Funcionalidad 8, 9 y 14:** Panel Administrativo, Reportes (JSON/CSV) y Dashboard Ejecutivo.
- **Funcionalidad 11:** Chat de Atención al Cliente (simulación de respuestas con retrasos).

---

## 🚀 Fases de Desarrollo Recomendadas

### Fase 1: Cimientos y Módulos Base (MVP)
1. Estructura de carpetas (`/components`, `/hooks`, `/context`, `/pages`, `/services`).
2. Configurar el Router y el Contexto global.
3. Completar Módulos 1 al 5 (Inicio, Catálogo, Carrito, Login, Checkout).

### Fase 2: Simulación y Lógica Avanzada
1. Implementar la Funcionalidad 1 (Inventario Compartido).
2. Crear los simuladores de tiempo (Logística, Rastreo, Chat) usando wrappers de `setTimeout`.
3. Implementar Cupones, Wishlist (Lista de Deseos) y Recomendaciones basadas en el carrito.

### Fase 3: Administración y Reportes
1. Dashboard en tiempo real.
2. Panel administrativo para ABM (Alta, Baja, Modificación) de productos simulados.
3. Generación y descarga de archivos de reportes.
4. Sistema de Auditoría global.

### Fase 4: El Desafío Máximo
1. **Compra Colaborativa:** Simulaciones (Polling o `setInterval` con Promesas) para manejar un carrito común.
2. Manejo avanzado de `AbortController` si un integrante cancela su parte.

---

## 💡 Ejemplos de Asincronismo a Implementar

- **`Promise.all()`:** Para cargar el catálogo de FakeStore y el estado de la sesión simultáneamente.
- **`Promise.race()`:** Para un Timeout en la petición de login (si tarda más de 5 segundos, abortar).
- **`Promise.allSettled()`:** Para el Checkout, donde enviamos notificaciones a múltiples servicios (Inventario, Dashboard, simulación de pagos) y no queremos que si uno falla, se caiga toda la compra.
- **`AbortController`:** En el buscador del catálogo. Si el usuario escribe muy rápido, abortamos la petición HTTP anterior.
