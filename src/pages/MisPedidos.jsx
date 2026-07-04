import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storageService';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

export default function MisPedidos() {
  const { usuario } = useAuth();
  const [expandido, setExpandido] = useState(null);

  const todasLasCompras = JSON.parse(localStorage.getItem('chickencitos_compras') || '[]');
  const misPedidos = todasLasCompras.filter(p => p.userId === usuario?.id);

  if (misPedidos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Package size={48} /></div>
        <h2>No tienes pedidos aún</h2>
        <p>Explora nuestro catálogo y haz tu primer pedido.</p>
        <Link to="/catalogo" className="btn btn-primary">Ver Menú</Link>
      </div>
    );
  }

  const enviosStatuses = storage.getEnvioStatuses();

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Mis Pedidos</h1>
      <div className="flex flex-col gap-3">
        {misPedidos.slice().reverse().map(p => {
          const expandidoActivo = expandido === p.id;
          const status = enviosStatuses[p.id] || 'Pendiente';
          const badgeClass = status === 'Entregado' ? 'badge-success'
            : status === 'Cancelado' || status === 'Pendiente' ? 'badge-danger'
            : 'badge-warning';

          return (
            <div key={p.id} className="page-section" style={{ padding: '1rem', cursor: 'pointer' }}
              onClick={() => setExpandido(expandidoActivo ? null : p.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong>Pedido #{p.id}</strong>
                    <span className="text-sm text-muted" style={{ marginLeft: '0.75rem' }}>
                      {new Date(p.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${badgeClass}`}>{status}</span>
                  {expandidoActivo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandidoActivo && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="table-container">
                    <table className="table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr><th>Producto</th><th className="text-right">Precio</th><th className="text-center">Cant.</th><th className="text-right">Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {p.products?.map((prod, i) => (
                          <tr key={i}>
                            <td>{prod.title}</td>
                            <td className="text-right">${prod.price?.toFixed(2)}</td>
                            <td className="text-center">{prod.quantity}</td>
                            <td className="text-right">${(prod.price * prod.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {p.resumen && (
                    <div className="summary-card" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', marginLeft: 'auto', maxWidth: 300 }}>
                      <div className="summary-line"><span>Subtotal</span><span>${p.resumen.subtotal?.toFixed(2)}</span></div>
                      <div className="summary-line"><span>IVA</span><span>${p.resumen.iva?.toFixed(2)}</span></div>
                      {p.resumen.descuento > 0 && (
                        <div className="summary-line" style={{ color: 'var(--primary)' }}>
                          <span>Descuento</span><span>-${p.resumen.descuento?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="summary-total"><span>Total</span><span>${p.resumen.total?.toFixed(2)}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
