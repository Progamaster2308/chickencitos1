import { useCart } from '../context/CartContext';
import { obtenerStock } from '../utils/stock';

export default function CartItem({ item }) {
  const { actualizarCantidad, eliminarProducto } = useCart();
  const stock = obtenerStock(item.id);
  const subtotalLinea = item.price * item.quantity;

  const handleIncrementar = () => {
    if (item.quantity < stock) actualizarCantidad(item.id, item.quantity + 1);
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.title} />
      </div>

      <div className="cart-item-info">
        <h4>{item.title}</h4>
        <p>${item.price.toFixed(2)} c/u &middot; Stock: {stock}</p>
      </div>

      <div className="cart-item-qty">
        <button onClick={() => actualizarCantidad(item.id, item.quantity - 1)}>−</button>
        <span>{item.quantity}</span>
        <button onClick={handleIncrementar} disabled={item.quantity >= stock}>+</button>
      </div>

      <div className="cart-item-subtotal">${subtotalLinea.toFixed(2)}</div>

      <button
        className="btn btn-danger btn-sm"
        onClick={() => eliminarProducto(item.id)}
      >
        Eliminar
      </button>
    </div>
  );
}
