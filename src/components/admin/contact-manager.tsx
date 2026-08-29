'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Save, Loader2, Plus, Trash2, GripVertical, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface SocialLink {
  id: string;
  type: string;
  labelFa: string;
  labelEn: string;
  value: string;
  href: string;
}

const SOCIAL_TYPES = [
  { value: 'instagram', fa: 'اینستاگرام', en: 'Instagram' },
  { value: 'whatsapp', fa: 'واتساپ', en: 'WhatsApp' },
  { value: 'telegram', fa: 'تلگرام', en: 'Telegram' },
  { value: 'pinterest', fa: 'پینترست', en: 'Pinterest' },
  { value: 'behance', fa: 'بیهنس', en: 'Behance' },
  { value: 'linkedin', fa: 'لینکدین', en: 'LinkedIn' },
  { value: 'website', fa: 'وب‌سایت', en: 'Website' },
  { value: 'other', fa: 'سایر', en: 'Other' },
];

export function ContactManager() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState('');

  // Page header
  const [titleFa, setTitleFa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descFa, setDescFa] = useState('');
  const [descEn, setDescEn] = useState('');

  // Contact info
  const [addressFa, setAddressFa] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');

  // Social links (dynamic)
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/contact-info')
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setId(data.id);
          setTitleFa(data.titleFa || '');
          setTitleEn(data.titleEn || '');
          setDescFa(data.descFa || '');
          setDescEn(data.descEn || '');
          setAddressFa(data.addressFa || '');
          setAddressEn(data.addressEn || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setWhatsapp(data.whatsapp || '');
          setTelegram(data.telegram || '');
          try { setSocials(data.socialsJson ? JSON.parse(data.socialsJson) : []); } catch { setSocials([]); }
        }
      })
      .catch(() => toast.error(t('خطا در دریافت اطلاعات', 'Failed to fetch contact info')))
      .finally(() => setLoading(false));
  }, []);

  const addSocial = () => {
    setSocials([...socials, {
      id: crypto.randomUUID(),
      type: 'instagram',
      labelFa: '', labelEn: '', value: '', href: '',
    }]);
  };

  const removeSocial = (idx: number) => {
    setSocials(socials.filter((_, i) => i !== idx));
  };

  const updateSocial = (idx: number, field: keyof SocialLink, value: string) => {
    setSocials(socials.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleFa, titleEn, descFa, descEn,
          addressFa, addressEn, phone, email, whatsapp, telegram,
          socialsJson: JSON.stringify(socials),
        }),
      });
      toast.success(t('اطلاعات تماس ذخیره شد', 'Contact info saved'));
    } catch {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t('مدیریت تماس', 'Contact Management')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('ویرایش اطلاعات بخش تماس و شبکه‌های اجتماعی', 'Edit contact section info & social links')}</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className={`${isRtl ? 'ml-1' : 'mr-1'} animate-spin`} /> : <Save size={14} className={isRtl ? 'ml-1' : 'mr-1'} />}
          {t('ذخیره', 'Save')}
        </Button>
      </div>

      {/* Page Title & Description */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">{t('عنوان و توضیحات بخش', 'Section Title & Description')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('عنوان (فارسی)', 'Title (Persian)')}</Label>
            <Input value={titleFa} onChange={e => setTitleFa(e.target.value)} placeholder={t('بیایید چیزی بسازیم', "Let's Build Something")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('عنوان (انگلیسی)', 'Title (English)')}</Label>
            <Input value={titleEn} onChange={e => setTitleEn(e.target.value)} dir="ltr" placeholder="Let's Build Something" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('توضیحات (فارسی)', 'Description (Persian)')}</Label>
            <Textarea value={descFa} onChange={e => setDescFa(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('توضیحات (انگلیسی)', 'Description (English)')}</Label>
            <Textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={2} dir="ltr" />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">{t('اطلاعات تماس', 'Contact Details')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('ایمیل', 'Email')}</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" placeholder="name@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('شماره تماس', 'Phone Number')}</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" placeholder="+98 9xx xxx xxxx" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('شماره واتساپ', 'WhatsApp Number')}</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} dir="ltr" placeholder="+989xxxxxxxxx" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('لینک/آیدی تلگرام', 'Telegram Link/ID')}</Label>
            <Input value={telegram} onChange={e => setTelegram(e.target.value)} dir="ltr" placeholder="https://t.me/username" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">{t('آدرس', 'Address')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('آدرس (فارسی)', 'Address (Persian)')}</Label>
            <Input value={addressFa} onChange={e => setAddressFa(e.target.value)} placeholder={t('مشهد، ایران', 'Mashhad, Iran')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('آدرس (انگلیسی)', 'Address (English)')}</Label>
            <Input value={addressEn} onChange={e => setAddressEn(e.target.value)} dir="ltr" placeholder="Mashhad, Iran" />
          </div>
        </div>
      </div>

      {/* Social Links (Dynamic) */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-primary" />
            <h2 className="text-sm font-semibold">{t('شبکه‌های اجتماعی', 'Social Links')}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={addSocial}>
            <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('افزودن', 'Add')}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {socials.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('شبکه اجتماعی اضافه کنید', 'Add a social link')}
            </p>
          )}
          {socials.map((social, idx) => (
            <div key={social.id} className="border border-border rounded-lg p-4 relative group">
              <button
                onClick={() => removeSocial(idx)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t('نوع', 'Type')}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SOCIAL_TYPES.map(st => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => updateSocial(idx, 'type', st.value)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                          social.type === st.value
                            ? 'bg-primary/15 border-primary/30 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {lang === 'fa' ? st.fa : st.en}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t('لینک', 'Link (URL)')}</Label>
                  <Input
                    value={social.href}
                    onChange={e => updateSocial(idx, 'href', e.target.value)}
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t('لابل (فارسی)', 'Label (Persian)')}</Label>
                  <Input
                    value={social.labelFa}
                    onChange={e => updateSocial(idx, 'labelFa', e.target.value)}
                    placeholder={t('اینستاگرام شخصی', 'Instagram (Personal)')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t('لابل (انگلیسی)', 'Label (English)')}</Label>
                  <Input
                    value={social.labelEn}
                    onChange={e => updateSocial(idx, 'labelEn', e.target.value)}
                    dir="ltr"
                    placeholder="Instagram (Personal)"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs">{t('مقدار نمایش (مثل @username)', 'Display Value (e.g. @username)')}</Label>
                  <Input
                    value={social.value}
                    onChange={e => updateSocial(idx, 'value', e.target.value)}
                    dir="ltr"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
