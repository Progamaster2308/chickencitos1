import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const { mensajes, enviarMensaje, cargando } = useChat();
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleAbrirChat = (e) => {
      setAbierto(true);
      const mensaje = e.detail?.mensaje;
      if (mensaje) {
        setTimeout(() => enviarMensaje(mensaje), 300);
      }
    };
    window.addEventListener('abrirChat', handleAbrirChat);
    return () => window.removeEventListener('abrirChat', handleAbrirChat);
  }, [enviarMensaje]);

  const handleEnviar = () => {
    if (!input.trim()) return;
    enviarMensaje(input.trim());
    setInput('');
  };

  if (!abierto) {
    return (
      <button className="chat-widget-btn" onClick={() => setAbierto(true)}>
        💬
      </button>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h4>💬 Chat Chickencito</h4>
        <button
          onClick={() => setAbierto(false)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {mensajes.map((m, i) => (
          <div key={i} className={`chat-msg ${m.emisor === 'Usuario' ? 'user' : 'bot'}`}>
            <strong>{m.emisor}</strong>
            {m.texto}
          </div>
        ))}
        {cargando && <div className="chat-msg bot"><strong>Bot</strong>Escribiendo...</div>}
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleEnviar}>➤</button>
      </div>
    </div>
  );
}
