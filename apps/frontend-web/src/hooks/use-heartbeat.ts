import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export function useHeartbeat(enabled: boolean) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sendHeartbeat = async () => {
      try {
        await api.auth.heartbeat();
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    sendHeartbeat();

    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}

