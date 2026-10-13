'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles } from 'lucide-react';
import { jeetoBeatEngine } from '@/lib/audioEngine';

export default function SoundPlayer() {
  const [soundEnabledByAdmin, setSoundEnabledByAdmin] = useState(false);
  const [trackTitle, setTrackTitle] = useState('Jeeto Pakistan Beats');
  const [trackUrl, setTrackUrl] = useState('synthesized-jeeto-beats');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch sound settings from server (Admin Control)
  useEffect(() => {
    fetch('/api/sound-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSoundEnabledByAdmin(data.soundEnabled);
          if (data.trackTitle) setTrackTitle(data.trackTitle);
          if (data.trackUrl) setTrackUrl(data.trackUrl);
          if (typeof data.volume === 'number') {
            setVolume(data.volume);
            jeetoBeatEngine.setVolume(data.volume);
          }
        }
      })
      .catch(() => {});
  }, []);

  // When admin turns sound OFF, immediately stop any playing audio
  useEffect(() => {
    if (!soundEnabledByAdmin && isPlaying) {
      handleStop();
    }
  }, [soundEnabledByAdmin]);

  const handleStop = () => {
    jeetoBeatEngine.stop();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (!soundEnabledByAdmin) return;

    if (isPlaying) {
      handleStop();
    } else {
      if (trackUrl && trackUrl.startsWith('http')) {
        // Use custom streaming audio URL
        if (!audioRef.current) {
          audioRef.current = new Audio(trackUrl);
          audioRef.current.loop = true;
        } else {
          audioRef.current.src = trackUrl;
        }
        audioRef.current.volume = volume;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio playback fallback to synthesized engine:', err);
            jeetoBeatEngine.start();
            setIsPlaying(true);
          });
      } else {
        // Use synthesized Jeeto Pakistan Rhythmic Engine
        jeetoBeatEngine.setVolume(volume);
        jeetoBeatEngine.start();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    jeetoBeatEngine.setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // If Admin has turned sound OFF for the entire website, render nothing
  if (!soundEnabledByAdmin) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 left-4 z-40 select-none animate-in fade-in duration-300"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="bg-slate-950/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 transition-all">
        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 shadow-md ${
            isPlaying
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={isPlaying ? 'Pause Game Show Beats' : 'Play Jeeto Pakistan Beats'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Track Info & Visualizer */}
        <div className="flex flex-col pr-1 cursor-pointer" onClick={handleTogglePlay}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-white leading-tight">
              {trackTitle}
            </span>
            {isPlaying && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 bg-yellow-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }}></span>
              </span>
            )}
          </div>
          <span className="text-[9px] text-emerald-400 font-medium">
            {isPlaying ? 'Beats Playing Live • Click to Pause' : 'Click to Play Game Show Beats'}
          </span>
        </div>

        {/* Volume controls (shown on hover or when playing) */}
        {(showControls || isPlaying) && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              type="button"
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
              className="text-slate-400 hover:text-white"
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 accent-emerald-400 cursor-pointer bg-slate-800 rounded-lg"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
