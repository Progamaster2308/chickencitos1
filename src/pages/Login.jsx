import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { iniciarSesion, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    try {
      await iniciarSesion(username.trim(), password);
      navigate('/catalogo');
    } catch {}
  };

  return (
    <div className="page-section" style={{ maxWidth: 420, margin: '3rem auto' }}>
      <h1 className="text-center">Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            autoComplete="username"
          />
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{ paddingRight: '2.5rem' }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem',
              }}
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !username.trim() || !password.trim()}>
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#991B1B', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
