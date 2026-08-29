'client';

import { useAppStore } from '@/store/use-app-store';

const socials = [
  {
    href: 'https://www.instagram.com/_mostafa.jafari_',
    label: 'Instagram (Personal)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>,
  },
  {
    href: 'https://www.instagram.com/_jeffstudio_',
    label: 'Instagram (JEFF Studio)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/><text x="12" y="16" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" fontWeight="bold">J</text></svg>,
  },
  {
    href: 'https://www.pinterest.com/jeffstudiio',
    label: 'Pinterest',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.46 7.58 5.97 9.12-.08-.72-.16-1.82.03-2.6l1.1-4.66s-.28-.56-.28-1.38c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.31 0 .8-.51 1.99-.77 3.1-.22.92.46 1.67 1.37 1.67 1.64 0 2.9-1.73 2.9-4.23 0-2.21-1.59-3.76-3.86-3.76-2.63 0-4.17 1.97-4.17 4.01 0 .79.31 1.64.69 2.1.08.09.09.18.07.27l-.26 1.04c-.04.17-.14.2-.32.12-1.22-.57-1.98-2.34-1.98-3.77 0-3.07 2.23-5.89 6.43-5.89 3.38 0 6 2.4 6 5.62 0 3.35-2.11 6.06-5.04 6.06-.99 0-1.91-.51-2.23-1.12l-.6 2.3c-.22.84-.81 1.89-1.21 2.53A10 10 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>,
  },
  {
    href: 'https://www.behance.net/mostafajafari313',
    label: 'Behance',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7.5 11c1.38 0 2.5-.9 2.5-2.25S8.88 6.5 7.5 6.5H3v4.5h4.5zm.5 1.5H3V17h5c1.38 0 2.5-1.12 2.5-2.25S9.38 12.5 8 12.5zM1 5h6.5C9.98 5 12 6.57 12 8.75c0 1.37-.82 2.5-2 3.18C11.52 12.6 13 14.12 13 16.25 13 18.43 10.98 20 8.5 20H1V5zm16 0h6v1.5h-6V5zm3 3c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.95 0 3.73-1.14 4.54-2.91h-2.36c-.5.56-1.28.91-2.18.91-1.38 0-2.5-.93-2.77-2.2h7.75c.02-.27.02-.53.02-.8 0-2.76-2.24-5-5-5zm-2.7 4.2c.34-1.17 1.42-2.03 2.7-2.03s2.36.86 2.7 2.03h-5.4z"/></svg>,
  },
  {
    href: 'https://www.linkedin.com/in/-mostafa-jafari-/',
    label: 'LinkedIn',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7" y1="10" x2="7" y2="16"/><circle cx="7" cy="7" r="1"/><path d="M11 16v-4a2 2 0 0 1 4 0v4"/></svg>,
  },
  {
    href: 'mailto:mostafa.jafari313@gmail.com',
    label: 'Email',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>,
  },
];

export function Footer() {
  const { lang, setView } = useAppStore();

  return (
    <footer className="border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-1 group"
          aria-label="JEFF studio — Return to home"
        >
          <span className="text-lg font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-inter)' }}>JEFF</span>
          <span className="text-xs opacity-40 font-light">studio</span>
        </button>

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label={s.label}
              title={s.label}
            >
              {s.svg}
            </a>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          {lang === 'fa'
            ? '© جف استودیو — مصطفی جعفری. تمامی حقوق محفوظ است'
            : '© JEFF studio — Mostafa Jafari. All rights reserved'}
        </span>
      </div>
    </footer>
  );
}