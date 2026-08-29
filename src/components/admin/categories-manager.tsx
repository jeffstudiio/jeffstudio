'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type Category, type SubCategory } from '@/store/use-app-store';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, FolderOpen, Image as ImageIcon, Upload, X, GripVertical, Check, AlertCircle, Film, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function CategoriesManager() {
  const { lang, categories, setCategories } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Controlled form fields for category dialog
  const [formTitleFa, setFormTitleFa] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formDescFa, setFormDescFa] = useState('');
  const [formDescEn, setFormDescEn] = useState('');

  // Subcategory dialog
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subParentId, setSubParentId] = useState<string>('');
  const [editSub, setEditSub] = useState<SubCategory | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<SubCategory | null>(null);

  // Controlled form fields for subcategory dialog
  const [subFormTitleFa, setSubFormTitleFa] = useState('');
  const [subFormTitleEn, setSubFormTitleEn] = useState('');
  const [subFormSlug, setSubFormSlug] = useState('');
  const [subFormOrder, setSubFormOrder] = useState(0);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error(t('خطا در دریافت دسته‌بندی‌ها', 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, [setCategories]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = () => {
    setEditCategory(null);
    setCoverPreview(null);
    setVideoPreview(null);
    setFormTitleFa('');
    setFormTitleEn('');
    setFormSlug('');
    setFormOrder(0);
    setFormDescFa('');
    setFormDescEn('');
    setIsDialogOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setCoverPreview(cat.coverImage || null);
    setVideoPreview(cat.videoUrl || null);
    setFormTitleFa(cat.titleFa || '');
    setFormTitleEn(cat.titleEn || '');
    setFormSlug(cat.slug || '');
    setFormOrder(cat.order ?? 0);
    setFormDescFa(cat.descriptionFa || '');
    setFormDescEn(cat.descriptionEn || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/categories?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(t('دسته‌بندی حذف شد', 'Category deleted'));
      fetchCategories();
    } catch {
      toast.error(t('خطا در حذف دسته‌بندی', 'Failed to delete category'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      slug: formSlug,
      titleFa: formTitleFa,
      titleEn: formTitleEn,
      descriptionFa: formDescFa || null,
      descriptionEn: formDescEn || null,
      coverImage: coverPreview,
      videoUrl: videoPreview,
      order: formOrder,
    };

    if (!data.slug || !data.titleFa || !data.titleEn) {
      toast.error(t('فیلدهای الزامی را پر کنید', 'Fill required fields'));
      return;
    }

    try {
      const method = editCategory ? 'PUT' : 'POST';
      const body = editCategory ? { id: editCategory.id, ...data } : data;
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editCategory ? t('دسته‌بندی ویرایش شد', 'Category updated') : t('دسته‌بندی ایجاد شد', 'Category created'));
      setIsDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error(t('خطا در ذخیره‌سازی', 'Failed to save'));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCoverPreview(data.url);
      toast.success(t('تصویر آپلود شد', 'Image uploaded'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(t(`خطا در آپلود تصویر${msg ? ': ' + msg : ''}`, `Upload failed${msg ? ': ' + msg : ''}`));
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.isVideo) {
        toast.error(t('لطفاً فایل ویدیویی انتخاب کنید', 'Please select a video file'));
        return;
      }
      setVideoPreview(data.url);
      toast.success(t('ویدیو آپلود شد', 'Video uploaded'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(t(`خطا در آپلود ویدیو${msg ? ': ' + msg : ''}`, `Video upload failed${msg ? ': ' + msg : ''}`));
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  // --- Subcategory CRUD ---

  const openSubCreate = (catId: string) => {
    setSubParentId(catId);
    setEditSub(null);
    setSubFormTitleFa('');
    setSubFormTitleEn('');
    setSubFormSlug('');
    setSubFormOrder(0);
    setSubDialogOpen(true);
  };

  const openSubEdit = (catId: string, sub: SubCategory) => {
    setSubParentId(catId);
    setEditSub(sub);
    setSubFormTitleFa(sub.titleFa || '');
    setSubFormTitleEn(sub.titleEn || '');
    setSubFormSlug(sub.slug || '');
    setSubFormOrder(sub.order ?? 0);
    setSubDialogOpen(true);
  };

  const handleSubSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const titleFa = subFormTitleFa;
    const titleEn = subFormTitleEn;
    const slug = subFormSlug;
    const order = subFormOrder;

    if (!titleFa || !titleEn || !slug) {
      toast.error(t('فیلدهای الزامی زیردسته را پر کنید', 'Fill required subcategory fields'));
      return;
    }

    try {
      if (editSub) {
        // Update
        const res = await fetch('/api/subcategories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editSub.id, titleFa, titleEn, slug, order }),
        });
        if (!res.ok) throw new Error();
        toast.success(t('زیردسته ویرایش شد', 'Subcategory updated'));
      } else {
        // Create
        const res = await fetch('/api/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: subParentId, slug, titleFa, titleEn, order }),
        });
        if (!res.ok) throw new Error();
        toast.success(t('زیردسته اضافه شد', 'Subcategory added'));
      }
      setSubDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error(t('خطا در ذخیره زیردسته', 'Failed to save subcategory'));
    }
  };

  const handleSubDelete = async () => {
    if (!deleteSubTarget) return;
    try {
      const res = await fetch(`/api/subcategories?id=${deleteSubTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(t('زیردسته حذف شد', 'Subcategory deleted'));
      fetchCategories();
    } catch {
      toast.error(t('خطا در حذف زیردسته', 'Failed to delete subcategory'));
    } finally {
      setDeleteSubTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t('مدیریت دسته‌بندی‌ها', 'Categories Management')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(`${categories.length} دسته‌بندی`, `${categories.length} categories`)}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
          {t('دسته جدید', 'New Category')}
        </Button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <FolderOpen size={40} className="opacity-30" />
          <p>{t('دسته‌بندی یافت نشد', 'No categories found')}</p>
          <Button variant="outline" size="sm" onClick={handleCreate}>
            <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('ایجاد دسته‌بندی', 'Create Category')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              lang={lang}
              isExpanded={expandedId === cat.id}
              onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              onEdit={handleEdit}
              onDelete={() => setDeleteTarget(cat)}
              onAddSub={openSubCreate}
              onEditSub={(sub) => openSubEdit(cat.id, sub)}
              onDeleteSub={(sub) => setDeleteSubTarget(sub)}
            />
          ))}
        </div>
      )}

      {/* ===== Category Create/Edit Dialog ===== */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setCoverPreview(null); setVideoPreview(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? t(`ویرایش: ${formTitleFa || editCategory.titleFa}`, `Edit: ${formTitleEn || editCategory.titleEn}`) : t('دسته‌بندی جدید', 'New Category')}
            </DialogTitle>
          </DialogHeader>
          <form id="category-form" onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان فارسی', 'Title (Persian)')} *</Label>
                <Input name="titleFa" value={formTitleFa} onChange={(e) => setFormTitleFa(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان انگلیسی', 'Title (English)')} *</Label>
                <Input name="titleEn" value={formTitleEn} onChange={(e) => setFormTitleEn(e.target.value)} dir="ltr" required />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('اسلاگ', 'Slug')} *</Label>
              <Input name="slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} dir="ltr" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('ترتیب', 'Order')}</Label>
                <Input name="order" type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} dir="ltr" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('تصویر کاور', 'Cover Image')}</Label>
                <div className="flex items-center gap-2">
                  {coverPreview ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border flex-shrink-0">
                      <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverPreview(null)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : null}
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground hover:border-primary/50 cursor-pointer transition-colors">
                    {uploadingCover ? <span>{t('آپلود...', 'Uploading...')}</span> : <><Upload size={14} /> {t('انتخاب تصویر', 'Choose image')}</>}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                  </label>
                </div>
              </div>
            </div>
            {/* Video Upload */}
            <div className="flex flex-col gap-2">
              <Label>{t('ویدیو دسته‌بندی (اختیاری)', 'Category Video (Optional)')}</Label>
              <div className="flex items-center gap-2">
                {videoPreview ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
                    <Video size={16} className="text-primary" />
                    <button
                      type="button"
                      onClick={() => setVideoPreview(null)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : null}
                <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:border-primary/50 cursor-pointer transition-colors ${videoPreview ? 'border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
                  {uploadingVideo ? <span>{t('در حال آپلود ویدیو...', 'Uploading video...')}</span> : <><Film size={14} /> {videoPreview ? t('تغییر ویدیو', 'Change video') : t('انتخاب ویدیو', 'Choose video')}</>}
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                </label>
              </div>
              {videoPreview && (
                <video src={videoPreview} controls className="w-full rounded-md border border-border mt-1 max-h-40" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('توضیحات فارسی', 'Description (Persian)')}</Label>
              <Textarea name="descriptionFa" value={formDescFa} onChange={(e) => setFormDescFa(e.target.value)} rows={2} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('توضیحات انگلیسی', 'Description (English)')}</Label>
              <Textarea name="descriptionEn" value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)} dir="ltr" rows={2} />
            </div>
            {/* Subcategories list (read-only in category edit) */}
            {editCategory && (editCategory.subcategories?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-2">
                <Label>{t('زیردسته‌ها (از لیست باز/بسته مدیریت کنید)', 'Subcategories (manage from list below)')}</Label>
                <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-background border border-border">
                  {editCategory.subcategories.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-card transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{idx + 1}</Badge>
                        <span>{lang === 'fa' ? sub.titleFa : sub.titleEn}</span>
                      </div>
                      <span className="text-xs text-muted-foreground" dir="ltr">{sub.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setCoverPreview(null); setVideoPreview(null); }}>
              {t('انصراف', 'Cancel')}
            </Button>
            <Button type="submit" form="category-form">
              <Check size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
              {t('ذخیره', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Subcategory Create/Edit Dialog ===== */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editSub ? t('ویرایش زیردسته', 'Edit Subcategory') : t('زیردسته جدید', 'New Subcategory')}
            </DialogTitle>
          </DialogHeader>
          <form id="sub-form" onSubmit={handleSubSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان فارسی', 'Title (Persian)')} *</Label>
                <Input name="subTitleFa" value={subFormTitleFa} onChange={(e) => setSubFormTitleFa(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('عنوان انگلیسی', 'Title (English)')} *</Label>
                <Input name="subTitleEn" value={subFormTitleEn} onChange={(e) => setSubFormTitleEn(e.target.value)} dir="ltr" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('اسلاگ', 'Slug')} *</Label>
                <Input name="subSlug" value={subFormSlug} onChange={(e) => setSubFormSlug(e.target.value)} dir="ltr" required placeholder="e.g. residential" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('ترتیب', 'Order')}</Label>
                <Input name="subOrder" type="number" value={subFormOrder} onChange={(e) => setSubFormOrder(parseInt(e.target.value) || 0)} dir="ltr" />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialogOpen(false)}>
              {t('انصراف', 'Cancel')}
            </Button>
            <Button type="submit" form="sub-form">
              <Check size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
              {t('ذخیره', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Category Confirmation ===== */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-destructive" />
              {t('حذف دسته‌بندی', 'Delete Category')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `آیا از حذف «${deleteTarget?.titleFa}» مطمئن هستید؟ تمام زیردسته‌ها و پروژه‌های مرتبط هم حذف خواهند شد.`,
                `Are you sure you want to delete "${deleteTarget?.titleEn}"? All subcategories and related projects will also be deleted.`
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

      {/* ===== Delete Subcategory Confirmation ===== */}
      <AlertDialog open={!!deleteSubTarget} onOpenChange={() => setDeleteSubTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-destructive" />
              {t('حذف زیردسته', 'Delete Subcategory')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `آیا از حذف «${deleteSubTarget?.titleFa}» مطمئن هستید؟`,
                `Are you sure you want to delete "${deleteSubTarget?.titleEn}"?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('انصراف', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {t('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ========== Category Card Component ========== */

function CategoryCard({
  category,
  lang,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddSub,
  onEditSub,
  onDeleteSub,
}: {
  category: Category;
  lang: 'fa' | 'en';
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (cat: Category) => void;
  onDelete: () => void;
  onAddSub: (catId: string) => void;
  onEditSub: (sub: SubCategory) => void;
  onDeleteSub: (sub: SubCategory) => void;
}) {
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;
  const subs = category.subcategories || [];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-colors hover:border-primary/20">
      <div className="flex items-center gap-4 p-4">
        {/* Cover Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
          {category.videoUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10">
              <Film size={18} className="text-primary" />
              <span className="text-[8px] text-primary mt-0.5">{t('ویدیو', 'Video')}</span>
            </div>
          ) : category.coverImage ? (
            <img src={category.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-medium truncate">{lang === 'fa' ? category.titleFa : category.titleEn}</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {category.order}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {lang === 'fa' ? category.titleEn : category.titleFa}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FolderOpen size={12} />
              {subs.length} {t('زیردسته', 'sub')}
            </span>
            <span dir="ltr">/{category.slug}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={t('زیردسته‌ها', 'Subcategories')}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={t('ویرایش', 'Edit')}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            title={t('حذف', 'Delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Subcategories */}
      {isExpanded && (
        <div className="border-t border-border bg-background/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t('زیردسته‌ها', 'Subcategories')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSub(category.id)}
              className="text-xs h-7"
            >
              <Plus size={12} className={isRtl ? 'ml-1' : 'mr-1'} />
              {t('افزودن زیردسته', 'Add Sub')}
            </Button>
          </div>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('زیردسته‌ای وجود ندارد', 'No subcategories yet')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">{sub.order}</Badge>
                    <span className="truncate">{lang === 'fa' ? sub.titleFa : sub.titleEn}</span>
                </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => onEditSub(sub)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title={t('ویرایش زیردسته', 'Edit sub')}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteSub(sub)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title={t('حذف زیردسته', 'Delete sub')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}