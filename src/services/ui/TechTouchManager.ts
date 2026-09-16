import { audioManager } from '../audio/AudioManager';

export class TechTouchManager {
  private isInitialized = false;
  private lastTapTimestamp = 0;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Pointer down / touch listener
    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });

    // Keydown listener for keyboard touches/typing
    window.addEventListener('keydown', this.handleKeyDown, { passive: true });
  }

  destroy() {
    if (!this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = false;
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handlePointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if target or parent is an interactive element
    const interactive = target.closest(
      'button, a, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [data-tech-touch], .interactive-tech'
    );

    // If interactive or clicked on game elements
    if (interactive || target.classList.contains('cursor-pointer') || target.tagName === 'BUTTON') {
      const now = Date.now();
      // Throttle audio slightly so multi-touch doesn't clip
      if (now - this.lastTapTimestamp > 35) {
        this.lastTapTimestamp = now;
        audioManager.playTechTap();
      }

      this.spawnCyberRipple(e.clientX, e.clientY);
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Exclude modifiers
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

    const target = e.target as HTMLElement | null;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (isInput || e.key === 'Enter' || e.key === ' ') {
      audioManager.playTechKey();

      if (target && isInput) {
        const rect = target.getBoundingClientRect();
        // Subtle ripple near the active input
        this.spawnCyberRipple(rect.left + rect.width * 0.9, rect.top + rect.height / 2, true);
      }
    }
  };

  // Spawn visual sci-fi cyber ripple at touch coordinates
  public spawnCyberRipple(x: number, y: number, isMini = false) {
    if (typeof document === 'undefined') return;

    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'cyber-touch-ripple';
    rippleContainer.style.left = `${x}px`;
    rippleContainer.style.top = `${y}px`;

    // Outer expanding neon-cyan ring
    const outerRing = document.createElement('div');
    outerRing.className = 'cyber-touch-outer';
    if (isMini) {
      outerRing.style.width = '32px';
      outerRing.style.height = '32px';
    }

    // Inner glowing pulse
    const innerPulse = document.createElement('div');
    innerPulse.className = 'cyber-touch-inner';
    if (isMini) {
      innerPulse.style.width = '18px';
      innerPulse.style.height = '18px';
    }

    // Cyber crosshair SVG
    const crosshair = document.createElement('div');
    crosshair.className = 'cyber-touch-crosshair flex items-center justify-center';
    crosshair.innerHTML = `
      <svg viewBox="0 0 24 24" width="${isMini ? 16 : 24}" height="${isMini ? 16 : 24}" fill="none" stroke="rgba(6, 182, 212, 0.9)" stroke-width="2">
        <line x1="12" y1="2" x2="12" y2="7"></line>
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <line x1="2" y1="12" x2="7" y2="12"></line>
        <line x1="17" y1="12" x2="22" y2="12"></line>
        <circle cx="12" cy="12" r="2" fill="#00f0ff"></circle>
      </svg>
    `;

    rippleContainer.appendChild(outerRing);
    rippleContainer.appendChild(innerPulse);
    rippleContainer.appendChild(crosshair);

    document.body.appendChild(rippleContainer);

    // Auto cleanup
    setTimeout(() => {
      rippleContainer.remove();
    }, 450);
  }
}

export const techTouchManager = new TechTouchManager();
