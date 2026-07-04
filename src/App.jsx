import { useState, useEffect } from 'react';
import { Drumstick, ShoppingCart, User, Menu, X } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import { ProductsProvider, useProducts } from './context/ProductsContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationsContext';
import { LogisticsProvider } from './context/LogisticsContext';
import { ChatProvider } from './context/ChatContext';
import { AdminProvider } from './context/AdminContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { WishlistProvider } from './context/WishlistContext';
import { ComparadorProvider } from './context/ComparadorContext';
import { AuditorProvider } from './context/AuditorContext';


import SplashScreen from './components/SplashScreen';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import ChatWidget from './components/ChatWidget';
import NotificationsWidget from './components/NotificationsWidget';
import Footer from './components/Footer';
import AuthRoute from './components/AuthRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Comparador from './pages/Comparador';
import Favoritos from './components/Favoritos';
import DashboardEjecutivo from './pages/DashboardEjecutivo';
import MisPedidos from './pages/MisPedidos';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import NotFound from './pages/NotFound';

function NavLink({ to, children, onClick }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link to={to} className={`navbar-link ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </Link>
  );
}

function Navbar() {
  const { items } = useCart();
  const { usuario, cerrarSesion } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const cantidadEnCarrito = items.reduce((total, item) => total + item.quantity, 0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <Drumstick size={24} strokeWidth={2} className="navbar-brand-icon" />
          <span>Chickencito</span>
          <span className="navbar-brand-suffix">Express</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
          <NavLink to="/catalogo" onClick={closeMenu}>Menú</NavLink>
          <NavLink to="/comparador" onClick={closeMenu}>Comparar</NavLink>
          <NavLink to="/favoritos" onClick={closeMenu}>Favoritos</NavLink>

          <NavLink to="/carrito" onClick={closeMenu}>
            <span className="flex items-center gap-1">
              <ShoppingCart size={14} /> Carrito{cantidadEnCarrito > 0 ? ` (${cantidadEnCarrito})` : ''}
            </span>
          </NavLink>
          <NavLink to="/checkout" onClick={closeMenu}>Checkout</NavLink>
          <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>
          <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
        </div>

        <div className="navbar-actions">
          {usuario ? (
            <>
              <Link to="/mis-pedidos" className="navbar-link" onClick={closeMenu}>Mis Pedidos</Link>
              <button className="navbar-user-btn" onClick={cerrarSesion}>
                <User size={14} /> {usuario.firstName} <span style={{ fontSize: '0.8em', opacity: 0.6 }}>✕</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
              <User size={14} /> Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// Componente principal con layout, rutas protegidas y escucha de eventos globales
function AppShell() {
  const { loading, error, reintentar } = useProducts();
  const { agregarNotificacion } = useNotifications();

  useEffect(() => {
    const handleProductoAgotado = (e) => {
      agregarNotificacion('Inventario', `"${e.detail.title}" agotado`, 'advertencia');
    };
    const handleWishlistChange = (e) => {
      (e.detail || []).forEach(n => {
        agregarNotificacion('Lista de deseos', n.mensaje, 'info');
      });
    };
    window.addEventListener('productoAgotado', handleProductoAgotado);
    window.addEventListener('wishlistChanges', handleWishlistChange);
    return () => {
      window.removeEventListener('productoAgotado', handleProductoAgotado);
      window.removeEventListener('wishlistChanges', handleWishlistChange);
    };
  }, [agregarNotificacion]);

  if (loading) return <LoadingSpinner mensaje="Cargando productos..." />;
  if (error) return <ErrorScreen mensaje={error} onReintentar={reintentar} />;

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/comparador" element={<Comparador />} />
          <Route path="/favoritos" element={<Favoritos />} />


          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<AuthRoute><Checkout /></AuthRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/dashboard" element={<AuthRoute><DashboardEjecutivo /></AuthRoute>} />
          <Route path="/mis-pedidos" element={<AuthRoute><MisPedidos /></AuthRoute>} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
      <NotificationsWidget />
    </div>
  );
}

// Punto de entrada — muestra SplashScreen inicial y luego monta todos los proveedores de contexto
function App() {

  const [splashVisible, setSplashVisible] = useState(true);

  if (splashVisible) {
    return <SplashScreen onFinish={() => setSplashVisible(false)} />;
  }

  return (
    <AdminProvider>
      <NotificationsProvider>
        <ProductsProvider>
          <AuditorProvider>
          <CartProvider>
            <AuthProvider>
              <WishlistProvider>
                <ComparadorProvider>
                  <LogisticsProvider>
                    <ChatProvider>
                      <BrowserRouter>
                        <AppShell />
                      </BrowserRouter>
                    </ChatProvider>
                  </LogisticsProvider>
                </ComparadorProvider>
              </WishlistProvider>
            </AuthProvider>
          </CartProvider>
          </AuditorProvider>


        </ProductsProvider>
      </NotificationsProvider>
    </AdminProvider>
  );
}

export default App;
