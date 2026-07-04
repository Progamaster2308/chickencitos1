import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { storage } from '../services/storageService';

const AuditorContext = createContext(null);

export function AuditorProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const registrarAccion = useCallback((accion, modulo, resultado = 'éxito', detalle = '') => {
    const sesion = storage.getSesion();
    const registro = {
      id: Date.now() + Math.random().toString(36).slice(2, 6),
      usuario: sesion ? `${sesion.firstName} ${sesion.lastName}` : 'Anónimo',
      usuarioId: sesion?.id || null,
      fecha: new Date().toLocaleDateString('es-MX'),
      hora: new Date().toLocaleTimeString('es-MX'),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      accion,
      modulo,
      tiempo: '0.0s',
      resultado,
      detalle,
    };
    storage.addAudit(registro);
    setRefreshKey(k => k + 1);
    return registro;
  }, []);

  const filtrarAuditoria = useCallback((filtros = {}) => {
    let registros = storage.getAudit();
    if (filtros.usuario) {
      registros = registros.filter(r =>
        r.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
      );
    }
    if (filtros.fecha) {
      registros = registros.filter(r => r.fecha === filtros.fecha);
    }
    if (filtros.accion) {
      registros = registros.filter(r =>
        r.accion.toLowerCase().includes(filtros.accion.toLowerCase())
      );
    }
    if (filtros.modulo) {
      registros = registros.filter(r => r.modulo === filtros.modulo);
    }
    if (filtros.resultado) {
      registros = registros.filter(r => r.resultado === filtros.resultado);
    }
    return registros;
  }, []);

  const value = useMemo(() => ({
    registrarAccion,
    filtrarAuditoria,
    refreshKey,
  }), [registrarAccion, filtrarAuditoria, refreshKey]);

  return (
    <AuditorContext.Provider value={value}>
      {children}
    </AuditorContext.Provider>
  );
}

export const useAuditor = () => {
  const context = useContext(AuditorContext);
  if (!context) throw new Error('useAuditor debe usarse dentro de AuditorProvider');
  return context;
};
