'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { ArrowLeft, ArrowRight, Check, MessageCircle } from 'lucide-react';

interface ServiceData {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  priceFa: string;
  priceEn: string;
  iconSvg: string;
  featuresFa: string;
  featuresEn: string;
  noteFa: string;
  noteEn: string;
  order: number;
}

const fallbackServices: ServiceData[] = [
  {
    id: 'fb-1',
    titleFa: '\u0637\u0631\u0627\u062d\u06cc \u0645\u0639\u0645\u0627\u0631\u06cc',
    titleEn: 'Architectural Design',
    descFa: '\u0637\u0631\u0627\u062d\u06cc \u067e\u0644\u0627\u0646\u060c \u0646\u0645\u0627\u060c \u0633\u0627\u06cc\u062a\u200c\u067e\u0644\u0627\u0646 \u0648 \u0641\u0627\u0632 \u06f1 \u0648 \u06f2 \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u0633\u06a9\u0648\u0646\u06cc\u060c \u062a\u062c\u0627\u0631\u06cc \u0648 \u0639\u0645\u0648\u0645\u06cc \u0628\u0627 \u0631\u0639\u0627\u06cc\u062a \u0627\u0633\u062a\u0627\u0646\u062f\u0627\u0631\u062f\u0647\u0627\u06cc \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc.',
    descEn: 'Complete architectural design including floor plans, elevations, site plans, and Phase 1 & 2 documents for residential, commercial, and public projects.',
    priceFa: '\u0627\u0632 \u06f5\u06f0,\u06f0\u06f0\u06f0,\u06f0\u06f0\u06f0 \u062a\u0648\u0645\u0627\u0646',
    priceEn: 'Starting from $800',
    iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='6' y='20' width='16' height='22' rx='1' /><rect x='26' y='12' width='16' height='30' rx='1' /><path d='M6 20h16V10a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10z' /><path d='M26 12h16V6a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v6z' /></svg>",
    featuresFa: '\u067e\u0644\u0627\u0646 \u0645\u0639\u0645\u0627\u0631\u06cc\n\u0646\u0645\u0627 \u0648 \u067e\u0644\u0627\u0646 \u0633\u0627\u06cc\u062a\n\u0641\u0627\u0632 \u06f1 \u0648 \u06f2\n\u0645\u062f\u0644 \u0633\u0647\u200c\u0628\u0639\u062f\u06cc \u0627\u0648\u0644\u06cc\u0647',
    featuresEn: 'Floor Plans\nElevations & Site Plan\nPhase 1 & 2\nPreliminary 3D Model',
    order: 0,
  },
  {
    id: 'fb-2',
    titleFa: '\u0637\u0631\u0627\u062d\u06cc \u062f\u0627\u062e\u0644\u06cc',
    titleEn: 'Interior Design',
    descFa: '\u0637\u0631\u0627\u062d\u06cc \u0641\u0636\u0627\u0647\u0627\u06cc \u062f\u0627\u062e\u0644\u06cc \u0634\u0627\u0645\u0644 \u0627\u0646\u062a\u062e\u0627\u0628 \u0645\u062a\u0631\u06cc\u0627\u0644\u060c \u0631\u0646\u06af\u200c\u0628\u0646\u062f\u06cc\u060c \u0645\u0628\u0644\u0627\u0646 \u0648 \u062f\u06a9\u0648\u0631\u0627\u0633\u06cc\u0648\u0646 \u0628\u0627 \u0631\u0648\u06cc\u06a9\u0631\u062f\u06cc \u0645\u062f\u0631\u0646 \u0648 \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc.',
    descEn: 'Interior space design including material selection, color schemes, furniture and decor with a modern and functional approach.',
    priceFa: '\u0627\u0632 \u06f3\u06f0,\u06f0\u06f0\u06f0,\u06f0\u06f0\u06f0 \u062a\u0648\u0645\u0627\u0646',
    priceEn: 'Starting from $500',
    iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='8' y='8' width='32' height='32' rx='2' /><path d='M8 16h32' /><path d='M16 8v32' /><rect x='20' y='20' width='12' height='12' rx='1' /></svg>",
    featuresFa: '\u0645\u0648\u062f\u0628\u0648\u0631\u062f \u0648 \u06a9\u0627\u0646\u0633\u067e\u062a\n\u067e\u0644\u0627\u0646 \u0686\u06cc\u062f\u0645\u0627\u0646\n\u0627\u0646\u062a\u062e\u0627\u0628 \u0645\u062a\u0631\u06cc\u0627\u0644\n\u0646\u0642\u0634\u0647\u200c\u0647\u0627\u06cc \u0627\u062c\u0631\u0627\u06cc\u06cc',
    featuresEn: 'Moodboard & Concept\nLayout Plan\nMaterial Selection\nConstruction Drawings',
    order: 1,
  },
  {
    id: 'fb-3',
    titleFa: '\u0631\u0646\u062f\u0631 \u0633\u0647\u200c\u0628\u0639\u062f\u06cc',
    titleEn: '3D Rendering',
    descFa: '\u062a\u0648\u0644\u06cc\u062f \u0631\u0646\u062f\u0631\u0647\u0627\u06cc \u0641\u062a\u0648\u200c\u0631\u0626\u0627\u0644\u06cc\u0633\u062a\u06cc\u06a9 \u0628\u0627 \u06a9\u06cc\u0641\u06cc\u062a \u0628\u0627\u0644\u0627 \u0628\u0627 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0627\u0632 V-Ray \u0648 Corona \u0628\u0631\u0627\u06cc \u0627\u0631\u0627\u0626\u0647 \u062d\u0631\u0641\u0647\u200c\u0627\u06cc \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627.',
    descEn: 'High-quality photorealistic rendering using V-Ray and Corona for professional project presentations.',
    priceFa: '\u0627\u0632 \u06f1\u06f5,\u06f0\u06f0\u06f0,\u06f0\u06f0\u06f0 \u062a\u0648\u0645\u0627\u0646',
    priceEn: 'Starting from $250',
    iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='6' y='6' width='36' height='36' rx='2' /><circle cx='24' cy='24' r='8' /><path d='M24 16v-4M24 36v-4M16 24h-4M36 24h-4' /></svg>",
    featuresFa: '\u0631\u0646\u062f\u0631 \u0641\u062a\u0648\u200c\u0631\u0626\u0627\u0644\u06cc\u0633\u062a\u06cc\u06a9\n\u0627\u0646\u06cc\u0645\u06cc\u0634\u0646 \u0645\u0639\u0645\u0627\u0631\u06cc\n\u0648\u06cc\u0631\u0686\u0648\u0627\u0644 \u062a\u0648\u0631\n\u067e\u0633\u062a\u200c\u067e\u0631\u0648\u062f\u0627\u06a9\u0634\u0646',
    featuresEn: 'Photorealistic Render\nArchitectural Animation\nVirtual Tour\nPost-Production',
    order: 2,
  },
];

