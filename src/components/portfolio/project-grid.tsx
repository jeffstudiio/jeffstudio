'client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export function ProjectGrid() {
  const {
    categories, projects, lang, selectedCategoryId, selectedSubcategoryId,
    selectSubcategory, selectCategory, openProject, setView,
  } = useAppStore();
  const isRtl = lang === 'fa';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const category = categories.find((c) => c.id === selectedCategoryId);

  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);

  useEffect(() => {
    setActiveSubFilter(null);
  }, [selectedCategoryId]);

  useEffect(() => {
    setActiveSubFilter(selectedSubcategoryId);
  }, [selectedSubcategoryId]);

  const filteredProjects = projects.filter((p) => {
    if (p.categoryId !== selectedCategoryId) return false;
    if (activeSubFilter && p.subcategoryId !== activeSubFilter) return false;
    return true;
  });

  const subcategories = category?.subcategories || [];

  return (
    <section className="pt-24 md:pt-28 pb-20 px-5 md:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back button + Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-12"
        >
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            <Arrow size={16} className={isRtl ? 'rotate-180' : ''} />
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </button>

          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-primary block mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
              {lang === 'fa' ? 'پروژه‌ها' : 'Projects'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold">
              {lang === 'fa' ? category?.titleFa : category?.titleEn}
            </h1>
          </div>
        </motion.div>

        {/* Sub-category Filters */}
        {subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <button
              onClick={() => setActiveSubFilter(null)}
              className={`text-sm px-5 py-2.5 rounded-full border transition-all duration-300 ${
                !activeSubFilter
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
            >
              {lang === 'fa' ? 'همه' : 'All'}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSubcategory(activeSubFilter === sub.id ? null : sub.id)}
                className={`text-sm px-5 py-2.5 rounded-full border transition-all duration-300 ${
                  activeSubFilter === sub.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                }`}
              >
                {lang === 'fa' ? sub.titleFa : sub.titleEn}
              </button>
            ))}
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => {
              const cover = project.images.find((img) => img.isCover) || project.images[0];
              return (
                <motion.button
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => openProject(project)}
                  className="project-card group relative aspect-[4/3] rounded-sm overflow-hidden border border-border text-left"
                >
                  {cover && (
                    <img
                      src={cover.url}
                      alt={lang === 'fa' ? (cover.altFa || project.titleFa) : (cover.altEn || project.titleEn)}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  {!cover && (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <span className="text-4xl opacity-20" style={{ fontFamily: 'var(--font-inter)' }}>{`0${i + 1}`}</span>
                    </div>
                  )}
                  <div className="project-card-overlay" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <span className="text-xs text-primary/80 block mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                      {project.subcategory ? (lang === 'fa' ? project.subcategory.titleFa : project.subcategory.titleEn) : ''}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                      {lang === 'fa' ? project.titleFa : project.titleEn}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                      {project.year && <span style={{ fontFamily: 'var(--font-inter)' }}>{project.year}</span>}
                      {(lang === 'fa' ? project.locationFa : project.locationEn) && (
                        <span>{lang === 'fa' ? project.locationFa : project.locationEn}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-32 text-muted-foreground">
            <p className="text-lg mb-2">{lang === 'fa' ? 'پروژه‌ای یافت نشد' : 'No projects found'}</p>
            <p className="text-sm">{lang === 'fa' ? 'به زودی پروژه‌های جدید اضافه می‌شوند.' : 'New projects coming soon.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}