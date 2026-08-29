'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';

const SITE_URL = 'https://jeffstudio.ir';
const SITE_NAME_EN = 'JEFF studio';
const SITE_NAME_FA = 'جف استودیو';
const DEFAULT_TITLE_EN = 'JEFF studio — Mostafa Jafari, Architect & 3D Visualization Artist';
const DEFAULT_TITLE_FA = 'جف استودیو — مصطفی جعفری، معمار و هنرمند بصری‌سازی سه‌بعدی';
const DEFAULT_DESC_EN = 'Portfolio of Mostafa Jafari — Architecture, Interior Design, 3D Visualization, Furniture Design & AI Architecture. Professional architectural services.';
const DEFAULT_DESC_FA = 'نمونه‌کارهای مصطفی جعفری — معماری، طراحی داخلی، رندر سه‌بعدی، طراحی مبلان و معماری هوش مصنوعی. خدمات حرفه‌ای معماری.';

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

function getPageMeta(view: string, lang: 'fa' | 'en', store: any): PageMeta {
  const isEn = lang === 'en';

  switch (view) {
    case 'home': {
      return {
        title: isEn ? DEFAULT_TITLE_EN : DEFAULT_TITLE_FA,
        description: isEn ? DEFAULT_DESC_EN : DEFAULT_DESC_FA,
      };
    }
    case 'services': {
      return {
        title: isEn
          ? 'Services — JEFF studio | Architectural Design, 3D Rendering, Interior Design'
          : 'خدمات — جف استودیو | طراحی معماری، رندر سه‌بعدی، طراحی داخلی',
        description: isEn
          ? 'Professional architectural services: Architectural Design, Interior Design, 3D Rendering, Furniture Design & AI Architecture by Mostafa Jafari.'
          : 'خدمات حرفه‌ای معماری: طراحی معماری، طراحی داخلی، رندر سه‌بعدی، طراحی مبلان و معماری هوش مصنوعی توسط مصطفی جعفری.',
      };
    }
    case 'category': {
      const cat = store.categories?.find((c: any) => c.id === store.selectedCategoryId);
      const catName = cat ? (isEn ? cat.titleEn : cat.titleFa) : '';
      const catDesc = cat ? (isEn ? (cat.descriptionEn || '') : (cat.descriptionFa || '')) : '';
      return {
        title: catName
          ? (isEn ? `${catName} — JEFF studio Portfolio` : `${catName} — نمونه‌کارهای جف استودیو`)
          : (isEn ? 'Projects — JEFF studio' : 'پروژه‌ها — جف استودیو'),
        description: catDesc || (isEn
          ? 'Browse our portfolio of architecture, interior design, and 3D visualization projects.'
          : 'مشاهده نمونه‌کارهای معماری، طراحی داخلی و بصری‌سازی سه‌بعدی.'),
        ogImage: cat?.coverImage || undefined,
      };
    }
    case 'about': {
      return {
        title: isEn
          ? 'About — Mostafa Jafari | JEFF studio'
          : 'درباره — مصطفی جعفری | جف استودیو',
        description: isEn
          ? 'Learn about Mostafa Jafari — Architect, Interior Designer, and 3D Visualization Artist with years of experience in residential, commercial, and public projects.'
          : 'آشنایی با مصطفی جعفری — معمار، طراح داخلی و هنرمند بصری‌سازی سه‌بعدی با سابقه تجربیات موفر در پروژه‌های مسکونی، تجاری و عمومی.',
      };
    }
    case 'contact': {
      return {
        title: isEn
          ? 'Contact — JEFF studio | Get a Quote'
          : 'تماس — جف استودیو | دریافت پیشنهاد قیمت',
        description: isEn
          ? 'Get in touch with Mostafa Jafari for architectural design, interior design, 3D rendering, or furniture design projects. Based in Mashhad, Iran — serving clients worldwide.'
          : 'تماس با مصطفی جعفری برای پروژه‌های معماری، طراحی داخلی، رندر سه‌بعدی یا طراحی مبلان. مقر در مشهد، ایران — خدمت به مشتریان سراسر جهان.',
      };
    }
    default:
      return {
        title: isEn ? DEFAULT_TITLE_EN : DEFAULT_TITLE_FA,
        description: isEn ? DEFAULT_DESC_EN : DEFAULT_DESC_FA,
      };
  }
}

export function SeoHead() {
  const { view, lang, categories, selectedCategoryId } = useAppStore();

  useEffect(() => {
    const store = { categories, selectedCategoryId };
    const meta = getPageMeta(view, lang, store);

    // Update document title
    document.title = meta.title;

    // Helper to set/update meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Update description
    setMeta('name', 'description', meta.description);

    // Update Open Graph
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', SITE_URL);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', lang === 'fa' ? SITE_NAME_FA : SITE_NAME_EN);
    if (meta.ogImage) {
      setMeta('property', 'og:image', meta.ogImage.startsWith('http') ? meta.ogImage : `${SITE_URL}${meta.ogImage}`);
    }
    setMeta('property', 'og:locale', lang === 'fa' ? 'fa_IR' : 'en_US');

    // Update Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    if (meta.ogImage) {
      setMeta('name', 'twitter:image', meta.ogImage.startsWith('http') ? meta.ogImage : `${SITE_URL}${meta.ogImage}`);
    }

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', SITE_URL);

    // Update hreflang tags
    const updateHreflang = (hreflang: string, href: string) => {
      let el = document.querySelector(`link[hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    updateHreflang('fa', `${SITE_URL}?lang=fa`);
    updateHreflang('en', `${SITE_URL}?lang=en`);
    updateHreflang('x-default', SITE_URL);

  }, [view, lang, categories, selectedCategoryId]);

  // Also sync URL query param for language
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') !== lang) {
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    }
  }, [lang]);

  return null;
}
