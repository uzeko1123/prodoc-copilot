import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(seconds = 0, onExpire?: () => void) {
  const [countdown, setCountdown] = useState(seconds);

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (countdown <= 0) {
      onExpireRef.current?.();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const start = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  return { countdown, startCountdown: start };
}
