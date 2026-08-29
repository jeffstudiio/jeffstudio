'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Download, Upload, Database, FileJson, HardDrive, AlertCircle, CheckCircle2, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function BackupManager() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Export ─── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jeff-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show backup summary
      const d = data.data;
      setBackupInfo({
        categories: d.categories?.length || 0,
        subcategories: d.subcategories?.length || 0,
        projects: d.projects?.length || 0,
        images: d.projectImages?.length || 0,
        services: d.services?.length || 0,
        settings: d.settings?.length || 0,
        messages: d.messages?.length || 0,
        files: data.uploadedFiles?.length || 0,
        exportedAt: data.exportedAt,
      });

      toast.success(t('بکآپ با موفقیت دانلود شد', 'Backup downloaded successfully'));
    } catch {
      toast.error(t('خطا در دریافت بکآپ', 'Failed to export backup'));
    } finally {
      setExporting(false);
    }
  };

  /* ─── Import ─── */
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validate structure
      if (!backupData.data) {
        toast.error(t('فایل بکآپ نامعتبر است', 'Invalid backup file'));
        return;
      }

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: backupData.data, mode: importMode }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success(t(
        `بازیابی موفق: ${result.results?.map((r: any) => `${r.table}(${r.count})`).join(', ')}`,
        `Restored: ${result.results?.map((r: any) => `${r.table}(${r.count})`).join(', ')}`
      ));
      setBackupInfo(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(t(`خطا در بازیابی${msg ? ': ' + msg : ''}`, `Restore failed${msg ? ': ' + msg : ''}`));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">{t('بکآپ و بازیابی', 'Backup & Restore')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('از تمام محتوای سایت بکآپ بگیرید یا بازیابی کنید', 'Backup or restore all site content')}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Download size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">{t('دانلود بکآپ', 'Download Backup')}</h3>
              <p className="text-xs text-muted-foreground">{t('فایل JSON از تمام داده‌ها', 'JSON file of all data')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><FileJson size={12} /> {t('دسته‌بندی‌ها، پروژه‌ها، خدمات، تنظیمات و...', 'Categories, projects, services, settings & more')}</div>
            <div className="flex items-center gap-2"><HardDrive size={12} /> {t('لیست فایل‌های آپلود شده', 'List of uploaded files')}</div>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="mt-auto">
            {exporting ? (
              <><Loader2 size={16} className={`${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} /> {t('در حال آماده‌سازی...', 'Preparing...')}</>
            ) : (
              <><Download size={16} className={`${isRtl ? 'ml-2' : 'mr-2'}`} /> {t('دانلود بکآپ', 'Download Backup')}</>
            )}
          </Button>
        </div>

        {/* Import Card */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Upload size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium">{t('بازیابی بکآپ', 'Restore Backup')}</h3>
              <p className="text-xs text-muted-foreground">{t('بارگذاری فایل بکآپ JSON', 'Upload a JSON backup file')}</p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">{t('حالت بازیابی:', 'Restore mode:')}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setImportMode('merge')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  importMode === 'merge'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <RefreshCw size={12} className={isRtl ? 'ml-1 inline' : 'mr-1 inline'} />
                {t('ادغام (توصیه شده)', 'Merge (Recommended)')}
              </button>
              <button
                onClick={() => setImportMode('replace')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  importMode === 'replace'
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border text-muted-foreground hover:border-destructive/40'
                }`}
              >
                <Trash2 size={12} className={isRtl ? 'ml-1 inline' : 'mr-1 inline'} />
                {t('جایگزینی کامل', 'Full Replace')}
              </button>
            </div>
          </div>

          {importMode === 'replace' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive">
                {t(
                  'توجه: در حالت جایگزینی، تمام داده‌های فعلی حذف و با بکآپ جایگزین می‌شود.',
                  'Warning: Replace mode will delete all current data and replace with backup.'
                )}
              </p>
            </div>
          )}

          <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors mt-auto ${
            importing ? 'border-border text-muted-foreground' : 'border-primary/50 text-primary hover:bg-primary/5'
          }`}>
            {importing ? (
              <><Loader2 size={16} className="animate-spin" /> {t('در حال بازیابی...', 'Restoring...')}</>
            ) : (
              <><Upload size={16} /> {t('انتخاب فایل بکآپ', 'Choose backup file')}</>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Last Backup Info */}
      {backupInfo && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <h3 className="text-sm font-medium">{t('آخرین بکآپ', 'Last Backup')}</h3>
            <span className="text-xs text-muted-foreground mr-auto" dir="ltr">{new Date(backupInfo.exportedAt).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('دسته‌بندی', 'Categories'), value: backupInfo.categories, icon: <Database size={12} /> },
              { label: t('پروژه', 'Projects'), value: backupInfo.projects, icon: <Database size={12} /> },
              { label: t('تصاویر', 'Images'), value: backupInfo.images, icon: <HardDrive size={12} /> },
              { label: t('خدمات', 'Services'), value: backupInfo.services, icon: <Database size={12} /> },
              { label: t('تنظیمات', 'Settings'), value: backupInfo.settings, icon: <FileJson size={12} /> },
              { label: t('پیام‌ها', 'Messages'), value: backupInfo.messages, icon: <Database size={12} /> },
              { label: t('فایل آپلود', 'Uploaded Files'), value: backupInfo.files, icon: <HardDrive size={12} /> },
              { label: t('زیردسته', 'Subcategories'), value: backupInfo.subcategories, icon: <Database size={12} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-background">
                {item.icon}
                <span>{item.label}:</span>
                <span className="font-medium text-foreground ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
