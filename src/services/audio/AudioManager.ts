class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmActive: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private bgmTimer: NodeJS.Timeout | null = null;
  private bgmArpTimer: NodeJS.Timeout | null = null;
  private currentChordIndex: number = 0;
  private activePadOscs: OscillatorNode[] = [];

  constructor() {
    // Lazy init audio context on first user interaction
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('face_challenge_muted');
      this.isMuted = savedMute === 'true';

      // Attach user interaction listener to resume audio context if suspended
      const resumeListener = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (!this.isMuted && !this.isBgmActive) {
          this.startBgm();
        }
      };
      window.addEventListener('click', resumeListener, { once: true });
      window.addEventListener('keydown', resumeListener, { once: true });
      window.addEventListener('touchstart', resumeListener, { once: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('face_challenge_muted', String(this.isMuted));
    }

    if (this.isMuted) {
      if (this.bgmGainNode && this.ctx) {
        this.bgmGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.bgmGainNode && this.ctx) {
        this.bgmGainNode.gain.setValueAtTime(0.065, this.ctx.currentTime);
      }
      if (!this.isBgmActive) {
        this.startBgm();
      }
    }

    return this.isMuted;
  }

  // ==========================================
  // BACKGROUND MUSIC (BGM) PROCEDURAL SYNTH
  // ==========================================
  // Ambient, soothing, uplifting chord progression (Cmaj9 - Am9 - Fmaj7 - Gsus4)
  startBgm() {
    if (this.isBgmActive) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmActive = true;

    // Master BGM Gain
    this.bgmGainNode = ctx.createGain();
    this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.065, ctx.currentTime);
    this.bgmGainNode.connect(ctx.destination);

    // Warm chord progression frequencies [root, third, fifth, seventh/ninth]
    const chords = [
      // Cmaj9
      [130.81, 196.00, 246.94, 329.63, 293.66],
      // Am9
      [110.00, 164.81, 196.00, 261.63, 246.94],
      // Fmaj7
      [87.31, 130.81, 174.61, 220.00, 261.63],
      // Gsus4 -> G
      [98.00, 146.83, 196.00, 261.63, 293.66]
    ];

    const chordDuration = 5.0; // 5 seconds per chord

    const playNextPadChord = () => {
      if (!this.isBgmActive || !this.bgmGainNode) return;
      const curCtx = this.getContext();
      if (!curCtx) return;

      const chord = chords[this.currentChordIndex % chords.length];
      this.currentChordIndex++;

      const now = curCtx.currentTime;

      // Filter for warm soft pad feel
      const filter = curCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + chordDuration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(650, now + chordDuration);

      const chordGain = curCtx.createGain();
      // Gentle attack and release
      chordGain.gain.setValueAtTime(0.001, now);
      chordGain.gain.linearRampToValueAtTime(0.35, now + 1.2);
      chordGain.gain.setValueAtTime(0.35, now + chordDuration - 1.2);
      chordGain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

      filter.connect(chordGain);
      chordGain.connect(this.bgmGainNode);

      // Create oscillators for chord
      chord.forEach((freq) => {
        try {
          const osc = curCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Subtle slow chorus detune
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

          osc.connect(filter);
          osc.start(now);
          osc.stop(now + chordDuration);
        } catch {}
      });
    };

    // Soft pentatonic melodic kalimba/bell chimes
    const pentatonicScales = [
      [523.25, 659.25, 783.99, 987.77, 1046.50, 1174.66], // C major pentatonic / lydian
      [440.00, 523.25, 659.25, 783.99, 880.00, 1046.50],  // A minor pentatonic
      [349.23, 440.00, 523.25, 659.25, 698.46, 880.00],   // F major
      [392.00, 493.88, 587.33, 659.25, 783.99, 987.77]    // G major
    ];

    const playRandomChime = () => {
      if (!this.isBgmActive || !this.bgmGainNode || this.isMuted) return;
      const curCtx = this.getContext();
      if (!curCtx) return;

      const scale = pentatonicScales[(this.currentChordIndex - 1 + pentatonicScales.length) % pentatonicScales.length];
      const noteFreq = scale[Math.floor(Math.random() * scale.length)];
      const now = curCtx.currentTime;

      try {
        const osc = curCtx.createOscillator();
        const gain = curCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.bgmGainNode);

        osc.start(now);
        osc.stop(now + 1.2);
      } catch {}
    };

    // Trigger first chord immediately
    playNextPadChord();

    // Schedule chord transitions
    this.bgmTimer = setInterval(() => {
      playNextPadChord();
    }, chordDuration * 1000 - 200);

    // Schedule gentle bell chimes at musical intervals
    this.bgmArpTimer = setInterval(() => {
      if (Math.random() > 0.3) {
        playRandomChime();
      }
    }, 1800);
  }

  stopBgm() {
    this.isBgmActive = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmArpTimer) {
      clearInterval(this.bgmArpTimer);
      this.bgmArpTimer = null;
    }
    if (this.bgmGainNode && this.ctx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmGainNode.disconnect();
      } catch {}
      this.bgmGainNode = null;
    }
  }

  // ==========================================
  // CELEBRATORY & INTERACTION SOUND EFFECTS
  // ==========================================

  // 1. "mỗi khi đạt số điểm cần" - Triggered the instant student's face score reaches target passThreshold
  playScoreTargetReached() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-tech celestial rising chime arpeggio: C5, E5, G5, B5, C6, E6
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.24, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.35);
      });

      // Shimmering sub-tone
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(440, now);
      subOsc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      subGain.gain.setValueAtTime(0.12, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.35);
    } catch {}
  }

  // 2. "mỗi khi trả lời đúng" - Bright two-tone celebratory chime fanfare with harmonic bells
  playCorrectAnswer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Joyful correct chime: F5 (698.46) -> A5 (880.00) -> C6 (1046.50)
      const chord = [
        { f: 698.46, delay: 0, dur: 0.2 },
        { f: 880.00, delay: 0.08, dur: 0.22 },
        { f: 1046.50, delay: 0.16, dur: 0.45 },
        { f: 1396.91, delay: 0.22, dur: 0.55 }
      ];

      chord.forEach(({ f, delay, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + delay);

        gain.gain.setValueAtTime(0.26, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });
    } catch {}
  }

  // 3. "cũng như là ghép đúng ô" - Crisp tactile puzzle snap + harmonic harp chime
  playPieceSnap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Crisp mechanical lock snap click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(160, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.04);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);

      // Uplifting piece-locked bell chord (D5, F#5, A5, D6)
      const chord = [587.33, 739.99, 880.00, 1174.66];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.03 + idx * 0.04);

        gain.gain.setValueAtTime(0.22, now + 0.03 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03 + idx * 0.04 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.03 + idx * 0.04);
        osc.stop(now + 0.03 + idx * 0.04 + 0.38);
      });
    } catch {}
  }

  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  playSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {}
  }

  playFail() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [330, 293.66, 261.63]; // E4, D4, C4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.2);
      });
    } catch {}
  }

  playPuzzleUnlock() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const chord = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.5);
      });
    } catch {}
  }

  playWrongDrop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Fanfare: G4, C5, E5, G5, E5, G5
      const notes = [
        { f: 392.00, d: 0.15 },
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.35 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.6 }
      ];

      let t = ctx.currentTime;
      notes.forEach(({ f, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + d);
        t += d * 0.85;
      });
    } catch {}
  }

  // Futuristic tech touch tactile sound for buttons and touches
  playTechTap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-tech laser chirp
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1250, now);
      osc1.frequency.exponentialRampToValueAtTime(550, now + 0.03);

      gain1.gain.setValueAtTime(0.09, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.03);

      // Subtle tactile body thump
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(240, now);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.025);

      gain2.gain.setValueAtTime(0.06, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.025);
    } catch {}
  }

  // Soft futuristic keyboard / tactile tap
  playTechKey() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch {}
  }
}

export const audioManager = new AudioManager();

