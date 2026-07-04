import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ paddingTop: '4rem' }}>
      <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍗</div>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>404</h1>
      <h2 style={{ marginBottom: '0.75rem' }}>Página no encontrada</h2>
      <p style={{ marginBottom: '1.5rem', maxWidth: 400, marginInline: 'auto' }}>
        Esta página no está en nuestro menú. ¿Quizás te equivocaste de ruta?
      </p>
      <div className="flex gap-2 justify-center">
        <Link to="/" className="btn btn-primary"><Home size={16} /> Ir al inicio</Link>
        <Link to="/catalogo" className="btn btn-secondary"><Search size={16} /> Ver catálogo</Link>
      </div>
    </div>
  );
}
