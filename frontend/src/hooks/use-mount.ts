import { useEffect, useRef } from 'react';

export function useMount(onMounted: () => void) {
  const onMountedRef = useRef(onMounted);

  useEffect(() => {
    onMountedRef.current = onMounted;
  });

  useEffect(() => {
    const timer = setTimeout(() => onMountedRef.current(), 0);
    return () => clearTimeout(timer);
  }, []);
}
