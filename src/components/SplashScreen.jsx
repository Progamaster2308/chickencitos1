import { useEffect, useState, useRef } from 'react';
import { Drumstick } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [fase, setFase] = useState('logo');
  const [progreso, setProgreso] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const ejecutarSplash = async () => {
      try {
        await esperar(300);
        setFase('tagline');
        await esperar(250);
        setFase('cargando');

        const duracion = 1000;
        const intervalo = 30;
        let transcurrido = 0;

        while (transcurrido < duracion) {
          await esperar(intervalo);
          transcurrido += intervalo;
          const pct = Math.min(Math.floor((transcurrido / duracion) * 100), 100);
          setProgreso(pct);
        }

        setProgreso(100);
        await esperar(150);
        setIsFading(true);
        await esperar(300);
        onFinish();
      } catch (error) {
        console.error("Error en Splash:", error);
      }
    };

    ejecutarSplash();
  }, [onFinish]);

  return (
    <div className={`splash-container ${isFading ? 'fade-out' : ''}`}>
      <div className="splash-bg-shapes">
        <div className="splash-shape splash-shape-1" />
        <div className="splash-shape splash-shape-2" />
        <div className="splash-shape splash-shape-3" />
      </div>

      <div className="splash-content">
        <div className={`splash-icon-wrap ${fase !== 'logo' ? 'splash-icon-done' : ''}`}>
          <Drumstick size={48} strokeWidth={1.5} className="splash-icon" />
        </div>

        <h1 className={`splash-logo ${fase !== 'logo' ? 'splash-logo-visible' : ''}`}>
          Chickencito<span>Express</span>
        </h1>

        <p className={`splash-sub ${fase === 'tagline' || fase === 'cargando' ? 'splash-sub-visible' : ''}`}>
          El servicio que mereces, donde estés
        </p>

        <div className={`splash-bar-track ${fase === 'cargando' || (progreso >= 100) ? 'splash-bar-visible' : ''}`}>
          <div className="splash-bar-fill" style={{ width: `${progreso}%` }} />
          <span className="splash-bar-label">{progreso}%</span>
        </div>

        <p className="splash-version">v2.0.0</p>
      </div>
    </div>
  );
}
