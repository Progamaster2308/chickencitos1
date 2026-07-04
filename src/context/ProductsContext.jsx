import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productosApi, comidasApi } from '../services/apiService';
import { storage } from '../services/storageService';
import { useNotifications } from './NotificationsContext';

// Contexto de productos — carga el catálogo desde APIs externas y productos personalizados del admin
const ProductsContext = createContext(null);
const INVENTARIO_KEY = 'chickencitos_inventario';

export function ProductsProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Contador para forzar recarga del catálogo desde componentes externos
  const [forceRefresh, setForceRefresh] = useState(0);
  const { agregarNotificacion } = useNotifications();

  // Carga asíncrona del catálogo — usa AbortController para cancelación
  // Obtiene productos desde FakeStore API y comidas desde TheMealDB en paralelo
  const cargarProductos = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const [data, comidas] = await Promise.all([
        productosApi.obtener(controller.signal),
        comidasApi.obtener(controller.signal),
      ]);
      const custom = storage.getProductosCustom();
      setProductos([...data, ...comidas, ...custom]);
      agregarNotificacion('Sincronización', `Catálogo actualizado: ${data.length + comidas.length + custom.length} productos`, 'exito');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        agregarNotificacion('Error', 'Error al sincronizar catálogo', 'error');
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [agregarNotificacion]);

  // Efecto principal de carga al montar y cada vez que se fuerza refresco
  useEffect(() => {
    const cleanup = cargarProductos();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [cargarProductos, forceRefresh]);

  // Escucha cambios de inventario desde otras pestañas o componentes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === INVENTARIO_KEY) {
        setForceRefresh(p => p + 1);
      }
    };
    const handleStockUpdate = () => setForceRefresh(p => p + 1);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('stockUpdated', handleStockUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('stockUpdated', handleStockUpdate);
    };
  }, []);

  // Permite reintentar la carga desde pantallas de error
  const reintentar = useCallback(() => {
    setForceRefresh(p => p + 1);
    return cargarProductos();
  }, [cargarProductos]);

  const value = { productos, loading, error, reintentar };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de un ProductsProvider');
  }
  return context;
}
