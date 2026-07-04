import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Error en la aplicación</h2>
          <p style={{ color: '#64748B', marginBottom: '1rem' }}>{this.state.error.message}</p>
          <pre style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', maxHeight: '400px', overflow: 'auto' }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#FF5A00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
