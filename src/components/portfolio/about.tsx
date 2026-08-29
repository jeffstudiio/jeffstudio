'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';

interface AboutData {
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

export function About() {
  const { lang } = useAppStore();
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch('/api/about')
      .then((r) => r.json())
      .then((json) => {
        if (json.id) setData(json);
      })
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <section className="pt-24 md:pt-28 pb-20 px-5 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </section>
    );
  }

  let skills: { nameFa: string; nameEn: string; level: number }[] = [];
  let stats: { num: string; labelFa: string; labelEn: string }[] = [];
  let experience: { titleFa: string; titleEn: string; orgFa: string; orgEn: string; type: string }[] = [];
  let education: { titleFa: string; titleEn: string }[] = [];

  try { skills = JSON.parse(data.skillsJson || '[]'); } catch {}
  try { stats = JSON.parse(data.statsJson || '[]'); } catch {}
  try { experience = JSON.parse(data.experienceJson || '[]'); } catch {}
  try { education = JSON.parse(data.educationJson || '[]'); } catch {}

  const biosFa = (data.bioFa || '').split('\n').filter(Boolean);
  const biosEn = (data.bioEn || '').split('\n').filter(Boolean);
  const bios = lang === 'fa' ? biosFa : biosEn;

  return (
    <section className="pt-24 md:pt-28 pb-20 px-5 md:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {lang === 'fa' ? '۰۳ / درباره' : '03 / About'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold">
            {lang === 'fa' ? 'درباره ما' : 'About Us'}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Photo + Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Photo */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                {data.profilePhoto ? (
                  <img
                    src={data.profilePhoto}
                    alt="Mostafa Jafari — Architect and 3D Visualization Artist, JEFF studio founder"
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                    {lang === 'fa' ? 'مج' : 'MJ'}
                  </div>
                )}
              </div>
              <div className="pt-1">
                <h2 className="text-2xl font-bold mb-2">
                  {lang === 'fa' ? 'مصطفی جعفری' : 'Mostafa Jafari'}
                </h2>
                <p className="text-sm text-primary tracking-wide" style={{ fontFamily: 'var(--font-inter)' }}>
                  {lang === 'fa' ? data.subtitleFa : data.subtitleEn}
                </p>
              </div>
            </div>

            {/* Bio paragraphs */}
            {bios.map((para, i) => (
              <p key={i} className="text-muted-foreground text-[15px] leading-[1.9]">
                {para}
              </p>
            ))}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-inter)' }}>
                      {stat.num}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{lang === 'fa' ? stat.labelFa : stat.labelEn}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Skills & Experience */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 space-y-12"
          >
            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-6">
                  {lang === 'fa' ? 'مهارت‌ها' : 'Skills'}
                </h3>
                <div className="space-y-4">
                  {skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-32 flex-shrink-0" style={{ fontFamily: 'var(--font-inter)' }}>
                        {lang === 'fa' ? skill.nameFa : skill.nameEn}
                      </span>
                      <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-6">
                  {lang === 'fa' ? 'سوابق کاری' : 'Experience'}
                </h3>
                <div className="space-y-0">
                  {experience.map((exp, i) => (
                    <div
                      key={i}
                      className="py-5 border-t border-border first:border-t-0"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 ${
                            exp.type === 'current'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {exp.type === 'current'
                            ? (lang === 'fa' ? 'فعلی' : 'Current')
                            : (lang === 'fa' ? 'پیشین' : 'Previous')}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold leading-relaxed">
                            {lang === 'fa' ? exp.titleFa : exp.titleEn}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lang === 'fa' ? exp.orgFa : exp.orgEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-6">
                  {lang === 'fa' ? 'تحصیلات' : 'Education'}
                </h3>
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i} className="py-4 border-t border-border">
                      <h4 className="text-sm font-semibold">{lang === 'fa' ? edu.titleFa : edu.titleEn}</h4>
                      <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                        {lang === 'fa' ? edu.titleEn : edu.titleFa}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}