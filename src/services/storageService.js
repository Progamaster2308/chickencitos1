// Claves de localStorage para persistencia del marketplace
const STOCK_KEY = 'chickencitos_inventario';
const CART_KEY = 'chickencitos_carrito';
const CUPON_KEY = 'chickencitos_cupon_activo';
const CUPONES_LISTA_KEY = 'chickencitos_cupones_lista';
const COMPRAS_KEY = 'chickencitos_compras';
const AUDIT_KEY = 'chickencitos_audit';
const SESION_KEY = 'user_session';
const FAVORITOS_KEY = 'chickencitos_favoritos';
const DIRECCION_KEY = 'chickencitos_direccion';
const METODO_PAGO_KEY = 'chickencitos_metodo_pago';
const METODO_ENVIO_KEY = 'chickencitos_metodo_envio';
const CANCELADOS_KEY = 'chickencitos_pedidos_cancelados';
const GRUPOS_KEY = 'chickencitos_grupos';
const LOGISTICA_HIST_KEY = 'chickencitos_logistica_historial';
const REPARTIDORES_KEY = 'chickencitos_repartidores_asignados';
const BANNER_KEY = 'chickencitos_banner';
const CHECKOUT_PASO_KEY = 'chickencitos_checkout_paso';
const CUPONES_USOS_KEY = 'chickencitos_cupones';
const FAV_SNAPSHOTS_KEY = 'chickencitos_fav_snapshots';

// Lee un valor JSON de localStorage con manejo de errores
const leer = (clave, fallback = null) => {
  try { const r = localStorage.getItem(clave); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};

// Guarda un valor JSON en localStorage
const guardar = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
// Elimina una clave de localStorage
const eliminar = (clave) => localStorage.removeItem(clave);

// Servicio de almacenamiento — abstrae todas las operaciones de localStorage del sistema
export const storage = {
  // Stock
  getStock: (productId) => {
    const inv = leer(STOCK_KEY, {});
    const key = `stock_${productId}`;
    if (inv[key] === undefined) {
      inv[key] = ((productId * 7) % 50) + 5;
      guardar(STOCK_KEY, inv);
    }
    return inv[key];
  },
  decrementarStock: (productId, cantidad, productTitle) => {
    const inv = leer(STOCK_KEY, {});
    const key = `stock_${productId}`;
    const actual = inv[key] ?? ((productId * 7) % 50) + 5;
    if (cantidad > actual) throw new Error(`Stock insuficiente para el producto ${productId}`);
    inv[key] = actual - cantidad;
    guardar(STOCK_KEY, inv);
    window.dispatchEvent(new Event('stockUpdated'));
    if (inv[key] === 0 && productTitle) {
      window.dispatchEvent(new CustomEvent('productoAgotado', { detail: { productId, title: productTitle } }));
    }
    return inv[key];
  },
  stockSuficiente: (productId, cantidad) => cantidad <= storage.getStock(productId),

  // Carrito
  getCart: () => leer(CART_KEY, []),
  setCart: (items) => guardar(CART_KEY, items),

  // Cupón activo
  getCuponActivo: () => leer(CUPON_KEY, null),
  setCuponActivo: (cupon) => cupon ? guardar(CUPON_KEY, cupon) : eliminar(CUPON_KEY),

  // Cupones creados por admin
  getCuponesAdmin: () => leer(CUPONES_LISTA_KEY, []),
  setCuponesAdmin: (cupones) => guardar(CUPONES_LISTA_KEY, cupones),

  // Usos de cupones
  getUsosCupon: (codigo) => (leer(CUPONES_USOS_KEY, {}))[codigo] || 0,
  registrarUsoCupon: (codigo) => {
    const usos = leer(CUPONES_USOS_KEY, {});
    usos[codigo] = (usos[codigo] || 0) + 1;
    guardar(CUPONES_USOS_KEY, usos);
  },

  // Compras
  getCompras: () => leer(COMPRAS_KEY, []),
  setCompras: (compras) => guardar(COMPRAS_KEY, compras),
  addCompra: (pedido) => {
    const historial = leer(COMPRAS_KEY, []);
    historial.push(pedido);
    guardar(COMPRAS_KEY, historial);
    return pedido;
  },

  // Auditoría
  getAudit: () => leer(AUDIT_KEY, []),
  addAudit: (registro) => {
    const auditoria = leer(AUDIT_KEY, []);
    auditoria.push(registro);
    guardar(AUDIT_KEY, auditoria);
  },

  // Sesión
  getSesion: () => leer(SESION_KEY, null),
  setSesion: (usuario) => guardar(SESION_KEY, usuario),
  clearSesion: () => eliminar(SESION_KEY),

  // Favoritos
  getFavoritos: () => leer(FAVORITOS_KEY, []),
  setFavoritos: (favoritos) => guardar(FAVORITOS_KEY, favoritos),

  // Snapshots favoritos
  getFavSnapshots: () => leer(FAV_SNAPSHOTS_KEY, { precios: {}, stocks: {} }),
  setFavSnapshots: (snapshots) => guardar(FAV_SNAPSHOTS_KEY, snapshots),

  // Dirección, pago, envío
  getDireccion: () => localStorage.getItem(DIRECCION_KEY) || '',
  setDireccion: (d) => localStorage.setItem(DIRECCION_KEY, d),
  getMetodoPago: () => localStorage.getItem(METODO_PAGO_KEY) || 'tarjeta',
  setMetodoPago: (m) => localStorage.setItem(METODO_PAGO_KEY, m),
  getMetodoEnvio: () => localStorage.getItem(METODO_ENVIO_KEY) || 'estandar',
  setMetodoEnvio: (e) => localStorage.setItem(METODO_ENVIO_KEY, e),

  // Checkout paso
  getCheckoutPaso: () => localStorage.getItem(CHECKOUT_PASO_KEY) || 'inicio',
  setCheckoutPaso: (paso) => localStorage.setItem(CHECKOUT_PASO_KEY, paso),

  // Cancelados
  getCancelados: () => leer(CANCELADOS_KEY, []),
  addCancelado: (registro) => {
    const cancelados = leer(CANCELADOS_KEY, []);
    cancelados.push(registro);
    guardar(CANCELADOS_KEY, cancelados);
  },

  // Grupos colaborativos
  getGrupos: () => leer(GRUPOS_KEY, {}),
  setGrupos: (grupos) => guardar(GRUPOS_KEY, grupos),

  // Logística
  addLogisticaEvento: (evento) => {
    const hist = leer(LOGISTICA_HIST_KEY, []);
    hist.push(evento);
    guardar(LOGISTICA_HIST_KEY, hist);
  },
  getLogisticaHistorial: () => leer(LOGISTICA_HIST_KEY, []),
  addRepartidorAsignado: (nombre) => {
    const reps = leer(REPARTIDORES_KEY, []);
    reps.push(nombre);
    guardar(REPARTIDORES_KEY, [...new Set(reps)]);
  },

  // Banner
  getBanner: () => leer(BANNER_KEY, null),

  // Productos custom (admin CRUD)
  getProductosCustom: () => leer('chickencitos_productos_custom', []),
  setProductosCustom: (productos) => guardar('chickencitos_productos_custom', productos),

  // Estado de envío por pedido
  getEnvioStatuses: () => leer('chickencitos_envio_statuses', {}),
  setEnvioStatus: (pedidoId, status) => {
    const statuses = leer('chickencitos_envio_statuses', {});
    statuses[pedidoId] = status;
    guardar('chickencitos_envio_statuses', statuses);
  },
};
