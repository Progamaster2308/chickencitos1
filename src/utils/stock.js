const STOCK_STORAGE_KEY = 'chickencitos_inventario';

const getStockKey = (productId) => `stock_${productId}`;

export const generarStockSimulado = (productId) => ((productId * 7) % 50) + 5;

const inicializarInventarioSiNoExiste = () => {
  if (!localStorage.getItem(STOCK_STORAGE_KEY)) {
    const inventario = {};
    for (let id = 1; id <= 20; id++) {
      inventario[getStockKey(id)] = generarStockSimulado(id);
    }
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(inventario));
  }
};

export const obtenerStock = (productId) => {
  inicializarInventarioSiNoExiste();
  const inventario = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY) || '{}');
  return inventario[getStockKey(productId)] ?? generarStockSimulado(productId);
};

export const decrementarStock = (productId, cantidad, productTitle) => {
  inicializarInventarioSiNoExiste();
  const inventario = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY) || '{}');
  const actual = inventario[getStockKey(productId)] ?? generarStockSimulado(productId);
  if (cantidad > actual) throw new Error(`Stock insuficiente para el producto ${productId}`);
  const nuevoStock = actual - cantidad;
  inventario[getStockKey(productId)] = nuevoStock;
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(inventario));
  window.dispatchEvent(new Event('stockUpdated'));
  if (nuevoStock === 0 && productTitle) {
    window.dispatchEvent(new CustomEvent('productoAgotado', { detail: { productId, title: productTitle } }));
  }
  return nuevoStock;
};

export const validarStockSuficiente = (productId, cantidad) => {
  return cantidad <= obtenerStock(productId);
};
