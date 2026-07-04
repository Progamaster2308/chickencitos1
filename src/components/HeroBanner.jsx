import { Link } from 'react-router-dom';
import { Drumstick, ArrowRight, Sparkles, Shield, Truck, Clock } from 'lucide-react';

const BANNER_KEY = 'chickencitos_banner';
const BANNER_DEFAULT = {
  titulo: 'El servicio que mereces, donde estés',
  subtitulo: 'Realiza pedidos desde la comodidad de tu hogar',
  imagen: null,
};

const leerBanner = () => {
  try {
    const raw = localStorage.getItem(BANNER_KEY);
    return raw ? { ...BANNER_DEFAULT, ...JSON.parse(raw) } : BANNER_DEFAULT;
  } catch {
    return BANNER_DEFAULT;
  }
};

export default function HeroBanner() {
  const config = leerBanner();

  return (
    <div className="hero-banner">
      <div className="hero-pattern" />
      <div
        className="hero-banner-bg"
        style={config.imagen ? { backgroundImage: `url(${config.imagen})` } : {}}
      />
      <div className="hero-overlay" />

      <div className="hero-banner-content">
        <div className="hero-badge">
          <Sparkles size={12} />
          <span>Nueva temporada</span>
        </div>

        <div className="hero-icon-wrap">
          <Drumstick size={40} strokeWidth={1.5} className="hero-icon-main" />
        </div>

        <h1 className="hero-banner-title">{config.titulo}</h1>
        <p className="hero-banner-sub">{config.subtitulo}</p>

        <div className="hero-banner-actions">
          <Link to="/catalogo" className="hero-cta hero-cta-primary">
            Ver Menú <ArrowRight size={16} />
          </Link>
          <Link to="/comparador" className="hero-cta hero-cta-secondary">
            Comparar productos
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <Truck size={14} />
            <span>Envío gratis +$150</span>
          </div>
          <div className="hero-stat">
            <Shield size={14} />
            <span>Pago seguro</span>
          </div>
          <div className="hero-stat">
            <Clock size={14} />
            <span>24-72 hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
