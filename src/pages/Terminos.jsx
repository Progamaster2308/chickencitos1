import { Link } from 'react-router-dom';
import { Scale, AlertTriangle, Skull, Ban, ArrowLeft } from 'lucide-react';

export default function Terminos() {
  return (
    <div className="page-section" style={{ maxWidth: 720, margin: '2rem auto' }}>
      <div className="flex items-center gap-2 mb-3">
        <Scale size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0 }}>Términos y condiciones</h1>
      </div>

      <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
        Última actualización: hace aproximadamente 5 minutos (cuando se nos ocurrió)
      </p>

      <div className="flex flex-col gap-4" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> 1. Aceptación de los términos
          </h3>
          <p>Al utilizar esta aplicación, el usuario acepta el riesgo de caer en bancarrota debido a un consumo excesivo de brainrots de Roblox y exceso de pedidos de Chickencito Express. El sistema no se hace responsable por la pérdida de dinero virtual o real.</p>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skull size={18} style={{ color: 'var(--danger)' }} /> 2. Del usuario
          </h3>
          <p>El usuario se compromete a:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>No pedir 20 piezas de pollo a las 2:00 a.m. y arrepentirse al llegar la cuenta.</li>
            <li>Entender que "entrega en 24 a 72 horas" es una sugerencia, no una promesa.</li>
            <li>No culpar al repartidor si el pedido llega frío por estar jugando Roblox.</li>
            <li>Aceptar que el código de cupón "CHICKENCITO99" probablemente nunca funcione.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ban size={18} style={{ color: 'var(--danger)' }} /> 3. Restricciones
          </h3>
          <p>Queda estrictamente prohibido:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Usar la plataforma para pedir comida saludable. Para eso existen otras apps.</li>
            <li>Intentar pagar con Robux o V-Bucks.</li>
            <li>Contactar al soporte preguntando "¿ya llegó mi pedido?" antes de los 5 minutos.</li>
            <li>Crear más de 3 cuentas para acumular cupones de bienvenida (ya lo intentamos).</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} style={{ color: 'var(--primary)' }} /> 4. Responsabilidad legal
          </h3>
          <p>Chickencito Express no se hace responsable si:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>El usuario olvida su contraseña y su sesión se cierra misteriosamente.</li>
            <li>El carrito se vacía solo porque sí (efectos secundarios del async/await).</li>
            <li>El usuario descubre que "Chickencito" no es un animal real.</li>
            <li>El splash screen dura más de 3 segundos y el usuario cree que se trabó.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skull size={18} style={{ color: 'var(--danger)' }} /> 5. Disposición final
          </h3>
          <p>Estos términos pueden cambiar en cualquier momento sin previo aviso, probablemente mientras el desarrollador toma café. El uso continuado de la plataforma implica la aceptación de estos términos, aunque nadie los lea realmente.</p>
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
