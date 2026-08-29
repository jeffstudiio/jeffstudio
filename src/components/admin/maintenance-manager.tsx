'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Search, FileCode, Eye, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronRight, FolderOpen, Wrench, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PatchFile {
  path: string;
  size: number;
}

interface PatchResult {
  found: boolean;
  count: number;
  message: string;
  preview: {
    filePath: string;
    before: string;
    matched: string;
    after: string;
    totalLines: number;
    matchedLineStart: number;
  } | null;
  appliedAt?: string;
}

export function MaintenanceManager() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const t = (fa: string, en: string) => lang === 'fa' ? fa : en;

  const [files, setFiles] = useState<PatchFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [fileSearch, setFileSearch] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  // Patch form
  const [selectedFile, setSelectedFile] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [replaceCode, setReplaceCode] = useState('');
  const [patching, setPatching] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [lastResult, setLastResult] = useState<PatchResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // File tree
  const fetchFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const res = await fetch('/api/patch');
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      toast.error(t('خطا در دریافت لیست فایل‌ها', 'Failed to fetch file list'));
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const filteredFiles = files.filter(f =>
    !fileSearch.trim() || f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  // Build directory tree
  const tree: Record<string, PatchFile[]> = {};
  for (const f of filteredFiles) {
    const parts = f.path.split('/');
    const dir = parts.slice(0, -1).join('/');
    if (!tree[dir]) tree[dir] = [];
    tree[dir].push(f);
  }
  const dirKeys = Object.keys(tree).sort();

  const toggleDir = (dir: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir); else next.add(dir);
      return next;
    });
  };

  const selectFile = (path: string) => {
    setSelectedFile(path);
    setSearchCode('');
    setReplaceCode('');
    setLastResult(null);
    setShowPreview(false);
  };

  /* ─── Preview ─── */
  const handlePreview = async () => {
    if (!selectedFile || !searchCode.trim()) {
      toast.error(t('فایل و کد جستجو را وارد کنید', 'Enter file path and search code'));
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch('/api/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile, searchCode, replaceCode: '', action: 'preview' }),
      });
      const result: PatchResult = await res.json();
      if (!res.ok) throw new Error(result.error);
      setLastResult(result);
      setShowPreview(true);
      if (!result.found) {
        toast.warning(t('الگو یافت نشد', 'Pattern not found'));
      } else {
        toast.success(t(`${result.count} مورد یافت شد`, `Found ${result.count} occurrence(s)`));
      }
    } catch (err) {
      toast.error(t('خطا در جستجو', 'Search failed'));
    } finally {
      setPreviewing(false);
    }
  };

  /* ─── Apply Patch ─── */
  const handleApply = async () => {
    if (!selectedFile || !searchCode.trim()) {
      toast.error(t('فایل و کد جستجو را وارد کنید', 'Enter file path and search code'));
      return;
    }
    setPatching(true);
    try {
      const res = await fetch('/api/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile, searchCode, replaceCode, action: 'apply' }),
      });
      const result: PatchResult = await res.json();
      if (!res.ok) throw new Error(result.error);
      setLastResult(result);
      setShowPreview(true);
      if (result.found) {
        toast.success(t(`پچ موفق: ${result.count} مورد جایگزین شد`, `Patch applied: ${result.count} occurrence(s) replaced`));
      } else {
        toast.warning(t('الگو یافت نشد', 'Pattern not found'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(t(`خطا: ${msg}`, `Error: ${msg}`));
    } finally {
      setPatching(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">{t('به‌روزرسانی و رفع باگ', 'Updates & Bug Fixes')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('جستجو، پیش‌نمایش و اعمال تغییرات کد بدون بارگذاری مجدد قالب', 'Search, preview & apply code changes without re-uploading template')}
        </p>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">{t('چگونه کار می‌کند؟', 'How it works?')}</p>
          <p>{t(
            '۱. فایل مورد نظر را از لیست انتخاب کنید یا مسیر آن را وارد کنید\n۲. کد فعلی (بخشی که می‌خواهید تغییر دهد) را در "کد فعلی" وارد کنید\n۳. کد جدید را در "کد جایگزین" وارد کنید\n۴. ابتدا "پیش‌نمایش" بزنید تا مطمئن شوید درست پیدا شده\n۵. سپس "اعمال تغییر" بزنید',
            '1. Select a file or enter its path\n2. Paste the current code (the part you want to change) in "Current Code"\n3. Paste the new code in "Replacement Code"\n4. Click "Preview" first to verify it was found\n5. Then click "Apply" to make the change'
          )}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: File Browser */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border flex flex-col max-h-[70vh]">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
              <Input
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder={t('جستجوی فایل...', 'Search files...')}
                className={`text-xs h-8 ${isRtl ? 'pr-9' : 'pl-9'}`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filesLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {dirKeys.map(dir => (
                  <div key={dir}>
                    <button
                      onClick={() => toggleDir(dir)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {expandedDirs.has(dir) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <FolderOpen size={12} />
                      <span className="truncate">{dir}/</span>
                      <span className="ml-auto text-[10px]">{tree[dir].length}</span>
                    </button>
                    {expandedDirs.has(dir) && (
                      <div className={`${isRtl ? 'mr-5' : 'ml-5'} flex flex-col gap-0.5`}>
                        {tree[dir].map(f => (
                          <button
                            key={f.path}
                            onClick={() => selectFile(f.path)}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors truncate ${
                              selectedFile === f.path
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <FileCode size={12} className="flex-shrink-0" />
                            <span className="truncate">{f.path.split('/').pop()}</span>
                            <span className="ml-auto text-[10px] opacity-50">{formatSize(f.size)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Patch Form */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Selected File */}
          <div className="bg-card rounded-xl border border-border p-4">
            <Label className="text-xs mb-2 block">{t('فایل هدف', 'Target File')}</Label>
            <Input
              value={selectedFile}
              onChange={(e) => selectFile(e.target.value)}
              placeholder={t('مثال: src/components/portfolio/header.tsx', 'e.g. src/components/portfolio/header.tsx')}
              dir="ltr"
              className="text-xs font-mono"
            />
          </div>

          {/* Search & Replace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-2">
              <Label className="text-xs">{t('کد فعلی (جستجو)', 'Current Code (Search)')}</Label>
              <Textarea
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={t('کدی که می‌خواهید پیدا و تغییر دهید...', 'Code to find and replace...')}
                dir="ltr"
                className="font-mono text-xs min-h-[160px] resize-y"
                rows={8}
              />
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-2">
              <Label className="text-xs">{t('کد جایگزین (جدید)', 'Replacement Code (New)')}</Label>
              <Textarea
                value={replaceCode}
                onChange={(e) => setReplaceCode(e.target.value)}
                placeholder={t('کد جدید که جایگزین شود...', 'New code to replace with...')}
                dir="ltr"
                className="font-mono text-xs min-h-[160px] resize-y"
                rows={8}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewing || !selectedFile || !searchCode.trim()}
            >
              {previewing ? <><Loader2 size={14} className={`${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} /> {t('جستجو...', 'Searching...')}</> : <><Eye size={14} className={`${isRtl ? 'ml-2' : 'mr-2'}`} /> {t('پیش‌نمایش', 'Preview')}</>}
            </Button>
            <Button
              onClick={handleApply}
              disabled={patching || !selectedFile || !searchCode.trim()}
            >
              {patching ? <><Loader2 size={14} className={`${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} /> {t('اعمال...', 'Applying...')}</> : <><Zap size={14} className={`${isRtl ? 'ml-2' : 'mr-2'}`} /> {t('اعمال تغییر', 'Apply Change')}</>}
            </Button>
          </div>

          {/* Preview Result */}
          {showPreview && lastResult?.preview && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                {lastResult.found ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={16} className="text-amber-500" />
                )}
                <span className="text-sm font-medium">{lastResult.message}</span>
                {lastResult.appliedAt && (
                  <span className="text-[10px] text-muted-foreground mr-auto" dir="ltr">{new Date(lastResult.appliedAt).toLocaleString()}</span>
                )}
              </div>
              {lastResult.preview && (
                <div className="flex flex-col gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{t('فایل:', 'File:')}</span>
                    <span dir="ltr" className="text-foreground">{lastResult.preview.filePath}</span>
                    <span className="text-[10px]">{t('خط', 'Line')} {lastResult.preview.matchedLineStart} / {lastResult.preview.totalLines}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border overflow-x-auto">
                    <div className="text-muted-foreground whitespace-pre-wrap break-all">{lastResult.preview.before}<span className="bg-primary/20 text-primary px-0.5 rounded">{lastResult.preview.matched}</span>{lastResult.preview.after}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
