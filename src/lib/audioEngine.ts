/**
 * Jeeto Pakistan Procedural Rhythmic Audio Engine
 * Uses the Web Audio API to produce the iconic high-energy game show suspense & celebration beats.
 */

class JeetoPakistanBeatEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private currentStep = 0;
  private bpm = 128; // Energetic game show tempo
  private masterGain: GainNode | null = null;
  private volume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Deep resonant Dhol / Bass Drum hit
  private playDholBass(time: number, accent = false) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = accent ? 140 : 110;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.16);

    gain.gain.setValueAtTime(accent ? 1.0 : 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // Snappy Dholak / Tabla Treble Slap (Taa / Dha)
  private playDholakSlap(time: number, isGhost = false) {
    if (!this.ctx || !this.masterGain) return;

    // Filtered noise snap
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(3.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isGhost ? 0.25 : 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.08);

    // High harmonic ping
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(180, time + 0.07);

    oscGain.gain.setValueAtTime(isGhost ? 0.2 : 0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  // High-frequency rhythm shaker / jingle
  private playShaker(time: number, accent = false) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.28 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  // Suspense / Game Show Rhythmic Brass Stab
  private playGameShowStab(time: number, chordIndex: number) {
    if (!this.ctx || !this.masterGain) return;
    const notes = [
      [220, 261.63, 329.63], // A minor
      [261.63, 329.63, 392.0], // C major
      [293.66, 349.23, 440.0], // D minor
      [329.63, 415.3, 493.88],  // E dominant
    ];

    const chord = notes[chordIndex % notes.length];

    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(600, time + 0.15);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  // 16-step rhythmic loop representing the Jeeto Pakistan beat pattern
  private tick() {
    if (!this.isPlaying || !this.ctx) return;

    const time = this.ctx.currentTime + 0.05;
    const step = this.currentStep % 16;

    // Jeeto Pakistan Rhythmic Grid:
    // Bass (Dhol): Beats 0, 4, 7, 10, 12
    if (step === 0 || step === 4 || step === 7 || step === 10 || step === 12) {
      this.playDholBass(time, step === 0);
    }

    // Slaps / Claps: Beats 2, 6, 8, 11, 14
    if (step === 2 || step === 6 || step === 10 || step === 14) {
      this.playDholakSlap(time, false);
    } else if (step === 3 || step === 8 || step === 13) {
      this.playDholakSlap(time, true); // ghost note
    }

    // Shakers on every 16th note
    this.playShaker(time, step % 2 === 0);

    // Dramatic Suspense Stab on Bar downbeats
    if (step === 0 || step === 8) {
      const chordIndex = Math.floor(this.currentStep / 16) % 4;
      this.playGameShowStab(time, chordIndex);
    }

    this.currentStep++;
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;
    const stepDurationMs = (60 / this.bpm / 4) * 1000;
    this.timerId = setInterval(() => this.tick(), stepDurationMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const jeetoBeatEngine = new JeetoPakistanBeatEngine();
export const jeetoPakistanBeats = jeetoBeatEngine;
