import { useNavigate } from 'react-router-dom';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import { useProducts } from '../context/ProductsContext';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { Sparkles, TrendingUp, ArrowRight, Package, Users, Star, Clock, Store, Laptop, Shirt, Gem, ShoppingBag, Shield, Truck } from 'lucide-react';

const CATEGORY_MAP = {
  electronics: { icon: Laptop, color: '#3B82F6' },
  jewelery: { icon: Gem, color: '#EC4899' },
  "men's clothing": { icon: Shirt, color: '#10B981' },
  "women's clothing": { icon: ShoppingBag, color: '#F43F5E' },
};

const CATEGORY_LABELS = {
  electronics: 'Electrónica',
  jewelery: 'Joyería',
  "men's clothing": 'Caballeros',
  "women's clothing": 'Damas',
};

export default function Home() {
  const navigate = useNavigate();
  const sugerencias = useRecomendaciones();
  const { productos } = useProducts();
  const categoriaFav = sugerencias?.categoriaFav;

  const stats = [
    { icon: Package, label: 'Productos', value: productos.length },
    { icon: Users, label: 'Usuarios activos', value: '2,847' },
    { icon: Star, label: 'Calificación', value: '4.8' },
    { icon: Clock, label: 'Entrega', value: '24-72 hrs' },
  ];

  const categorias = [...new Set(productos.map(p => p.category))];

  const productosPopulares = productos.filter(p =>
    p.rating?.rate >= 4 && p.rating?.count >= 100
  ).slice(0, 4);

  const mejoresOfertas = [...productos].sort((a, b) => b.rating?.rate - a.rating?.rate).slice(0, 4);

  const trustBadges = [
    { icon: Shield, label: 'Pago 100% seguro', desc: 'Datos protegidos' },
    { icon: Truck, label: 'Envío exprés', desc: 'En 24-48 horas' },
    { icon: Star, label: 'Garantía de calidad', desc: 'Devolución sin costo' },
    { icon: Clock, label: 'Soporte 24/7', desc: 'Chat en vivo' },
  ];

  return (
    <div className="home-page">
      <HeroBanner />

      <div className="home-stats-row">
        {stats.map((s, i) => (
          <div key={i} className="home-stat-card">
            <s.icon size={20} className="home-stat-icon" />
            <div>
              <div className="home-stat-value">{s.value}</div>
              <div className="home-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="home-section">
        <div className="home-section-header">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-primary" />
            <h2 className="home-section-title">Categorías</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/catalogo')}>
            Explorar <ArrowRight size={14} />
          </button>
        </div>
        <div className="home-categories-scroll">
          {categorias.map(cat => {
            const CatIcon = CATEGORY_MAP[cat]?.icon || Store;
            const color = CATEGORY_MAP[cat]?.color || '#64748B';
            const label = CATEGORY_LABELS[cat] || cat;
            return (
              <button
                key={cat}
                className="home-category-chip"
                onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(cat)}`)}
                style={{ '--chip-color': color }}
              >
                <span className="home-category-icon" style={{ background: `${color}18`, color }}>
                  <CatIcon size={18} />
                </span>
                <span className="home-category-label">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {categoriaFav && (
        <div className="home-recommendation-card">
          <Sparkles size={18} className="home-rec-icon" />
          <div>
            <strong>Recomendado para ti</strong>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#065F46' }}>
              Descubre productos en <strong>{CATEGORY_LABELS[categoriaFav] || categoriaFav}</strong> basados en tus compras recientes
            </p>
          </div>
        </div>
      )}

      {productosPopulares.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              <h2 className="home-section-title">Más Populares</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/catalogo')}>
              Ver todo <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-muted home-section-desc">
            Los favoritos de la semana — productos mejor calificados por nuestra comunidad
          </p>
          <div className="grid grid-4">
            {productosPopulares.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="home-section-header">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="home-section-title">Mejores Calificados</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/comparador')}>
            Comparar <ArrowRight size={14} />
          </button>
        </div>
        <p className="text-muted home-section-desc">
          Los productos con las valoraciones más altas de nuestro catálogo
        </p>
        <div className="grid grid-4">
          {mejoresOfertas.map(p => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>

      <section className="home-trust-row">
        {trustBadges.map((b, i) => (
          <div key={i} className="home-trust-card">
            <b.icon size={24} className="home-trust-icon" />
            <div>
              <div className="home-trust-label">{b.label}</div>
              <div className="home-trust-desc">{b.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="home-cta-section">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalogo')}>
          <ShoppingBag size={18} /> Explorar Catálogo Completo
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
          Dashboard Ejecutivo
        </button>
      </div>
    </div>
  );
}
