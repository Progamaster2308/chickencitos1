import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { usuario, perfil } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (perfil !== 'administrador') return <Navigate to="/" replace />;

  return children;
}
