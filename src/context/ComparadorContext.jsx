import { createContext, useContext, useMemo, useState } from 'react';
import { useCart } from './CartContext';

const ComparadorContext = createContext(null);

export function ComparadorProvider({ children }) {
  const MAX = 4;
  const { agregarProducto } = useCart();

  const [seleccionados, setSeleccionados] = useState([]);

  const agregarAlComparador = (producto) => {
    setSeleccionados((prev) => {
      const existe = prev.some((p) => p.id === producto.id);
      if (existe) return prev;
      if (prev.length >= MAX) return prev;
      return [...prev, producto];
    });
  };

  const quitarDeComparador = (productoId) => {
    setSeleccionados((prev) => prev.filter((p) => p.id !== productoId));
  };

  const toggleSeleccion = (producto) => {
    setSeleccionados((prev) => {
      const existe = prev.some((p) => p.id === producto.id);
      if (existe) return prev.filter((p) => p.id !== producto.id);
      if (prev.length >= MAX) return prev;
      return [...prev, producto];
    });
  };

  const estaSeleccionado = (productoId) => seleccionados.some((p) => p.id === productoId);

  const agregarSeleccionadoAlCarrito = async (producto) => {
    // feedback visual/estado se maneja desde la página, aquí solo agregamos
    await agregarProducto(producto, 1);
  };

  const value = useMemo(() => {
    return {
      seleccionados,
      agregarAlComparador,
      quitarDeComparador,
      toggleSeleccion,
      estaSeleccionado,
      agregarSeleccionadoAlCarrito,
      MAX,
    };
  }, [seleccionados]);

  return <ComparadorContext.Provider value={value}>{children}</ComparadorContext.Provider>;
}

export const useComparador = () => {
  const ctx = useContext(ComparadorContext);
  if (!ctx) throw new Error('useComparador debe usarse dentro de un ComparadorProvider');
  return ctx;
};

