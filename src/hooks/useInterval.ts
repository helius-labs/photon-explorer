import { useRef, useEffect } from 'react';

// useInterval: Custom hook for creating an interval that executes a given callback function.
export function useInterval(callback: () => void, delay: number | null) {
  // useRef is used to create a ref object to persist the latest callback function across renders.
  const savedCallback = useRef<() => void>();

  // This effect updates the saved callback whenever the callback function changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // tick: Function to be executed at each interval.
    function tick() {
      // Execute the saved callback if it's defined.
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    // If delay is not null, set up the interval.
    if (delay !== null) {
      const id = setInterval(tick, delay);
      // Clean up the interval on unmount or when the delay changes.
      return () => clearInterval(id);
    }
  }, [delay]);
}
