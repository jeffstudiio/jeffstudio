'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { AdminPanel } from '@/components/admin/admin-panel';
import { Preloader } from '@/components/portfolio/preloader';
import { Header } from '@/components/portfolio/header';
import { Hero } from '@/components/portfolio/hero';
import { CategoryCards } from '@/components/portfolio/category-cards';
import { ProjectGrid } from '@/components/portfolio/project-grid';
import { Services } from '@/components/portfolio/services';
import { About } from '@/components/portfolio/about';
import { Contact } from '@/components/portfolio/contact';
import { Footer } from '@/components/portfolio/footer';
import { SearchOverlay } from '@/components/portfolio/search-overlay';
import { ProjectModal } from '@/components/portfolio/project-modal';
import { BackToTop } from '@/components/portfolio/back-to-top';
import { SeoHead } from '@/components/portfolio/seo-head';
import { AiChat } from '@/components/portfolio/ai-chat';

export default function Home() {
  const {
    view, lang, setCategories, setProjects, setLoading,
  } = useAppStore();

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catRes, projRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/projects'),
        ]);
        const cats = await catRes.json();
        const projs = await projRes.json();
        if (Array.isArray(cats)) setCategories(cats);
        if (Array.isArray(projs)) setProjects(projs);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setCategories, setProjects, setLoading]);

  // Update document direction and lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = lang === 'fa'
      ? 'var(--font-vazirmatn), sans-serif'
      : 'var(--font-inter), sans-serif';
  }, [lang]);

  // Admin views
  const isAdmin = view === 'admin' || view === 'admin-categories' || view === 'admin-projects' || view === 'admin-project-form' || view === 'admin-settings' || view === 'admin-messages' || view === 'admin-services' || view === 'admin-about' || view === 'admin-contact' || view === 'admin-backup' || view === 'admin-maintenance';

  if (isAdmin) {
    return <AdminPanel />;
  }

  // Portfolio views
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <SeoHead />
      <Preloader />
      <Header />
      <main className="min-h-screen">
        {view === 'home' && <Hero />}
        {(view === 'home') && <CategoryCards />}
        {view === 'category' && <ProjectGrid />}
        {view === 'services' && <Services />}
        {view === 'about' && <About />}
        {view === 'contact' && <Contact />}
      </main>
      <Footer />
      <SearchOverlay />
      <ProjectModal />
      <BackToTop />
      <AiChat />
    </div>
  );
}