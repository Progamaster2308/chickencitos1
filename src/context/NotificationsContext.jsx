import { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext(null);

let notifIdCounter = 0;

export function NotificationsProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const agregarNotificacion = useCallback((titulo, mensaje, tipo = 'info') => {
    const nueva = {
      id: ++notifIdCounter,
      titulo,
      mensaje,
      tipo,
      fecha: new Date().toISOString(),
      leida: false,
    };
    setNotificaciones(prev => [nueva, ...prev]);
    setNoLeidas(prev => prev + 1);
    return nueva;
  }, []);

  const marcarLeida = useCallback((id) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    setNoLeidas(0);
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
    setNoLeidas(0);
  }, []);

  return (
    <NotificationsContext.Provider value={{ notificaciones, noLeidas, agregarNotificacion, marcarLeida, marcarTodasLeidas, limpiarNotificaciones }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
