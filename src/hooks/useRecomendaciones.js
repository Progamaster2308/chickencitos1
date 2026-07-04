import { useState, useEffect } from 'react';

const FAVORITOS_KEY = 'chickencitos_favoritos';

export const useRecomendaciones = () => {
  const [sugerencias, setSugerencias] = useState(null);

  useEffect(() => {
    const calcularRecomendaciones = async () => {
      try {
        const historialRaw = localStorage.getItem('chickencitos_compras');
        const historial = historialRaw ? JSON.parse(historialRaw) : [];

        if (historial.length === 0) {
          setSugerencias(null);
          return;
        }

        const ordenadoPorFecha = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const recientes = ordenadoPorFecha.slice(0, 3);

        const conteo = historial.reduce((acc, pedido) => {
          pedido.products.forEach(p => {
            if (p.category) {
              acc[p.category] = (acc[p.category] || 0) + p.quantity;
            }
            if (p.price) {
              acc['precios'] = acc['precios'] || [];
              acc['precios'].push(p.price);
            }
          });
          return acc;
        }, {});

        if (Object.keys(conteo).length === 0) {
          setSugerencias(null);
          return;
        }

        const categoriaFav = Object.keys(conteo)
          .filter(k => k !== 'precios')
          .reduce((a, b) => conteo[a] > conteo[b] ? a : b, Object.keys(conteo).filter(k => k !== 'precios')[0]);

        const favoritosRaw = localStorage.getItem(FAVORITOS_KEY);
        const favoritos = favoritosRaw ? JSON.parse(favoritosRaw) : [];

        const precios = conteo['precios'] || [];
        const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
        const precioMax = precios.length > 0 ? Math.max(...precios) : Infinity;

        const comprasRecientes = recientes.flatMap(p => p.products || []).map(p => p.category).filter(Boolean);
        const categoriaReciente = comprasRecientes.length > 0
          ? comprasRecientes.sort((a, b) => comprasRecientes.filter(c => c === a).length - comprasRecientes.filter(c => c === b).length).pop()
          : null;

        await new Promise(resolve => setTimeout(resolve, 500));

        setSugerencias({
          categoriaFav,
          favoritosIds: favoritos.map(f => f.id),
          precioMin,
          precioMax: precioMax === Infinity ? 9999 : precioMax,
          categoriaReciente,
        });
      } catch (error) {
        console.error("Error calculando recomendaciones:", error);
        setSugerencias(null);
      }
    };

    calcularRecomendaciones();
  }, []);

  return sugerencias;
};
