# TODO - Chickencitos (Wishlist + Comparador)

- [ ] Paso 1: Revisar routing/layout en `src/App.jsx` para detectar dónde exponer la nueva pantalla `Favoritos` y `Comparador`.
- [x] Paso 2: Implementar `src/components/Favoritos.jsx` para listar favoritos, permitir eliminar desde UI y mostrar mensaje vacío.

- [x] Paso 3: Actualizar `src/context/WishlistContext.jsx`


  - [x] Usar `useNotifications().agregarNotificacion` para disparar notificaciones.

  - [x] Ajustar detección de “baja” a condición estricta (precio baja) usando precio actual desde `productos`.

  - [x] Mantener persistencia `localStorage`.
- [ ] Paso 4: Crear `src/context/ComparadorContext.jsx`
  - [ ] Guardar seleccionados (máx 4) y exponer acciones: agregar/eliminar.
  - [ ] Conectar con `useProducts` (recalcular resultados cuando cambie la selección).
- [x] Paso 5: Reescribir `src/pages/Comparador.jsx` para cumplir:

  - [x] Cargar catálogo completo de forma asíncrona con `Promise.all`.
  - [ ] Sin `slice`/muestra limitada en la tabla.
  - [ ] Botón eliminar en cabecera y botón “Agregar al carrito” en fila final con feedback visual.
  - [ ] Costo final IVA 16% calculado async con `calcularCostoFinal`.
- [x] Paso 6: Actualizar `src/App.jsx` (o rutas) para envolver `ComparadorProvider` y añadir ruta/pantalla si aplica.

- [ ] Paso 7: Verificación manual
  - [ ] Abrir Marketplace, validar Wishlist persistente.
  - [ ] Cambiar precios/stock (simulación) y confirmar notificaciones.
  - [ ] Validar comparador: límite 4, eliminar rápido, agregar al carrito con feedback.

