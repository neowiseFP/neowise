import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem('access_token', session.access_token);
      } else {
        localStorage.removeItem('access_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <Component {...pageProps} />;
}