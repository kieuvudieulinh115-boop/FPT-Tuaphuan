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

      // Attach user interaction listener to resume audio context if suspended (BGM removed per user request)
      const resumeListener = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
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
    return this.isMuted;
  }

  // ==========================================
  // BACKGROUND MUSIC (BGM) - DISABLED
  // (Huỷ bỏ hoàn toàn âm thanh nền nhẹ nhàng theo yêu cầu người dùng,
  // chỉ giữ lại âm thanh hiệu ứng khi click, chọn đáp án hoặc thao tác)
  // ==========================================
  startBgm() {
    // Intentionally no-op to cancel gentle ambient background loop
    this.stopBgm();
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
  // User directive: "bỏ tất cả âm thanh có trong phần mềm chỉ giữ lại hiệu ứng chạm"
  // All melodies, victory fanfare, timer ticks, pass/fail chimes are removed.
  // ONLY the tactile touch / tap effect (hiệu ứng chạm) is kept active.
  // ==========================================

  // Disabled per request: no chime when score target reached
  playScoreTargetReached() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no fanfare when answering correctly
  playCorrectAnswer() {
    // Intentionally disabled - only touch sound is retained
  }

  // Tactile touch feedback when snapping a puzzle piece into place
  playPieceSnap() {
    this.playClick();
  }

  // HIỆU ỨNG CHẠM (Tactile Touch / Tap Effect)
  // Clean, crisp and satisfying mechanical touch feedback for buttons, puzzle pieces, answers & interactions
  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-precision tactile haptic touch click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  // Disabled per request: no countdown timer ticks
  playTick() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no success jingles
  playSuccess() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no failure chimes
  playFail() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no puzzle unlock chimes
  playPuzzleUnlock() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no wrong drop buzzer or knocks
  playWrongDrop() {
    // Intentionally disabled - only touch sound is retained
  }

  // Disabled per request: no game over victory fanfare
  playVictory() {
    // Intentionally disabled - only touch sound is retained
  }

  // Futuristic tech touch tactile sound for buttons and touches (alias for touch effect)
  playTechTap() {
    this.playClick();
  }

  // Soft tactile key tap
  playTechKey() {
    this.playClick();
  }
}

export const audioManager = new AudioManager();

