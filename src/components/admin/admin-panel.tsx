'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type View } from '@/store/use-app-store';
import { LayoutGrid, FolderOpen, Settings, ArrowRight, Lock, Eye, EyeOff, MessageSquare, Briefcase, User, Phone, Database, Wrench, Mail, ShieldCheck, Loader2, RotateCcw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { CategoriesManager } from './categories-manager';
import { ProjectsManager } from './projects-manager';
import { ProjectForm } from './project-form';
import { SettingsManager } from './settings-manager';
import { MessagesManager } from './messages-manager';
import { ServicesManager } from './services-manager';
import { AboutManager } from './about-manager';
import { ContactManager } from './contact-manager';
import { BackupManager } from './backup-manager';
import { MaintenanceManager } from './maintenance-manager';

interface NavItem {
  view: View;
  fa: string;
  en: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { view: 'admin-about', fa: 'درباره ما', en: 'About', icon: <User size={18} /> },
  { view: 'admin-contact', fa: 'تماس', en: 'Contact', icon: <Phone size={18} /> },
  { view: 'admin-messages', fa: 'پیام‌ها', en: 'Messages', icon: <MessageSquare size={18} /> },
  { view: 'admin-services', fa: 'خدمات', en: 'Services', icon: <Briefcase size={18} /> },
  { view: 'admin-categories', fa: 'دسته‌بندی‌ها', en: 'Categories', icon: <FolderOpen size={18} /> },
  { view: 'admin-projects', fa: 'پروژه‌ها', en: 'Projects', icon: <LayoutGrid size={18} /> },
  { view: 'admin-settings', fa: 'تنظیمات', en: 'Settings', icon: <Settings size={18} /> },
  { view: 'admin-backup', fa: 'بکآپ', en: 'Backup', icon: <Database size={18} /> },
  { view: 'admin-maintenance', fa: 'به‌روزرسانی', en: 'Updates', icon: <Wrench size={18} /> },
];

// ─── Step 1: Password ───
function PasswordStep({ lang, onSubmit }: { lang: 'fa' | 'en'; onSubmit: (sessionId: string) => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSubmit(data.sessionId);
      } else if (data.error === 'INVALID_PASSWORD') {
        setError(lang === 'fa' ? 'رمز عبور اشتباه است' : 'Incorrect password');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setError(lang === 'fa' ? 'خطای ناشناخته' : 'Unknown error');
      }
    } catch {
      setError(lang === 'fa' ? 'خطای اتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={`w-full max-w-sm bg-card rounded-xl border border-border p-8 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold">{lang === 'fa' ? 'ورود به پنل مدیریت' : 'Admin Login'}</h1>
          <p className="text-sm text-muted-foreground">{lang === 'fa' ? 'رمز عبور را وارد کنید' : 'Enter the admin password'}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={lang === 'fa' ? 'رمز عبور...' : 'Password...'}
              className={`${error ? 'border-destructive' : ''} pr-10`}
              autoFocus dir="ltr"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {loading ? (lang === 'fa' ? 'در حال ارسال...' : 'Sending...') : (lang === 'fa' ? 'ادامه' : 'Continue')}
          </Button>
        </form>
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Step 2: OTP Verification ───
function OTPStep({ lang, sessionId, onSuccess, onBack }: { lang: 'fa' | 'en'; sessionId: string; onSuccess: () => void; onBack: () => void }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (otp.length === 6 && !loading) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: otp }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); return; }
      const msgs: Record<string, { fa: string; en: string }> = {
        CODE_EXPIRED: { fa: 'کد منقضی شده', en: 'Code expired' },
        MAX_ATTEMPTS: { fa: 'تعداد تلاش بیش از حد', en: 'Too many attempts' },
        WRONG_CODE: { fa: 'کد اشتباه است', en: 'Incorrect code' },
      };
      const msg = msgs[data.error] || { fa: 'خطا', en: 'Error' };
      setError(lang === 'fa' ? msg.fa : msg.en);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (data.error === 'CODE_EXPIRED' || data.error === 'MAX_ATTEMPTS') onBack();
    } catch { setError(lang === 'fa' ? 'خطای اتصال' : 'Connection error'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setCountdown(60); setOtp(''); setError('');
    try {
      const res = await fetch('/api/admin/resend-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!data.success) onBack();
    } catch { onBack(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={`w-full max-w-sm bg-card rounded-xl border border-border p-8 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold">{lang === 'fa' ? 'تایید هویت دو مرحله‌ای' : 'Two-Factor Authentication'}</h1>
          <p className="text-sm text-muted-foreground text-center">{lang === 'fa' ? 'کد ۶ رقمی ارسال شده به ایمیل خود را وارد کنید' : 'Enter the 6-digit code sent to your email'}</p>
        </div>
        <div className="flex flex-col items-center gap-6">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} dir="ltr">
            <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /></InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
          </InputOTP>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {loading && <Loader2 size={20} className="animate-spin text-muted-foreground" />}
          <div className="flex flex-col items-center gap-3 w-full">
            <Button variant="ghost" size="sm" onClick={handleResend} disabled={countdown > 0 || loading} className="text-muted-foreground">
              <RotateCcw size={14} />
              {countdown > 0 ? (lang === 'fa' ? `ارسال مجدد (${countdown})` : `Resend (${countdown})`) : (lang === 'fa' ? 'ارسال مجدد کد' : 'Resend code')}
            </Button>
            <Button variant="link" size="sm" onClick={onBack} className="text-muted-foreground">{lang === 'fa' ? 'بازگشت به ورود' : 'Back to login'}</Button>
          </div>
        </div>
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ───
export function AdminPanel() {
  const { view, lang, setView, setCategories, setProjects } = useAppStore();
  const [step, setStep] = useState<'password' | 'otp' | 'dashboard'>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin-auth') === 'true') return 'dashboard';
    return 'password';
  });
  const [otpSessionId, setOtpSessionId] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePasswordSuccess = (sessionId: string) => { setOtpSessionId(sessionId); setStep('otp'); };
  const handleOTPSuccess = () => { setStep('dashboard'); sessionStorage.setItem('admin-auth', 'true'); };
  const handleBackToPassword = () => { setStep('password'); setOtpSessionId(''); };
  const handleLogout = () => { sessionStorage.removeItem('admin-auth'); setStep('password'); setOtpSessionId(''); setView('home'); };

  if (step === 'password') return <PasswordStep lang={lang} onSubmit={handlePasswordSuccess} />;
  if (step === 'otp') return <OTPStep lang={lang} sessionId={otpSessionId} onSuccess={handleOTPSuccess} onBack={handleBackToPassword} />;

  const isRtl = lang === 'fa';
  const currentView = view as string;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b border-border ${sidebarCollapsed ? 'text-center' : ''}`}>
        <button onClick={() => setView('home')} className={`flex items-center gap-2 hover:text-primary transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <span className="text-lg font-bold tracking-[0.15em]">JEFF</span>
          {!sidebarCollapsed && <span className="text-xs opacity-40 font-light">studio</span>}
        </button>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentView === item.view || (item.view === 'admin-projects' && currentView === 'admin-project-form');
          return (
            <button key={item.view} onClick={() => {
              setView(item.view); setMobileMenuOpen(false);
              if (item.view === 'admin-projects') fetch('/api/projects?all=true').then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); });
              if (item.view === 'admin-categories') fetch('/api/categories').then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); });
            }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-card'} ${sidebarCollapsed ? 'justify-center' : ''}`} title={lang === 'fa' ? item.fa : item.en}>
              {item.icon}
              {!sidebarCollapsed && (lang === 'fa' ? item.fa : item.en)}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex flex-col gap-1">
        <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 w-full ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {!sidebarCollapsed && (lang === 'fa' ? 'خروج' : 'Logout')}
        </button>
        <button onClick={() => setView('home')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 w-full ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <ArrowRight size={18} className={isRtl ? '' : 'rotate-180'} />
          {!sidebarCollapsed && (lang === 'fa' ? 'بازگشت به سایت' : 'Back to Site')}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'admin-categories': return <CategoriesManager />;
      case 'admin-projects': return <ProjectsManager />;
      case 'admin-project-form': return <ProjectForm />;
      case 'admin-settings': return <SettingsManager />;
      case 'admin-messages': return <MessagesManager />;
      case 'admin-about': return <AboutManager />;
      case 'admin-contact': return <ContactManager />;
      case 'admin-services': return <ServicesManager />;
      case 'admin-backup': return <BackupManager />;
      case 'admin-maintenance': return <MaintenanceManager />;
      default: return <CategoriesManager />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className={`hidden lg:flex flex-col border-e border-border bg-card/50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {sidebarContent}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute top-4 z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ [isRtl ? 'left' : 'right']: sidebarCollapsed ? '68px' : '196px' }}>
          <ArrowRight size={12} className={`transition-transform duration-300 ${sidebarCollapsed ? (isRtl ? '' : 'rotate-180') : (isRtl ? 'rotate-180' : '')}`} />
        </button>
      </aside>
      {mobileMenuOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`lg:hidden fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-50 h-full w-64 bg-card border-s border-border transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>{sidebarContent}</aside>
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors"><LayoutGrid size={18} /></button>
            <h2 className="text-sm font-medium">
              {currentView === 'admin-categories' && (lang === 'fa' ? 'دسته‌بندی‌ها' : 'Categories')}
              {currentView === 'admin-projects' && (lang === 'fa' ? 'پروژه‌ها' : 'Projects')}
              {currentView === 'admin-project-form' && (lang === 'fa' ? 'فرم پروژه' : 'Project Form')}
              {currentView === 'admin-settings' && (lang === 'fa' ? 'تنظیمات' : 'Settings')}
              {currentView === 'admin-messages' && (lang === 'fa' ? 'پیام‌ها' : 'Messages')}
              {currentView === 'admin-about' && (lang === 'fa' ? 'درباره ما' : 'About')}
              {currentView === 'admin-contact' && (lang === 'fa' ? 'تماس' : 'Contact')}
              {currentView === 'admin-services' && (lang === 'fa' ? 'خدمات' : 'Services')}
              {currentView === 'admin-backup' && (lang === 'fa' ? 'بکآپ' : 'Backup')}
              {currentView === 'admin-maintenance' && (lang === 'fa' ? 'به‌روزرسانی' : 'Updates')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">{lang === 'fa' ? 'تایید شده' : 'Verified'}</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">JEFF {lang === 'fa' ? 'استودیو' : 'Studio'} — {lang === 'fa' ? 'مدیریت' : 'Admin'}</span>
          </div>
        </header>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}
