import { useState, useMemo, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useProducts } from '../context/ProductsContext';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import { useAuditor } from '../context/AuditorContext';
import { storage } from '../services/storageService';
import { obtenerStock, generarStockSimulado } from '../utils/stock';

const PRODUCTOS_CUSTOM_KEY = 'chickencitos_productos_custom';
const CUPONES_STORAGE_KEY = 'chickencitos_cupones';

const leerProductosCustom = () => {
  try { return JSON.parse(localStorage.getItem(PRODUCTOS_CUSTOM_KEY) || '[]'); }
  catch { return []; }
};

const guardarProductosCustom = (lista) => localStorage.setItem(PRODUCTOS_CUSTOM_KEY, JSON.stringify(lista));

let customIdCounter = 1000;

export default function AdminDashboard() {
  const { exportarCSV, exportarJSON } = useAdmin();
  const { productos, reintentar } = useProducts();
  const { agregarNotificacion } = useNotifications();
  const { perfil } = useAuth();
  const { registrarAccion, filtrarAuditoria } = useAuditor();
  const esAdminCompleto = perfil === 'administrador';

  const TABS = esAdminCompleto
    ? ['dashboard', 'reportes', 'inventario', 'pedidos', 'productos', 'cupones', 'banner', 'auditoria']
    : ['dashboard', 'inventario', 'pedidos'];
  const [tab, setTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [showCuponForm, setShowCuponForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', category: '', image: '', description: '' });
  const [cuponForm, setCuponForm] = useState({ codigo: '', tipo: 'porcentaje', valor: '', montoMinimo: '', expiracion: '2027-12-31', usosMaximos: '' });
  const [filtroAuditoria, setFiltroAuditoria] = useState({ usuario: '', fecha: '', accion: '', modulo: '', resultado: '' });
  const [bannerForm, setBannerForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chickencitos_banner') || '{}'); }
    catch { return {}; }
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [compras, setCompras] = useState(() => JSON.parse(localStorage.getItem('chickencitos_compras') || '[]'));

  const forzarActualizacion = useCallback(() => {
    setRefreshKey(k => k + 1);
    setCompras(JSON.parse(localStorage.getItem('chickencitos_compras') || '[]'));
  }, []);

  const stats = useMemo(() => {
    const ventasPorCategoria = {};
    const productosVendidos = {};
    let totalIngresos = 0;
    let descuentosAplicados = 0;

    compras.forEach(p => {
      p.products?.forEach(prod => {
        const cat = prod.category || 'Sin categoría';
        ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + prod.quantity;
        productosVendidos[prod.title] = (productosVendidos[prod.title] || 0) + prod.quantity;
      });
      if (p.resumen) {
        totalIngresos += p.resumen.total || 0;
        descuentosAplicados += p.resumen.descuento || 0;
      }
    });

    return {
      ventasPorCategoria: Object.entries(ventasPorCategoria).sort((a, b) => b[1] - a[1]),
      productosMasVendidos: Object.entries(productosVendidos).sort((a, b) => b[1] - a[1]).slice(0, 10),
      totalIngresos,
      descuentosAplicados,
      productosSinStock: productos.filter(p => obtenerStock(p.id) === 0),
      totalPedidos: compras.length,
    };
  }, [compras, productos]);

  const descargarReporte = (clave, formato) => {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]');
    if (formato === 'csv') exportarCSV(datos, clave);
    else exportarJSON(datos, clave);
    agregarNotificacion('Reporte', `Reporte descargado en ${formato.toUpperCase()}`, 'exito');
    registrarAccion('Reporte descargado', 'Admin', 'éxito', `${clave} en ${formato.toUpperCase()}`);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1>Panel Administrativo</h1>

      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-3 mb-3">
            <div className="stat-card"><div className="stat-label">Total Ingresos</div><div className="stat-value">${stats.totalIngresos.toFixed(2)}</div></div>
            <div className="stat-card"><div className="stat-label">Pedidos Totales</div><div className="stat-value">{stats.totalPedidos}</div></div>
            <div className="stat-card"><div className="stat-label">Descuentos</div><div className="stat-value">${stats.descuentosAplicados.toFixed(2)}</div></div>
            <div className="stat-card"><div className="stat-label">Productos sin Stock</div><div className="stat-value" style={{ color: stats.productosSinStock.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{stats.productosSinStock.length}</div></div>
            <div className="stat-card"><div className="stat-label">Categorías</div><div className="stat-value">{stats.ventasPorCategoria.length}</div></div>
            <div className="stat-card"><div className="stat-label">Pedidos Pendientes</div><div className="stat-value">{stats.totalPedidos}</div></div>
          </div>

          <div className="page-section">
            <h3>Productos más vendidos</h3>
            {stats.productosMasVendidos.length === 0 ? (
              <p className="text-muted text-sm">Sin ventas aún</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Producto</th><th className="text-right">Cantidad</th></tr></thead>
                  <tbody>
                    {stats.productosMasVendidos.map(([nombre, cant]) => (
                      <tr key={nombre}><td>{nombre}</td><td className="text-right font-bold">{cant}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="page-section">
            <h3>Ventas por Categoría</h3>
            {stats.ventasPorCategoria.length === 0 ? (
              <p className="text-muted text-sm">Sin datos</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Categoría</th><th className="text-right">Unidades</th></tr></thead>
                  <tbody>
                    {stats.ventasPorCategoria.map(([cat, cant]) => (
                      <tr key={cat}><td>{cat}</td><td className="text-right font-bold">{cant}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'auditoria' && (
        <div className="page-section">
          <h3>Registros de Auditoría</h3>
          <div className="grid grid-5 mb-3" style={{ gap: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            <input className="input" placeholder="Filtrar usuario" value={filtroAuditoria.usuario} onChange={e => setFiltroAuditoria(f => ({ ...f, usuario: e.target.value }))} />
            <input className="input" placeholder="Fecha (dd/mm/aaaa)" value={filtroAuditoria.fecha} onChange={e => setFiltroAuditoria(f => ({ ...f, fecha: e.target.value }))} />
            <input className="input" placeholder="Acción" value={filtroAuditoria.accion} onChange={e => setFiltroAuditoria(f => ({ ...f, accion: e.target.value }))} />
            <input className="input" placeholder="Módulo" value={filtroAuditoria.modulo} onChange={e => setFiltroAuditoria(f => ({ ...f, modulo: e.target.value }))} />
            <select className="input select" value={filtroAuditoria.resultado} onChange={e => setFiltroAuditoria(f => ({ ...f, resultado: e.target.value }))}>
              <option value="">Todos</option>
              <option value="éxito">Éxito</option>
              <option value="error">Error</option>
              <option value="advertencia">Advertencia</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Hora</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Resultado</th><th>Detalle</th></tr></thead>
              <tbody>
                {(() => {
                  const filtros = {};
                  if (filtroAuditoria.usuario) filtros.usuario = filtroAuditoria.usuario;
                  if (filtroAuditoria.fecha) filtros.fecha = filtroAuditoria.fecha;
                  if (filtroAuditoria.accion) filtros.accion = filtroAuditoria.accion;
                  if (filtroAuditoria.modulo) filtros.modulo = filtroAuditoria.modulo;
                  if (filtroAuditoria.resultado) filtros.resultado = filtroAuditoria.resultado;
                  const registros = filtrarAuditoria(filtros);
                  return registros.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>Sin registros de auditoría</td></tr>
                  ) : registros.slice().reverse().map((r, idx) => (
                    <tr key={r.id ?? idx}>
                      <td className="text-sm">{String(r.fecha ?? '')}</td>
                      <td className="text-sm">{String(r.hora ?? '')}</td>
                      <td>{String(r.usuario ?? '')}</td>
                      <td>{String(r.accion ?? '')}</td>
                      <td><span className="badge badge-info">{String(r.modulo ?? '')}</span></td>
                      <td><span className={`badge ${String(r.resultado) === 'éxito' ? 'badge-success' : String(r.resultado) === 'error' ? 'badge-danger' : 'badge-warning'}`}>{String(r.resultado ?? '')}</span></td>
                      <td className="text-sm" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(r.detalle ?? '')}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reportes' && (
        <>
          <div className="page-section">
            <h3>Reporte de Ventas</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={() => descargarReporte('chickencitos_compras', 'json')}>📄 JSON</button>
              <button className="btn btn-secondary" onClick={() => descargarReporte('chickencitos_compras', 'csv')}>📊 CSV</button>
            </div>
          </div>
          <div className="page-section">
            <h3>Logs de Auditoría</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={() => descargarReporte('chickencitos_audit', 'json')}>📄 JSON</button>
              <button className="btn btn-secondary" onClick={() => descargarReporte('chickencitos_audit', 'csv')}>📊 CSV</button>
            </div>
          </div>
        </>
      )}

      {tab === 'inventario' && (
        <div className="page-section">
          <h3>Inventario Actual</h3>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Producto</th><th className="text-right">Stock</th><th className="text-center">Acción</th></tr></thead>
              <tbody>
                {productos.slice(0, 20).map(p => {
                  const stock = obtenerStock(p.id);
                  return (
                    <tr key={p.id}>
                      <td>{p.title.slice(0, 45)}</td>
                      <td className="text-right">
                        <span className={`badge ${stock < 5 ? 'badge-danger' : stock < 10 ? 'badge-warning' : 'badge-success'}`}>{stock}</span>
                      </td>
                      <td className="text-center">
                          <button className="btn btn-secondary btn-sm" onClick={() => {
                          const inv = JSON.parse(localStorage.getItem('chickencitos_inventario') || '{}');
                          inv[`stock_${p.id}`] = stock + 10;
                          localStorage.setItem('chickencitos_inventario', JSON.stringify(inv));
                          agregarNotificacion('Inventario', `Stock de "${p.title.slice(0, 30)}" +10`, 'exito');
                          registrarAccion('Stock actualizado', 'Admin', 'éxito', `"${p.title}" +10 unidades`);
                          forzarActualizacion();
                        }}>
                          +10
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="page-section">
          <h3>Todos los Pedidos ({compras.length})</h3>
          {compras.length === 0 ? (
            <p className="text-muted text-sm">Sin pedidos aún</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th className="text-right">Total</th><th>Estado</th><th className="text-center">Acción</th></tr></thead>
                <tbody>
                  {compras.slice().reverse().map(p => {
                    const enviosStatuses = storage.getEnvioStatuses();
                    const statusActual = enviosStatuses[p.id] || 'Pendiente';
                    const etapas = ['Pendiente', 'Confirmado', 'Empacado', 'Enviado', 'Confirmar envío', 'En ruta', 'Entregado'];
                    return (
                      <tr key={p.id}>
                        <td className="font-bold">#{p.id}</td>
                        <td className="text-sm">{new Date(p.fecha).toLocaleDateString('es-MX')}</td>
                        <td>{p.userName || `#${p.userId}`}</td>
                        <td className="text-right font-bold">${p.resumen?.total?.toFixed(2) ?? '0.00'}</td>
                        <td>
                          <select className="input select" style={{ fontSize: '0.8rem', padding: '0.25rem', width: 'auto' }}
                            value={statusActual}
                            onChange={(e) => {
                              storage.setEnvioStatus(p.id, e.target.value);
                              agregarNotificacion('Envío', `Pedido #${p.id}: estado actualizado a "${e.target.value}"`, 'exito');
                              registrarAccion('Estado de envío actualizado', 'Admin', 'éxito', `Pedido #${p.id}: ${statusActual} → ${e.target.value}`);
                              forzarActualizacion();
                            }}>
                            {etapas.map(et => (
                              <option key={et} value={et}>{et}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-danger btn-sm" onClick={() => {
                            const nuevas = compras.filter(c => c.id !== p.id);
                            localStorage.setItem('chickencitos_compras', JSON.stringify(nuevas));
                            const cancelados = JSON.parse(localStorage.getItem('chickencitos_pedidos_cancelados') || '[]');
                            cancelados.push({ id: p.id, fecha: new Date().toISOString(), userId: p.userId });
                            localStorage.setItem('chickencitos_pedidos_cancelados', JSON.stringify(cancelados));
                            agregarNotificacion('Pedido', `Pedido #${p.id} cancelado`, 'advertencia');
                            registrarAccion('Pedido cancelado', 'Admin', 'éxito', `Pedido #${p.id} - ${p.userName || `Usuario #${p.userId}`}`);
                            forzarActualizacion();
                          }}>
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'productos' && (
        <div className="page-section">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ margin: 0 }}>Gestión de Productos</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ title: '', price: '', category: '', image: '', description: '' }); }}>
              {showForm ? '✕ Cerrar' : '➕ Nuevo Producto'}
            </button>
          </div>

          {showForm && (
            <div style={{ background: 'var(--border-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h4>
              <div className="flex flex-col gap-2">
                <input className="input" placeholder="Nombre" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <input className="input" placeholder="Precio" type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                <input className="input" placeholder="Categoría" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                <input className="input" placeholder="URL de imagen" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />
                <textarea className="input" rows="2" placeholder="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    <div className="flex gap-2">
                      <button className="btn btn-primary" onClick={() => {
                        const custom = leerProductosCustom();
                        if (editando) {
                          const idx = custom.findIndex(p => p.id === editando.id);
                          if (idx >= 0) custom[idx] = { ...editando, ...form, price: parseFloat(form.price) };
                          guardarProductosCustom(custom);
                          agregarNotificacion('Producto', `"${form.title}" actualizado`, 'exito');
                          registrarAccion('Producto actualizado', 'Admin', 'éxito', `"${form.title}" (ID: ${editando.id})`);
                        } else {
                          const nuevo = { id: ++customIdCounter, ...form, price: parseFloat(form.price), rating: { rate: 0, count: 0 } };
                          custom.push(nuevo);
                          const inv = JSON.parse(localStorage.getItem('chickencitos_inventario') || '{}');
                          inv[`stock_${nuevo.id}`] = 20;
                          localStorage.setItem('chickencitos_inventario', JSON.stringify(inv));
                          guardarProductosCustom(custom);
                          agregarNotificacion('Producto', `"${form.title}" creado`, 'exito');
                          registrarAccion('Producto creado', 'Admin', 'éxito', `"${form.title}" (ID: ${nuevo.id})`);
                        }
                    setShowForm(false);
                    setEditando(null);
                    setForm({ title: '', price: '', category: '', image: '', description: '' });
                    reintentar();
                  }}>
                    {editando ? 'Guardar cambios' : 'Crear Producto'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditando(null); }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th className="text-center">Stock</th><th className="text-center">Acciones</th></tr></thead>
              <tbody>
                {leerProductosCustom().length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No hay productos personalizados. Usa productos existentes del catálogo o crea nuevos.</td></tr>
                ) : leerProductosCustom().map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.title}</td>
                    <td>${parseFloat(p.price).toFixed(2)}</td>
                    <td><span className="badge badge-secondary">{p.category}</span></td>
                    <td className="text-center"><span className={`badge ${obtenerStock(p.id) < 5 ? 'badge-danger' : 'badge-success'}`}>{obtenerStock(p.id)}</span></td>
                    <td className="text-center">
                      <div className="flex gap-1 justify-center">
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          setEditando(p);
                          setForm({ title: p.title, price: String(p.price), category: p.category, image: p.image || '', description: p.description || '' });
                          setShowForm(true);
                        }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          const restantes = leerProductosCustom().filter(x => x.id !== p.id);
                          guardarProductosCustom(restantes);
                          agregarNotificacion('Producto', `"${p.title}" eliminado`, 'advertencia');
                          registrarAccion('Producto eliminado', 'Admin', 'éxito', `"${p.title}" (ID: ${p.id})`);
                          reintentar();
                        }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'banner' && (
        <div className="page-section">
          <h3>Personalizar Banner Principal</h3>
          <div className="flex flex-col gap-2" style={{ maxWidth: 500 }}>
            <input className="input" placeholder="Título del banner"
              value={bannerForm.titulo}
              onChange={e => setBannerForm(f => ({ ...f, titulo: e.target.value }))}
            />
            <input className="input" placeholder="Subtítulo"
              value={bannerForm.subtitulo}
              onChange={e => setBannerForm(f => ({ ...f, subtitulo: e.target.value }))}
            />
            <input className="input" placeholder="URL de imagen de fondo (opcional)"
              value={bannerForm.imagen}
              onChange={e => setBannerForm(f => ({ ...f, imagen: e.target.value }))}
            />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => {
                localStorage.setItem('chickencitos_banner', JSON.stringify(bannerForm));
                agregarNotificacion('Banner', 'Banner actualizado correctamente', 'exito');
                registrarAccion('Banner actualizado', 'Admin', 'éxito', `Título: ${bannerForm.titulo}`);
              }}>
                Guardar Banner
              </button>
              <button className="btn btn-secondary" onClick={() => {
                localStorage.removeItem('chickencitos_banner');
                setBannerForm({ titulo: 'El sabor que mereces, donde estés', subtitulo: 'Pide desde la comodidad de tu hogar. Envío gratis en compras mayores a $150 MXN.', imagen: '' });
                agregarNotificacion('Banner', 'Banner restablecido a valores por defecto', 'info');
              }}>
                Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'cupones' && (
        <div className="page-section">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ margin: 0 }}>Gestión de Cupones</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCuponForm(!showCuponForm)}>
              {showCuponForm ? '✕ Cerrar' : '➕ Nuevo Cupón'}
            </button>
          </div>

          {showCuponForm && (
            <div style={{ background: 'var(--border-light)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Nuevo Cupón</h4>
              <div className="flex flex-col gap-2">
                <input className="input" placeholder="Código (ej. PROMO30)" value={cuponForm.codigo} onChange={e => setCuponForm(p => ({ ...p, codigo: e.target.value }))} />
                <div className="flex gap-2">
                  <select className="input select" value={cuponForm.tipo} onChange={e => setCuponForm(p => ({ ...p, tipo: e.target.value }))} style={{ flex: 1 }}>
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto fijo ($)</option>
                  </select>
                  <input className="input" placeholder="Valor" type="number" step="0.01" value={cuponForm.valor} onChange={e => setCuponForm(p => ({ ...p, valor: e.target.value }))} style={{ flex: 1 }} />
                </div>
                <div className="flex gap-2">
                  <input className="input" placeholder="Monto mínimo" type="number" step="0.01" value={cuponForm.montoMinimo} onChange={e => setCuponForm(p => ({ ...p, montoMinimo: e.target.value }))} style={{ flex: 1 }} />
                  <input className="input" placeholder="Usos máximos" type="number" value={cuponForm.usosMaximos} onChange={e => setCuponForm(p => ({ ...p, usosMaximos: e.target.value }))} style={{ flex: 1 }} />
                </div>
                <input className="input" placeholder="Fecha expiración" type="date" value={cuponForm.expiracion} onChange={e => setCuponForm(p => ({ ...p, expiracion: e.target.value }))} />
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={() => {
                    if (!cuponForm.codigo.trim()) { agregarNotificacion('Error', 'El código es obligatorio', 'error'); return; }
                    const cupones = JSON.parse(localStorage.getItem(CUPONES_STORAGE_KEY + '_lista') || '[]');
                    cupones.push({
                      codigo: cuponForm.codigo.toUpperCase(),
                      tipo: cuponForm.tipo,
                      valor: parseFloat(cuponForm.valor),
                      montoMinimo: parseFloat(cuponForm.montoMinimo) || 0,
                      expiracion: cuponForm.expiracion,
                      usosMaximos: parseInt(cuponForm.usosMaximos) || 1,
                      categoriasPermitidas: [],
                    });
                    localStorage.setItem('chickencitos_cupones_lista', JSON.stringify(cupones));
                    agregarNotificacion('Cupón', `Cupón ${cuponForm.codigo.toUpperCase()} creado`, 'exito');
                    registrarAccion('Cupón creado', 'Admin', 'éxito', `${cuponForm.codigo.toUpperCase()}`);
                    setShowCuponForm(false);
                    setCuponForm({ codigo: '', tipo: 'porcentaje', valor: '', montoMinimo: '', expiracion: '2027-12-31', usosMaximos: '' });
                  }}>
                    Crear Cupón
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowCuponForm(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Monto Mín.</th><th>Expira</th><th>Usos Máx.</th><th className="text-center">Acción</th></tr></thead>
              <tbody>
                {(() => {
                  const cuponesGuardados = JSON.parse(localStorage.getItem('chickencitos_cupones_lista') || '[]');
                  return cuponesGuardados.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>No hay cupones creados aún.</td></tr>
                  ) : cuponesGuardados.map((c, i) => (
                    <tr key={i}>
                      <td className="font-bold">{c.codigo}</td>
                      <td><span className="badge badge-info">{c.tipo}</span></td>
                      <td>{c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor}`}</td>
                      <td>${(c.montoMinimo || 0).toFixed(2)}</td>
                      <td className="text-sm">{c.expiracion}</td>
                      <td className="text-center">{c.usosMaximos}</td>
                      <td className="text-center">
                        <button className="btn btn-danger btn-sm" onClick={() => {
                          const restantes = cuponesGuardados.filter((_, j) => j !== i);
                    localStorage.setItem('chickencitos_cupones_lista', JSON.stringify(restantes));
                    agregarNotificacion('Cupón', `Cupón ${c.codigo} eliminado`, 'advertencia');
                    registrarAccion('Cupón eliminado', 'Admin', 'éxito', `${c.codigo}`);
                    setShowCuponForm(false);
                    forzarActualizacion();
                        }}>🗑️</button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
