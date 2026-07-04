export default function LoadingSpinner({ mensaje = 'Cargando...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>{mensaje}</p>
    </div>
  );
}
