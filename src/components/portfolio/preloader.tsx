'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const lang = useAppStore((s) => s.lang);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader ${!visible ? 'hidden' : ''}`}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl tracking-[0.3em] font-bold" style={{ color: '#F1E9E4' }}>
          <span style={{ fontFamily: 'var(--font-inter)' }}>JEFF</span>
          <span className="text-sm font-normal opacity-50 mr-2">studio</span>
        </div>
        <div className="preloader-bar" />
      </div>
    </div>
  );
}