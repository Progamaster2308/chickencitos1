import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

const respuestasPredefinidas = [
  { palabras: ['hola', 'buenas', 'saludos'], respuesta: '¡Hola! ¿En qué puedo ayudarte hoy?' },
  { palabras: ['horario', 'abren', 'cierran'], respuesta: 'Estamos abiertos de lunes a domingo de 10:00 a 22:00 hrs.' },
  { palabras: ['pedido', 'compra', 'orden'], respuesta: 'Tu pedido está siendo procesado. Te notificaremos cualquier cambio.' },
  { palabras: ['precio', 'costo', 'cuánto'], respuesta: 'Los precios se muestran en el catálogo. Todos incluyen IVA.' },
  { palabras: ['devolución', 'reembolso', 'cancelar'], respuesta: 'Las devoluciones se procesan en un plazo de 3 a 5 días hábiles.' },
  { palabras: ['gracias', 'gracioso'], respuesta: '¡Gracias a ti por preferirnos! ¿Hay algo más en que pueda ayudarte?' },
  { palabras: ['cupón', 'descuento', 'promoción'], respuesta: 'Usa códigos como BIENVENIDA10 o AHORRO20 en tu carrito para obtener descuentos.' },
  { palabras: ['entrega', 'envío', 'llegar'], respuesta: 'Los tiempos de entrega varían según tu ubicación. Revisa el seguimiento en tu ticket.' },
  { palabras: ['falta', 'error', 'problema'], respuesta: 'Lamento el inconveniente. Un agente especializado te contactará pronto.' },
  { palabras: ['adios', 'salir', 'chao'], respuesta: '¡Hasta luego! Que tengas un excelente día.' },
];

const esperarRetardoAleatorio = () => {
  const ms = 500 + Math.random() * 2000;
  return new Promise(resolve => setTimeout(resolve, ms));
};

const buscarRespuesta = (texto) => {
  const minus = texto.toLowerCase();
  for (const r of respuestasPredefinidas) {
    if (r.palabras.some(p => minus.includes(p))) return r.respuesta;
  }
  return 'Gracias por tu mensaje. Un agente te atenderá pronto.';
};

export function ChatProvider({ children }) {
  const [mensajes, setMensajes] = useState([{ emisor: 'Bot', texto: '¡Hola! Soy el asistente de Chickencito. ¿En qué puedo ayudarte?', pedidoId: null }]);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async (texto, pedidoId = null) => {
    setMensajes(prev => [...prev, { emisor: 'Usuario', texto, pedidoId }]);
    setCargando(true);
    await esperarRetardoAleatorio();
    const respuesta = buscarRespuesta(texto);
    setMensajes(prev => [...prev, { emisor: 'Bot', texto: respuesta, pedidoId: null }]);
    setCargando(false);
  };

  const iniciarChatPedido = async (pedidoId) => {
    setMensajes(prev => [...prev, { emisor: 'Bot', texto: `Chat del pedido #${pedidoId} iniciado. ¿En qué puedo ayudarte?`, pedidoId }]);
  };

  return (
    <ChatContext.Provider value={{ mensajes, enviarMensaje, iniciarChatPedido, cargando }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
