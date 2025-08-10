"use client";
import { useState, useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <>
      <div style={{position: 'fixed', top: 10, right: 20, zIndex: 1000}}>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            background: 'var(--sidebar-header-bg)',
            color: 'var(--sidebar-fg)',
            border: '1px solid var(--sidebar-border)',
            borderRadius: 8,
            padding: '6px 16px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      {children}
    </>
  );
}
