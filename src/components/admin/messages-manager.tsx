'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { MessageSquare, Trash2, Eye, EyeOff, RefreshCw, Inbox, Mail, User, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SERVICE_LIST = [
  { titleFa: 'طراحی معماری', titleEn: 'Architectural Design' },
  { titleFa: 'طراحی داخلی', titleEn: 'Interior Design' },
  { titleFa: 'رندر سه‌بعدی و بصری‌سازی', titleEn: '3D Rendering & Visualization' },
  { titleFa: 'طراحی مبلمان و محصول', titleEn: 'Furniture & Product Design' },
  { titleFa: 'معماری هوش مصنوعی', titleEn: 'AI Architecture' },
  { titleFa: 'مشاوره معماری', titleEn: 'Architecture Consultation' },
];

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceIndex: number | null;
  isRead: boolean;
  createdAt: string;
}

export function MessagesManager() {
  const { lang } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleRead = async (msg: Message) => {
    try {
      await fetch(`/api/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: !m.isRead } : m))
      );
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm(lang === 'fa' ? 'آیا از حذف این پیام مطمئنید؟' : 'Delete this message?')) return;
    try {
      await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'read') return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (lang === 'fa') {
      return d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getServiceName = (index: number | null) => {
    if (index === null || index < 0 || index >= SERVICE_LIST.length) return null;
    return lang === 'fa' ? SERVICE_LIST[index].titleFa : SERVICE_LIST[index].titleEn;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            {lang === 'fa' ? 'پیام‌ها و سفارشات' : 'Messages & Orders'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'fa'
              ? `${messages.length} پیام | ${unreadCount} خوانده‌نشده`
              : `${messages.length} messages | ${unreadCount} unread`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {lang === 'fa' ? 'بارگذاری مجدد' : 'Refresh'}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border pb-3">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' && (lang === 'fa' ? 'همه' : 'All')}
            {f === 'unread' && (lang === 'fa' ? `خوانده‌نشده (${unreadCount})` : `Unread (${unreadCount})`)}
            {f === 'read' && (lang === 'fa' ? 'خوانده‌شده' : 'Read')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw size={20} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Inbox size={48} className="mb-4 opacity-30" />
          <p className="text-sm">
            {filter === 'unread'
              ? (lang === 'fa' ? 'پیام خوانده‌نشده‌ای نیست' : 'No unread messages')
              : (lang === 'fa' ? 'پیامی دریافت نشده' : 'No messages yet')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const serviceName = getServiceName(msg.serviceIndex);

            return (
              <div
                key={msg.id}
                className={`border rounded-lg transition-all ${
                  !msg.isRead ? 'border-primary/30 bg-primary/[0.03]' : 'border-border'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                  className="w-full text-right px-4 py-3.5 flex items-start gap-3 hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!msg.isRead ? 'bg-primary' : 'bg-border'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${!msg.isRead ? '' : 'text-muted-foreground'}`}>
                        {msg.name}
                      </span>
                      {serviceName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          <Briefcase size={10} />
                          {serviceName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: 'var(--font-inter)' }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-border">
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{lang === 'fa' ? 'نام:' : 'Name:'}</span>
                        <span className="font-medium">{msg.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{lang === 'fa' ? 'ایمیل:' : 'Email:'}</span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="font-medium text-primary hover:underline"
                          style={{ fontFamily: 'var(--font-inter)', direction: 'ltr' }}
                        >
                          {msg.email}
                        </a>
                      </div>

                      {msg.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{lang === 'fa' ? 'تلفن:' : 'Phone:'}</span>
                          <a
                            href={`tel:${msg.phone.replace(/\s/g, '')}`}
                            className="font-medium text-primary hover:underline"
                            style={{ fontFamily: 'var(--font-inter)', direction: 'ltr' }}
                          >
                            {msg.phone}
                          </a>
                        </div>
                      )}

                      {serviceName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{lang === 'fa' ? 'خدمت:' : 'Service:'}</span>
                          <span className="font-medium text-primary">{serviceName}</span>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRead(msg)}
                        >
                          {msg.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                          {msg.isRead
                            ? (lang === 'fa' ? 'علامت‌گذاری خوانده‌نشده' : 'Mark Unread')
                            : (lang === 'fa' ? 'خوانده شد' : 'Mark Read')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(msg.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                          {lang === 'fa' ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}