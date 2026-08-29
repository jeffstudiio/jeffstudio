'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function Hero() {
  const { lang, setView } = useAppStore();
  const isRtl = lang === 'fa';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pattern overlay - SVG pattern */}
        <div className="absolute inset-0 opacity-[0.04] hero-pattern-light" />
        {/* Floating gradient orb 1 */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full hero-orb-1"
          style={{
            top: '5%',
            left: '10%',
          }}
          animate={{
            x: [0, 120, -60, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Floating gradient orb 2 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full hero-orb-2"
          style={{
            bottom: '5%',
            right: '5%',
          }}
          animate={{
            x: [0, -100, 70, 0],
            y: [0, 60, -50, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Floating gradient orb 3 - small */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full hero-orb-3"
          style={{
            top: '40%',
            right: '30%',
          }}
          animate={{
            x: [0, 60, -90, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full py-32">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="mb-8"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              {lang === 'fa' ? 'مصطفی جعفری' : 'Mostafa Jafari'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8"
          >
            {lang === 'fa'
              ? 'جف استودیو'
              : 'JEFF studio'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="text-sm md:text-base tracking-[0.15em] text-muted-foreground mb-12"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {lang === 'fa'
              ? 'معمار · طراح داخلی · هنرمند بصری‌سازی'
              : 'Architect · Interior Designer · 3D Visualization Artist'}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed mb-12"
          >
            {lang === 'fa'
              ? 'ترکیب خلاقیت، تکنولوژی و هنر برای خلق فضاهایی که الهام‌بخش هستند.'
              : 'Blending creativity, technology, and art to craft spaces that inspire.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.55 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => setView('home')}
              className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-all"
            >
              {lang === 'fa' ? 'مشاهده نمونه‌کارها' : 'View Portfolio'}
              <Arrow size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setView('contact')}
              className="px-8 py-4 border border-border rounded-sm text-sm font-medium hover:border-primary/50 hover:text-primary transition-all"
            >
              {lang === 'fa' ? 'تماس و سفارش' : 'Get in Touch'}
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5"
            >
              <div className="w-1 h-2 bg-primary rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}