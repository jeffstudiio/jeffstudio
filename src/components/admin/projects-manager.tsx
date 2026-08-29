'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore, type Project } from '@/store/use-app-store';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Image as ImageIcon, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function ProjectsManager() {
  const { lang, projects, setProjects, categories, setView, setEditingProject } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?all=true');
      const data = await res.json();
      setProjects(data);
    } catch {
      toast.error(t('خطا در دریافت پروژه‌ها', 'Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.categoryId === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.titleFa.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, statusFilter, categoryFilter, search]);

  const handleNewProject = () => {
    setEditingProject(null);
    setView('admin-project-form');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setView('admin-project-form');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(t('پروژه حذف شد', 'Project deleted'));
      fetchProjects();
    } catch {
      toast.error(t('خطا در حذف پروژه', 'Failed to delete project'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? (lang === 'fa' ? cat.titleFa : cat.titleEn) : '—';
  };

  const getCoverImage = (project: Project) => {
    return project.images.find(img => img.isCover)?.url || project.images[0]?.url || null;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t('مدیریت پروژه‌ها', 'Projects Management')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(`${projects.length} پروژه ( ${filteredProjects.length} نمایش داده شده)`, `${projects.length} projects (${filteredProjects.length} shown)`)}
          </p>
        </div>
        <Button onClick={handleNewProject} size="sm">
          <Plus size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
          {t('پروژه جدید', 'New Project')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('جستجو در پروژه‌ها...', 'Search projects...')}
            className={`${isRtl ? 'pr-10' : 'pl-10'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1">
            {[{ value: 'all', fa: 'همه', en: 'All' }, { value: 'published', fa: 'منتشر شده', en: 'Published' }, { value: 'draft', fa: 'پیش‌نویس', en: 'Draft' }].map(item => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === item.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {lang === 'fa' ? item.fa : item.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{t('دسته‌بندی:', 'Category:')}</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              categoryFilter === 'all'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('همه', 'All')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang === 'fa' ? cat.titleFa : cat.titleEn}
            </button>
          ))}
        </div>
      )}

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ImageIcon size={40} className="opacity-30" />
          <p>{t('پروژه‌ای یافت نشد', 'No projects found')}</p>
          <Button variant="outline" size="sm" onClick={handleNewProject}>
            <Plus size={14} className={isRtl ? 'ml-1' : 'mr-1'} />
            {t('ایجاد پروژه', 'Create Project')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          {filteredProjects.map(project => {
            const cover = getCoverImage(project);
            return (
              <div
                key={project.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm truncate">{lang === 'fa' ? project.titleFa : project.titleEn}</h3>
                    <Badge
                      variant={project.status === 'published' ? 'default' : 'secondary'}
                      className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                        project.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {project.status === 'published'
                        ? (lang === 'fa' ? 'منتشر شده' : 'Published')
                        : (lang === 'fa' ? 'پیش‌نویس' : 'Draft')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {lang === 'fa' ? project.titleEn : project.titleFa}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span>{getCategoryName(project.categoryId)}</span>
                    {project.subcategory && (
                      <span>→ {lang === 'fa' ? project.subcategory.titleFa : project.subcategory.titleEn}</span>
                    )}
                    {project.year && <span>{project.year}</span>}
                    <span>{project.images.length} {t('تصویر', 'imgs')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={t('ویرایش', 'Edit')}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title={t('حذف', 'Delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-destructive" />
              {t('حذف پروژه', 'Delete Project')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `آیا از حذف «${deleteTarget?.titleFa}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
                `Are you sure you want to delete "${deleteTarget?.titleEn}"? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('انصراف', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90 text-white">
              {deleting ? t('در حال حذف...', 'Deleting...') : t('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
