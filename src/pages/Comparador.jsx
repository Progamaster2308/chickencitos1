import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useComparador } from '../context/ComparadorContext';
import { obtenerStock } from '../utils/stock';

// Calcula el costo final de forma asíncrona (IVA 16%)
const calcularCostoFinal = async (producto) => {
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));

  // Descuento simulado (mantiene coherencia con el resto del sistema)
  const descuento = producto.id % 5 === 0 ? 10 : 0;
  const precioConDescuento = descuento > 0 ? producto.price * (1 - descuento / 100) : producto.price;
  const costoFinal = +(precioConDescuento * 1.16).toFixed(2);

  return {
    ...producto,
    descuento,
    precioConDescuento: +precioConDescuento.toFixed(2),
    costoFinal,
  };
};

// Enriquecer producto con stock (asíncrono)
const obtenerInfoProductoAsync = async (producto) => {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 200));
  const stock = obtenerStock(producto.id);
  return { ...producto, stock };
};

export default function Comparador() {
  const { productos } = useProducts();
  const { agregarProducto } = useCart();

  const {
    seleccionados,
    toggleSeleccion,
    estaSeleccionado,
    quitarDeComparador,
    MAX,
  } = useComparador();

  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [agregados, setAgregados] = useState({});

  // Búsqueda sobre el catálogo completo (sin limitar muestra)
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter((p) => p.title.toLowerCase().includes(texto));
  }, [productos, busqueda]);

  // Resultados de tabla: aseguramos asincronía con Promise.all
  useEffect(() => {
    if (seleccionados.length === 0) {
      setResultados([]);
      return;
    }

    let cancelado = false;

    const cargarResultados = async () => {
      setCargando(true);
      try {
        // 1) Stock/atributos
        const infoBasica = await Promise.all(seleccionados.map(obtenerInfoProductoAsync));
        // 2) Cálculo asíncrono de costo final (IVA 16%)
        const infoConCosto = await Promise.all(infoBasica.map(calcularCostoFinal));
        if (!cancelado) setResultados(infoConCosto);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarResultados();

    return () => {
      cancelado = true;
    };
  }, [seleccionados]);

  const manejarAgregarAlCarrito = async (producto) => {
    await agregarProducto(producto, 1);

    setAgregados((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [producto.id]: false }));
    }, 1800);
  };

  return (
    <div>
      <h1>Comparador Inteligente</h1>
      <p className="text-muted mb-2">Selecciona hasta {MAX} productos para comparar sus atributos.</p>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input mb-2"
      />

      {/*
        Lista de selección sobre el catálogo completo.
        La validación de límite se mantiene (máx 4) pero sin recortes arbitrarios.
      */}
      <div className="flex flex-wrap gap-1 mb-3">
        {filtrados.map((p) => {
          const selected = estaSeleccionado(p.id);
          return (
            <button
              key={p.id}
              className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleSeleccion(p)}
              disabled={seleccionados.length >= MAX && !selected}
            >
              {selected ? '✓ ' : ''}
              {p.title.slice(0, 22)}...
            </button>
          );
        })}
      </div>

      {cargando && <LoadingSpinner mensaje="Cargando información..." />}

      {resultados.length > 0 && !cargando && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Producto</th>
                {resultados.map((r) => (
                  <th key={r.id} className="text-center" style={{ minWidth: 160 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={r.image}
                        alt={r.title}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto 0.5rem',
                        }}
                      />
                      {/* Botón eliminar en la cabecera de la columna */}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => quitarDeComparador(r.id)}
                        style={{ position: 'absolute', top: 0, right: 0 }}
                        title="Eliminar del comparador"
                      >
                        Eliminar
                      </button>
                    </div>
                    <span className="text-sm">{r.title.slice(0, 28)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Precio', render: (r) => `$${r.price.toFixed(2)}` },
                { label: 'Categoría', render: (r) => r.category },
                { label: 'Valoración', render: (r) => `⭐ ${r.rating?.rate ?? 'N/A'}` },
                { label: 'Stock', render: (r) => r.stock },
                { label: 'Descuento', render: (r) => (r.descuento > 0 ? `${r.descuento}%` : '—') },
                { label: 'Precio c/ desc.', render: (r) => `$${r.precioConDescuento}` },
                {
                  label: 'Costo final (IVA incl.)',
                  render: (r) => <strong style={{ color: 'var(--primary)' }}>${r.costoFinal}</strong>,
                },
                {
                  // Fila final con botón "Agregar al carrito"
                  label: 'Acción',
                  render: (r) => (
                    <button
                      className={`btn btn-sm ${agregados[r.id] ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => manejarAgregarAlCarrito(r)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {agregados[r.id] ? 'Agregado ✓' : 'Agregar al carrito'}
                    </button>
                  ),
                },
              ].map((fila) => (
                <tr key={fila.label}>
                  <td style={{ fontWeight: 600 }}>{fila.label}</td>
                  {resultados.map((r) => (
                    <td key={r.id} className="text-center">
                      {fila.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {seleccionados.length === 0 && !cargando && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Selecciona productos arriba para compararlos.</p>
        </div>
      )}
    </div>
  );
}

