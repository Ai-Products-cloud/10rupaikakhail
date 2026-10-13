'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Background Sound Engine
 * Plays the official Jeeto Pakistan Game Show soundtrack (Waqar Ali / ARY Digital)
 * in a seamless continuous background loop with zero visible UI widget on screen.
 * Respects Admin global sound settings (on/off and volume).
 */
export default function SoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // Initialize audio element
    if (!audioRef.current) {
      const audio = new Audio('/audio/jeeto-pakistan-theme.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // Fetch sound configuration from admin settings
    fetch('/api/sound-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (isCancelled || !audio) return;

        const isEnabled = settings?.soundEnabled ?? true;
        const volume = typeof settings?.volume === 'number' ? settings.volume : 0.4;
        audio.volume = Math.max(0, Math.min(1, volume));

        if (!isEnabled) {
          audio.pause();
          return;
        }

        // Try direct playback
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser autoplay policy requires user gesture.
            // Start audio on first user tap/click anywhere on page.
            const handleFirstInteraction = () => {
              if (audio && !isCancelled) {
                audio.play().catch(() => {});
              }
              window.removeEventListener('click', handleFirstInteraction);
              window.removeEventListener('pointerdown', handleFirstInteraction);
              window.removeEventListener('keydown', handleFirstInteraction);
            };

            window.addEventListener('click', handleFirstInteraction, { once: true });
            window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
            window.addEventListener('keydown', handleFirstInteraction, { once: true });
          });
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Zero visible UI elements as requested
  return null;
}
