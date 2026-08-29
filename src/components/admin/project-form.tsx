'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Project, type ProjectImage } from '@/store/use-app-store';
import {
  ArrowLeft, ArrowRight, Save, X, ImagePlus, Star, Film,
  Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ImageForm {
  url: string;
  altFa: string;
  altEn: string;
  isCover: boolean;
  isVideo: boolean;
  order: number;
}

export function ProjectForm() {
  const { lang, categories, editingProject, setEditingProject, setView, setProjects } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editingProject);
  const [fetchError, setFetchError] = useState(false);

  const [form, setForm] = useState({
    slug: '',
    titleFa: '',
    titleEn: '',
    descriptionFa: '',
    descriptionEn: '',
    clientFa: '',
    clientEn: '',
    locationFa: '',
    locationEn: '',
    year: '',
    status: 'published' as 'published' | 'draft',
    order: 0,
    categoryId: '',
    subcategoryId: '',
  });

  const [images, setImages] = useState<ImageForm[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load project data for editing
  useEffect(() => {
    if (editingProject) {
      setLoading(true);
      fetch(`/api/projects/${editingProject.id}`)
        .then(r => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => {
          setForm({
            slug: data.slug,
            titleFa: data.titleFa,
            titleEn: data.titleEn,
            descriptionFa: data.descriptionFa || '',
            descriptionEn: data.descriptionEn || '',
            clientFa: data.clientFa || '',
            clientEn: data.clientEn || '',
            locationFa: data.locationFa || '',
            locationEn: data.locationEn || '',
            year: data.year || '',
            status: data.status || 'published',
            order: data.order || 0,
            categoryId: data.categoryId,
            subcategoryId: data.subcategoryId || '',
          });
          setImages(
            (data.images || []).map((img: ProjectImage) => ({
              url: img.url,
              altFa: img.altFa || '',
              altEn: img.altEn || '',
              isCover: img.isCover,
              isVideo: img.isVideo || false,
              order: img.order,
            }))
          );
        })
        .catch(() => setFetchError(true))
        .finally(() => setLoading(false));
    }
  }, [editingProject]);

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const selectedCategory = categories.find(c => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'projects');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setImages(prev => [
          ...prev,
          {
            url: data.url,
            altFa: '',
            altEn: '',
            isCover: prev.length === 0,
            isVideo: data.isVideo || false,
            order: prev.length,
          },
        ]);
      }
    } catch {
      toast.error(t('خطا در آپلود تصویر', 'Image upload failed'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const updateImage = (index: number, field: keyof ImageForm, value: string | boolean) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // If setting isCover, unset others
      if (field === 'isCover' && value === true) {
        updated.forEach((img, i) => {
          if (i !== index) img.isCover = false;
        });
      }
      return updated;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the cover, set first image as cover
      if (prev[index].isCover && updated.length > 0) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.slug || !form.titleFa || !form.titleEn || !form.categoryId) {
      toast.error(t('فیلدهای الزامی را پر کنید', 'Fill required fields'));
      return;
    }

    setSaving(true);
    const body = {
      ...form,
      subcategoryId: form.subcategoryId || null,
      images: images.map((img, i) => ({
        url: img.url,
        altFa: img.altFa || null,
        altEn: img.altEn || null,
        isCover: img.isCover,
        isVideo: img.isVideo || false,
        order: i,
      })),
    };

    try {
      let res: Response;
      if (editingProject) {
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      toast.success(editingProject ? t('پروژه ویرایش شد', 'Project updated') : t('پروژه ایجاد شد', 'Project created'));

      // Refresh projects list
      const projectsRes = await fetch('/api/projects?all=true');
      const projectsData = await projectsRes.json();
      setProjects(projectsData);

      setEditingProject(null);
      setView('admin-projects');
    } catch (err) {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <AlertCircle size={32} />
        <p>{t('خطا در دریافت اطلاعات پروژه', 'Failed to load project data')}</p>
        <Button variant="outline" size="sm" onClick={() => setView('admin-projects')}>
          <BackArrow size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
          {t('بازگشت', 'Back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setEditingProject(null); setView('admin-projects'); }}>
          <BackArrow size={16} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {editingProject ? t('ویرایش پروژه', 'Edit Project') : t('پروژه جدید', 'New Project')}
          </h1>
          {editingProject && (
            <p className="text-xs text-muted-foreground">{editingProject.titleFa}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Info */}
        <section className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t('اطلاعات پایه', 'Basic Information')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('عنوان فارسی', 'Title (Persian)')} *</Label>
              <Input value={form.titleFa} onChange={e => updateField('titleFa', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('عنوان انگلیسی', 'Title (English)')} *</Label>
              <Input value={form.titleEn} onChange={e => updateField('titleEn', e.target.value)} dir="ltr" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t('اسلاگ', 'Slug')} *</Label>
            <Input value={form.slug} onChange={e => updateField('slug', e.target.value)} dir="ltr" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('دسته‌بندی', 'Category')} *</Label>
              <Select value={form.categoryId} onValueChange={v => updateField('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('انتخاب دسته‌بندی', 'Select category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {lang === 'fa' ? cat.titleFa : cat.titleEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('زیردسته', 'Subcategory')}</Label>
              <Select
                value={form.subcategoryId}
                onValueChange={v => updateField('subcategoryId', v)}
                disabled={!subcategories.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('انتخاب زیردسته', 'Select subcategory')} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {lang === 'fa' ? sub.titleFa : sub.titleEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('سال', 'Year')}</Label>
              <Input value={form.year} onChange={e => updateField('year', e.target.value)} dir="ltr" placeholder="1403" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('کارفرما (فارسی)', 'Client (Persian)')}</Label>
              <Input value={form.clientFa} onChange={e => updateField('clientFa', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('کارفرما (انگلیسی)', 'Client (English)')}</Label>
              <Input value={form.clientEn} onChange={e => updateField('clientEn', e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('موقعیت (فارسی)', 'Location (Persian)')}</Label>
              <Input value={form.locationFa} onChange={e => updateField('locationFa', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('موقعیت (انگلیسی)', 'Location (English)')}</Label>
              <Input value={form.locationEn} onChange={e => updateField('locationEn', e.target.value)} dir="ltr" />
            </div>
          </div>
        </section>

        {/* Descriptions */}
        <section className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t('توضیحات', 'Descriptions')}</h2>
          <div className="flex flex-col gap-2">
            <Label>{t('توضیحات فارسی', 'Description (Persian)')}</Label>
            <Textarea value={form.descriptionFa} onChange={e => updateField('descriptionFa', e.target.value)} rows={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t('توضیحات انگلیسی', 'Description (English)')}</Label>
            <Textarea value={form.descriptionEn} onChange={e => updateField('descriptionEn', e.target.value)} dir="ltr" rows={3} />
          </div>
        </section>

        {/* Images */}
        <section className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {t(`تصاویر و ویدیو (${images.length})`, `Images & Videos (${images.length})`)}
            </h2>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:border-primary/50 cursor-pointer transition-colors">
              {uploadingImage ? (
                <><Loader2 size={14} className="animate-spin" /> {t('آپلود...', 'Uploading...')}</>
              ) : (
                <><ImagePlus size={14} /> {t('آپلود تصویر/ویدیو', 'Upload Image/Video')}</>
              )}
              <input type="file" accept="image/*,video/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
          </div>

          {images.length === 0 ? (
            <div className="flex items-center justify-center py-10 border border-dashed border-border rounded-lg text-sm text-muted-foreground">
              {t('هنوز تصویری آپلود نشده', 'No images uploaded yet')}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {images.map((img, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg border border-border bg-background/50 group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border relative">
                    {img.isVideo ? (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <Film size={20} />
                      </div>
                    ) : (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {img.isVideo && (
                      <div className="absolute bottom-1 left-1 bg-primary/80 text-primary-foreground rounded px-1 py-0.5 text-[8px] font-medium">
                        {t('ویدیو', 'Video')}
                      </div>
                    )}
                    {img.isCover && (
                      <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-[9px] font-medium flex items-center gap-0.5">
                        <Star size={8} /> {t('کاور', 'Cover')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={img.altFa}
                        onChange={e => updateImage(index, 'altFa', e.target.value)}
                        placeholder={t('ALT فارسی', 'ALT (Fa)')}
                        className="text-xs h-8"
                      />
                      <Input
                        value={img.altEn}
                        onChange={e => updateImage(index, 'altEn', e.target.value)}
                        placeholder={t('ALT انگلیسی', 'ALT (En)')}
                        dir="ltr"
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <Switch
                          checked={img.isCover}
                          onCheckedChange={v => updateImage(index, 'isCover', v)}
                          className="scale-75"
                        />
                        {t('کاور', 'Cover')}
                      </label>
                      <span className="text-[10px] text-muted-foreground" dir="ltr">#{index + 1}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors self-start opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Publishing */}
        <section className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t('انتشار', 'Publishing')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('وضعیت', 'Status')}</Label>
              <Select value={form.status} onValueChange={v => updateField('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">{t('منتشر شده', 'Published')}</SelectItem>
                  <SelectItem value="draft">{t('پیش‌نویس', 'Draft')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('ترتیب نمایش', 'Display Order')}</Label>
              <Input
                type="number"
                value={form.order}
                onChange={e => updateField('order', parseInt(e.target.value) || 0)}
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setEditingProject(null); setView('admin-projects'); }}
          >
            {t('انصراف', 'Cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 size={14} className={`${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} /> {t('در حال ذخیره...', 'Saving...')}</>
            ) : (
              <><Save size={14} className={isRtl ? 'ml-2' : 'mr-2'} /> {t('ذخیره', 'Save')}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
