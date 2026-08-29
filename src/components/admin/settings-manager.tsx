'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Save, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface SettingEntry {
  key: string;
  value: string;
}

const PRESET_KEYS = [
  { key: 'site_title_fa', fa: 'عنوان سایت (فارسی)', en: 'Site Title (Persian)' },
  { key: 'site_title_en', fa: 'عنوان سایت (انگلیسی)', en: 'Site Title (English)' },
  { key: 'site_description_fa', fa: 'توضیحات سایت (فارسی)', en: 'Site Description (Persian)' },
  { key: 'site_description_en', fa: 'توضیحات سایت (انگلیسی)', en: 'Site Description (English)' },
  { key: 'contact_email', fa: 'ایمیل تماس', en: 'Contact Email' },
  { key: 'contact_phone', fa: 'شماره تماس', en: 'Phone Number' },
  { key: 'contact_address_fa', fa: 'آدرس (فارسی)', en: 'Address (Persian)' },
  { key: 'contact_address_en', fa: 'آدرس (انگلیسی)', en: 'Address (English)' },
  { key: 'contact_whatsapp', fa: 'شماره واتساپ', en: 'WhatsApp Number' },
  { key: 'contact_telegram', fa: 'لینک تلگرام', en: 'Telegram Link' },
  { key: 'social_instagram', fa: 'اینستاگرام', en: 'Instagram' },
  { key: 'social_linkedin', fa: 'لینکدین', en: 'LinkedIn' },
  { key: 'bg_music', fa: 'لینک موزیک پس‌زمینه (MP3)', en: 'Background Music URL (MP3)' },
  { key: 'services_title_fa', fa: 'عنوان خدمات (فارسی)', en: 'Services Title (Persian)' },
  { key: 'services_title_en', fa: 'عنوان خدمات (انگلیسی)', en: 'Services Title (English)' },
  { key: 'services_desc_fa', fa: 'توضیحات خدمات (فارسی)', en: 'Services Description (Persian)' },
  { key: 'services_desc_en', fa: 'توضیحات خدمات (انگلیسی)', en: 'Services Description (English)' },
  { key: 'contact_title_fa', fa: 'عنوان تماس (فارسی)', en: 'Contact Title (Persian)' },
  { key: 'contact_title_en', fa: 'عنوان تماس (انگلیسی)', en: 'Contact Title (English)' },
  { key: 'contact_desc_fa', fa: 'توضیحات تماس (فارسی)', en: 'Contact Description (Persian)' },
  { key: 'contact_desc_en', fa: 'توضیحات تماس (انگلیسی)', en: 'Contact Description (English)' },
  { key: 'cta_title_fa', fa: 'بنر CTA خدمات (فارسی)', en: 'Services CTA Title (Persian)' },
  { key: 'cta_title_en', fa: 'بنر CTA خدمات (انگلیسی)', en: 'Services CTA Title (English)' },
  { key: 'cta_desc_fa', fa: 'بنر CTA توضیحات (فارسی)', en: 'Services CTA Description (Persian)' },
  { key: 'cta_desc_en', fa: 'بنر CTA توضیحات (انگلیسی)', en: 'Services CTA Description (English)' },
];

export function SettingsManager() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data: Record<string, string> = await res.json();
      const entries = Object.entries(data).map(([key, value]) => ({ key, value }));
      setSettings(entries);
    } catch {
      toast.error(t('خطا در دریافت تنظیمات', 'Failed to fetch settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      }
      return [...prev, { key, value }];
    });
  };

  const removeSetting = (key: string) => {
    setSettings(prev => prev.filter(s => s.key !== key));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error();
      toast.success(t('تنظیمات ذخیره شد', 'Settings saved'));
    } catch {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPreset = (key: string) => {
    if (!settings.find(s => s.key === key)) {
      setSettings(prev => [...prev, { key, value: '' }]);
    }
  };

  const handleAddCustom = () => {
    if (!newKey.trim()) return;
    if (settings.find(s => s.key === newKey.trim())) {
      toast.error(t('این کلید از قبل وجود دارد', 'Key already exists'));
      return;
    }
    setSettings(prev => [...prev, { key: newKey.trim(), value: newValue }]);
    setNewKey('');
    setNewValue('');
    setShowAdd(false);
  };

  const isLongValue = (value: string) => value.length > 100;

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t('تنظیمات سایت', 'Site Settings')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(`${settings.length} تنظیمه`, `${settings.length} settings`)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('بازنشانی', 'Refresh')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 size={14} className={`${isRtl ? 'ml-1' : 'mr-1'} animate-spin`} /> {t('ذخیره...', 'Saving...')}</>
            ) : (
              <><Save size={14} className={isRtl ? 'ml-1' : 'mr-1'} /> {t('ذخیره همه', 'Save All')}</>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Add Presets */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('افزودن سریع', 'Quick Add')}</h2>
        <div className="flex flex-wrap gap-2">
          {PRESET_KEYS.map(preset => {
            const exists = settings.find(s => s.key === preset.key);
            return (
              <button
                key={preset.key}
                onClick={() => handleAddPreset(preset.key)}
                disabled={!!exists}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  exists
                    ? 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {lang === 'fa' ? preset.fa : preset.en}
                {exists && <span className="ms-1.5 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings List */}
      <div className="flex flex-col gap-4">
        {settings.length === 0 && !showAdd && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <p className="text-sm">{t('تنظیمی وجود ندارد', 'No settings yet')}</p>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
              {t('افزودن تنظیم', 'Add Setting')}
            </Button>
          </div>
        )}

        {settings.map(setting => (
          <div key={setting.key} className="bg-card rounded-xl border border-border p-4 group">
            <div className="flex items-start justify-between gap-3 mb-2">
              <Label className="text-xs font-mono text-primary/80" dir="ltr">{setting.key}</Label>
              <button
                onClick={() => removeSetting(setting.key)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {isLongValue(setting.value) ? (
              <Textarea
                value={setting.value}
                onChange={e => updateSetting(setting.key, e.target.value)}
                rows={3}
                className="text-sm"
              />
            ) : (
              <Input
                value={setting.value}
                onChange={e => updateSetting(setting.key, e.target.value)}
                className="text-sm"
                dir={setting.key.includes('_en') ? 'ltr' : undefined}
              />
            )}
          </div>
        ))}

        {/* Custom Add */}
        {showAdd && (
          <div className="bg-card rounded-xl border border-dashed border-primary/30 p-4">
            <h3 className="text-sm font-medium mb-3">{t('تنظیم جدید', 'New Setting')}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <Label className="text-xs">{t('کلید', 'Key')}</Label>
                <Input
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="my_setting_key"
                  dir="ltr"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <Label className="text-xs">{t('مقدار', 'Value')}</Label>
                <Input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder={t('مقدار تنظیم', 'Setting value')}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={handleAddCustom}>
                  <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
                  {t('افزودن', 'Add')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                  {t('انصراف', 'Cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Button when there are settings */}
        {settings.length > 0 && !showAdd && (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="self-start">
            <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('تنظیم جدید', 'New Setting')}
          </Button>
        )}
      </div>
    </div>
  );
}
