"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogout() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
      } catch (e) {
        window.location.href = '/';
      }
    };

    const resetTimeout = () => {
      clearTimeout(timeout);
      // 10 minutes of inactivity
      timeout = setTimeout(logout, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      clearTimeout(timeout);
    };
  }, [router]);

  return null;
}
