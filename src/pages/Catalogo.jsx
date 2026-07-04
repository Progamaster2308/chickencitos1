import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorScreen from '../components/ErrorScreen';

export default function Catalogo() {
  const { productos, loading, error, reintentar } = useProducts();
  const [searchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || 'todas');
  const [orden, setOrden] = useState('ninguno');

  const categorias = useMemo(() => {
    const unicas = new Set(productos.map((p) => p.category));
    return ['todas', ...unicas];
  }, [productos]);

  const productosVisibles = useMemo(() => {
    let resultado = [...productos];
    if (busqueda.trim()) {
      const texto = busqueda.trim().toLowerCase();
      resultado = resultado.filter((p) => p.title.toLowerCase().includes(texto));
    }
    if (categoria !== 'todas') resultado = resultado.filter((p) => p.category === categoria);
    if (orden === 'precio-asc') resultado.sort((a, b) => a.price - b.price);
    else if (orden === 'precio-desc') resultado.sort((a, b) => b.price - a.price);
    else if (orden === 'nombre-asc') resultado.sort((a, b) => a.title.localeCompare(b.title));
    else if (orden === 'nombre-desc') resultado.sort((a, b) => b.title.localeCompare(a.title));
    return resultado;
  }, [productos, busqueda, categoria, orden]);

  if (loading) return <LoadingSpinner mensaje="Cargando productos..." />;
  if (error) return <ErrorScreen mensaje={error} onReintentar={reintentar} />;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Menú</h1>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text" placeholder="Buscar producto..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="input" style={{ flex: 1, minWidth: 200 }}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input select" style={{ width: 'auto' }}>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat === 'todas' ? 'Todas' : cat}</option>
          ))}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} className="input select" style={{ width: 'auto' }}>
          <option value="ninguno">Sin orden</option>
          <option value="precio-asc">Precio ↑</option>
          <option value="precio-desc">Precio ↓</option>
          <option value="nombre-asc">A-Z</option>
          <option value="nombre-desc">Z-A</option>
        </select>
      </div>

      {productosVisibles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p style={{ color: 'var(--text-muted)' }}>No se encontraron productos.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-2">{productosVisibles.length} producto{productosVisibles.length !== 1 ? 's' : ''} encontrado{productosVisibles.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-3">
            {productosVisibles.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
