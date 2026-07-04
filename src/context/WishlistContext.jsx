import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { obtenerStock } from '../utils/stock';
import { useProducts } from './ProductsContext';
import { useNotifications } from './NotificationsContext';

const WishlistContext = createContext(null);
const WISHLIST_KEY = 'chickencitos_favoritos';
const SNAPSHOTS_KEY = 'chickencitos_fav_snapshots';
const POLL_INTERVAL = 30000;

const leerFavoritos = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const [favoritos, setFavoritos] = useState(leerFavoritos);
  const preciosAnteriores = useRef({});
  const stocksAnteriores = useRef({});

  const { productos } = useProducts();
  const { agregarNotificacion } = useNotifications();

  const toggleFavorito = useCallback((producto) => {
    setFavoritos((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      const nuevos = existe
        ? prev.filter((p) => p.id !== producto.id)
        : [
            ...prev,
            {
              id: producto.id,
              title: producto.title,
              price: producto.price,
              category: producto.category,
              image: producto.image,
            },
          ];

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(nuevos));
      return nuevos;
    });
  }, []);

  const esFavorito = useCallback((productId) => {
    return favoritos.some((p) => p.id === productId);
  }, [favoritos]);

  // Notificaciones: monitorea cambios en favoritos.
  // - Si el precio baja (comparando contra snapshot anterior)
  // - Si el stock pasa de 0 -> >0
  useEffect(() => {
    if (favoritos.length === 0) return;

    const snapshots = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '{}');
    preciosAnteriores.current = snapshots.precios || {};
    stocksAnteriores.current = snapshots.stocks || {};

    const verificarCambios = () => {
      const nuevosSnapshotsPrecios = { ...preciosAnteriores.current };
      const nuevosSnapshotsStocks = { ...stocksAnteriores.current };

      const notificaciones = [];

      favoritos.forEach((fav) => {
        const stockActual = obtenerStock(fav.id);

        // Precio actual del catálogo (si existe). Si no existe, usamos el guardado.
        const productoActual = productos.find((p) => p.id === fav.id);
        const precioActual = productoActual?.price ?? fav.price;

        const precioAnterior = nuevosSnapshotsPrecios[fav.id];
        const stockAnterior = nuevosSnapshotsStocks[fav.id];

        // Notificar solo cuando el precio baja
        if (precioAnterior !== undefined && precioActual < precioAnterior) {
          notificaciones.push({
            id: fav.id,
            title: fav.title,
            mensaje: `"${fav.title}" bajó de precio: $${precioAnterior} → $${precioActual}`,
            tipo: 'info',
          });
        }

        // Notificar cuando stock pasa de 0 a >0
        if (stockAnterior !== undefined && stockAnterior === 0 && stockActual > 0) {
          notificaciones.push({
            id: fav.id,
            title: fav.title,
            mensaje: `"${fav.title}" está disponible con stock: ${stockActual}`,
            tipo: 'exito',
          });
        }

        nuevosSnapshotsPrecios[fav.id] = precioActual;
        nuevosSnapshotsStocks[fav.id] = stockActual;
      });

      localStorage.setItem(
        SNAPSHOTS_KEY,
        JSON.stringify({ precios: nuevosSnapshotsPrecios, stocks: nuevosSnapshotsStocks })
      );

      preciosAnteriores.current = nuevosSnapshotsPrecios;
      stocksAnteriores.current = nuevosSnapshotsStocks;

      if (notificaciones.length > 0) {
        notificaciones.forEach((n) => {
          agregarNotificacion('Lista de deseos', n.mensaje, n.tipo);
        });
      }
    };

    // Usamos un timer para que sea continuo.
    const timer = setInterval(verificarCambios, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [favoritos, productos, agregarNotificacion]);

  return (
    <WishlistContext.Provider value={{ favoritos, toggleFavorito, esFavorito }}>
      {children}
    </WishlistContext.Provider>
  );

}

export const useWishlist = () => useContext(WishlistContext);

