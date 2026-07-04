import { Link, useNavigate } from 'react-router-dom';
import { Drumstick, Mail, Phone, MapPin, Globe, MessageCircle, Heart, Play, MessageSquare } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const abrirChat = (e, mensajeInicial) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('abrirChat', { detail: { mensaje: mensajeInicial } }));
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Drumstick size={28} strokeWidth={1.5} className="footer-logo-icon" />
              <span>Chickencito<span className="footer-logo-suffix">Express</span></span>
            </Link>
            <p className="footer-desc">
              Realiza pedidos desde la comodidad de tu hogar. Envío gratis en compras mayores a $150 MXN.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="Facebook"><Globe size={18} /></a>
              <a href="#" className="footer-social-link" aria-label="Twitter"><MessageCircle size={18} /></a>
              <a href="#" className="footer-social-link" aria-label="Instagram"><Heart size={18} /></a>
              <a href="#" className="footer-social-link" aria-label="Youtube"><Play size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Enlaces</h4>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/catalogo">Menú</Link></li>
              <li><Link to="/comparador">Comparar</Link></li>
              <li><Link to="/carrito">Carrito</Link></li>
              <li><Link to="/mis-pedidos">Mis Pedidos</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Ayuda</h4>
            <ul className="footer-links">
              <li>
                <a href="#" onClick={(e) => abrirChat(e, 'Quiero hacer una pregunta frecuente')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} /> Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => abrirChat(e, 'Necesito contactar con soporte')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} /> Contacto
                </a>
              </li>
              <li><Link to="/terminos">Términos y condiciones</Link></li>
              <li><Link to="/privacidad">Aviso de privacidad</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <ul className="footer-contact">
              <li><Phone size={14} /> <span>653-XXX-XXXX</span></li>
              <li><Mail size={14} /> <span>contacto@chickencitos.com</span></li>
              <li><MapPin size={14} /> <span>San Luis Río Colorado, Sonora</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Chickencito Express. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
