'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Background Sound Engine
 * Plays the official Jeeto Pakistan Theme song across all devices (Mobile & Desktop)
 * in a seamless continuous background loop with zero visible UI widget on screen.
 * Volume is calibrated to medium (0.5 / 50%) via Web Audio GainNode & HTML5 volume fallback.
 */
export default function SoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isUnlockedRef = useRef<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5); // Default to Medium (50%)
  const [trackUrl, setTrackUrl] = useState<string>('/audio/jeeto-pakistan-theme.mp3');

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
          isUnlockedRef.current = true;
        })
        .catch(() => {});
    }
  }, []);

  // Pause playback
  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
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

        setSoundEnabled(enabled);
        setVolume(vol);
        setTrackUrl(url);

        if (audioRef.current) {
          applyVolume(enabled ? vol : 0);
          if (!enabled) {
            pausePlayback();
          }
        }
      })
      .catch(() => {
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
      if (!document.hidden && audioRef.current && !audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupListeners();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [soundEnabled, volume, initWebAudio, startPlayback]);

  if (!soundEnabled) {
    return null;
  }

  // Zero visible UI widgets on screen — pure background audio
  return (
    <audio
      ref={audioRef}
      src={trackUrl}
      loop
      preload="auto"
      playsInline
      className="hidden"
      aria-hidden="true"
    />
  );
}
