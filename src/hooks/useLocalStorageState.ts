import { useEffect, useRef, useState } from 'react';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return initialValue;
    }

    try {
      return JSON.parse(saved) as T;
    } catch (error) {
      console.error('Falha ao ler dados do localStorage:', error);
      return initialValue;
    }
  });
  const isExternalUpdateRef = useRef(false);

  useEffect(() => {
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;

      if (!event.newValue) {
        isExternalUpdateRef.current = true;
        setValue(initialValue);
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as T;
        isExternalUpdateRef.current = true;
        setValue(parsed);
      } catch (error) {
        console.error('Falha ao sincronizar dados do localStorage:', error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [initialValue, key]);

  return [value, setValue] as const;
}
