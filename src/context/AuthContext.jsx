import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { usuariosApi } from '../services/apiService';
import { storage } from '../services/storageService';
import { useNotifications } from './NotificationsContext';
import { useAuditor } from './AuditorContext';

// Contexto de autenticación — maneja sesión de usuario usando DummyJSON Users API
const AuthContext = createContext(null);

// Mapeo de roles de DummyJSON al sistema interno
const ROLES = {
  admin: 'administrador',
  moderator: 'vendedor',
  user: 'usuario',
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => storage.getSesion());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { agregarNotificacion } = useNotifications();
  const { registrarAccion } = useAuditor();

  const perfil = useMemo(() => {
    if (!usuario) return null;
    return ROLES[usuario.role] || 'usuario';
  }, [usuario]);

  const esAdmin = perfil === 'administrador';

  // Inicio de sesión asíncrono — busca el usuario en DummyJSON Users API
  // Usa Promise.race() para implementar un timeout de 5 segundos
  const iniciarSesion = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const temporizador = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('La solicitud de inicio de sesión tardó demasiado. Intenta de nuevo.')), 5000)
      );
      const usuarioEncontrado = await Promise.race([
        usuariosApi.buscar(username),
        temporizador,
      ]);
      const usuarioAutenticado = {
        id: usuarioEncontrado.id,
        username: usuarioEncontrado.username,
        firstName: usuarioEncontrado.firstName,
        lastName: usuarioEncontrado.lastName,
        role: usuarioEncontrado.role,
        email: usuarioEncontrado.email,
        image: usuarioEncontrado.image,
      };
      setUsuario(usuarioAutenticado);
      storage.setSesion(usuarioAutenticado);
      const rol = ROLES[usuarioAutenticado.role] || 'usuario';
      agregarNotificacion('Sesión', `Bienvenido ${usuarioAutenticado.firstName} (${rol})`, 'exito');
      registrarAccion('Inicio de sesión', 'Auth', 'éxito', `Usuario: ${username}, Rol: ${rol}`);
      return usuarioAutenticado;
    } catch (err) {
      setError(err.message);
      registrarAccion('Inicio de sesión', 'Auth', 'error', `Usuario: ${username}, Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [agregarNotificacion, registrarAccion]);

  const cerrarSesion = () => {
    if (usuario) registrarAccion('Cierre de sesión', 'Auth', 'éxito', `Usuario: ${usuario.firstName} ${usuario.lastName}`);
    setUsuario(null);
    storage.clearSesion();
    // Limpieza de datos sensibles por seguridad
    storage.setCart([]);
    storage.setDireccion('');
    storage.setMetodoPago('tarjeta');
    storage.setMetodoEnvio('estandar');
    storage.setCuponActivo(null);
    storage.setCheckoutPaso('inicio');
    agregarNotificacion('Sesión', 'Sesión cerrada', 'info');
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, error, esAdmin, perfil, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
