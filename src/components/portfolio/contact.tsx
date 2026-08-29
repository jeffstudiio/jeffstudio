'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { Mail, Phone, Send, MapPin, ChevronDown, X, Loader2, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* SVG icons for social platforms */
function IconInstagram({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>
    </svg>
  );
}

function IconPinterest({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.46 7.58 5.97 9.12-.08-.72-.16-1.82.03-2.6l1.1-4.66s-.28-.56-.28-1.38c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.31 0 .8-.51 1.99-.77 3.1-.22.92.46 1.67 1.37 1.67 1.64 0 2.9-1.73 2.9-4.23 0-2.21-1.59-3.76-3.86-3.76-2.63 0-4.17 1.97-4.17 4.01 0 .79.31 1.64.69 2.1.08.09.09.18.07.27l-.26 1.04c-.04.17-.14.2-.32.12-1.22-.57-1.98-2.34-1.98-3.77 0-3.07 2.23-5.89 6.43-5.89 3.38 0 6 2.4 6 5.62 0 3.35-2.11 6.06-5.04 6.06-.99 0-1.91-.51-2.23-1.12l-.6 2.3c-.22.84-.81 1.89-1.21 2.53A10 10 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  );
}

function IconBehance({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M7.5 11c1.38 0 2.5-.9 2.5-2.25S8.88 6.5 7.5 6.5H3v4.5h4.5zm.5 1.5H3V17h5c1.38 0 2.5-1.12 2.5-2.25S9.38 12.5 8 12.5zM1 5h6.5C9.98 5 12 6.57 12 8.75c0 1.37-.82 2.5-2 3.18C11.52 12.6 13 14.12 13 16.25 13 18.43 10.98 20 8.5 20H1V5zm16 0h6v1.5h-6V5zm3 3c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.95 0 3.73-1.14 4.54-2.91h-2.36c-.5.56-1.28.91-2.18.91-1.38 0-2.5-.93-2.77-2.2h7.75c.02-.27.02-.53.02-.8 0-2.76-2.24-5-5-5zm-2.7 4.2c.34-1.17 1.42-2.03 2.7-2.03s2.36.86 2.7 2.03h-5.4z"/>
    </svg>
  );
}

function IconLinkedin({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7" y1="10" x2="7" y2="16"/><circle cx="7" cy="7" r="1"/><path d="M11 16v-4a2 2 0 0 1 4 0v4"/>
    </svg>
  );
}

