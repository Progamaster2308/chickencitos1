import { createContext, useContext } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  
  // Función para exportar cualquier array de objetos a un archivo CSV
  const exportarCSV = (datos, nombreArchivo) => {
    if (datos.length === 0) return;

    // Convertimos los objetos a formato CSV
    const encabezados = Object.keys(datos[0]).join(',');
    const filas = datos.map(obj => Object.values(obj).join(',')).join('\n');
    const contenido = `${encabezados}\n${filas}`;

    const blob = new Blob([contenido], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Función para exportar a JSON
  const exportarJSON = (datos, nombreArchivo) => {
    const contenido = JSON.stringify(datos, null, 2);
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminContext.Provider value={{ exportarCSV, exportarJSON }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);