'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { X, Send, Loader2, Bot, Sparkles, Minus, MessageSquare, ImagePlus, CheckCircle2, Briefcase, Clock } from 'lucide-react';

const FREE_MESSAGE_LIMIT = 20;
const STORAGE_KEY = 'ai-chat-count';
const DATE_KEY = 'ai-chat-date';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  image?: string;
}

interface BriefData {
  content: string;
  raw: string;
}

function getDailyCount(): { count: number } {
  try {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(DATE_KEY);
    if (savedDate !== today) { localStorage.setItem(DATE_KEY, today); localStorage.setItem(STORAGE_KEY, '0'); return { count: 0 }; }
    return { count: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) };
  } catch { return { count: 0 }; }
}

function incrementCount(): number {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(DATE_KEY) !== today) { localStorage.setItem(DATE_KEY, today); localStorage.setItem(STORAGE_KEY, '1'); return 1; }
    const n = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEY, String(n));
    return n;
  } catch { return 0; }
}

function extractBrief(text: string): BriefData | null {
  const s = text.indexOf('[PROJECT_BRIEF]');
  const e = text.indexOf('[/PROJECT_BRIEF]');
  if (s === -1 || e === -1) return null;
  return { content: text.slice(s + 15, e).trim(), raw: text.replace(/\[PROJECT_BRIEF\][\s\S]*?\[\/PROJECT_BRIEF\]/, '').trim() };
}

function BriefCard({ brief, isRtl, onSend }: { brief: BriefData; isRtl: boolean; onSend: () => void }) {
  const lines = brief.content.split('\n').filter(l => l.trim());
  return (
    <div className='rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-4 space-y-2'>
      <div className='flex items-center gap-2 mb-3'>
        <Briefcase size={16} className='text-primary' />
        <span className='text-sm font-semibold text-primary'>{isRtl ? 'خلاصه پروژه' : 'Project Brief'}</span>
      </div>
      <div className='space-y-1.5'>
        {lines.map((line, i) => {
          const c = line.indexOf(':'); if (c === -1) return null;
          return (<div key={i} className='flex flex-col sm:flex-row sm:gap-2 text-sm'><span className='font-medium text-foreground/80 min-w-[140px] text-xs'>{line.slice(0, c).trim()}</span><span className='text-foreground'>{line.slice(c + 1).trim()}</span></div>);
        })}
      </div>
      <div className='mt-4 pt-3 border-t border-primary/20'>
        <button onClick={onSend} className='w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]'><Send size={15} />{isRtl ? 'ارسال درخواست پیشنهاد رسمی' : 'Submit for Formal Quote'}</button>
      </div>
    </div>
  );
}

