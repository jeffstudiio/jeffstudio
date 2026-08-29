'client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, User, Film } from 'lucide-react';

export function ProjectModal() {
  const { selectedProject, showProjectModal, closeProject, lang } = useAppStore();
  const prevProjectIdRef = useRef<string | undefined>(undefined);
  const [activeImg, setActiveImg] = useState(0);
  const isRtl = lang === 'fa';

  if (selectedProject?.id !== prevProjectIdRef.current) {
    prevProjectIdRef.current = selectedProject?.id;
    setActiveImg(0);
  }

  useEffect(() => {
    if (showProjectModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showProjectModal]);

  const p = selectedProject;
  if (!p) return null;

  const images = p.images.length > 0 ? p.images : [];
  const currentImage = images[activeImg];

  const goNext = () => setActiveImg((prev) => (prev + 1) % images.length);
  const goPrev = () => setActiveImg((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {showProjectModal && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 modal-backdrop"
            onClick={closeProject}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-4 md:inset-8 lg:inset-12 bg-card rounded-sm overflow-hidden modal-content"
          >
            {/* Close Button */}
            <button
              onClick={closeProject}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all bg-card/80 backdrop-blur-sm"
            >
              <X size={18} />
            </button>

            <div className="h-full flex flex-col lg:flex-row">
              {/* Left: Main Image (or placeholder) */}
              <div className="lg:w-[60%] h-[40vh] lg:h-full bg-muted relative flex items-center justify-center">
                {images.length > 0 && currentImage ? (
                  <>
                    <AnimatePresence mode="wait">
                      {currentImage.isVideo ? (
                        <motion.video
                          key={activeImg}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          src={currentImage.url}
                          controls
                          autoPlay
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <motion.img
                          key={activeImg}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          src={currentImage.url}
                          alt={lang === 'fa' ? (currentImage.altFa || p.titleFa) : (currentImage.altEn || p.titleEn)}
                          className="absolute inset-0 w-full h-full object-contain"
                          decoding="async"
                        />
                      )}
                    </AnimatePresence>

                    {/* Image Nav Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={goPrev}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-primary/80 transition-all"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={goNext}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-primary/80 transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60" style={{ fontFamily: 'var(--font-inter)' }}>
                      {activeImg + 1} / {images.length}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4 opacity-20">📸</div>
                    <p className="text-sm">{lang === 'fa' ? 'تصویری ثبت نشده' : 'No images yet'}</p>
                  </div>
                )}
              </div>

              {/* Right: Info Panel */}
              <div className="lg:w-[40%] h-[60vh] lg:h-full overflow-y-auto p-6 md:p-10 flex flex-col border-l border-border">
                {/* Category & Subcategory */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.subcategory && (
                    <span className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary">
                      {lang === 'fa' ? p.subcategory.titleFa : p.subcategory.titleEn}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-6">
                  {lang === 'fa' ? p.titleFa : p.titleEn}
                </h2>

                {/* Meta */}
                <div className="space-y-3 mb-8 text-sm text-muted-foreground">
                  {p.year && (
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-primary" />
                      <span style={{ fontFamily: 'var(--font-inter)' }}>{p.year}</span>
                    </div>
                  )}
                  {(lang === 'fa' ? p.locationFa : p.locationEn) && (
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-primary" />
                      <span>{lang === 'fa' ? p.locationFa : p.locationEn}</span>
                    </div>
                  )}
                  {(lang === 'fa' ? p.clientFa : p.clientEn) && (
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-primary" />
                      <span>{lang === 'fa' ? p.clientFa : p.clientEn}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {(lang === 'fa' ? p.descriptionFa : p.descriptionEn) && (
                  <div className="mb-10">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {lang === 'fa' ? p.descriptionFa : p.descriptionEn}
                    </p>
                  </div>
                )}

                {/* Thumbnail Gallery at bottom */}
                {images.length > 1 && (
                  <div className="mt-auto pt-6 border-t border-border">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImg(idx)}
                          className={`flex-shrink-0 w-20 h-14 rounded-sm overflow-hidden border-2 transition-all ${
                            activeImg === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          {img.isVideo ? (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Film size={16} className="text-primary" />
                            </div>
                          ) : (
                            <img
                              src={img.url}
                              alt={lang === 'fa' ? (img.altFa || '') : (img.altEn || '')}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}