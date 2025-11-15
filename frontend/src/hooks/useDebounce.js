import { useState, useEffect } from 'react';

// Hook personalizado para debounce
export function useDebounce(value, delay) {
  // Estado para guardar el valor con debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Actualiza el valor con debounce después del 'delay' especificado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el timeout si el valor cambia (evita que el valor anterior se establezca)
    // o si el componente se desmonta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}
