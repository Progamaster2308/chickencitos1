import { useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';

const TIPO_COLOR = {
  exito: { bg: '#D1FAE5', dot: '#10B981' },
  error: { bg: '#FEE2E2', dot: '#EF4444' },
  advertencia: { bg: '#FEF3C7', dot: '#F59E0B' },
  info: { bg: '#DBEAFE', dot: '#3B82F6' },
};

export default function NotificationsWidget() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas, limpiarNotificaciones } = useNotifications();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button className="notif-btn" onClick={() => setAbierto(!abierto)}>
        🔔
        {noLeidas > 0 && <span className="notif-badge">{noLeidas}</span>}
      </button>

      {abierto && (
        <div className="notif-box">
          <div className="notif-box-header">
            <h4>Notificaciones</h4>
            <div className="flex gap-1">
              {noLeidas > 0 && <button className="btn btn-ghost btn-sm" onClick={marcarTodasLeidas}>✓ Todo</button>}
              <button className="btn btn-ghost btn-sm" onClick={limpiarNotificaciones}>🗑</button>
            </div>
          </div>

          <div className="notif-list">
            {notificaciones.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', margin: 0 }}>
                Sin notificaciones
              </p>
            )}
            {notificaciones.map(n => {
              const colores = TIPO_COLOR[n.tipo] || TIPO_COLOR.info;
              return (
                <div
                  key={n.id}
                  className={`notif-item ${!n.leida ? 'unread' : ''}`}
                  onClick={() => marcarLeida(n.id)}
                  style={{ borderLeftColor: colores.dot }}
                >
                  <p className="notif-item-title">{n.titulo}</p>
                  <p className="notif-item-msg">{n.mensaje}</p>
                  <p className="notif-item-date">{new Date(n.fecha).toLocaleString('es-MX')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
