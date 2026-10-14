'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

/**
 * Universal Sound Player for All Devices (Mobile & Desktop)
 * 
 * Features:
 * - Plays official Jeeto Pakistan Theme song across all devices (Desktop, iOS Safari, Android Chrome, Tablets).
 * - Calibrated to medium volume (0.5 / 50%) using Web Audio GainNode & HTML5 volume fallback.
 * - Universal auto-unlock on first user interaction (touchstart, touchend, click, pointerdown, scroll, keydown).
 * - Handles iOS WebKit AudioContext suspension and silent-switch policies.
 * - Floating audio control pill allows user to toggle sound anytime without intruding on page layout.
 */
export default function SoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isUnlockedRef = useRef<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5); // Default to Medium (50%)
  const [trackUrl, setTrackUrl] = useState<string>('/audio/jeeto-pakistan-theme.mp3');
  const [trackTitle, setTrackTitle] = useState<string>('Jeeto Pakistan Theme');

  // Initialize or resume Web Audio context for true volume control across all platforms including iOS
  const initWebAudio = useCallback((audioEl: HTMLAudioElement, targetVolume: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const source = ctx.createMediaElementSource(audioEl);
          const gainNode = ctx.createGain();
          gainNode.gain.value = targetVolume;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);

          audioCtxRef.current = ctx;
          gainNodeRef.current = gainNode;
        }
      } else if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = targetVolume;
      }
    } catch {
      // Fallback: cross-origin or already connected
    }

    // Always set HTML5 audio volume as well
    audioEl.volume = targetVolume;
  }, []);

  // Update volume in both Web Audio GainNode and HTMLAudioElement
  const applyVolume = useCallback((targetVolume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = targetVolume;
    }
    if (audioRef.current) {
      audioRef.current.volume = targetVolume;
    }
  }, []);

  // Trigger audio playback safely with user gesture fallback
  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Resume AudioContext if suspended (required by iOS Safari and Android Chrome)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          isUnlockedRef.current = true;
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, []);

  // Pause playback
  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Fetch admin sound configuration
  useEffect(() => {
    let isCancelled = false;

    fetch('/api/sound-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (isCancelled || !settings) return;

        const enabled = settings.soundEnabled ?? true;
        const vol = typeof settings.volume === 'number' ? settings.volume : 0.5; // Medium volume
        const url = settings.trackUrl || '/audio/jeeto-pakistan-theme.mp3';
        const title = settings.trackTitle || 'Jeeto Pakistan Theme';

        setSoundEnabled(enabled);
        setVolume(vol);
        setTrackUrl(url);
        setTrackTitle(title);

        if (audioRef.current) {
          applyVolume(enabled ? vol : 0);
          if (!enabled) {
            pausePlayback();
          }
        }
      })
      .catch(() => {
        // Fallback to medium volume and default track
        setSoundEnabled(true);
        setVolume(0.5);
      });

    return () => {
      isCancelled = true;
    };
  }, [applyVolume, pausePlayback]);

  // Handle immediate gesture unlock for mobile devices
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize Web Audio on mount
    initWebAudio(audio, volume);

    // Attempt direct playback (works immediately on Desktop browsers)
    if (soundEnabled) {
      startPlayback();
    }

    // Mobile gesture unlock listener
    const handleUserGesture = () => {
      if (isUnlockedRef.current) return;

      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      initWebAudio(currentAudio, volume);

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      currentAudio
        .play()
        .then(() => {
          setIsPlaying(true);
          isUnlockedRef.current = true;
          cleanupListeners();
        })
        .catch(() => {
          // Will retry on next interaction
        });
    };

    // Mobile events to unlock audio immediately on first touch or click anywhere
    const gestureEvents = ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown', 'scroll'];

    const cleanupListeners = () => {
      gestureEvents.forEach((event) => {
        window.removeEventListener(event, handleUserGesture);
        document.removeEventListener(event, handleUserGesture);
      });
    };

    gestureEvents.forEach((event) => {
      window.addEventListener(event, handleUserGesture, { capture: true, passive: true });
      document.addEventListener(event, handleUserGesture, { capture: true, passive: true });
    });

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioRef.current && isPlaying) {
          // Lower volume or pause when user minimizes/locks screen
        }
      } else {
        if (audioRef.current && isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupListeners();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [soundEnabled, volume, initWebAudio, startPlayback, isPlaying]);

  // Toggle Mute / Play from floating button
  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    initWebAudio(audio, volume);

    if (isPlaying && !isMuted) {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      audio.muted = false;
      applyVolume(volume);
      startPlayback();
      setIsMuted(false);
    }
  };

  if (!soundEnabled) {
    return null;
  }

  return (
    <>
      {/* Hidden DOM Audio Element with playsInline attribute for mobile devices */}
      <audio
        ref={audioRef}
        src={trackUrl}
        loop
        preload="auto"
        playsInline
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Sound Controller Widget */}
      <div
        className="fixed bottom-20 md:bottom-6 left-4 z-40 transition-all duration-300"
        title={`${trackTitle} - Volume: ${Math.round(volume * 100)}%`}
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isPlaying ? 'Mute background sound' : 'Play background sound'}
          className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg text-xs font-semibold ${
            isPlaying && !isMuted
              ? 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-400 border-amber-500/40 shadow-amber-500/10'
              : 'bg-slate-950/80 hover:bg-slate-900/90 text-slate-400 hover:text-white border-white/10'
          }`}
        >
          {isPlaying && !isMuted ? (
            <>
              {/* Animated Equalizer Waves */}
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2/3" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4/5" />
              </div>
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px] font-bold text-amber-300">Sound: 50%</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-300 flex items-center gap-1">
                <Music className="w-3 h-3 text-slate-400" />
                <span>Play Sound</span>
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
