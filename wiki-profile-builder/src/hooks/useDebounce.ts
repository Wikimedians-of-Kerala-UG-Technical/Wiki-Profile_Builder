import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced callback with AbortController support
 * Returns a function that will be debounced and an abort controller
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: (signal: AbortSignal, ...args: Parameters<T>) => ReturnType<T>,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Abort previous request
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      // Create new controller
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(signal, ...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return debouncedCallback;
}
