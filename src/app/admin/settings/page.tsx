'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Save,
  Clock,
  Shield,
  Music,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [trackTitle, setTrackTitle] = useState('Jeeto Pakistan Game Show (Waqar Ali / ARY Digital)');
  const [trackUrl, setTrackUrl] = useState('/audio/jeeto-pakistan-theme.mp3');
  const [volume, setVolume] = useState(0.4);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSettings();
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sound-settings');
      if (res.ok) {
        const data = await res.json();
        setSoundEnabled(data.soundEnabled ?? true);
        setTrackTitle(data.trackTitle || 'Jeeto Pakistan Rhythmic Beats');
        setTrackUrl(data.trackUrl || 'synthesized-jeeto-beats');
        setVolume(data.volume ?? 0.6);
        setSessionTimeoutMinutes(data.sessionTimeoutMinutes ?? 30);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/sound-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soundEnabled,
          trackTitle,
          trackUrl,
          volume,
          sessionTimeoutMinutes,
        }),
      });

      if (res.ok) {
        showNotice('success', 'Platform sound and session timeout settings saved successfully!');
      } else {
        showNotice('error', 'Failed to save settings.');
      }
    } catch (err) {
      showNotice('error', 'Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const togglePreview = () => {
    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio('/audio/jeeto-pakistan-theme.mp3');
        previewAudioRef.current.loop = true;
      }
      previewAudioRef.current.volume = volume;
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => {
        setIsPlayingPreview(false);
      });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = newVol;
    }
  };

  const selectPreset = (type: 'jeeto' | 'custom') => {
    if (type === 'jeeto') {
      setTrackTitle('Jeeto Pakistan Game Show (Waqar Ali / ARY Digital)');
      setTrackUrl('/audio/jeeto-pakistan-theme.mp3');
    } else {
      setTrackTitle('Custom Game Show Track');
      setTrackUrl('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Global Configuration
          </span>
          <h1 className="text-2xl font-black text-white">Sound &amp; Session Inactivity Controls</h1>
          <p className="text-xs text-slate-300 mt-1">
            Master audio controls (Jeeto Pakistan beats / custom music) and user session auto-logout timers.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
            notice.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-3xl border border-white/10">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs">Loading platform settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sound Controls Card */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Full Website Sound Controls</h2>
                  <p className="text-[11px] text-slate-400">
                    Controls background beats and sound widget across the entire platform.
                  </p>
                </div>
              </div>

              {/* Master ON/OFF Switch */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Master Sound Status:</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                    soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {soundEnabled ? 'ENABLED (Sound On)' : 'MUTED (Turned Off for Full Website)'}
                </span>
              </div>

              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Active Sound Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => selectPreset('jeeto')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      trackUrl === 'synthesized-jeeto-beats'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-xs text-white">Jeeto Pakistan Beats</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      High-energy game show dholak, tabla, and suspense percussion (Built-in Web Audio).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPreset('custom')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      trackUrl !== 'synthesized-jeeto-beats'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-xs text-white">Custom Audio URL</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Enter any external MP3, stream, or audio clip link.
                    </p>
                  </button>
                </div>
              </div>

              {/* Title & URL Inputs */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Sound Display Title</label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="e.g. Jeeto Pakistan Rhythmic Beats"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {trackUrl !== 'synthesized-jeeto-beats' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      Custom Sound URL (Direct MP3 or Web Audio link)
                    </label>
                    <input
                      type="url"
                      value={trackUrl}
                      onChange={(e) => setTrackUrl(e.target.value)}
                      placeholder="https://example.com/audio/theme-song.mp3"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Volume Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Default Volume Level
                  </span>
                  <span className="font-mono font-bold text-amber-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Live Preview Button */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Test sound before saving:</span>
                <button
                  type="button"
                  onClick={togglePreview}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    isPlayingPreview
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                  }`}
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop Beat Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-amber-400" />
                      <span>Play Beat Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Session Inactivity Timeout Card */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Login Session Inactivity Timeout</h2>
                  <p className="text-[11px] text-slate-400">
                    &quot;After how much time off the login&quot; (idle logout safeguard).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  To protect participants and prevent unauthorized entries from shared or public computers, the system automatically logs out inactive users after this duration.
                </p>

                {/* Preset Timeout Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Choose Inactivity Timeout Limit
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[15, 30, 60, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSessionTimeoutMinutes(mins)}
                        className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition ${
                          sessionTimeoutMinutes === mins
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                            : 'bg-slate-950 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {mins < 60 ? `${mins} Minutes` : `${mins / 60} Hour${mins / 60 > 1 ? 's' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Minutes Input */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Custom Timeout (in Minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={sessionTimeoutMinutes}
                      onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value, 10) || 30)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">Minutes</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Recommended: 30 minutes for standard user security, 15 minutes for strict security.
                  </span>
                </div>

                {/* Security Badge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Active Timeout Guard Enabled</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    When a participant is idle for {sessionTimeoutMinutes} minutes, a 60-second warning dialog will display before terminating the session and redirecting to the login portal.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Apply & Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