function IconTelegram({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function IconWhatsapp({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function IconWebsite({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function IconOther({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
    </svg>
  );
}

const SOCIAL_ICON_MAP: Record<string, React.FC<{className?: string; size?: number}>> = {
  instagram: IconInstagram,
  whatsapp: IconWhatsapp,
  telegram: IconTelegram,
  pinterest: IconPinterest,
  behance: IconBehance,
  linkedin: IconLinkedin,
  website: IconWebsite,
  other: IconOther,
};

/* Services list — fetched from API, same source as Services page */
const fallbackServiceList = [
  { titleFa: '\u0637\u0631\u0627\u062d\u06cc \u0645\u0639\u0645\u0627\u0631\u06cc', titleEn: 'Architectural Design' },
  { titleFa: '\u0637\u0631\u0627\u062d\u06cc \u062f\u0627\u062e\u0644\u06cc', titleEn: 'Interior Design' },
  { titleFa: '\u0631\u0646\u062f\u0631 \u0633\u0647\u200c\u0628\u0639\u062f\u06cc', titleEn: '3D Rendering' },
];

interface ContactInfoData {
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  addressFa: string;
  addressEn: string;
  phone: string;
  email: string;
  whatsapp: string;
  telegram: string;
  socialsJson: string;
}

interface SocialLink {
  type: string;
  labelFa: string;
  labelEn: string;
  value: string;
  href: string;
}

export function Contact() {
  const { lang, view, selectedServiceIndex, setSelectedServiceIndex } = useAppStore();
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfoData | null>(null);
  const [serviceList, setServiceList] = useState(fallbackServiceList);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRtl = lang === 'fa';
  const hasPreselectedService = selectedServiceIndex !== null;
  const selectedService = selectedServiceIndex !== null ? serviceList[selectedServiceIndex] : null;

  useEffect(() => {
    if (view !== 'contact') setSelectedServiceIndex(null);
  }, [view, setSelectedServiceIndex]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetch('/api/contact-info')
      .then(r => r.json())
      .then(data => { if (data && data.id) setContactInfo(data); })
      .catch(() => {});
    // Fetch services from API — same source as Services page
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServiceList(data.map((s: any) => ({ titleFa: s.titleFa, titleEn: s.titleEn })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formState.name, 
          email: formState.email, 
          phone: formState.phone,
          message: formState.message, 
          serviceIndex: selectedServiceIndex 
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormState({ name: '', email: '', phone: '', message: '' });
        if (!hasPreselectedService) setSelectedServiceIndex(null);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch {} finally { setSubmitting(false); }
  };

  const clearService = () => setSelectedServiceIndex(null);

  // Use contact info from API or fallback defaults
  const email = contactInfo?.email || 'mostafa.jafari313@gmail.com';
  const phone = contactInfo?.phone || '+98 915 902 6785';
  const whatsapp = contactInfo?.whatsapp || '';
  const telegram = contactInfo?.telegram || '';
  const address = isRtl 
    ? (contactInfo?.addressFa || '\u0645\u0634\u0647\u062f\u060c \u0627\u06cc\u0631\u0627\u0646')
    : (contactInfo?.addressEn || 'Mashhad, Iran');
  const pageTitle = isRtl 
    ? (contactInfo?.titleFa || '\u0628\u06cc\u0627\u06cc\u06cc\u062f \u0686\u06cc\u0632\u06cc \u0628\u0633\u0627\u0632\u06cc\u0645')
    : (contactInfo?.titleEn || "Let's Build Something");
  const pageDesc = isRtl
    ? (contactInfo?.descFa || '\u0628\u0631\u0627\u06cc \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u0639\u0645\u0627\u0631\u06cc\u060c \u0637\u0631\u0627\u062d\u06cc \u062f\u0627\u062e\u0644\u06cc\u060c \u0631\u0646\u062f\u0631 \u06cc\u0627 \u0637\u0631\u0627\u062d\u06cc \u0645\u0628\u0644\u0627\u0646 \u2014 \u0627\u06cc\u0631\u0627\u0646\u06cc \u06cc\u0627 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc\u060c \u0628\u0627 \u0645\u0646 \u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0627\u0634\u06cc\u062f.')
    : (contactInfo?.descEn || 'For architecture, interior design, 3D visualization, or furniture design projects \u2014 local or international, get in touch.');

  // Parse dynamic socials
  let socials: SocialLink[] = [];
  try { socials = contactInfo?.socialsJson ? JSON.parse(contactInfo.socialsJson) : []; } catch {}

  // Build contact items (email, phone, whatsapp, telegram)
  const contacts: { icon: any; labelFa: string; labelEn: string; value: string; href: string }[] = [
    { icon: Mail, labelFa: '\u0627\u06cc\u0645\u06cc\u0644', labelEn: 'Email', value: email, href: `mailto:${email}` },
    { icon: Phone, labelFa: '\u062a\u0644\u0641\u0646', labelEn: 'Phone', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
  ];
  if (whatsapp) {
    contacts.push({ icon: IconWhatsapp, labelFa: '\u0648\u0627\u062a\u0633\u0627\u067e', labelEn: 'WhatsApp', value: whatsapp, href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` });
  }
  if (telegram) {
    contacts.push({ icon: IconTelegram, labelFa: '\u062a\u0644\u06af\u0631\u0627\u0645', labelEn: 'Telegram', value: telegram, href: telegram.startsWith('http') ? telegram : `https://t.me/${telegram}` });
  }

  // Add dynamic socials
  for (const s of socials) {
    const IconComp = SOCIAL_ICON_MAP[s.type] || IconOther;
    contacts.push({
      icon: IconComp,
      labelFa: s.labelFa || s.type,
      labelEn: s.labelEn || s.type,
      value: s.value,
      href: s.href,
    });
  }

  return (
    <section className="pt-24 md:pt-28 pb-20 px-5 md:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {isRtl ? '\u06f0\u06f4 / \u062a\u0645\u0627\u0633' : '04 / Contact'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold">{pageTitle}</h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm md:text-base leading-relaxed">{pageDesc}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Contact Info */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-4 p-5 border border-border rounded-sm">
              <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold mb-1">{isRtl ? '\u0645\u0648\u0642\u0639\u06cc\u062a' : 'Location'}</h3>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </div>

            {/* Contact items (email, phone, messengers, socials) */}
            {contacts.map((c, i) => (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 border border-border rounded-sm hover:border-primary/30 transition-all group"
              >
                <c.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{isRtl ? c.labelFa : c.labelEn}</div>
                  <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-inter)' }}>{c.value}</div>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            {hasPreselectedService && selectedService && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 px-5 py-3.5 bg-primary/10 border border-primary/20 rounded-sm mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-primary font-medium flex-shrink-0">{isRtl ? '\u062e\u062f\u0645\u062a \u0627\u0646\u062a\u062e\u0627\u0628\u06cc:' : 'Selected Service:'}</span>
                  <span className="text-sm font-semibold truncate">{isRtl ? selectedService.titleFa : selectedService.titleEn}</span>
                </div>
                <button type="button" onClick={clearService} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary/20 text-primary transition-colors"><X size={14} /></button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!hasPreselectedService && (
                <div ref={dropdownRef} className="relative">
                  <label className="text-sm text-muted-foreground block mb-2">{isRtl ? '\u0627\u0646\u062a\u062e\u0627\u0628 \u062e\u062f\u0645\u062a (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)' : 'Select Service (Optional)'}</label>
                  <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between px-5 py-3.5 bg-muted border border-border rounded-sm text-sm focus:border-primary focus:outline-none transition-colors">
                    <span className={selectedService ? '' : 'text-muted-foreground'}>
                      {selectedService ? (isRtl ? selectedService.titleFa : selectedService.titleEn) : (isRtl ? '\u062e\u062f\u0645\u062a \u0645\u0648\u0631\u062f \u0646\u0638\u0631 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f...' : 'Choose a service...')}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedService && <button type="button" onClick={(e) => { e.stopPropagation(); clearService(); }} className="text-muted-foreground hover:text-foreground transition-colors"><X size={14} /></button>}
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-sm shadow-lg z-20 overflow-hidden">
                      {serviceList.map((s, i) => (
                        <button key={i} type="button" onClick={() => { setSelectedServiceIndex(i); setDropdownOpen(false); }} className={`w-full text-right px-5 py-3 text-sm hover:bg-muted transition-colors ${selectedServiceIndex === i ? 'text-primary bg-primary/5' : ''}`}>
                          {isRtl ? s.titleFa : s.titleEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground block mb-2">{isRtl ? '\u0646\u0627\u0645 \u0634\u0645\u0627' : 'Your Name'}</label>
                <input type="text" required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="w-full px-5 py-3.5 bg-muted border border-border rounded-sm text-sm focus:border-primary focus:outline-none transition-colors" placeholder={isRtl ? '\u0646\u0627\u0645 \u06a9\u0627\u0645\u0644 \u062e\u0648\u062f \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f' : 'Enter your full name'} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">{isRtl ? '\u0627\u06cc\u0645\u06cc\u0644' : 'Email'}</label>
                <input type="email" required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} className="w-full px-5 py-3.5 bg-muted border border-border rounded-sm text-sm focus:border-primary focus:outline-none transition-colors" dir="ltr" style={{ textAlign: 'left', fontFamily: 'var(--font-inter)' }} placeholder="name@example.com" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">{isRtl ? '\u0634\u0645\u0627\u0631\u0647 \u062a\u0645\u0627\u0633 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)' : 'Phone Number (Optional)'}</label>
                <input type="tel" value={formState.phone} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} className="w-full px-5 py-3.5 bg-muted border border-border rounded-sm text-sm focus:border-primary focus:outline-none transition-colors" dir="ltr" style={{ textAlign: 'left', fontFamily: 'var(--font-inter)' }} placeholder={isRtl ? '+98 9xx xxx xxxx' : '+98 9xx xxx xxxx'} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  {hasPreselectedService ? (isRtl ? '\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u067e\u0631\u0648\u0698\u0647' : 'Project Details') : (isRtl ? '\u067e\u06cc\u0627\u0645' : 'Message')}
                </label>
                <textarea required rows={6} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} className="w-full px-5 py-3.5 bg-muted border border-border rounded-sm text-sm focus:border-primary focus:outline-none transition-colors resize-none" placeholder={hasPreselectedService ? (isRtl ? '\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u067e\u0631\u0648\u0698\u0647 \u062e\u0648\u062f \u0631\u0627 \u0628\u0646\u0648\u06cc\u0633\u06cc\u062f...' : 'Describe your project...') : (isRtl ? '\u067e\u0631\u0648\u0698\u0647 \u062e\u0648\u062f \u0631\u0627 \u062a\u0648\u0636\u06cc\u062d \u062f\u0647\u06cc\u062f...' : 'Describe your project...')} />
              </div>

              <button type="submit" disabled={submitting || submitted} className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : submitted ? (isRtl ? '\u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0627\u0631\u0633\u0627\u0644 \u0634\u062f' : 'Request Sent') : hasPreselectedService ? (isRtl ? '\u062b\u0628\u062a \u0633\u0641\u0627\u0631\u0634' : 'Place Order') : (isRtl ? '\u0627\u0631\u0633\u0627\u0644 \u067e\u06cc\u0627\u0645' : 'Send Message')}
                {!submitting && !submitted && <Send size={16} />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}