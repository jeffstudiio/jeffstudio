'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const FALLBACK_SRC = '/uploads/bg-music.mp3';

export function BgMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const setupDone = useRef(false);
  const srcLoaded = useRef(false);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (srcLoaded.current) {
      audio.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (setupDone.current) return;
    setupDone.current = true;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.loop = true;

    // Try to play on first user interaction anywhere on the page
    const playOnInteraction = () => {
      if (srcLoaded.current) return; // already tried
      srcLoaded.current = true;

      const a = audioRef.current;
      if (!a) return;

      // Set src right before first play attempt (browser policy requires user gesture)
      a.src = FALLBACK_SRC;
      a.load();
      a.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {
        // Autoplay blocked even with gesture - user can click the button
      });
    };

    document.addEventListener('click', playOnInteraction, { once: true, capture: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true, capture: true });
    document.addEventListener('keydown', playOnInteraction, { once: true, capture: true });

    return () => {
      document.removeEventListener('click', playOnInteraction, { capture: true });
      document.removeEventListener('touchstart', playOnInteraction, { capture: true });
      document.removeEventListener('keydown', playOnInteraction, { capture: true });
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src || audio.src === window.location.href) {
      // No src set yet - set it now and play
      audio.src = FALLBACK_SRC;
      audio.load();
      srcLoaded.current = true;
      audio.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {});
      return;
    }

    if (muted || !playing) {
      audio.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
      setMuted(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110 shadow-lg"
        title={muted || !playing ? 'Play Music / \u067e\u062e\u0634 \u0645\u0648\u0632\u06cc\u06a9' : 'Mute / \u0642\u0637\u0639 \u0645\u0648\u0632\u06cc\u06a9'}
      >
        {muted || !playing ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </>
  );
}