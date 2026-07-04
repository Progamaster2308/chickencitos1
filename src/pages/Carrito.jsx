import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Carrito() {
  const { items, vaciarCarrito, subtotal, iva, descuento, total, cuponActivo, aplicandoCupon, aplicarCupon, limpiarCupon, codigoGrupo, crearGrupoCompra, unirseAGrupo, confirmarParticipacion, abandonarGrupo, calcularAportaciones } = useCart();
  const [codigoCupon, setCodigoCupon] = useState('');
  const [mensajeCupon, setMensajeCupon] = useState(null);
  const [codigoGrupoInput, setCodigoGrupoInput] = useState('');
  const [nombreParticipante, setNombreParticipante] = useState('');

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setMensajeCupon(null);
    try {
      const cupon = await aplicarCupon(codigoCupon);
      setMensajeCupon({ tipo: 'exito', texto: `✅ ¡Cupón aplicado! ${cupon.tipo === 'porcentaje' ? `${cupon.valor}% de descuento` : `$${cupon.valor} de descuento`}` });
      setCodigoCupon('');
    } catch (err) {
      setMensajeCupon({ tipo: 'error', texto: `❌ ${err.message}` });
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos desde nuestro menú.</p>
        <Link to="/catalogo" className="btn btn-primary">Ver Menú</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 style={{ margin: 0 }}>Carrito</h1>
        <button className="btn btn-secondary" onClick={vaciarCarrito}>
          Vaciar carrito
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        {items.map((item) => <CartItem key={item.id} item={item} />)}
      </div>

      {mensajeCupon && (
        <div className={`page-section ${mensajeCupon.tipo === 'exito' ? '' : ''}`}
          style={{
            padding: '0.75rem 1rem',
            background: mensajeCupon.tipo === 'exito' ? 'var(--success-light)' : 'var(--danger-light)',
            color: mensajeCupon.tipo === 'exito' ? '#065F46' : '#991B1B',
            fontWeight: 600, fontSize: '0.9rem',
          }}
        >
          {mensajeCupon.texto}
        </div>
      )}

      <div className="page-section mb-2" style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>👥 Compra Colaborativa</h3>
        {!codigoGrupo ? (
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => crearGrupoCompra()}>
              Crear grupo
            </button>
            <div className="flex gap-1" style={{ flex: 1, minWidth: 200 }}>
              <input
                className="input" placeholder="Código de grupo"
                value={codigoGrupoInput}
                onChange={e => setCodigoGrupoInput(e.target.value)}
              />
              <button className="btn btn-secondary btn-sm" onClick={() => {
                try { unirseAGrupo(codigoGrupoInput); } catch (e) { alert(e.message); }
              }}>
                Unirse
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, color: '#6f42c1', marginBottom: '0.5rem' }}>
              🏷️ Grupo: <strong>{codigoGrupo}</strong>
            </p>
            {(() => {
              const aportes = calcularAportaciones(codigoGrupo);
              return aportes.length > 0 && (
                <div className="table-container" style={{ marginBottom: '0.75rem' }}>
                  <table className="table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr><th>Participante</th><th className="text-right">Aportación</th><th className="text-center">Estado</th></tr>
                    </thead>
                    <tbody>
                      {aportes.map((a, i) => (
                        <tr key={i}>
                          <td>{a.nombre}</td>
                          <td className="text-right">${a.aportacion}</td>
                          <td className="text-center">
                            <span className={`badge ${a.confirmado ? 'badge-success' : 'badge-warning'}`}>
                              {a.confirmado ? '✅ Confirmado' : '⏳ Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-1">
              <input
                className="input" placeholder="Tu nombre" style={{ maxWidth: 180 }}
                value={nombreParticipante}
                onChange={e => setNombreParticipante(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={() => {
                if (!nombreParticipante.trim()) { alert('Ingresa tu nombre'); return; }
                confirmarParticipacion(codigoGrupo, nombreParticipante.trim());
              }}>
                Confirmar participación
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => {
                abandonarGrupo(codigoGrupo, nombreParticipante.trim() || 'Anfitrión');
              }}>
                Abandonar grupo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="summary-card" style={{ marginLeft: 'auto' }}>
        <div className="coupon-row">
          <input
            type="text"
            placeholder="Código de cupón"
            value={codigoCupon}
            onChange={(e) => setCodigoCupon(e.target.value)}
            disabled={!!cuponActivo}
          />
          {cuponActivo ? (
            <button className="btn btn-secondary btn-sm" onClick={limpiarCupon}>Quitar</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleAplicarCupon} disabled={aplicandoCupon}>
              {aplicandoCupon ? '...' : 'Aplicar'}
            </button>
          )}
        </div>

        <div className="summary-line"><span>Subtotal</span><span>${subtotal}</span></div>
        <div className="summary-line"><span>IVA (16%)</span><span>${iva}</span></div>
        <div className="summary-line" style={{ color: Number(descuento) > 0 ? 'var(--primary)' : 'inherit' }}>
          <span>Descuento</span><span>-${descuento}</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>${total}</span>
        </div>

        <Link to="/checkout" className="btn btn-primary btn-block mt-2">
          Finalizar Compra
        </Link>
      </div>
    </div>
  );
}
