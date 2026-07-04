import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { LogisticsContext } from '../context/LogisticsContext';
import { conexionApi, pedidosApi } from '../services/apiService';
import { calcularResumen } from '../services/couponService';
import { storage } from '../services/storageService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorScreen from '../components/ErrorScreen';
import Ticket from '../components/Ticket';

// Validación asíncrona de inventario — verifica stock suficiente para cada item del carrito
const validarInventario = async (items) => {
  const results = items.map(item => ({ item, valido: storage.stockSuficiente(item.id, item.quantity) }));
  const fallo = results.find(r => !r.valido);
  if (fallo) throw new Error(`No hay suficiente stock de "${fallo.item.title}".`);
};

// Reduce el inventario después de confirmar la compra
const decrementarInventario = (items) => {
  items.forEach(item => storage.decrementarStock(item.id, item.quantity, item.title));
};

export default function Checkout() {
  const { items, vaciarCarrito, cuponActivo, pasoActual, setPasoActual, codigoGrupo, direccion, setDireccion, metodoPago, setMetodoPago, metodoEnvio, setMetodoEnvio } = useCart();
  const { usuario } = useAuth();
  const { iniciarLogistica } = useContext(LogisticsContext);
  const { agregarNotificacion } = useNotifications();

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [pedidoFinal, setPedidoFinal] = useState(null);

  // Orquestación del flujo de compra: validación, pago, pedido, inventario y registro
  const procesarCompra = async () => {
    setProcesando(true);
    setError(null);
    const inicioOperacion = Date.now();
    try {
      setPasoActual('Validando conexión e inventario...');
      await Promise.all([conexionApi.validar(), validarInventario(items)]);

      setPasoActual('Calculando total...');
      const resumen = calcularResumen(items, cuponActivo);

      setPasoActual('Procesando pago...');
      const gateways = [
        new Promise((_, reject) => setTimeout(() => reject(new Error('Stripe: transacción rechazada')), 300)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('PayPal: saldo insuficiente')), 500)),
        new Promise(resolve => setTimeout(() => resolve({ proveedor: 'MercadoPago', transaccion: 'MP-' + Date.now(), comision: 0.02 }), 700)),
      ];
      const pago = await Promise.any(gateways);
      agregarNotificacion('Pago', `Pago procesado con ${pago.proveedor} (comisión ${(pago.comision * 100).toFixed(0)}%)`, 'exito');

      setPasoActual('Enviando pedido...');
      const respuestaApi = await pedidosApi.enviar(usuario.id, items.map(i => ({ id: i.id, quantity: i.quantity })));

      // ID local único para persistir pedidos correctamente en localStorage.
      // Importante: no dependemos del id devuelto por la API simulada (puede repetirse).
      const pedidoIdLocal = `OC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      setPasoActual('Actualizando inventario...');
      decrementarInventario(items);

      setPasoActual('Guardando compra...');
      const pedidoCompleto = guardarCompra(
        respuestaApi,
        pedidoIdLocal,
        items,
        resumen,
        usuario,
        cuponActivo,
        codigoGrupo,
        pago
      );

      iniciarLogistica(pedidoCompleto.id);
      vaciarCarrito();
      setPedidoFinal(pedidoCompleto);


      // Operaciones post-compra asíncronas que no deben bloquear el flujo principal
      // Promise.allSettled permite que algunas fallen sin rechazar toda la compra
      setPasoActual('Sincronizando servicios...');
      const tareasPostCompra = [
        storage.addAudit({
          usuario: `${usuario.firstName} ${usuario.lastName}`,
          fecha: new Date().toLocaleDateString('es-MX'),
          hora: new Date().toLocaleTimeString('es-MX'),
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          accion: 'Compra realizada',
          modulo: 'Checkout',
          tiempo: `${((Date.now() - inicioOperacion) / 1000).toFixed(1)}s`,
          resultado: 'éxito',
          detalle: `Pedido #${pedidoCompleto.id} - $${resumen.total.toFixed(2)}`,
        }),
        Promise.resolve(agregarNotificacion('Compra', `Pedido #${pedidoCompleto.id} registrado en sistema`, 'exito')),
      ];
      const resultadosPostCompra = await Promise.allSettled(tareasPostCompra);
      resultadosPostCompra.forEach((r, i) => {
        if (r.status === 'rejected') console.warn(`Tarea post-compra ${i} falló:`, r.reason);
      });

      setPasoActual('completado');
      agregarNotificacion('Compra', `Pedido #${pedidoCompleto.id} realizado con éxito — Entrega estimada: 24 a 72 hrs`, 'exito');
    } catch (err) {
      setError(err.message);
      agregarNotificacion('Pago rechazado', err.message, 'error');
    } finally {
      setProcesando(false);
    }
  };

  if (!usuario) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔒</div>
      <h2>Debes iniciar sesión</h2>
      <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
    </div>
  );

  if (pedidoFinal) return <Ticket pedido={pedidoFinal} resumen={pedidoFinal.resumen} />;

  if (items.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">🛒</div>
      <h2>Tu carrito está vacío</h2>
      <Link to="/catalogo" className="btn btn-primary">Ver Menú</Link>
    </div>
  );

  if (procesando) return <LoadingSpinner mensaje={pasoActual} />;
  if (error) return <ErrorScreen mensaje={error} onReintentar={procesarCompra} />;

  return (
    <div className="page-section" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1>Confirmar Compra</h1>
      <p className="text-muted">Comprando como <strong>{usuario.firstName} {usuario.lastName}</strong></p>

      {cuponActivo && (
        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          🏷️ Cupón: {cuponActivo.codigo} ({cuponActivo.tipo === 'porcentaje' ? `${cuponActivo.valor}%` : `$${cuponActivo.valor}`})
        </p>
      )}
      {codigoGrupo && (
        <p style={{ color: '#6f42c1', fontWeight: 600, fontSize: '0.9rem' }}>
          👥 Compra colaborativa: {codigoGrupo}
        </p>
      )}

      <div className="page-section" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Dirección de envío</h3>
        <textarea
          className="input" rows="2"
          placeholder="Calle, número, colonia, ciudad, código postal"
          value={direccion} onChange={e => setDireccion(e.target.value)}
        />
      </div>

      <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Método de pago</label>
          <select className="input select" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="tarjeta">💳 Tarjeta crédito/débito</option>
            <option value="efectivo">💵 Efectivo contra entrega</option>
            <option value="transferencia">🏦 Transferencia bancaria</option>
            <option value="paypal">🅿️ PayPal</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Método de envío</label>
          <select className="input select" value={metodoEnvio} onChange={e => setMetodoEnvio(e.target.value)}>
            <option value="estandar">🚚 Estándar (3-5 días)</option>
            <option value="express">⚡ Express (1-2 días)</option>
            <option value="same-day">🚀 Same Day (hoy)</option>
          </select>
        </div>
      </div>

      <div className="summary-line mt-2" style={{ fontSize: '1.1rem' }}>
        <span style={{ fontWeight: 600 }}>Total a pagar</span>
        <strong style={{ color: 'var(--primary)', fontSize: '1.35rem' }}>
          ${calcularResumen(items, cuponActivo).total.toFixed(2)}
        </strong>
      </div>

      <button className="btn btn-primary btn-block mt-3" onClick={procesarCompra}>
        Finalizar Compra
      </button>
    </div>
  );
}

// Construye y persiste el pedido completo con todos los datos de la transacción
const guardarCompra = (respuestaApi, pedidoIdLocal, items, resumen, usuario, cupon = null, codigoGrupo = null, pago = null) => {
  const pedidoCompleto = {
    id: pedidoIdLocal,

    fecha: new Date().toISOString(),
    userId: usuario.id,
    userName: `${usuario.firstName} ${usuario.lastName}`,
    products: items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, category: i.category })),
    resumen,
    cupon: cupon ? { codigo: cupon.codigo, descuento: cupon.valor } : null,
    codigoGrupo,
    pago: pago ? { proveedor: pago.proveedor, transaccion: pago.transaccion, comision: pago.comision } : null,
  };
  storage.addCompra(pedidoCompleto);
  return pedidoCompleto;
};
