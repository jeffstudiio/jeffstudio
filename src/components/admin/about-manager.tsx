'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2, Upload, User, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface SkillItem {
  nameFa: string;
  nameEn: string;
  level: number;
}

interface StatItem {
  num: string;
  labelFa: string;
  labelEn: string;
}

interface ExpItem {
  titleFa: string;
  titleEn: string;
  orgFa: string;
  orgEn: string;
  type: string;
}

interface EduItem {
  titleFa: string;
  titleEn: string;
}

interface AboutData {
  id: string;
  profilePhoto: string;
  bioFa: string;
  bioEn: string;
  subtitleFa: string;
  subtitleEn: string;
  skillsJson: string;
  statsJson: string;
  experienceJson: string;
  educationJson: string;
}

export function AboutManager() {
  const { lang } = useAppStore();
  const [data, setData] = useState<AboutData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bioFa, setBioFa] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [subtitleFa, setSubtitleFa] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [experience, setExperience] = useState<ExpItem[]>([]);
  const [education, setEducation] = useState<EduItem[]>([]);

  const t = (fa: string, en: string) => (lang === 'fa' ? fa : en);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/about');
      const json = await res.json();
      if (json.error) return;
      setData(json);
      setBioFa(json.bioFa || '');
      setBioEn(json.bioEn || '');
      setSubtitleFa(json.subtitleFa || '');
      setSubtitleEn(json.subtitleEn || '');
      try { setSkills(JSON.parse(json.skillsJson || '[]')); } catch { setSkills([]); }
      try { setStats(JSON.parse(json.statsJson || '[]')); } catch { setStats([]); }
      try { setExperience(JSON.parse(json.experienceJson || '[]')); } catch { setExperience([]); }
      try { setEducation(JSON.parse(json.educationJson || '[]')); } catch { setEducation([]); }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (json.url) {
        setData((prev) => prev ? { ...prev, profilePhoto: json.url } : prev);
        toast.success(t('عکس آپلود شد', 'Photo uploaded'));
      }
    } catch {
      toast.error(t('خطا در آپلود', 'Upload failed'));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profilePhoto: data?.profilePhoto || '',
          bioFa,
          bioEn,
          subtitleFa,
          subtitleEn,
          skillsJson: JSON.stringify(skills),
          statsJson: JSON.stringify(stats),
          experienceJson: JSON.stringify(experience),
          educationJson: JSON.stringify(education),
        }),
      });
      toast.success(t('ذخیره شد', 'Saved successfully'));
    } catch {
      toast.error(t('خطا در ذخیره', 'Save failed'));
    }
    setSaving(false);
  };

  // --- Skills helpers ---
  const addSkill = () => setSkills([...skills, { nameFa: '', nameEn: '', level: 50 }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: keyof SkillItem, value: string | number) => {
    const updated = [...skills];
    updated[i] = { ...updated[i], [field]: value };
    setSkills(updated);
  };

  // --- Stats helpers ---
  const addStat = () => setStats([...stats, { num: '', labelFa: '', labelEn: '' }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: keyof StatItem, value: string) => {
    const updated = [...stats];
    updated[i] = { ...updated[i], [field]: value };
    setStats(updated);
  };

  // --- Experience helpers ---
  const addExp = () => setExperience([...experience, { titleFa: '', titleEn: '', orgFa: '', orgEn: '', type: 'previous' }]);
  const removeExp = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: keyof ExpItem, value: string) => {
    const updated = [...experience];
    updated[i] = { ...updated[i], [field]: value };
    setExperience(updated);
  };

  // --- Education helpers ---
  const addEdu = () => setEducation([...education, { titleFa: '', titleEn: '' }]);
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: keyof EduItem, value: string) => {
    const updated = [...education];
    updated[i] = { ...updated[i], [field]: value };
    setEducation(updated);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with save button */}
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? (t('در حال ذخیره...', 'Saving...')) : (t('ذخیره تغییرات', 'Save Changes'))}
        </Button>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} />
            {t('عکس پروفایل', 'Profile Photo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {data.profilePhoto ? (
                <img src={data.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload size={14} />
                {uploading ? (t('در حال آپلود...', 'Uploading...')) : (t('آپلود عکس', 'Upload Photo'))}
              </Button>
              {data.profilePhoto && (
                <Button variant="ghost" size="sm" onClick={() => setData({ ...data, profilePhoto: '' })} className="gap-2 text-destructive">
                  <Trash2 size={14} />
                  {t('حذف عکس', 'Remove Photo')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtitle / Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('عنوان و زیرعنوان', 'Title & Subtitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('عنوان (فارسی)', 'Title (Persian)')}</Label>
              <Input value={subtitleFa} onChange={(e) => setSubtitleFa(e.target.value)} placeholder={lang === 'fa' ? 'مثلا: معمار · طراح داخلی' : 'e.g. Architect · Interior Designer'} />
            </div>
            <div className="space-y-2">
              <Label>{t('عنوان (انگلیسی)', 'Title (English)')}</Label>
              <Input value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} dir="ltr" placeholder="e.g. Architect · Interior Designer" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('بیوگرافی', 'Biography')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('بیوگرافی فارسی (هر پاراگراف تو خط جدا)', 'Persian Bio (each paragraph on new line)')}</Label>
            <Textarea
              value={bioFa}
              onChange={(e) => setBioFa(e.target.value)}
              rows={6}
              className="leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('بیوگرافی انگلیسی (هر پاراگراف تو خط جدا)', 'English Bio (each paragraph on new line)')}</Label>
            <Textarea
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              rows={6}
              dir="ltr"
              className="leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('آمار و ارقام', 'Statistics')}</span>
            <Button variant="outline" size="sm" onClick={addStat} className="gap-1">
              <Plus size={14} /> {t('افزودن', 'Add')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical size={14} className="text-muted-foreground flex-shrink-0" />
              <Input value={stat.num} onChange={(e) => updateStat(i, 'num', e.target.value)} placeholder={t('مقدار', 'Number')} className="w-24" dir="ltr" />
              <Input value={stat.labelFa} onChange={(e) => updateStat(i, 'labelFa', e.target.value)} placeholder={t('لیبل فارسی', 'Persian Label')} className="flex-1" />
              <Input value={stat.labelEn} onChange={(e) => updateStat(i, 'labelEn', e.target.value)} placeholder={t('لیبل انگلیسی', 'English Label')} className="flex-1" dir="ltr" />
              <Button variant="ghost" size="icon" onClick={() => removeStat(i)} className="text-destructive hover:text-destructive flex-shrink-0">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {stats.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('آیتمی وجود ندارد', 'No items')}</p>}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('مهارت‌ها', 'Skills')}</span>
            <Button variant="outline" size="sm" onClick={addSkill} className="gap-1">
              <Plus size={14} /> {t('افزودن', 'Add')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical size={14} className="text-muted-foreground flex-shrink-0" />
              <Input value={skill.nameFa} onChange={(e) => updateSkill(i, 'nameFa', e.target.value)} placeholder={t('نام فارسی', 'Persian Name')} className="flex-1" />
              <Input value={skill.nameEn} onChange={(e) => updateSkill(i, 'nameEn', e.target.value)} placeholder={t('نام انگلیسی', 'English Name')} className="flex-1" dir="ltr" />
              <div className="flex items-center gap-2 w-36 flex-shrink-0">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={skill.level}
                  onChange={(e) => updateSkill(i, 'level', parseInt(e.target.value) || 0)}
                  className="w-16"
                  dir="ltr"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeSkill(i)} className="text-destructive hover:text-destructive flex-shrink-0">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {skills.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('مهارتی وجود ندارد', 'No skills')}</p>}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('سوابق کاری', 'Work Experience')}</span>
            <Button variant="outline" size="sm" onClick={addExp} className="gap-1">
              <Plus size={14} /> {t('افزودن', 'Add')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={exp.type}
                    onChange={(e) => updateExp(i, 'type', e.target.value)}
                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                  >
                    <option value="current">{t('فعلی', 'Current')}</option>
                    <option value="previous">{t('پیشین', 'Previous')}</option>
                  </select>
                  <Button variant="ghost" size="icon" onClick={() => removeExp(i)} className="text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('عنوان فارسی', 'Title (FA)')}</Label>
                  <Input value={exp.titleFa} onChange={(e) => updateExp(i, 'titleFa', e.target.value)} placeholder={t('مثلا: معمار ارشد', 'e.g. Senior Architect')} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('عنوان انگلیسی', 'Title (EN)')}</Label>
                  <Input value={exp.titleEn} onChange={(e) => updateExp(i, 'titleEn', e.target.value)} dir="ltr" placeholder="e.g. Senior Architect" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('سازمان فارسی', 'Organization (FA)')}</Label>
                  <Input value={exp.orgFa} onChange={(e) => updateExp(i, 'orgFa', e.target.value)} placeholder={t('نام سازمان', 'Organization name')} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('سازمان انگلیسی', 'Organization (EN)')}</Label>
                  <Input value={exp.orgEn} onChange={(e) => updateExp(i, 'orgEn', e.target.value)} dir="ltr" placeholder="Organization name" />
                </div>
              </div>
            </div>
          ))}
          {experience.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('سابقه‌ای وجود ندارد', 'No experience')}</p>}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('تحصیلات', 'Education')}</span>
            <Button variant="outline" size="sm" onClick={addEdu} className="gap-1">
              <Plus size={14} /> {t('افزودن', 'Add')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical size={14} className="text-muted-foreground flex-shrink-0" />
              <Input value={edu.titleFa} onChange={(e) => updateEdu(i, 'titleFa', e.target.value)} placeholder={t('مثلا: کارشناسی ارشد معماری', 'e.g. Master of Architecture')} className="flex-1" />
              <Input value={edu.titleEn} onChange={(e) => updateEdu(i, 'titleEn', e.target.value)} placeholder="e.g. Master of Architecture" className="flex-1" dir="ltr" />
              <Button variant="ghost" size="icon" onClick={() => removeEdu(i)} className="text-destructive hover:text-destructive flex-shrink-0">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {education.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('موردی وجود ندارد', 'No items')}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
