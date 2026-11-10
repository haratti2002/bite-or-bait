// ============================================================================
// BITE OR BAIT - 100% Procedural Web Audio Synthesizer Engine ($0 Asset Cost)
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.stalking = false;
    this.bgmTimer = null;
    this.stepIndex = 0;
    this.masterGain = null;
    this.underwaterFilter = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;

    // Underwater lowpass filter that opens up when jumping above water or in menus
    this.underwaterFilter = this.ctx.createBiquadFilter();
    this.underwaterFilter.type = 'lowpass';
    this.underwaterFilter.frequency.value = 1800;
    this.underwaterFilter.Q.value = 1.2;

    this.underwaterFilter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  setUnderwater(isUnderwater) {
    if (!this.ctx || !this.underwaterFilter) return;
    const targetFreq = isUnderwater ? 1600 : 12000;
    this.underwaterFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  setStalkMode(active) {
    this.stalking = active;
    if (!this.ctx || !this.underwaterFilter) return;
    const targetFreq = active ? 750 : 1600;
    this.underwaterFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  // --- SOUND EFFECTS ---

  playSwim(intensity = 1) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220 * intensity, now);
    filter.frequency.exponentialRampToValueAtTime(480 * intensity, now + 0.12);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.underwaterFilter);
    noise.start(now);
  }

  playSonarPing() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // High crystalline sonar ping + sub wave
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    sub.type = 'triangle';
    sub.frequency.setValueAtTime(220, now);
    sub.frequency.exponentialRampToValueAtTime(110, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.masterGain); // Bypass underwater muffle for crisp ping

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.65);
    sub.stop(now + 0.65);
  }

  playHeartbeat() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [0, 0.16].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const startFreq = idx === 0 ? 95 : 80;
      osc.frequency.setValueAtTime(startFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(32, now + offset + 0.12);

      gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  }

  playLureRattle() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    // Metallic plastic rattle clicks (Click-Clack!)
    [0, 0.06, 0.14].forEach((offset, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800 + i * 450, now + offset);
      osc.frequency.exponentialRampToValueAtTime(600, now + offset + 0.035);

      gain.gain.setValueAtTime(0.14, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.045);
    });
  }

  playChomp() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Deep vacuum gulp + comic crunch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.28);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.31);

    // Joyful powerup chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(freq, now + 0.08 + i * 0.055);
      cGain.gain.setValueAtTime(0.22, now + 0.08 + i * 0.055);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + i * 0.055);
      cOsc.connect(cGain);
      cGain.connect(this.masterGain);
      cOsc.start(now + 0.08 + i * 0.055);
      cOsc.stop(now + 0.3 + i * 0.055);
    });
  }

  playTease(multiplier = 1) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Comic brake screech / whip-turn + funky brass stab!
    const slide = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    slide.type = 'sawtooth';
    slide.frequency.setValueAtTime(300, now);
    slide.frequency.exponentialRampToValueAtTime(920, now + 0.12);
    slide.frequency.exponentialRampToValueAtTime(220, now + 0.25);

    slideGain.gain.setValueAtTime(0.3, now);
    slideGain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

    slide.connect(slideGain);
    slideGain.connect(this.masterGain);
    slide.start(now);
    slide.stop(now + 0.27);

    // Funky comic horn chord
    const baseNotes = multiplier >= 3 ? [440, 554.37, 659.25, 880] : [349.23, 440, 523.25];
    baseNotes.forEach((freq, idx) => {
      const horn = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      horn.type = 'sawtooth';
      horn.frequency.setValueAtTime(freq * 0.96, now + 0.08);
      horn.frequency.linearRampToValueAtTime(freq, now + 0.14);

      hGain.gain.setValueAtTime(0.16, now + 0.08);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      horn.connect(hGain);
      hGain.connect(this.masterGain);
      horn.start(now + 0.08);
      horn.stop(now + 0.46);
    });
  }

  playPlasticAlarm() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    // Urgent comic alarm when a lure enters the mouth!
    [0, 0.12, 0.24].forEach((offset, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 740 : 520, now + offset);

      gain.gain.setValueAtTime(0.32, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.11);
    });
  }

  playSpitOut() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    // "PTUI!!" cartoon spit projectile sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  playHooked() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    // Harsh metallic rip + danger chord
    [130.81, 138.59, 196.0].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.85, now + 0.5);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.56);
    });
  }

  playSplash() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.4);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.45);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  // --- PROCEDURAL INTERACTIVE FUNK BASSLINE BGM ---

  startBGM() {
    this.init();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.stepIndex = 0;

    // 16-step funky bass groove in E minor pentatonic
    const bassLine = [
      82.41, 0, 82.41, 98.0,
      110.0, 0, 123.47, 110.0,
      82.41, 0, 82.41, 146.83,
      123.47, 110.0, 98.0, 0
    ];

    const tick = () => {
      if (!this.bgmPlaying) return;
      if (this.ctx && !this.muted && this.ctx.state === 'running') {
        const now = this.ctx.currentTime;
        const step = this.stepIndex % 16;
        const freq = bassLine[step];

        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = this.stalking ? 'triangle' : 'sawtooth';
          const playFreq = this.stalking ? freq * 0.75 : freq;
          osc.frequency.setValueAtTime(playFreq, now);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(this.stalking ? 320 : 850, now);
          filter.frequency.exponentialRampToValueAtTime(160, now + 0.14);

          gain.gain.setValueAtTime(0.13, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.underwaterFilter);

          osc.start(now);
          osc.stop(now + 0.17);
        }

        // Subtle hi-hat / water bubble percussion on off-beats
        if (step % 2 === 1 && !this.stalking) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          hatOsc.type = 'sine';
          hatOsc.frequency.setValueAtTime(520 + (step * 40), now);
          hatOsc.frequency.exponentialRampToValueAtTime(980, now + 0.04);

          hatGain.gain.setValueAtTime(0.04, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          hatOsc.connect(hatGain);
          hatGain.connect(this.underwaterFilter);
          hatOsc.start(now);
          hatOsc.stop(now + 0.05);
        }

        // If stalking, add tense heartbeat pulse every 4 steps
        if (this.stalking && step % 4 === 0) {
          this.playHeartbeat();
        }
      }
      this.stepIndex++;
      const tempoMs = this.stalking ? 190 : 145;
      this.bgmTimer = setTimeout(tick, tempoMs);
    };

    tick();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.soundEngine = new SoundEngine();
