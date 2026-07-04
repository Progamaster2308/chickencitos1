// URLs base para las APIs externas del marketplace
const PRODUCTS_URL = 'https://fakestoreapi.com/products';
const USERS_URL = 'https://dummyjson.com/users';
const AUTH_URL = 'https://dummyjson.com/auth/login';
const CARTS_URL = 'https://dummyjson.com/carts/add';
const COMIDAS_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// Categorías de búsqueda para el menú de comida (Chickencito Express)
const CATEGORIAS_COMIDA = ['chicken', 'beef', 'seafood', 'pasta', 'dessert'];

// Simula latencia de red envolviendo setTimeout en una Promesa
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API de productos — consume FakeStore API con soporte para AbortController
export const productosApi = {
  obtener: async (signal) => {
    const response = await fetch(PRODUCTS_URL, { signal });
    if (!response.ok) throw new Error(`Error al obtener productos (status ${response.status})`);
    return response.json();
  },
};

// API de comidas — consume TheMealDB para obtener platillos del menú
// Mapea los resultados al formato de producto del sistema
export const comidasApi = {
  obtener: async (signal) => {
    const todas = [];
    // Busca por varias categorías de comida para obtener un menú variado
    const busquedas = CATEGORIAS_COMIDA.map(cat =>
      fetch(COMIDAS_URL + cat, { signal })
        .then(r => r.ok ? r.json() : { meals: [] })
        .catch(() => ({ meals: [] }))
    );
    const resultados = await Promise.all(busquedas);
    const idsVistos = new Set();
    resultados.forEach(res => {
      (res.meals || []).forEach(meal => {
        if (idsVistos.has(meal.idMeal)) return;
        idsVistos.add(meal.idMeal);
        // Genera precio determinista basado en el id del platillo
        const precioBase = 5 + (parseInt(meal.idMeal.slice(-3), 10) % 20);
        todas.push({
          id: parseInt(meal.idMeal, 10) + 10000,
          title: meal.strMeal,
          price: parseFloat((precioBase + Math.random()).toFixed(2)),
          category: meal.strCategory || 'Comida',
          description: meal.strInstructions ? meal.strInstructions.slice(0, 200) + '...' : 'Platillo tradicional',
          image: meal.strMealThumb || '',
          rating: {
            rate: parseFloat((3.5 + (parseInt(meal.idMeal.slice(-1), 10) % 15) / 10).toFixed(1)),
            count: parseInt(meal.idMeal.slice(-4), 10) + 20,
          },
        });
      });
    });
    return todas;
  },
};

// API de usuarios — consume DummyJSON Users para búsqueda y autenticación
export const usuariosApi = {
  buscar: async (username, signal) => {
    const response = await fetch(`${USERS_URL}/filter?key=username&value=${encodeURIComponent(username)}`, { signal });
    if (!response.ok) throw new Error('Error al buscar usuario');
    const data = await response.json();
    if (!data.users || data.users.length === 0) throw new Error('Usuario no encontrado');
    return data.users[0];
  },
  obtener: async (signal) => {
    const response = await fetch(USERS_URL, { signal });
    if (!response.ok) throw new Error(`Error al obtener usuarios (status ${response.status})`);
    const data = await response.json();
    return data.users;
  },
};

// API de autenticación — inicia sesión con usuario y contraseña contra DummyJSON Auth
export const authApi = {
  iniciarSesion: async (username, password) => {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Usuario o contraseña incorrectos');
    return response.json();
  },
};

// API de pedidos — envía compras a DummyJSON Carts con POST
export const pedidosApi = {
  enviar: async (userId, productos) => {
    await esperar(400);
    const response = await fetch(CARTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, products: productos }),
    });
    if (!response.ok) throw new Error(`Error al enviar el pedido (status ${response.status})`);
    return response.json();
  },
};

// API de conectividad — valida que el navegador tenga conexión a internet
export const conexionApi = {
  validar: async () => {
    await esperar(300);
    if (!navigator.onLine) throw new Error('No hay conexión a internet.');
  },
};
