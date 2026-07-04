import { useState, useMemo, useContext } from 'react';
import { useProducts } from '../context/ProductsContext';
import { LogisticsContext } from '../context/LogisticsContext';
import { obtenerStock } from '../utils/stock';

const DIAS_KEY = 'chickencitos_pedidos_cancelados';

export default function DashboardEjecutivo() {
  const { productos } = useProducts();
  const { estadoPedido, repartidorAsignado, fechaEntrega } = useContext(LogisticsContext);
  const [refresco, setRefresco] = useState(0);

  const stats = useMemo(() => {
    const compras = JSON.parse(localStorage.getItem('chickencitos_compras') || '[]');
    const audit = JSON.parse(localStorage.getItem('chickencitos_audit') || '[]');
    const cupones = JSON.parse(localStorage.getItem('chickencitos_cupones') || '{}');
    const cancelados = JSON.parse(localStorage.getItem(DIAS_KEY) || '[]');

    const ventasDelDia = compras.filter(c => c.fecha?.slice(0, 10) === new Date().toISOString().slice(0, 10));
    const ingresosDelDia = ventasDelDia.reduce((sum, c) => sum + (c.resumen?.total || 0), 0);
    const totalIngresos = compras.reduce((sum, c) => sum + (c.resumen?.total || 0), 0);

    const usuariosRecientes = audit.filter(a => Date.now() - new Date(a.timestamp).getTime() < 300000).length;

    const productosMasVendidos = {};
    compras.forEach(c => c.products?.forEach(p => { productosMasVendidos[p.title] = (productosMasVendidos[p.title] || 0) + p.quantity; }));
    const topProducto = Object.entries(productosMasVendidos).sort((a, b) => b[1] - a[1])[0];

    const tiempos = audit.filter(a => a.tiempoEjecucion).map(a => a.tiempoEjecucion);
    const tiempoPromMs = tiempos.length > 0 ? tiempos.reduce((s, t) => s + t, 0) / tiempos.length : 0;
    const tiempoPromedio = tiempoPromMs > 0 ? `${(tiempoPromMs / 1000).toFixed(1)}s` : '—';

    const entregados = compras.filter(c => {
      const hist = JSON.parse(localStorage.getItem('chickencitos_logistica_historial') || '[]');
      return hist.some(h => h.pedidoId === c.id && h.etapa === 'Entregado');
    }).length;

    const enTransito = compras.filter(c => {
      const hist = JSON.parse(localStorage.getItem('chickencitos_logistica_historial') || '[]');
      const ultimo = hist.filter(h => h.pedidoId === c.id).pop();
      return ultimo && ultimo.etapa !== 'Entregado';
    }).length;

    const repartidoresAsignados = new Set(
      JSON.parse(localStorage.getItem('chickencitos_repartidores_asignados') || '[]')
    ).size;

    const totalProcesados = compras.length + cancelados.length;
    const pctExito = totalProcesados > 0 ? ((compras.length / totalProcesados) * 100).toFixed(1) + '%' : '—';

    const entregaTexto = estadoPedido?.fechaEntrega
      ? `${estadoPedido.fechaEntrega.fecha} ~ ${estadoPedido.fechaEntrega.hora} (${estadoPedido.fechaEntrega.horas}h)`
      : '24 a 72 hrs';

    return {
      usuariosConectados: Math.max(usuariosRecientes, 1),
      pedidosActivos: compras.length,
      ventasDelDia: ventasDelDia.length,
      ingresosDelDia,
      totalIngresos,
      tiempoPromedio,
      productoTop: topProducto ? topProducto[0] : '—',
      productosBajoStock: productos.filter(p => obtenerStock(p.id) < 5).length,
      cuponesUtilizados: Object.values(cupones).reduce((a, b) => a + b, 0),
      pedidosCancelados: cancelados.length,
      pedidosEntregados: entregados,
      pedidosEnTransito: enTransito,
      repartidoresActivos: Math.max(repartidoresAsignados, 1),
      porcentajeExito: pctExito,
      entregaEstimada: entregaTexto,
    };
  }, [productos, refresco, estadoPedido, repartidorAsignado, fechaEntrega]);

  const tarjetas = [
    { label: 'Usuarios Conectados', value: stats.usuariosConectados, color: 'var(--info)' },
    { label: 'Pedidos Activos', value: stats.pedidosActivos, color: 'var(--primary)' },
    { label: 'Ventas del Día', value: stats.ventasDelDia, color: 'var(--success)' },
    { label: 'Ingresos del Día', value: `$${stats.ingresosDelDia.toFixed(2)}`, color: 'var(--success)' },
    { label: 'Ingresos Totales', value: `$${stats.totalIngresos.toFixed(2)}`, color: 'var(--primary)' },
    { label: 'Tiempo Promedio Procesamiento', value: stats.tiempoPromedio, color: 'var(--text)' },
    { label: 'Producto Más Vendido', value: stats.productoTop.length > 15 ? stats.productoTop.slice(0, 15) + '…' : stats.productoTop, color: 'var(--text)' },
    { label: 'Productos Stock Bajo', value: stats.productosBajoStock, color: stats.productosBajoStock > 0 ? 'var(--danger)' : 'var(--success)' },
    { label: 'Cupones Utilizados', value: stats.cuponesUtilizados, color: 'var(--warning)' },
    { label: 'Pedidos Cancelados', value: stats.pedidosCancelados, color: 'var(--danger)' },
    { label: 'Pedidos Entregados', value: stats.pedidosEntregados, color: 'var(--success)' },
    { label: 'Pedidos en Tránsito', value: stats.pedidosEnTransito, color: 'var(--info)' },
    { label: 'Repartidores Activos', value: stats.repartidoresActivos, color: 'var(--info)' },
    { label: '% Éxito de Compras', value: stats.porcentajeExito, color: stats.porcentajeExito !== '—' && parseFloat(stats.porcentajeExito) > 80 ? 'var(--success)' : 'var(--danger)' },
    { label: 'Entrega Estimada', value: stats.entregaEstimada.length > 20 ? stats.entregaEstimada.slice(0, 20) + '…' : stats.entregaEstimada, color: 'var(--primary)' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 style={{ margin: 0 }}>Dashboard Ejecutivo</h1>
        <button className="btn btn-primary" onClick={() => setRefresco(p => p + 1)}>
          🔄 Refrescar
        </button>
      </div>

      <div className="grid grid-4">
        {tarjetas.map(t => (
          <div key={t.label} className="stat-card">
            <div className="stat-label">{t.label}</div>
            <div className="stat-value" style={{ color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted text-center mt-3">
        Datos actualizados al {new Date().toLocaleString('es-MX')}
      </p>
    </div>
  );
}
