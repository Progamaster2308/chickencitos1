export default function ErrorScreen({ mensaje, onReintentar }) {
  return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <h2 style={{ color: 'var(--danger)', margin: 0 }}>¡Algo salió mal!</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
        {mensaje || 'No pudimos conectar con el servidor. Por favor, inténtalo de nuevo.'}
      </p>
      <button className="btn btn-primary" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}
