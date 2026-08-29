'use client';

import { useSyncExternalStore, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type View } from '@/store/use-app-store';
import { Sun, Moon, Search, Menu, X, Shield, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems: { key: View; fa: string; en: string }[] = [
  { key: 'home', fa: 'خانه', en: 'Home' },
  { key: 'services', fa: 'خدمات', en: 'Services' },
  { key: 'about', fa: 'درباره', en: 'About' },
  { key: 'contact', fa: 'تماس', en: 'Contact' },
];

function useIsScrolled() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('scroll', cb, { passive: true });
      return () => window.removeEventListener('scroll', cb);
    },
    () => window.scrollY > 40,
    () => false
  );
}

function useIsMounted() {
  return useSyncExternalStore(
    (cb) => { const id = requestAnimationFrame(cb); return () => cancelAnimationFrame(id); },
    () => true,
    () => false
  );
}

/* Global music state so it persists across re-renders */
let musicPlaying = false;
let musicListeners: Set<() => void> = new Set();
function subscribeMusic(cb: () => void) { musicListeners.add(cb); return () => musicListeners.delete(cb); }
function getMusicSnapshot() { return musicPlaying; }
function getMusicServerSnapshot() { return false; }
function setMusicPlaying(val: boolean) { musicPlaying = val; musicListeners.forEach(l => l()); }

export function Header() {
  const { view, lang, setView, setLang, toggleSearch, sidebarOpen, setSidebarOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const scrolled = useIsScrolled();
  const mounted = useIsMounted();
  const isPlaying = useSyncExternalStore(subscribeMusic, getMusicSnapshot, getMusicServerSnapshot);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriedAutoplay = useRef(false);

  /* Create audio element once on mount */
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio('/uploads/background-music.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  /* Try autoplay on first interaction */
  const handleFirstInteraction = useCallback(() => {
    if (hasTriedAutoplay.current) return;
    hasTriedAutoplay.current = true;
    const audio = getAudio();
    audio.play().then(() => {
      setMusicPlaying(true);
    }).catch(() => {
      /* Browser blocked autoplay, user must click music button */
    });
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  }, [getAudio]);

  useEffect(() => {
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [handleFirstInteraction]);

  const toggleMusic = useCallback(() => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }, [getAudio, isPlaying]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleNav = (v: View) => {
    setView(v);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md shadow-lg shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-1 group" aria-label="JEFF studio — Home">
            <span className="text-xl md:text-2xl font-bold tracking-[0.15em]" style={{ fontFamily: 'var(--font-inter)' }}>
              JEFF
            </span>
            <span className="text-xs md:text-sm opacity-40 font-light">studio</span>
          </button>

          {/* Desktop Nav */}
          <nav aria-label={lang === 'fa' ? 'منوی اصلی' : 'Main navigation'} className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`text-sm tracking-wide transition-colors duration-300 hover:text-primary ${
                  view === item.key ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-current={view === item.key ? 'page' : undefined}
              >
                {lang === 'fa' ? item.fa : item.en}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Music Toggle */}
            <button
              onClick={toggleMusic}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${
                isPlaying
                  ? 'border-primary/50 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
              title={isPlaying ? (lang === 'fa' ? 'قطع صدا' : 'Mute') : (lang === 'fa' ? 'پخش صدا' : 'Play')}
            >
              {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Lang Toggle */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-primary/50 transition-all text-xs font-medium"
            >
              {lang === 'fa' ? 'EN' : 'فا'}
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-primary/50 transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* Search */}
            <button
              onClick={toggleSearch}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-primary/50 transition-all"
            >
              <Search size={16} />
            </button>

            {/* Admin */}
            <button
              onClick={() => handleNav('admin')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-primary/50 transition-all"
              title="Admin"
            >
              <Shield size={14} />
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: lang === 'fa' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'fa' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 ${lang === 'fa' ? 'left-0' : 'right-0'} w-72 h-full bg-card z-50 p-8 flex flex-col gap-6 pt-24`}
              role="navigation"
              aria-label={lang === 'fa' ? 'منوی موبایل' : 'Mobile navigation'}
            >
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`text-lg text-right transition-colors ${view === item.key ? 'text-primary' : ''}`}
                >
                  {lang === 'fa' ? item.fa : item.en}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
