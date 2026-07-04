import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Ghost, ArrowLeft } from 'lucide-react';

export default function Privacidad() {
  return (
    <div className="page-section" style={{ maxWidth: 720, margin: '2rem auto' }}>
      <div className="flex items-center gap-2 mb-3">
        <Shield size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0 }}>Aviso de privacidad</h1>
      </div>

      <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
        Prometemos no vender tus datos (a menos que alguien ofrezca mucho dinero, y entonces lo reconsideraremos)
      </p>

      <div className="flex flex-col gap-4" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} style={{ color: 'var(--info)' }} /> 1. Información que recopilamos
          </h3>
          <p>Recopilamos información como tu nombre, dirección, correo electrónico y, ocasionalmente, lo que pediste a las 3 de la mañana (no juzgamos). También registramos tu historial de pedidos para recomendarte más pollo del que necesitas.</p>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--success)' }} /> 2. Uso de la información
          </h3>
          <p>Tus datos se usan para:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Procesar tus pedidos (obvio, para qué más).</li>
            <li>Enviarte notificaciones cuando tu pedido esté listo y también cuando no.</li>
            <li>Mostrarte anuncios de pollo que probablemente ya compraste.</li>
            <li>Almacenar tus datos en localStorage porque no nos alcanza para una base de datos real.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ghost size={18} style={{ color: 'var(--text-muted)' }} /> 3. Compartición de datos
          </h3>
          <p>No compartimos tus datos con terceros. Bueno, tal vez con el repartidor para que sepa tu dirección. Y con la API de DummyJSON, pero ellos ya saben todo de todos. Y con FakeStore, pero solo para que se vea bonito el catálogo.</p>
          <p>En resumen: tus datos están tan seguros como un ticket de compra en una papelera pública.</p>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} /> 4. Seguridad de los datos
          </h3>
          <p>Implementamos medidas de seguridad de última generación como:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>localStorage (porque una base de datos SQL estaría muy cara).</li>
            <li>Promesas y async/await (para que todo se sienta más seguro).</li>
            <li>Un candado en el ícono del navegador (el HTTPS hace que todo se vea profesional).</li>
            <li>Splash screen con animaciones (para distraer al usuario mientras cargamos).</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} style={{ color: 'var(--text-muted)' }} /> 5. Derechos del usuario
          </h3>
          <p>Tienes derecho a:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Acceder a tus datos (ve a localStorage y échales un ojo).</li>
            <li>Rectificarlos (cambia el código en el inspector).</li>
            <li>Cancelarlos (borra las cookies y reza).</li>
            <li>Oponerte a que te recomendemos pollo a las 11 p.m. (no lo haremos).</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ghost size={18} style={{ color: 'var(--text-muted)' }} /> 6. Contacto
          </h3>
          <p>Si tienes dudas sobre este aviso de privacidad, puedes contactarnos al correo <strong>contacto@chickencitos.com</strong> o simplemente abrir el chat y preguntarle al bot, total, él se lo inventa todo.</p>
        </section>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
