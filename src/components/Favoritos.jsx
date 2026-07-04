import { useMemo, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Favoritos() {
  const { favoritos, toggleFavorito } = useWishlist();
  const { agregarProducto } = useCart();
  const [agregandoId, setAgregandoId] = useState(null);

  const favoritosOrdenados = useMemo(() => {
    return [...favoritos].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  }, [favoritos]);

  const handleAgregarCarrito = async (producto) => {
    setAgregandoId(producto.id);
    await agregarProducto(producto, 1);
    setTimeout(() => setAgregandoId((id) => (id === producto.id ? null : id)), 900);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Lista de Deseos</h1>

      {favoritosOrdenados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <p style={{ color: 'var(--text-muted)' }}>
            Aún no tienes productos guardados. Usa el corazón en el catálogo para agregarlos.
          </p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {favoritosOrdenados.map((p) => (
            <div key={p.id} className="wishlist-card">
              <div className="wishlist-card-media">
                <img src={p.image} alt={p.title} />
              </div>

              <div className="wishlist-card-body">
                <div className="wishlist-card-category">{p.category}</div>
                <h3 className="wishlist-card-title">{p.title}</h3>
                <div className="wishlist-card-price">${(p.price ?? 0).toFixed(2)}</div>

                <div className="wishlist-card-actions">
                  <button
                    className="btn btn-sm btn-secondary wishlist-eliminar"
                    onClick={() => toggleFavorito(p)}
                    title="Eliminar de favoritos"
                    aria-label={`Eliminar ${p.title} de favoritos`}
                  >
                    🗑️ Eliminar
                  </button>

                  <button
                    className={`btn btn-sm btn-primary wishlist-agregar ${agregandoId === p.id ? 'wishlist-agregado' : ''}`}
                    onClick={() => handleAgregarCarrito(p)}
                    disabled={agregandoId === p.id}
                  >
                    {agregandoId === p.id ? 'Agregado ✓' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