export function Services() {
  const { lang, setView, setSelectedServiceIndex } = useAppStore();
  const [services, setServices] = useState<ServiceData[]>(fallbackServices);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const isRtl = lang === 'fa';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data && typeof data === 'object') setSettings(data); })
      .catch(() => {});
  }, []);

  const title = isRtl ? (settings.services_title_fa || '\u062e\u062f\u0645\u0627\u062a \u0645\u0627') : (settings.services_title_en || 'Our Services');
  const desc = isRtl ? (settings.services_desc_fa || '\u0645\u0627 \u0628\u0627 \u062a\u0631\u06a9\u06cc\u0628 \u062e\u0644\u0627\u0642\u06cc\u062a \u0648 \u062a\u06a9\u0646\u0648\u0644\u0648\u0698\u06cc\u060c \u062e\u062f\u0645\u0627\u062a\u06cc \u062c\u0627\u0645\u0639 \u062f\u0631 \u0632\u0645\u06cc\u0646\u0647 \u0645\u0639\u0645\u0627\u0631\u06cc \u0648 \u0637\u0631\u0627\u062d\u06cc \u0627\u0631\u0627\u0626\u0647 \u0645\u06cc\u200c\u062f\u0647\u06cc\u0645. \u0647\u0631 \u067e\u0631\u0648\u0698\u0647 \u0628\u0627 \u062f\u0642\u062a \u0648 \u0648\u0633\u0648\u0627\u0633 \u062e\u0627\u0635\u06cc \u0627\u0646\u062c\u0627\u0645 \u0645\u06cc\u200c\u0634\u0648\u062f.') : (settings.services_desc_en || 'We offer comprehensive services in architecture and design by blending creativity with technology. Every project is executed with meticulous attention to detail.');
  const ctaTitle = isRtl ? (settings.cta_title_fa || '\u067e\u0631\u0648\u0698\u0647 \u062e\u0627\u0635\u06cc \u062f\u0631 \u0630\u0647\u0646 \u062f\u0627\u0631\u06cc\u062f\u061f') : (settings.cta_title_en || 'Have a special project in mind?');
  const ctaDesc = isRtl ? (settings.cta_desc_fa || '\u0647\u0631 \u067e\u0631\u0648\u0698\u0647\u200c\u0627\u06cc \u0645\u0646\u062d\u0635\u0631\u0628\u0647\u200c\u0641\u0631\u062f \u0647\u0633\u062a. \u0628\u0627 \u0645\u0627 \u062a\u0645\u0627\u0633 \u0628\u06af\u06cc\u0631\u06cc\u062f \u062a\u0627 \u0628\u0647\u062a\u0631\u06cc\u0646 \u0631\u0627\u0647\u06a9\u0627\u0631 \u0631\u0648 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0628\u062f\u06cc\u0645.') : (settings.cta_desc_en || 'Every project is unique. Contact us to get the best solution tailored to your needs.');

  const handleOrder = (index: number) => {
    setSelectedServiceIndex(index);
    setView('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className='pt-24 md:pt-28 pb-20 px-5 md:px-8 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-16'
        >
          <span className='text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4' style={{ fontFamily: 'var(--font-inter)' }}>
            {isRtl ? '\u06f0\u06f2 / \u062e\u062f\u0645\u0627\u062a' : '02 / Services'}
          </span>
          <h1 className='text-3xl md:text-5xl font-extrabold'>{title}</h1>
          <p className='text-muted-foreground mt-4 max-w-xl text-sm md:text-base leading-relaxed'>{desc}</p>
        </motion.div>

        {/* Service Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {services.map((service, i) => {
            const features = (isRtl ? service.featuresFa : service.featuresEn || '').split('\n').filter(Boolean);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className='group bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-500 flex flex-col'
              >
                <div className='w-12 h-12 text-primary mb-5 group-hover:scale-110 transition-transform duration-300'
                  dangerouslySetInnerHTML={{ __html: service.iconSvg || '' }}
                />
                <h3 className='text-lg font-bold mb-3'>{isRtl ? service.titleFa : service.titleEn}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed mb-5 flex-1'>{isRtl ? service.descFa : service.descEn}</p>
                {features.length > 0 && (
                  <div className='flex flex-col gap-2 mb-4'>
                    {features.map((f, fi) => (
                      <div key={fi} className='flex items-center gap-2.5 text-sm'>
                        <div className='w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                          <Check size={10} className='text-primary' />
                        </div>
                        <span className='text-muted-foreground'>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(service.noteFa || service.noteEn) && (
                  <div className='px-3 py-2 bg-muted/50 border border-border/50 rounded-sm mb-6'>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      {isRtl ? (service.noteFa || service.noteEn) : (service.noteEn || service.noteFa)}
                    </p>
                  </div>
                )}
                <div className='pt-4 border-t border-border'>
                  <div className='text-sm font-semibold text-primary mb-3' style={{ fontFamily: 'var(--font-inter)' }}>
                    {isRtl ? service.priceFa : service.priceEn}
                  </div>
                  <button
                    onClick={() => handleOrder(i)}
                    className='w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-sm text-sm font-medium hover:border-primary hover:text-primary transition-all group/btn'
                  >
                    {isRtl ? '\u062b\u0628\u062a \u0633\u0641\u0627\u0631\u0634' : 'Place Order'}
                    <Arrow size={14} className='group-hover/btn:translate-x-1 transition-transform' />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='mt-20 bg-card border border-border rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6'
        >
          <div>
            <h2 className='text-xl md:text-2xl font-bold mb-2'>{ctaTitle}</h2>
            <p className='text-sm text-muted-foreground'>{ctaDesc}</p>
          </div>
          <button
            onClick={() => setView('contact')}
            className='flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-all flex-shrink-0'
          >
            <MessageCircle size={16} />
            {isRtl ? '\u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627' : 'Contact Us'}
          </button>
        </motion.div>
      </div>
    </section>
  );
}