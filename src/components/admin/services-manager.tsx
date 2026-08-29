'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Plus, Pencil, Trash2, Briefcase, Check, AlertCircle, GripVertical, Type, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ServiceItem {
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

const defaultSvgIcons = [
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <rect x='6' y='20' width='16' height='22' rx='1' /><rect x='26' y='12' width='16' height='30' rx='1' />
    <path d='M6 20h16V10a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10z' /><path d='M26 12h16V6a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v6z' />
    <line x1='10' y1='26' x2='18' y2='26' /><line x1='10' y1='30' x2='18' y2='30' />
  </svg>`,
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <rect x='8' y='8' width='32' height='32' rx='2' />
    <path d='M8 16h32' /><path d='M16 8v32' />
    <rect x='20' y='20' width='12' height='12' rx='1' />
  </svg>`,
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <rect x='6' y='6' width='36' height='36' rx='2' />
    <circle cx='24' cy='24' r='8' />
    <path d='M24 16v-4M24 36v-4M16 24h-4M36 24h-4' />
  </svg>`,
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <path d='M24 4L4 14v20l20 10 20-10V14L24 4z' />
    <path d='M4 14l20 10 20-10' /><path d='M24 44V24' />
  </svg>`,
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <circle cx='24' cy='24' r='16' />
    <path d='M20 28c0-2.2 1.8-4 4-4' /><path d='M24 18v4l3 3' />
  </svg>`,
  `<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'>
    <rect x='8' y='6' width='32' height='36' rx='3' />
    <path d='M14 16h20' /><path d='M14 22h14' /><path d='M14 28h18' />
    <path d='M32 28l4 4 6-8' />
  </svg>`,
];

export function ServicesManager() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<ServiceItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  // Section header fields (stored in settings)
  const [sectionTitleFa, setSectionTitleFa] = useState('');
  const [sectionTitleEn, setSectionTitleEn] = useState('');
  const [sectionDescFa, setSectionDescFa] = useState('');
  const [sectionDescEn, setSectionDescEn] = useState('');
  const [ctaTitleFa, setCtaTitleFa] = useState('');
  const [ctaTitleEn, setCtaTitleEn] = useState('');
  const [ctaDescFa, setCtaDescFa] = useState('');
  const [ctaDescEn, setCtaDescEn] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [formTitleFa, setFormTitleFa] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescFa, setFormDescFa] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formPriceFa, setFormPriceFa] = useState('');
  const [formPriceEn, setFormPriceEn] = useState('');
  const [formIconSvg, setFormIconSvg] = useState('');
  const [formFeaturesFa, setFormFeaturesFa] = useState('');
  const [formFeaturesEn, setFormFeaturesEn] = useState('');
  const [formNoteFa, setFormNoteFa] = useState('');
  const [formNoteEn, setFormNoteEn] = useState('');
  const [formOrder, setFormOrder] = useState(0);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data: Record<string, string> = await res.json();
      setSectionTitleFa(data.services_title_fa || '');
      setSectionTitleEn(data.services_title_en || '');
      setSectionDescFa(data.services_desc_fa || '');
      setSectionDescEn(data.services_desc_en || '');
      setCtaTitleFa(data.cta_title_fa || '');
      setCtaTitleEn(data.cta_title_en || '');
      setCtaDescFa(data.cta_desc_fa || '');
      setCtaDescEn(data.cta_desc_en || '');
    } catch {}
  }, []);

  useEffect(() => { fetchServices(); fetchSettings(); }, [fetchServices, fetchSettings]);

  const saveSectionSettings = async () => {
    setSavingSection(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: [
          { key: 'services_title_fa', value: sectionTitleFa },
          { key: 'services_title_en', value: sectionTitleEn },
          { key: 'services_desc_fa', value: sectionDescFa },
          { key: 'services_desc_en', value: sectionDescEn },
          { key: 'cta_title_fa', value: ctaTitleFa },
          { key: 'cta_title_en', value: ctaTitleEn },
          { key: 'cta_desc_fa', value: ctaDescFa },
          { key: 'cta_desc_en', value: ctaDescEn },
        ] }),
      });
      toast.success(t('تنظیمات بخش ذخیره شد', 'Section settings saved'));
    } catch {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    } finally {
      setSavingSection(false);
    }
  };

  const resetForm = () => {
    setFormTitleFa('');
    setFormTitleEn('');
    setFormDescFa('');
    setFormDescEn('');
    setFormPriceFa('');
    setFormPriceEn('');
    setFormIconSvg('');
    setFormFeaturesFa('');
    setFormFeaturesEn('');
    setFormNoteFa('');
    setFormNoteEn('');
    setFormOrder(0);
    setEditService(null);
  };

  const handleCreate = () => {
    resetForm();
    setFormIconSvg(defaultSvgIcons[services.length % defaultSvgIcons.length]);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditService(service);
    setFormTitleFa(service.titleFa);
    setFormTitleEn(service.titleEn);
    setFormDescFa(service.descFa);
    setFormDescEn(service.descEn);
    setFormPriceFa(service.priceFa);
    setFormPriceEn(service.priceEn);
    setFormIconSvg(service.iconSvg);
    setFormFeaturesFa(service.featuresFa);
    setFormFeaturesEn(service.featuresEn);
    setFormNoteFa(service.noteFa || '');
    setFormNoteEn(service.noteEn || '');
    setFormOrder(service.order);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      titleFa: formTitleFa,
      titleEn: formTitleEn,
      descFa: formDescFa,
      descEn: formDescEn,
      priceFa: formPriceFa,
      priceEn: formPriceEn,
      iconSvg: formIconSvg,
      featuresFa: formFeaturesFa,
      featuresEn: formFeaturesEn,
      noteFa: formNoteFa,
      noteEn: formNoteEn,
      order: formOrder,
    };

    if (!data.titleFa || !data.titleEn) {
      toast.error(t('عنوان فارسی و انگلیسی الزامی است', 'Titles are required'));
      return;
    }

    try {
      const method = editService ? 'PUT' : 'POST';
      const body = editService ? { id: editService.id, ...data } : data;
      const res = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editService ? t('خدمت ویرایش شد', 'Service updated') : t('خدمت ایجاد شد', 'Service created'));
      setIsDialogOpen(false);
      fetchServices();
    } catch {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/services?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(t('خدمت حذف شد', 'Service deleted'));
      fetchServices();
    } catch {
      toast.error(t('خطا در حذف', 'Failed to delete'));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* ===== Section Header Settings ===== */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-primary" />
            <h2 className="text-sm font-semibold">{t('عنوان و توضیحات بخش خدمات', 'Services Section Header')}</h2>
          </div>
          <Button size="sm" onClick={saveSectionSettings} disabled={savingSection}>
            {savingSection ? <Loader2 size={14} className={`${isRtl ? 'ml-1' : 'mr-1'} animate-spin`} /> : <Save size={14} className={isRtl ? 'ml-1' : 'mr-1'} />}
            {t('ذخیره', 'Save')}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('عنوان بخش (فارسی)', 'Section Title (Persian)')}</Label>
            <Input value={sectionTitleFa} onChange={e => setSectionTitleFa(e.target.value)} placeholder={t('خدمات ما', 'Our Services')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('عنوان بخش (انگلیسی)', 'Section Title (English)')}</Label>
            <Input value={sectionTitleEn} onChange={e => setSectionTitleEn(e.target.value)} dir="ltr" placeholder="Our Services" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('توضیحات بخش (فارسی)', 'Section Description (Persian)')}</Label>
            <Textarea value={sectionDescFa} onChange={e => setSectionDescFa(e.target.value)} rows={2} placeholder={t('ما با ترکیب خلاقیت و تکنولوژی...', 'We blend creativity with technology...')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('توضیحات بخش (انگلیسی)', 'Section Description (English)')}</Label>
            <Textarea value={sectionDescEn} onChange={e => setSectionDescEn(e.target.value)} rows={2} dir="ltr" placeholder="We blend creativity with technology..." />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">{t('بنر CTA (پایان بخش)', 'CTA Banner (End of Section)')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t('عنوان CTA (فارسی)', 'CTA Title (Persian)')}</Label>
              <Input value={ctaTitleFa} onChange={e => setCtaTitleFa(e.target.value)} placeholder={t('پروژه خاصی در ذهن دارید؟', 'Have a special project in mind?')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t('عنوان CTA (انگلیسی)', 'CTA Title (English)')}</Label>
              <Input value={ctaTitleEn} onChange={e => setCtaTitleEn(e.target.value)} dir="ltr" placeholder="Have a special project in mind?" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t('توضیحات CTA (فارسی)', 'CTA Description (Persian)')}</Label>
              <Textarea value={ctaDescFa} onChange={e => setCtaDescFa(e.target.value)} rows={2} placeholder={t('هر پروژه‌ای منحصربه‌فرد است...', 'Every project is unique...')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t('توضیحات CTA (انگلیسی)', 'CTA Description (English)')}</Label>
              <Textarea value={ctaDescEn} onChange={e => setCtaDescEn(e.target.value)} rows={2} dir="ltr" placeholder="Every project is unique..." />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Service List Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t('مدیریت خدمات', 'Services Management')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(`${services.length} خدمت`, `${services.length} services`)}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
          {t('خدمت جدید', 'New Service')}
        </Button>
      </div>

      {/* Service List */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Briefcase size={40} className="opacity-30" />
          <p>{t('خدمتی یافت نشد', 'No services found')}</p>
          <p className="text-xs max-w-sm text-center">
            {t(
              'خدمات اینجا قابل مدیریت هستند. متن، قیمت و آیکن هر خدمت رو ویرایش کنید.',
              'Services are managed here. Edit text, price, and icon for each service.'
            )}
          </p>
          <Button variant="outline" size="sm" onClick={handleCreate}>
            <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('ایجاد خدمت', 'Create Service')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon Preview */}
                <div className="w-12 h-12 text-primary flex-shrink-0">
                  {service.iconSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: service.iconSvg }} />
                  ) : (
                    <Briefcase size={24} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{idx + 1}</span>
                    <h3 className="font-medium">{lang === 'fa' ? service.titleFa : service.titleEn}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lang === 'fa' ? service.descFa : service.descEn}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{lang === 'fa' ? service.priceFa : service.priceEn}</span>
                    <span>{(service.featuresFa || '').split('\n').filter(Boolean).length} {t('ویژگی', 'features')}</span>
                    {(service.noteFa || service.noteEn) && <span className="text-primary">{t('نکته', 'Note')}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={t('ویرایش', 'Edit')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title={t('حذف', 'Delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Service Create/Edit Dialog ===== */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editService
                ? t(`ویرایش: ${formTitleFa || editService.titleFa}`, `Edit: ${formTitleEn || editService.titleEn}`)
                : t('خدمت جدید', 'New Service')}
            </DialogTitle>
          </DialogHeader>
          <form id="service-form" onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Icon SVG */}
            <div className="flex flex-col gap-2">
              <Label>{t('آیکن (کد SVG)', 'Icon (SVG code)')}</Label>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 text-primary flex-shrink-0 border border-border rounded-lg p-1">
                  {formIconSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: formIconSvg }} />
                  ) : (
                    <Briefcase size={20} className="opacity-30" />
                  )}
                </div>
                <Textarea
                  value={formIconSvg}
                  onChange={(e) => setFormIconSvg(e.target.value)}
                  rows={3}
                  dir="ltr"
                  className="font-mono text-xs"
                  placeholder="<svg viewBox='0 0 48 48'...>...</svg>"
                />
              </div>
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان فارسی', 'Title (Persian)')} *</Label>
                <Input value={formTitleFa} onChange={(e) => setFormTitleFa(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان انگلیسی', 'Title (English)')} *</Label>
                <Input value={formTitleEn} onChange={(e) => setFormTitleEn(e.target.value)} dir="ltr" required />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('توضیحات فارسی', 'Description (Persian)')}</Label>
                <Textarea value={formDescFa} onChange={(e) => setFormDescFa(e.target.value)} rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('توضیحات انگلیسی', 'Description (English)')}</Label>
                <Textarea value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)} dir="ltr" rows={3} />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('قیمت فارسی', 'Price (Persian)')}</Label>
                <Input value={formPriceFa} onChange={(e) => setFormPriceFa(e.target.value)} placeholder={t('مثلا: از ۵۰,۰۰۰,۰۰۰ تومان', 'e.g. Starting from $800')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('قیمت انگلیسی', 'Price (English)')}</Label>
                <Input value={formPriceEn} onChange={(e) => setFormPriceEn(e.target.value)} dir="ltr" placeholder="e.g. Starting from $800" />
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('ویژگی‌ها فارسی (هر خط یک ویژگی)', 'Features (Persian, one per line)')}</Label>
                <Textarea
                  value={formFeaturesFa}
                  onChange={(e) => setFormFeaturesFa(e.target.value)}
                  rows={4}
                  placeholder={t('پلان معماری\nنما و پلان سایت\nفاز ۱ و ۲', 'Floor Plans\nElevations\nPhase 1 & 2')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('ویژگی‌ها انگلیسی (هر خط یک ویژگی)', 'Features (English, one per line)')}</Label>
                <Textarea
                  value={formFeaturesEn}
                  onChange={(e) => setFormFeaturesEn(e.target.value)}
                  dir="ltr"
                  rows={4}
                  placeholder="Floor Plans\nElevations\nPhase 1 & 2"
                />
              </div>
            </div>

            {/* Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('نکته پایانی فارسی (اختیاری)', 'Note (Persian, optional)')}</Label>
                <Textarea
                  value={formNoteFa}
                  onChange={(e) => setFormNoteFa(e.target.value)}
                  rows={2}
                  placeholder={t('نکته‌ای که زیر خدمات نمایش داده شود...', 'A note displayed below features...')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('نکته پایانی انگلیسی (اختیاری)', 'Note (English, optional)')}</Label>
                <Textarea
                  value={formNoteEn}
                  onChange={(e) => setFormNoteEn(e.target.value)}
                  dir="ltr"
                  rows={2}
                  placeholder="A note displayed below features..."
                />
              </div>
            </div>

            {/* Order */}
            <div className="w-32">
              <Label>{t('ترتیب', 'Order')}</Label>
              <Input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} dir="ltr" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              {t('انصراف', 'Cancel')}
            </Button>
            <Button type="submit" form="service-form">
              <Check size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
              {t('ذخیره', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirmation ===== */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-destructive" />
              {t('حذف خدمت', 'Delete Service')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `آیا از حذف «${deleteTarget?.titleFa}» مطمئن هستید؟`,
                `Are you sure you want to delete "${deleteTarget?.titleEn}"?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('انصراف', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {t('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
