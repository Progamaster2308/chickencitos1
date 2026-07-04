import { createContext, useState, useCallback, useMemo } from 'react';
import { storage } from '../services/storageService';

export const LogisticsContext = createContext(null);

const CENTROS_DISTRIBUCION = [
  { nombre: 'Mexicali', zona: 'Norte' },
  { nombre: 'San Luis Río Colorado', zona: 'Noroeste' },
  { nombre: 'Nogales', zona: 'Norte' },
  { nombre: 'Hermosillo', zona: 'Noroeste' },
  { nombre: 'Chihuahua', zona: 'Norte' },
];

const REPARTIDORES = [
  { nombre: 'Carlos López', velocidad: 1.0, zona: 'Norte', retraso: 0.1 },
  { nombre: 'María García', velocidad: 1.2, zona: 'Noroeste', retraso: 0.05 },
  { nombre: 'Juan Pérez', velocidad: 0.8, zona: 'Norte', retraso: 0.2 },
  { nombre: 'Ana Martínez', velocidad: 1.5, zona: 'Noroeste', retraso: 0.0 },
  { nombre: 'Pedro Ramírez', velocidad: 1.1, zona: 'Norte', retraso: 0.15 },
];

const esperarTiempoAleatorio = (base = 4000) => {
  const variacion = Math.random() * 3000;
  return new Promise(resolve => setTimeout(resolve, base + variacion));
};

const seleccionarAleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Calcula fecha estimada de entrega: 24 a 72 horas a partir de ahora
const calcularFechaEntrega = () => {
  const horas = 24 + Math.floor(Math.random() * 49);
  const fecha = new Date(Date.now() + horas * 60 * 60 * 1000);
  return {
    fecha: fecha.toLocaleDateString('es-MX'),
    hora: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    horas,
  };
};

export function LogisticsProvider({ children }) {
  const [estadoPedido, setEstadoPedido] = useState(null);
  const [centroAsignado, setCentroAsignado] = useState(null);
  const [repartidorAsignado, setRepartidorAsignado] = useState(null);

  const fechaEntrega = useMemo(() => calcularFechaEntrega(), [estadoPedido]);

  const iniciarLogistica = useCallback(async (pedidoId) => {
    const centro = seleccionarAleatorio(CENTROS_DISTRIBUCION);
    setCentroAsignado(centro);
    const entrega = calcularFechaEntrega();
    setEstadoPedido({ pedidoId, etapa: 'Pendiente', centro: centro.nombre, fechaEntrega: entrega });

    storage.setEnvioStatus(pedidoId, 'Pendiente');

    const etapas = ['Confirmado', 'Empacado', 'Enviado', 'Confirmar envío', 'En ruta', 'Entregado'];
    let repartidorAsignadoLocal = null;

    for (const etapa of etapas) {
      await esperarTiempoAleatorio(5000);
      if (etapa === 'Enviado') {
        repartidorAsignadoLocal = seleccionarAleatorio(REPARTIDORES.filter(r => r.zona === centro.zona));
        if (!repartidorAsignadoLocal) {
          repartidorAsignadoLocal = seleccionarAleatorio(REPARTIDORES);
        }
        setRepartidorAsignado(repartidorAsignadoLocal);
        const repKey = 'chickencitos_repartidores_asignados';
        const reps = JSON.parse(localStorage.getItem(repKey) || '[]');
        reps.push(repartidorAsignadoLocal.nombre);
        localStorage.setItem(repKey, JSON.stringify([...new Set(reps)]));
      }
      storage.setEnvioStatus(pedidoId, etapa);
      const histKey = 'chickencitos_logistica_historial';
      const hist = JSON.parse(localStorage.getItem(histKey) || '[]');
      hist.push({ pedidoId, etapa, centro: centro.nombre, timestamp: new Date().toISOString(), fechaEntrega: entrega });
      localStorage.setItem(histKey, JSON.stringify(hist));
      setEstadoPedido({ pedidoId, etapa, centro: centro.nombre, fechaEntrega: entrega });
    }
  }, []);

  const value = useMemo(() => ({
    estadoPedido, centroAsignado, repartidorAsignado, iniciarLogistica, fechaEntrega,
  }), [estadoPedido, centroAsignado, repartidorAsignado, iniciarLogistica, fechaEntrega]);

  return (
    <LogisticsContext.Provider value={value}>
      {children}
    </LogisticsContext.Provider>
  );
}
