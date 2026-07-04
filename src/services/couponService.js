import { storage } from './storageService';

// Tasa de IVA aplicable (16% para servicios digitales)
const IVA_RATE = 0.16;

// Cupones predefinidos del sistema — cada uno con reglas de validación
const cuponesBuiltIn = [
  { codigo: 'BIENVENIDA10', tipo: 'porcentaje', valor: 10, montoMinimo: 100, expiracion: '2027-12-31', usosMaximos: 1, categoriasPermitidas: [] },
  { codigo: 'AHORRO20', tipo: 'porcentaje', valor: 20, montoMinimo: 200, expiracion: '2027-12-31', usosMaximos: 1, categoriasPermitidas: ['electronics'] },
  { codigo: 'DESCUENTO50', tipo: 'fijo', valor: 50, montoMinimo: 150, expiracion: '2027-12-31', usosMaximos: 1, categoriasPermitidas: [] },
  { codigo: 'ENVIOGRATIS', tipo: 'fijo', valor: 35, montoMinimo: 80, expiracion: '2027-12-31', usosMaximos: 3, categoriasPermitidas: [] },
];

// Combina cupones del sistema con los creados por administradores
const todosLosCupones = () => [...cuponesBuiltIn, ...storage.getCuponesAdmin()];

// Validación asíncrona de cupón — verifica código, usos, expiración y categorías
export const validarCupon = async (codigo, items = []) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const cupon = todosLosCupones().find(c => c.codigo === codigo.toUpperCase());
  if (!cupon) throw new Error('Código de cupón inválido.');
  if (storage.getUsosCupon(cupon.codigo) >= cupon.usosMaximos) throw new Error('Este cupón ya ha alcanzado su límite de usos.');
  if (new Date(cupon.expiracion) < new Date()) throw new Error('Este cupón ha expirado.');
  if (cupon.categoriasPermitidas?.length > 0) {
    const cats = [...new Set(items.map(i => i.category))];
    if (!cats.some(c => cupon.categoriasPermitidas.includes(c))) {
      throw new Error(`Este cupón solo aplica para: ${cupon.categoriasPermitidas.join(', ')}`);
    }
  }
  return cupon;
};

// Cálculos financieros del carrito
export const calcularSubtotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calcularIVA = (subtotal) => subtotal * IVA_RATE;

// Calcula el descuento aplicable según el tipo de cupón (porcentaje o fijo)
export const calcularDescuento = (subtotal, cupon) => {
  if (!cupon) return 0;
  if (subtotal < cupon.montoMinimo) return 0;
  if (cupon.tipo === 'porcentaje') return subtotal * (cupon.valor / 100);
  return Math.min(cupon.valor, subtotal);
};

export const calcularTotal = (subtotal, iva, descuento) => subtotal + iva - descuento;

// Resumen completo: subtotal, IVA, descuento y total final
export const calcularResumen = (items, cupon) => {
  const subtotal = calcularSubtotal(items);
  const iva = calcularIVA(subtotal);
  const descuento = calcularDescuento(subtotal, cupon);
  const total = calcularTotal(subtotal, iva, descuento);
  return { subtotal, iva, descuento, total };
};
