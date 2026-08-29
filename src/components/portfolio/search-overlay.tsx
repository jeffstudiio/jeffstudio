'client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { Search, X } from 'lucide-react';

function SearchOverlayInner() {
  const { toggleSearch, projects, lang, openProject } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      setTimeout(() => node.focus(), 100);
    }
  }, []);

  const filtered = query.length > 1
    ? projects.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.titleFa.includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.descriptionFa?.includes(q) ||
          p.descriptionEn?.toLowerCase().includes(q) ||
          p.subcategory?.titleFa.includes(q) ||
          p.subcategory?.titleEn.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] bg-background/90 backdrop-blur-md search-overlay"
    >
      <div className="max-w-2xl mx-auto pt-32 px-5">
        <div className="relative mb-8">
          <Search size={20} className="absolute top-1/2 -translate-y-1/2 start-5 text-muted-foreground" />
          <input
            ref={inputCallbackRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') toggleSearch(); }}
            className="w-full ps-14 pe-14 py-5 bg-card border border-border rounded-sm text-lg focus:border-primary focus:outline-none transition-colors"
            placeholder={lang === 'fa' ? 'جستجوی پروژه...' : 'Search projects...'}
          />
          <button
            onClick={toggleSearch}
            className="absolute top-1/2 -translate-y-1/2 end-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {query.length > 1 && (
          <div className="max-h-[50vh] overflow-y-auto space-y-1">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                {lang === 'fa' ? 'نتیجه‌ای یافت نشد' : 'No results found'}
              </p>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  toggleSearch();
                  openProject(p);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-sm hover:bg-card transition-colors text-right"
              >
                {p.images[0] && (
                  <img src={p.images[0].url} alt="" className="w-16 h-12 rounded-sm object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {lang === 'fa' ? p.titleFa : p.titleEn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.subcategory && (lang === 'fa' ? p.subcategory.titleFa : p.subcategory.titleEn)}
                  </div>
                </div>
                {p.year && (
                  <span className="text-xs text-muted-foreground flex-shrink-0" style={{ fontFamily: 'var(--font-inter)' }}>{p.year}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SearchOverlay() {
  const { showSearch } = useAppStore();

  return (
    <AnimatePresence>
      {showSearch && <SearchOverlayInner key="search-overlay" />}
    </AnimatePresence>
  );
}
