import { useContext } from 'react';
import { LogisticsContext } from '../context/LogisticsContext';
import { useChat } from '../context/ChatContext';

export default function Ticket({ pedido, resumen }) {
  const fecha = new Date().toLocaleString('es-MX');
  const { estadoPedido, centroAsignado, repartidorAsignado } = useContext(LogisticsContext);
  const { iniciarChatPedido } = useChat();

  const getBadgeClass = (etapa) => {
    const map = {
      'Entregado': 'badge-success',
      'En ruta': 'badge-info',
      'Enviado': 'badge-primary',
      'Empacado': 'badge-warning',
      'Confirmado': 'badge-warning',
      'Pendiente': 'badge-secondary',
    };
    return map[etapa] || 'badge-secondary';
  };

  return (
    <div className="ticket">
      <div className="ticket-header">
        <h2 style={{ color: 'var(--primary)', margin: '0 0 0.25rem' }}>✅ ¡Compra exitosa!</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fecha}</p>
      </div>

      <div className="ticket-status">
        {estadoPedido && estadoPedido.pedidoId === pedido.id ? (
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600 }}>Estado:</span>
            <span className={`badge ${getBadgeClass(estadoPedido.etapa)}`}>{estadoPedido.etapa}</span>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Iniciando proceso de envío...</p>
        )}
        {centroAsignado && (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📦 Centro: {centroAsignado.nombre}
          </p>
        )}
        {repartidorAsignado && (
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            🚚 Repartidor: {repartidorAsignado.nombre}
          </p>
        )}
      </div>

      <div className="ticket-line"><span>Pedido #</span><strong>{pedido.id}</strong></div>
      {pedido.userName && <div className="ticket-line"><span>Cliente</span><strong>{pedido.userName}</strong></div>}
      {pedido.cupon && <div className="ticket-line" style={{ color: 'var(--primary)' }}><span>Cupón</span><strong>{pedido.cupon.codigo}</strong></div>}
      {pedido.codigoGrupo && <div className="ticket-line" style={{ color: '#6f42c1' }}><span>Compra grupal</span><strong>{pedido.codigoGrupo}</strong></div>}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
        {pedido.products?.map((item) => (
          <div key={item.id} className="ticket-line" style={{ fontSize: '0.85rem' }}>
            <span>{item.title.slice(0, 35)} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
        <div className="ticket-line"><span>Subtotal</span><span>${resumen.subtotal.toFixed(2)}</span></div>
        <div className="ticket-line"><span>IVA (16%)</span><span>${resumen.iva.toFixed(2)}</span></div>
        <div className="ticket-line" style={{ color: resumen.descuento > 0 ? 'var(--primary)' : 'inherit' }}>
          <span>Descuento</span><span>-${resumen.descuento.toFixed(2)}</span>
        </div>
        <div className="ticket-total">
          <span>Total</span>
          <span>${resumen.total.toFixed(2)}</span>
        </div>
      </div>

      <button className="btn btn-primary btn-block mt-3" onClick={() => iniciarChatPedido(pedido.id)}>
        💬 Chatear sobre este pedido
      </button>
    </div>
  );
}
