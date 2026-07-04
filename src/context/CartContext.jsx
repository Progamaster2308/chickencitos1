import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './NotificationsContext';
import { calcularResumen, validarCupon } from '../services/couponService';
import { storage } from '../services/storageService';
import { useAuditor } from './AuditorContext';

// Contexto del carrito — gestiona productos, cupones, métodos de pago y compra colaborativa
const CartContext = createContext(null);
const CART_STORAGE_KEY = 'chickencitos_carrito';

// Simula latencia de red en operaciones del carrito
const esperarSimulacion = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export function CartProvider({ children }) {
  // Todos los estados se inicializan desde localStorage para recuperación de sesión (F13)
  const [items, setItems] = useState(() => storage.getCart());
  const [pasoActual, setPasoActual] = useState(() => storage.getCheckoutPaso());
  const [cuponActivo, setCuponActivo] = useState(() => storage.getCuponActivo());
  const [errorCupon, setErrorCupon] = useState(null);
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const [codigoGrupo, setCodigoGrupo] = useState(null);
  const [direccion, setDireccion] = useState(() => storage.getDireccion());
  const [metodoPago, setMetodoPago] = useState(() => storage.getMetodoPago());
  const [metodoEnvio, setMetodoEnvio] = useState(() => storage.getMetodoEnvio());

  const gruposAbortControllers = useRef({});

  const { agregarNotificacion } = useNotifications();
  const { registrarAccion } = useAuditor();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        setItems(event.newValue ? JSON.parse(event.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => { storage.setCart(items); }, [items]);
  useEffect(() => { storage.setCheckoutPaso(pasoActual); }, [pasoActual]);
  useEffect(() => { storage.setCuponActivo(cuponActivo); }, [cuponActivo]);
  useEffect(() => { storage.setDireccion(direccion); }, [direccion]);
  useEffect(() => { storage.setMetodoPago(metodoPago); }, [metodoPago]);
  useEffect(() => { storage.setMetodoEnvio(metodoEnvio); }, [metodoEnvio]);

  const agregarProducto = async (producto, cantidad = 1) => {
    await esperarSimulacion();
    setItems((prevItems) => {
      const existente = prevItems.find((item) => item.id === producto.id);
      if (existente) {
        return prevItems.map((item) =>
          item.id === producto.id ? { ...item, quantity: item.quantity + cantidad } : item
        );
      }
      return [...prevItems, { ...producto, quantity: cantidad }];
    });
    agregarNotificacion('Carrito', `${producto.title} agregado al carrito`, 'info');
    registrarAccion('Producto agregado', 'Carrito', 'éxito', `${producto.title} x${cantidad}`);
  };

  const eliminarProducto = async (productoId) => {
    await esperarSimulacion();
    setItems((prevItems) => prevItems.filter((item) => item.id !== productoId));
    registrarAccion('Producto eliminado', 'Carrito', 'éxito', `ID: ${productoId}`);
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    await esperarSimulacion();
    if (nuevaCantidad <= 0) return eliminarProducto(productoId);
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === productoId ? { ...item, quantity: nuevaCantidad } : item))
    );
  };

  const vaciarCarrito = async () => {
    await esperarSimulacion();
    setItems([]);
    setPasoActual('inicio');
    setCuponActivo(null);
    setErrorCupon(null);
    setCodigoGrupo(null);
    registrarAccion('Carrito vaciado', 'Carrito', 'éxito', '');
  };

  const aplicarCupon = useCallback(async (codigo) => {
    setAplicandoCupon(true);
    setErrorCupon(null);
    try {
      const cupon = await validarCupon(codigo, items);
      setCuponActivo(cupon);
      agregarNotificacion('Cupón', `Cupón ${codigo} aplicado: ${cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `$${cupon.valor}`} de descuento`, 'exito');
      registrarAccion('Cupón aplicado', 'Carrito', 'éxito', `${codigo} - ${cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `$${cupon.valor}`}`);
      return cupon;
    } catch (err) {
      setErrorCupon(err.message);
      setCuponActivo(null);
      registrarAccion('Cupón aplicado', 'Carrito', 'error', `${codigo} - ${err.message}`);
      throw err;
    } finally {
      setAplicandoCupon(false);
    }
  }, [agregarNotificacion]);

  const limpiarCupon = useCallback(() => {
    setCuponActivo(null);
    setErrorCupon(null);
  }, []);

  const crearGrupoCompra = useCallback(() => {
    const codigo = `GRUPO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const controller = new AbortController();
    gruposAbortControllers.current[codigo] = controller;
    setCodigoGrupo(codigo);
    const grupos = storage.getGrupos();
    grupos[codigo] = {
      creado: Date.now(),
      items: [...items],
      participantes: [{ nombre: 'Anfitrión', confirmado: true, items: [...items] }],
      confirmados: false,
      expiracion: Date.now() + 300000,
    };
    storage.setGrupos(grupos);
    agregarNotificacion('Compra Colaborativa', `Grupo creado. Código: ${codigo}. Expira en 5 min.`, 'exito');
    registrarAccion('Grupo de compra creado', 'Compra Colaborativa', 'éxito', `Código: ${codigo}`);
    iniciarTimeoutGrupo(codigo, 300000);
    return codigo;
  }, [items, agregarNotificacion, registrarAccion]);

  const iniciarTimeoutGrupo = (codigo, ms) => {
    const controller = gruposAbortControllers.current[codigo];
    if (!controller) return;
    const { signal } = controller;
    const timerId = setTimeout(() => {
      if (signal.aborted) return;
      const grupos = storage.getGrupos();
      const grupo = grupos[codigo];
      if (grupo && !grupo.confirmados) {
        delete grupos[codigo];
        storage.setGrupos(grupos);
        liberarInventarioReservado(grupo.items || []);
        agregarNotificacion('Compra Colaborativa', `Grupo ${codigo} cancelado por tiempo límite`, 'advertencia');
      }
      delete gruposAbortControllers.current[codigo];
    }, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timerId);
      delete gruposAbortControllers.current[codigo];
    });
  };

  const confirmarParticipacion = useCallback((codigo, nombre) => {
    const grupos = storage.getGrupos();
    const grupo = grupos[codigo];
    if (!grupo) throw new Error('Código de grupo inválido');
    if (grupo.confirmados) throw new Error('La compra ya fue procesada');
    const idx = grupo.participantes.findIndex(p => p.nombre === nombre);
    if (idx >= 0) {
      grupo.participantes[idx].confirmado = true;
    } else {
      grupo.participantes.push({ nombre, confirmado: true, items: [] });
    }
    const todosConfirmados = grupo.participantes.every(p => p.confirmado);
    grupo.confirmados = todosConfirmados;
    storage.setGrupos(grupos);
    agregarNotificacion('Compra Colaborativa', `${nombre} confirmó su participación${todosConfirmados ? ' — ¡Todos confirmaron!' : ''}`, todosConfirmados ? 'exito' : 'info');
    registrarAccion('Participación confirmada', 'Compra Colaborativa', 'éxito', `Grupo: ${codigo}, Usuario: ${nombre}`);
    return todosConfirmados;
  }, [agregarNotificacion, registrarAccion]);

  const abandonarGrupo = useCallback((codigo, nombre) => {
    const grupos = storage.getGrupos();
    const grupo = grupos[codigo];
    if (!grupo) return;
    grupo.participantes = grupo.participantes.filter(p => p.nombre !== nombre);
    if (grupo.participantes.length === 0) {
      delete grupos[codigo];
      liberarInventarioReservado(grupo.items || []);
      const controller = gruposAbortControllers.current[codigo];
      if (controller) controller.abort();
      window.dispatchEvent(new CustomEvent('grupoCancelado', { detail: { codigo, motivo: 'disuelto' } }));
      agregarNotificacion('Compra Colaborativa', `Grupo ${codigo} disuelto`, 'advertencia');
    } else {
      grupo.confirmados = false;
      agregarNotificacion('Compra Colaborativa', `${nombre} abandonó el grupo. Total recalculado.`, 'info');
    }
    storage.setGrupos(grupos);
    if (nombre === 'Anfitrión' || grupo.participantes.length === 0) {
      setCodigoGrupo(null);
    }
    registrarAccion('Grupo abandonado', 'Compra Colaborativa', 'info', `Grupo: ${codigo}, Usuario: ${nombre}`);
  }, [agregarNotificacion, registrarAccion]);

  const calcularAportaciones = useCallback((codigo) => {
    const grupos = storage.getGrupos();
    const grupo = grupos[codigo];
    if (!grupo || grupo.participantes.length === 0) return [];
    const resumenGrupo = calcularResumen(grupo.items, cuponActivo);
    const total = resumenGrupo.total;
    const aporteIndividual = total / grupo.participantes.length;
    return grupo.participantes.map(p => ({
      nombre: p.nombre,
      confirmado: p.confirmado,
      aportacion: aporteIndividual.toFixed(2),
    }));
  }, [cuponActivo]);

  const unirseAGrupo = useCallback((codigo) => {
    const grupos = storage.getGrupos();
    const grupo = grupos[codigo];
    if (!grupo) throw new Error('Código de grupo inválido');
    if (grupo.confirmados) throw new Error('La compra ya fue procesada');
    if (Date.now() > grupo.expiracion) {
      delete grupos[codigo];
      storage.setGrupos(grupos);
      throw new Error('El grupo ha expirado');
    }
    setCodigoGrupo(codigo);
    setItems(grupo.items || []);
    agregarNotificacion('Compra Colaborativa', `Te has unido al grupo ${codigo}`, 'exito');
  }, [agregarNotificacion]);

  const liberarInventarioReservado = (items) => {
    items.forEach(item => {
      const inv = JSON.parse(localStorage.getItem('chickencitos_inventario') || '{}');
      const key = `stock_${item.id}`;
      if (inv[key] !== undefined) {
        inv[key] = inv[key] + (item.quantity || 1);
      }
      localStorage.setItem('chickencitos_inventario', JSON.stringify(inv));
    });
    window.dispatchEvent(new Event('stockUpdated'));
  };

  const resumen = calcularResumen(items, cuponActivo);

  const value = {
    items, pasoActual, setPasoActual,
    cuponActivo, errorCupon, aplicandoCupon, aplicarCupon, limpiarCupon,
    codigoGrupo, crearGrupoCompra, unirseAGrupo, confirmarParticipacion, abandonarGrupo, calcularAportaciones,
    direccion, setDireccion: (d) => setDireccion(d),
    metodoPago, setMetodoPago: (m) => setMetodoPago(m),
    metodoEnvio, setMetodoEnvio: (e) => setMetodoEnvio(e),
    subtotal: resumen.subtotal.toFixed(2),
    iva: resumen.iva.toFixed(2),
    descuento: resumen.descuento.toFixed(2),
    total: resumen.total.toFixed(2),
    agregarProducto, eliminarProducto, actualizarCantidad, vaciarCarrito,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
}