export function AiChat() {
  const { lang } = useAppStore();
  const isRtl = lang === 'fa';
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [briefSent, setBriefSent] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupDismiss = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMsgCount(getDailyCount().count); }, []);
  useEffect(() => {
    if (sessionStorage.getItem('ai-popup-v2')) return;
    popupTimer.current = setTimeout(() => { setShowPopup(true); popupDismiss.current = setTimeout(() => { setShowPopup(false); sessionStorage.setItem('ai-popup-v2', '1'); }, 10000); }, 3000);
    return () => { if (popupTimer.current) clearTimeout(popupTimer.current); if (popupDismiss.current) clearTimeout(popupDismiss.current); };
  }, []);
  const dismissPopup = useCallback(() => { setShowPopup(false); sessionStorage.setItem('ai-popup-v2', '1'); if (popupDismiss.current) clearTimeout(popupDismiss.current); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 300); }, [open, minimized]);

  const remaining = FREE_MESSAGE_LIMIT - msgCount;
  const isLimitReached = msgCount >= FREE_MESSAGE_LIMIT || quotaExhausted;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5*1024*1024) { alert(isRtl ? 'حجم فایل بیش از حد است (حداکثر 5MB)' : 'File too large (max 5MB)'); return; }
    if (!f.type.startsWith('image/')) { alert(isRtl ? 'فقط فایل تصویری' : 'Images only'); return; }
    const r = new FileReader(); r.onload = (ev) => setPendingImage(ev.target?.result as string); r.readAsDataURL(f); e.target.value = '';
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || loading || isLimitReached) return;
    const userMsg: Message = { role: 'user', text: text || '(Image)', image: pendingImage || undefined };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(''); setPendingImage(null); setLoading(true);
    setMsgCount(incrementCount());
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, lang, history: messages, image: pendingImage || undefined }) });
      const data = await res.json();
      if (res.status === 429 || data.error === 'QUOTA_EXHAUSTED') {
        setQuotaExhausted(true);
        setMessages([...newMsgs, { role: 'assistant', text: isRtl ? 'محدودیت روزانه مشاوره به پایان رسید. لطفاً پروژه خود را از طریق صفحه تماس ارسال کنید تا تیم ما پیگیری کند.' : 'Daily consultation limit reached. Please submit your project through the Contact page so our team can follow up.' }]);
      } else if (data.error === 'NETWORK_ERROR') {
        setMessages([...newMsgs, { role: 'assistant', text: isRtl ? 'اتصال به سرویس هوش مصنوعی برقرار نشد. اگر در ایران هستید، از VPN استفاده کنید. در غیر این صورت لحظاتی بعد دوباره تلاش کنید.' : 'Could not connect to AI service. If you are in Iran, please use a VPN. Otherwise, please try again in a moment.' }]);
      } else if (data.reply) {
        setMessages([...newMsgs, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages([...newMsgs, { role: 'assistant', text: isRtl ? 'خطایی رخ داد.' : 'Error occurred.' }]);
      }
    } catch { setMessages([...newMsgs, { role: 'assistant', text: isRtl ? 'اتصال برقرار نشد.' : 'Connection failed.' }]); }
    finally { setLoading(false); }
  };

  const sendBrief = async () => {
    const m = [...messages].reverse().find(m => m.role === 'assistant' && m.text.includes('[PROJECT_BRIEF]'));
    if (!m) return;
    const b = extractBrief(m.text); if (!b) return;
    const log = messages.map(m => `${m.role === 'user' ? 'Client' : 'AI'}: ${m.text}`).join('\n---\n');
    try { await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'AI Project Brief', email: 'ai-assistant@jeffstudio.ir', phone: '', message: `[Brief]\n${b.content}\n\n[Chat]\n${log}` }) }); setBriefSent(true); } catch {}
  };

  const toggleChat = () => { if (open) { setOpen(false); setMinimized(false); } else { setOpen(true); setMinimized(false); dismissPopup(); } };
  const btnPos = { right: '24px' };
  const panelPos = 'right-6';
  const qq = isRtl ? ['قیمت رندر 3D', 'طراحی داخلی ویلا', 'قیمت نما', 'انیمیشن معماری'] : ['3D rendering quote', 'Interior design for my villa', 'Facade design pricing', 'Architecture animation'];

  return (
    <React.Fragment>
      <AnimatePresence>{showPopup && !open && (
        <motion.div initial={{opacity:0,y:20,scale:0.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10,scale:0.9}} className='fixed bottom-24 z-[60] w-[290px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden cursor-pointer' style={btnPos} onClick={toggleChat}>
          <div className='h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' />
          <div className='p-4 flex items-start gap-3'>
            <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg'><Sparkles size={20} className='text-white' /></div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold'>{isRtl ? 'مشاوره رایگان' : 'Free Project Consultation'}</p>
              <p className='text-[11px] text-muted-foreground mt-0.5 leading-relaxed'>{isRtl ? 'برآورد قیمت پروژه خود را دریافت کنید' : 'Explore services, pricing & timeline'}</p>
              <span className='inline-block mt-2 text-[11px] font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-full'>{isRtl ? 'شروع کنید' : 'Start Now'}</span>
            </div>
          </div>
          <div className='absolute top-3 right-3'><span className='relative flex h-2.5 w-2.5'><span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' /><span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500' /></span></div>
        </motion.div>
      )}</AnimatePresence>

      <motion.button initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5,type:'spring',stiffness:200}} onClick={toggleChat} className={'fixed bottom-6 z-50 w-[60px] h-[60px] rounded-full shadow-xl flex items-center justify-center transition-all duration-300 '+(open?'bg-destructive text-destructive-foreground':'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-110')} style={btnPos}>
        {open?<X size={24}/>:<div className='relative'><MessageSquare size={26} strokeWidth={1.8}/><span className='absolute -top-1.5 -right-1.5 flex h-4 w-4'><span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60'/><Sparkles size={12} className='relative text-yellow-300 drop-shadow' fill='currentColor'/></span></div>}
      </motion.button>

      <AnimatePresence>{open && (
        <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={minimized?{opacity:1,y:0,scale:0.95}:{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}} className={'fixed bottom-24 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col '+panelPos} style={{height:minimized?'auto':'min(580px, calc(100vh - 140px))'}}>
          <div className='px-5 py-3.5 border-b border-border bg-gradient-to-r from-primary/8 via-purple-500/5 to-pink-500/8 flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md'><Bot size={20} className='text-white'/></div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-semibold'>{isRtl ? 'دستیار پروژه JEFF' : 'JEFF Project Assistant'}</h3>
              <div className='flex items-center gap-1.5 mt-0.5'>
                <span className='relative flex h-2 w-2'><span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'/><span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'/></span>
                <p className='text-[11px] text-muted-foreground'>{isRtl ? 'آنلاین' : 'Online'}</p>
                {!isLimitReached && <span className='text-[10px] text-muted-foreground/60'>{isRtl ? `${remaining} پیام باقیمانده` : `${remaining} left`}</span>}
              </div>
            </div>
            {minimized ? (
              <button onClick={e=>{e.stopPropagation();setMinimized(false);}} className='w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center'><MessageSquare size={16} className='text-muted-foreground'/></button>
            ) : (
              <button onClick={e=>{e.stopPropagation();setMinimized(true);}} className='w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center'><Minus size={16} className='text-muted-foreground'/></button>
            )}
          </div>
          {!minimized && (<>
            <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
              {messages.length===0 && (
                <div className='flex-1 flex items-center justify-center p-4'>
                  <div className='text-center'>
                    <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center mx-auto mb-4 border border-blue-500/20'><Briefcase size={30} className='text-primary'/></div>
                    <p className='text-sm font-medium mb-1'>{isRtl ? 'دستیار پروژه JEFF Studio' : 'JEFF Studio Project Assistant'}</p>
                    <p className='text-xs text-muted-foreground leading-relaxed max-w-[280px]'>{isRtl ? 'پروژه خود را توضیح دهید، اطلاعات خدمات و برآورد قیمت دریافت کنید.' : 'Discover our services, define your project, and get a price estimate.'}</p>
                    <div className='flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground/60'><Clock size={11}/><span>{isRtl ? `${FREE_MESSAGE_LIMIT} پیام رایگان در روز` : `${FREE_MESSAGE_LIMIT} free messages daily`}</span></div>
                    <div className='flex flex-wrap gap-2 mt-3 justify-center'>{qq.map(q=>(<button key={q} onClick={()=>{setInput(q);inputRef.current?.focus();}} className='text-[11px] px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground'>{q}</button>))}</div>
                  </div>
                </div>
              )}
              {messages.map((msg,i)=>{
                const brief = msg.role==='assistant'?extractBrief(msg.text):null;
                const txt = brief?brief.raw:msg.text;
                return (<motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={msg.role==='user'?'flex justify-end':'flex justify-start'}>
                  <div className={msg.role==='user'?'max-w-[85%] space-y-2':'max-w-[90%] space-y-3'}>
                    {msg.image&&<div className='flex justify-end'><img src={msg.image} alt='' className='max-h-[200px] rounded-xl border border-border shadow-sm object-cover'/></div>}
                    {txt&&<div className={msg.role==='user'?'px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-sm shadow-md':'px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-muted rounded-bl-sm'} dir='auto'>{txt}</div>}
                    {brief&&!briefSent&&<BriefCard brief={brief} isRtl={isRtl} onSend={sendBrief}/>}
                    {brief&&briefSent&&<div className='flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-sm text-green-600 dark:text-green-400'><CheckCircle2 size={16}/><span>{isRtl ? 'درخواست ثبت شد.' : 'Request submitted.'}</span></div>}
                  </div>
                </motion.div>);
              })}
              {loading&&<div className='flex justify-start'><div className='bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2'><Loader2 size={14} className='animate-spin text-muted-foreground'/><span className='text-xs text-muted-foreground'>{isRtl ? 'در حال تحلیل...' : 'Analyzing...'}</span></div></div>}
              <div ref={messagesEndRef}/>
            </div>
            {pendingImage&&(<div className='px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-3'><img src={pendingImage} alt='' className='w-12 h-12 rounded-lg object-cover border border-border'/><div className='flex-1'><p className='text-xs font-medium'>Image</p></div><button onClick={()=>setPendingImage(null)} className='w-7 h-7 rounded-lg hover:bg-destructive/20 flex items-center justify-center'><X size={14} className='text-destructive'/></button></div>)}
            <div className='p-3 border-t border-border'>
              {isLimitReached?(
                <div className='text-center py-3 px-4 rounded-xl bg-muted/50'>
                      <p className='text-xs text-muted-foreground'>{isRtl ? 'محدودیت روزانه اتمام شد' : 'Daily limit reached'}</p>
                  <p className='text-[10px] text-muted-foreground/60 mt-1'>{isRtl ? 'لطفاً از صفحه تماس استفاده کنید' : 'Please use the Contact page to submit your project'}</p>
                </div>
              ):(
                <div className='flex items-center gap-2'>
                  <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFile} className='hidden'/>
                  <button onClick={()=>fileInputRef.current?.click()} disabled={loading} className='w-10 h-10 rounded-xl border border-border bg-muted/50 flex items-center justify-center hover:bg-muted hover:border-primary/40 transition-all disabled:opacity-40 flex-shrink-0'><ImagePlus size={16} className='text-muted-foreground'/></button>
                  <input ref={inputRef} type='text' value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder={isRtl?'پروژه خود را توضیح دهید...':'Describe your project...'} disabled={loading} className='flex-1 px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50' dir='auto'/>
                  <button onClick={sendMessage} disabled={loading||(!input.trim()&&!pendingImage)} className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0'><Send size={16}/></button>
                </div>
              )}
            </div>
          </>)}
        </motion.div>
      )}</AnimatePresence>
    </React.Fragment>
  );
}
