'client';

import { motion } from 'framer-motion';
import { useAppStore, type Category } from '@/store/use-app-store';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function CategoryCards() {
  const { categories, lang, selectCategory } = useAppStore();
  const isRtl = lang === 'fa';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const projectCounts = (catId: string) => {
    return '10+';
  };

  return (
    <section className="py-20 md:py-32 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {lang === 'fa' ? '۰۱ / خدمات' : '01 / Services'}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold">
            {lang === 'fa' ? 'چه کاری انجام می‌دهیم؟' : 'What We Do'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              index={i}
              variants={cardVariants}
              isRtl={isRtl}
              lang={lang}
              Arrow={Arrow}
              projectCounts={projectCounts}
              onClick={() => selectCategory(cat.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category: cat,
  index,
  variants,
  isRtl,
  lang,
  Arrow,
  projectCounts,
  onClick,
}: {
  category: Category;
  index: number;
  variants: any;
  isRtl: boolean;
  lang: 'fa' | 'en';
  Arrow: typeof ArrowLeft;
  projectCounts: (id: string) => string;
  onClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered]);

  const hasVideo = !!cat.videoUrl;
  const hasCover = !!cat.coverImage;

  return (
    <motion.button
      ref={cardRef}
      custom={index}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="category-card group relative text-right p-8 md:p-10 border border-border rounded-sm overflow-hidden transition-all duration-500 hover:border-primary/30 bg-card/50 hover:bg-card"
    >
      {/* Top line accent */}
      <div className="category-card-line absolute top-0 left-0 right-0 h-[2px] bg-primary" />

      {/* Video background */}
      {hasVideo && (
        <>
          <video
            ref={videoRef}
            src={cat.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none"
          />
          {/* Play icon overlay */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Play size={12} className="text-primary fill-primary" />
            </div>
          </div>
        </>
      )}

      {/* Cover image background (only if no video, or as fallback) */}
      {!hasVideo && hasCover && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-700"
          style={{ backgroundImage: `url(${cat.coverImage})` }}
        />
      )}

      <div className="relative z-10">
        <span
          className="text-xs tracking-[0.2em] uppercase text-primary block mb-6"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {`0${index + 1}`}
        </span>

        <h3 className="text-xl md:text-2xl font-bold mb-4 leading-snug">
          {lang === 'fa' ? cat.titleFa : cat.titleEn}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {lang === 'fa'
            ? (cat.descriptionFa || 'مجموعه‌ای از بهترین پروژه‌ها')
            : (cat.descriptionEn || 'A collection of our finest projects')}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            {projectCounts(cat.id)} {lang === 'fa' ? 'پروژه' : 'Projects'}
          </span>
          <span className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all">
            <Arrow size={16} />
          </span>
        </div>

        {/* Subcategories preview */}
        {cat.subcategories && cat.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
            {cat.subcategories.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="text-[11px] px-3 py-1 rounded-full border border-border text-muted-foreground"
              >
                {lang === 'fa' ? sub.titleFa : sub.titleEn}
              </span>
            ))}
            {cat.subcategories.length > 3 && (
              <span className="text-[11px] px-3 py-1 text-muted-foreground">
                +{cat.subcategories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}