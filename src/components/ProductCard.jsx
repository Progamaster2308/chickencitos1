import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { obtenerStock } from '../utils/stock';

export default function ProductCard({ producto }) {
  const { agregarProducto } = useCart();
  const { esFavorito, toggleFavorito } = useWishlist();
  const [cantidad, setCantidad] = useState(1);

  const stock = obtenerStock(producto.id);
  const sinStock = stock === 0;
  const fav = esFavorito(producto.id);

  const handleAgregar = () => {
    agregarProducto(producto, cantidad);
    setCantidad(1);
  };

  return (
    <div className="product-card">
      <button className="fav-btn" onClick={() => toggleFavorito(producto)}>
        {fav ? '❤️' : '🤍'}
      </button>

      <div className="product-card-image">
        <img src={producto.image} alt={producto.title} />
      </div>

      <span className="product-card-category">{producto.category}</span>
      <h3 className="product-card-title">{producto.title}</h3>

      <div className="product-card-price">${producto.price.toFixed(2)}</div>

      <div className="product-card-rating">
        ⭐ {producto.rating?.rate ?? 'N/A'} ({producto.rating?.count ?? 0} reseñas)
      </div>

      <div className="product-card-stock" style={{ color: sinStock ? 'var(--danger)' : 'var(--text-secondary)' }}>
        {sinStock ? 'Sin stock' : `Stock: ${stock} unidades`}
      </div>

      {!sinStock && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number" min="1" max={stock}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="input"
            style={{ width: '64px', flexShrink: 0 }}
          />
          <button className="btn btn-primary flex-1" onClick={handleAgregar}>
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}
