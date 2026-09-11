// ==========================================================================
// SISTEMA DE SONIDOS RETRO - PIXEL VOCACIONAL
// ==========================================================================

const SoundSystem = {
  enabled: true,
  sounds: {},

  // Inicializar sonidos
  init() {
    // Verificar preferencia del usuario
    const saved = localStorage.getItem('sounds_enabled');
    this.enabled = saved === null ? true : saved === 'true';

    // Crear los sonidos
    this.sounds = {
      click: this.createBeep(220, 0.05, 'square'),
      correct: this.createBeep(880, 0.15, 'sine'),
      wrong: this.createBeep(150, 0.25, 'sawtooth'),
      gameOver: this.createBeep(80, 0.5, 'sawtooth'),
      start: this.createBeep(440, 0.1, 'square'),
      win: this.createBeep(1046, 0.2, 'sine')
    };
  },

  // Crear un sonido con Web Audio API (sin archivos externos)
  createBeep(frequency, duration, type) {
    return () => {
      if (!this.enabled) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type || 'square';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        console.warn('No se pudo reproducir sonido:', e);
      }
    };
  },

  // Reproducir un sonido
  play(name) {
    if (!this.enabled) return;
    if (this.sounds[name]) this.sounds[name]();
  },

  // Alternar sonidos
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sounds_enabled', this.enabled);
    return this.enabled;
  }
};