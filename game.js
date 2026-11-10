// ============================================================================
// BITE OR BAIT — Enhanced Gameplay Engine (Combo, Ambush, Loupe & Perks)
// ============================================================================

class BiteOrBaitGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new window.ComicRenderer(this.canvas);

    this.keys = {};
    this.discoveredIds = new Set();

    this.perks = {
      lineVisionBoost: 0,
      teaseDamageMult: 1.0,
      speedMult: 1.0
    };

    this.state = {
      mode: 'MENU', // MENU, PLAYING, SPIT_REFLEX, GILL_WASH, WAVE_CLEAR, GAME_OVER, VICTORY
      time: 0,
      waveIndex: 0,
      currentAngler: window.ANGLERS[0],
      anglerSanity: window.ANGLERS[0].sanityMax,
      anglerMood: 'idle',
      anglerQuote: window.ANGLERS[0].quotes.idle[0],
      moodTimer: 0,
      boatX: 460,
      boatDir: 1,
      twitchTimer: 4.0,

      score: 0,
      combo: 0,
      maxCombo: 0,
      bassWeight: 2.5,
      hunger: 100,
      lives: 3,

      sonarTimer: 0,
      sonarDuration: 2.8,
      sonarCooldown: 0,
      sonarMaxCooldown: 5.5,
      sonarOrigin: { x: 0, y: 0 },

      bass: {
        x: 240,
        y: 380,
        vx: 0,
        vy: 0,
        speed: 0,
        facing: 1,
        tilt: 0,
        scale: 1,
        mouthOpen: 0,
        stalking: false,
        coolTimer: 0,
        inCover: false
      },

      items: [],
      focusedItem: null,
      stalkProgress: 0,
      hookedItem: null,

      spitTimer: 0,
      spitWindow: 0.85,
      gillWashProgress: 0,

      popups: [],
      bubbles: [],
      particles: [],
      screenShake: 0,
      nextItemId: 1,
      perks: this.perks
    };

    this.initBubbles();
    this.bindEvents();
    this.resize();
    this.updateOverlayUI();

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  initBubbles() {
    this.state.bubbles = [];
    for (let i = 0; i < 26; i++) {
      this.state.bubbles.push({
        x: Math.random() * 960,
        y: 155 + Math.random() * 430,
        r: 2 + Math.random() * 4.5,
        vy: 20 + Math.random() * 30
      });
    }
  }

  spawnParticles(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 190;
      const life = 0.4 + Math.random() * 0.45;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 5,
        color,
        life,
        maxLife: life
      });
    }
  }

  resize() {
    this.canvas.width = 960;
    this.canvas.height = 600;
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }
      const wasDown = this.keys[code];
      this.keys[code] = true;
      if (!wasDown) {
        this.onKeyPress(code);
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      this.keys[code] = false;
      this.onKeyRelease(code);
    });

    document.getElementById('btnStartGame').addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.startBGM();
      this.startNewGame();
    });

    document.getElementById('btnOpenDex').addEventListener('click', () => {
      this.toggleDexModal(true);
    });

    document.getElementById('btnCloseDex').addEventListener('click', () => {
      this.toggleDexModal(false);
    });

    document.getElementById('btnMute').addEventListener('click', (e) => {
      window.soundEngine.init();
      const muted = window.soundEngine.toggleMute();
      e.currentTarget.textContent = muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
    });

    document.getElementById('btnNextWave').addEventListener('click', () => {
      this.startNextWave();
    });

    document.getElementById('btnAdRevive').addEventListener('click', () => {
      this.triggerRewardedAdRevive();
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
      this.startNewGame();
    });
  }

  onKeyPress(code) {
    const st = this.state;

    if (st.mode === 'MENU' && (code === 'Space' || code === 'Enter')) {
      window.soundEngine.init();
      window.soundEngine.startBGM();
      this.startNewGame();
      return;
    }

    if (st.mode === 'WAVE_CLEAR' && (code === 'Space' || code === 'Enter')) {
      this.startNextWave();
      return;
    }

    if (st.mode === 'SPIT_REFLEX') {
      if (code === 'ArrowLeft' || code === 'KeyA' || code === 'Space') {
        this.succeedSpitOut();
      }
      return;
    }

    if (st.mode === 'GILL_WASH') {
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        st.gillWashProgress += 18;
        st.screenShake = 0.25;
        this.spawnParticles(st.bass.x, st.bass.y, '#00ffcc', 6);
        window.soundEngine.playSplash();
        if (st.gillWashProgress >= 100) {
          this.succeedGillWash();
        }
      }
      return;
    }

    if (st.mode !== 'PLAYING') return;

    if (code === 'KeyZ' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.triggerSonar();
    }

    if ((code === 'KeyX' || code === 'Enter') && st.focusedItem) {
      this.executeBite(st.focusedItem);
    }

    if (code === 'KeyC' && st.focusedItem) {
      this.executeTease(st.focusedItem, Math.max(0.5, st.stalkProgress));
    }
  }

  onKeyRelease(code) {
    const st = this.state;
    if (st.mode !== 'PLAYING') return;

    if (code === 'Space' && st.bass.stalking) {
      if (st.focusedItem && st.stalkProgress >= 0.18 && st.stalkProgress < 0.98) {
        this.executeTease(st.focusedItem, st.stalkProgress);
      }
      st.bass.stalking = false;
      st.stalkProgress = 0;
      window.soundEngine.setStalkMode(false);
    }
  }

  // ==========================================================================
  // GAME FLOW & STAGE MANAGEMENT
  // ==========================================================================
  startNewGame() {
    const st = this.state;
    this.perks.lineVisionBoost = 0;
    this.perks.teaseDamageMult = 1.0;
    this.perks.speedMult = 1.0;
    st.sonarMaxCooldown = 5.5;
    st.sonarDuration = 2.8;
    st.spitWindow = 0.85;

    st.waveIndex = 0;
    st.score = 0;
    st.combo = 0;
    st.maxCombo = 0;
    st.bassWeight = 2.5;
    st.hunger = 100;
    st.lives = 3;
    this.setupWave(0);
  }

  setupWave(waveIdx) {
    const st = this.state;
    st.waveIndex = waveIdx;
    st.currentAngler = window.ANGLERS[waveIdx];
    st.anglerSanity = st.currentAngler.sanityMax;
    st.anglerMood = 'idle';
    st.anglerQuote = st.currentAngler.quotes.idle[0];
    st.mode = 'PLAYING';
    st.items = [];
    st.popups = [];
    st.particles = [];
    st.focusedItem = null;
    st.stalkProgress = 0;
    st.sonarCooldown = 0;
    st.sonarTimer = 0;
    st.boatX = 460;
    st.twitchTimer = st.currentAngler.castInterval;

    st.bass.x = 220;
    st.bass.y = 380;
    st.bass.vx = 0;
    st.bass.vy = 0;
    st.bass.stalking = false;
    st.bass.mouthOpen = 0;

    window.soundEngine.setUnderwater(true);
    window.soundEngine.setStalkMode(false);

    for (let i = 0; i < 6; i++) {
      this.spawnItem();
    }

    this.addPopup(480, 270, `${st.currentAngler.title}`, '#ffea00', 30, true, 165);
    this.updateOverlayUI();
  }

  startNextWave() {
    if (this.state.waveIndex + 1 < window.ANGLERS.length) {
      this.setupWave(this.state.waveIndex + 1);
    } else {
      this.setupWave(0);
    }
  }

  spawnItem() {
    const st = this.state;
    const waveNum = st.waveIndex + 1;
    const eligible = window.ITEM_CATALOG.filter((it) => it.minWave <= waveNum);

    const currentReal = st.items.filter((i) => !i.spec.isLure).length;
    const currentFake = st.items.filter((i) => i.spec.isLure).length;

    let pool = eligible;
    if (currentReal < 2) {
      pool = eligible.filter((i) => !i.isLure);
    } else if (currentFake < 2) {
      pool = eligible.filter((i) => i.isLure);
    }

    const spec = pool[Math.floor(Math.random() * pool.length)];
    const fromRight = Math.random() > 0.4;
    const startX = 120 + Math.random() * 720;
    let startY = 195 + Math.random() * 315;
    if (spec.shape === 'frog') startY = 162 + Math.random() * 20;
    if (spec.shape === 'craw') startY = 515 + Math.random() * 42;

    this.state.items.push({
      idNum: st.nextItemId++,
      spec,
      x: startX,
      y: startY,
      baseY: startY,
      anchorX: startX + (Math.random() - 0.5) * 65,
      vx: (fromRight ? -1 : 1) * (35 + Math.random() * 38),
      vy: 0,
      angle: 0,
      rattleCooldown: 1 + Math.random() * 1.8
    });
  }

  // ==========================================================================
  // CORE ACTIONS: SONAR, TEASE, BITE, SPIT-OUT, & GILL-WASH
  // ==========================================================================
  triggerSonar() {
    const st = this.state;
    if (st.sonarCooldown > 0) return;

    st.sonarTimer = st.sonarDuration;
    st.sonarCooldown = st.sonarMaxCooldown;
    st.sonarOrigin = { x: st.bass.x, y: st.bass.y };
    window.soundEngine.playSonarPing();
    this.addPopup(st.bass.x, st.bass.y - 48, 'LATERAL SONAR!!', '#00ffff', 24, true, 95);
  }

  executeTease(item, stalkLevel) {
    const st = this.state;
    this.discoveredIds.add(item.spec.id);

    const dir = st.bass.x < item.x ? -1 : 1;
    st.bass.vx = dir * 320;
    st.bass.vy = -90;
    st.bass.facing = dir;
    st.bass.stalking = false;
    st.bass.mouthOpen = 0;
    st.stalkProgress = 0;
    window.soundEngine.setStalkMode(false);

    if (item.spec.isLure) {
      st.combo += 1;
      st.maxCombo = Math.max(st.maxCombo, st.combo);

      let mult = 2;
      let label = 'PSYCH!! x2!';
      if (stalkLevel >= 0.72) {
        mult = 5;
        label = 'EXTREME TEASE x5!!';
      } else if (stalkLevel >= 0.45) {
        mult = 3;
        label = 'SUPER TEASE x3!!';
      }

      const ambushMult = st.bass.inCover ? 1.5 : 1.0;
      const feverMult = st.combo >= 4 ? 1.5 : 1.0;
      const pts = Math.round(item.spec.points * mult * ambushMult * feverMult);
      const rageDmg = Math.round(
        item.spec.angerDamage * (0.75 + stalkLevel * 0.9) * this.perks.teaseDamageMult * ambushMult
      );

      st.score += pts;
      st.anglerSanity = Math.max(0, st.anglerSanity - rageDmg);
      st.anglerMood = 'teased';
      st.moodTimer = 2.6;
      const quotes = st.currentAngler.quotes.teased;
      st.anglerQuote = quotes[Math.floor(Math.random() * quotes.length)];

      st.bass.coolTimer = 2.4;
      st.screenShake = 0.4;

      window.soundEngine.playTease(mult);
      this.spawnParticles(item.x, item.y, '#ffea00', 18);
      this.addPopup(item.x, item.y - 26, label, '#ffea00', 28, true, 125);
      this.addPopup(
        item.x,
        item.y + 22,
        `+${pts} PTS! (-${rageDmg} PATIENCE)${ambushMult > 1 ? ' [AMBUSH!]' : ''}`,
        '#00ffcc',
        19,
        false
      );

      this.removeItem(item);
      this.checkWaveCompletion();
    } else {
      st.combo = 0;
      window.soundEngine.playSwim(1.5);
      this.addPopup(item.x, item.y - 20, 'OOPS! SCARED REAL PREY AWAY!', '#ff9f43', 22, true, 125);
      this.removeItem(item);
    }
  }

  executeBite(item) {
    const st = this.state;
    this.discoveredIds.add(item.spec.id);

    st.bass.stalking = false;
    st.bass.mouthOpen = 1.0;
    st.stalkProgress = 0;
    window.soundEngine.setStalkMode(false);

    if (!item.spec.isLure) {
      st.combo += 1;
      st.maxCombo = Math.max(st.maxCombo, st.combo);

      const ambushMult = st.bass.inCover ? 1.5 : 1.0;
      const feverMult = st.combo >= 4 ? 1.5 : 1.0;
      const pts = Math.round(item.spec.points * ambushMult * feverMult);

      st.score += pts;
      st.bassWeight += item.spec.weightGain;
      st.bass.scale = Math.min(1.6, 1 + (st.bassWeight - 2.5) * 0.045);
      st.hunger = Math.min(100, st.hunger + item.spec.hungerRestore);
      st.anglerSanity = Math.max(0, st.anglerSanity - 12);

      window.soundEngine.playChomp();
      this.spawnParticles(item.x, item.y, '#2ecc71', 16);
      this.addPopup(item.x, item.y - 24, 'CHOMP!! DELICIOUS!', '#2ecc71', 28, true, 115);
      this.addPopup(
        item.x,
        item.y + 20,
        `+${item.spec.weightGain.toFixed(1)} LBS! +${pts} PTS`,
        '#ffffff',
        19,
        false
      );

      this.removeItem(item);
      this.checkWaveCompletion();
    } else {
      st.combo = 0;
      st.mode = 'SPIT_REFLEX';
      st.hookedItem = item;
      st.spitTimer = st.spitWindow;
      st.screenShake = 0.5;
      window.soundEngine.playPlasticAlarm();
    }
  }

  succeedSpitOut() {
    const st = this.state;
    const item = st.hookedItem;
    st.mode = 'PLAYING';
    st.bass.mouthOpen = 0;
    st.bass.vx = -st.bass.facing * 280;

    const bonus = 450;
    st.score += bonus;
    st.anglerSanity = Math.max(0, st.anglerSanity - 38);
    st.anglerMood = 'teased';
    st.moodTimer = 2.8;
    const quotes = st.currentAngler.quotes.spit;
    st.anglerQuote = quotes[Math.floor(Math.random() * quotes.length)];

    window.soundEngine.playSpitOut();
    if (item) {
      this.spawnParticles(item.x, item.y, '#00ffcc', 20);
      this.addPopup(item.x, item.y - 25, 'PTUI!! SPIT AT ANGLER!!', '#00ffcc', 28, true, 135);
      this.removeItem(item);
    }
    this.checkWaveCompletion();
  }

  failSpitOutAndHook() {
    const st = this.state;
    st.mode = 'GILL_WASH';
    st.gillWashProgress = 22;
    st.anglerMood = 'hooked';
    st.anglerQuote = st.currentAngler.quotes.hooked[0];
    st.screenShake = 0.65;
    window.soundEngine.playHooked();
    this.addPopup(st.bass.x, st.bass.y - 40, 'HOOKSET!! MASH [SPACE]!!', '#ff3838', 28, true, 130);
  }

  succeedGillWash() {
    const st = this.state;
    st.mode = 'PLAYING';
    st.bass.y = 152;
    st.bass.vy = 150;
    st.bass.mouthOpen = 0;

    window.soundEngine.setUnderwater(false);
    window.soundEngine.playSplash();
    this.spawnParticles(st.bass.x, 150, '#ffffff', 24);
    setTimeout(() => window.soundEngine.setUnderwater(true), 450);

    if (st.hookedItem) {
      this.removeItem(st.hookedItem);
      st.hookedItem = null;
    }

    st.score += 300;
    st.anglerSanity = Math.max(0, st.anglerSanity - 28);
    st.anglerMood = 'teased';
    st.moodTimer = 2.5;
    st.anglerQuote = 'NOOO!! IT THREW MY KSK LURE ON THE JUMP!!';

    this.addPopup(st.bass.x, 175, 'GILL WASH ESCAPE!!', '#ffea00', 30, true, 135);
    this.checkWaveCompletion();
  }

  loseLifeFromHook() {
    const st = this.state;
    if (st.hookedItem) {
      this.removeItem(st.hookedItem);
      st.hookedItem = null;
    }
    st.lives -= 1;
    st.bass.mouthOpen = 0;

    if (st.lives <= 0) {
      st.mode = 'GAME_OVER';
      this.updateOverlayUI();
    } else {
      st.mode = 'PLAYING';
      st.bass.x = 240;
      st.bass.y = 380;
      st.hunger = Math.max(55, st.hunger);
      this.addPopup(480, 300, 'BARELY ESCAPED! (-1 LIFE)', '#ff3838', 28, true, 130);
    }
  }

  triggerRewardedAdRevive() {
    const st = this.state;
    st.lives = 2;
    st.hunger = 100;
    st.sonarCooldown = 0;
    st.mode = 'PLAYING';
    this.addPopup(480, 280, '⚡ MIRACLE GILL-WASH REVIVE!! ⚡', '#ffea00', 30, true, 150);
    window.soundEngine.playSplash();
    this.updateOverlayUI();
  }

  checkWaveCompletion() {
    const st = this.state;
    if (st.anglerSanity <= 0) {
      st.anglerQuote = st.currentAngler.quotes.defeated[0];
      if (st.waveIndex + 1 < window.ANGLERS.length) {
        st.mode = 'WAVE_CLEAR';
      } else {
        st.mode = 'VICTORY';
      }
      window.soundEngine.playTease(5);
      this.updateOverlayUI();
    }
  }

  removeItem(target) {
    this.state.items = this.state.items.filter((i) => i !== target);
    if (this.state.focusedItem === target) {
      this.state.focusedItem = null;
    }
    if (this.state.items.length < 6) {
      setTimeout(() => {
        if (this.state.mode === 'PLAYING') this.spawnItem();
      }, 550);
    }
  }

  addPopup(x, y, text, color = '#fff', size = 26, burst = false, width = 100) {
    this.state.popups.push({
      x: Math.max(115, Math.min(845, x)),
      y: Math.max(170, Math.min(540, y)),
      text,
      color,
      size,
      burst,
      width,
      bgColor: color === '#ffea00' ? '#e84118' : '#ffea00',
      rot: (Math.random() - 0.5) * 0.16,
      age: 0,
      life: 1.35
    });
  }

  // ==========================================================================
  // MAIN 60FPS UPDATE LOOP
  // ==========================================================================
  loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(dt);
    this.renderer.drawScene(this.state);

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const st = this.state;
    st.time += dt;

    if (st.screenShake > 0) {
      st.screenShake = Math.max(0, st.screenShake - dt * 2.4);
    }

    for (const b of st.bubbles) {
      b.y -= b.vy * dt;
      if (b.y < 152) {
        b.y = 590;
        b.x = Math.random() * 960;
      }
    }

    for (const pt of st.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 120 * dt;
      pt.life -= dt;
    }
    st.particles = st.particles.filter((pt) => pt.life > 0);

    for (const p of st.popups) {
      p.age += dt;
      p.y -= 24 * dt;
    }
    st.popups = st.popups.filter((p) => p.age < p.life);

    if (st.mode === 'SPIT_REFLEX') {
      st.spitTimer -= dt;
      if (st.spitTimer <= 0) {
        this.failSpitOutAndHook();
      }
      return;
    }

    if (st.mode === 'GILL_WASH') {
      st.gillWashProgress -= 24 * dt;
      st.bass.y = Math.max(152, st.bass.y - 95 * dt);
      if (st.gillWashProgress <= 0) {
        this.loseLifeFromHook();
      }
      return;
    }

    if (st.mode !== 'PLAYING') return;

    const timeScale = st.bass.stalking ? 0.32 : 1.0;
    const gameDt = dt * timeScale;

    // Angler Boat Patrol & Rod Twitch AI
    st.boatX += st.boatDir * 28 * gameDt;
    if (st.boatX > 540) st.boatDir = -1;
    if (st.boatX < 360) st.boatDir = 1;

    st.twitchTimer -= gameDt;
    if (st.twitchTimer <= 0) {
      st.twitchTimer = st.currentAngler.castInterval;
      if (Math.random() < st.currentAngler.twitchChance) {
        // Angler twitches all lures!
        const lures = st.items.filter((i) => i.spec.isLure);
        lures.forEach((l) => {
          l.vx = -l.vx * 1.25;
          this.spawnParticles(l.x, l.y, '#ffffff', 5);
        });
        if (st.anglerMood === 'idle' && st.currentAngler.quotes.twitch) {
          const tq = st.currentAngler.quotes.twitch;
          st.anglerQuote = tq[Math.floor(Math.random() * tq.length)];
        }
      }
    }

    if (st.sonarTimer > 0) st.sonarTimer = Math.max(0, st.sonarTimer - dt);
    if (st.sonarCooldown > 0) st.sonarCooldown = Math.max(0, st.sonarCooldown - dt);
    if (st.bass.coolTimer > 0) st.bass.coolTimer = Math.max(0, st.bass.coolTimer - dt);

    if (st.moodTimer > 0) {
      st.moodTimer -= dt;
      if (st.moodTimer <= 0) {
        st.anglerMood = 'idle';
        const idleQuotes = st.currentAngler.quotes.idle;
        st.anglerQuote = idleQuotes[Math.floor(Math.random() * idleQuotes.length)];
      }
    }

    st.hunger = Math.max(0, st.hunger - dt * 1.55);
    if (st.hunger <= 0) {
      st.lives -= 1;
      if (st.lives <= 0) {
        st.mode = 'GAME_OVER';
        this.updateOverlayUI();
        return;
      } else {
        st.hunger = 75;
        this.addPopup(st.bass.x, st.bass.y - 30, 'STARVING!! EAT REAL PREY! (-1 LIFE)', '#ff3838', 24, true, 145);
      }
    }

    // Bass Swimming Physics
    const bass = st.bass;
    let ax = 0;
    let ay = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) ax -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) ax += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) ay -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) ay += 1;

    const feverBoost = st.combo >= 4 ? 1.2 : 1.0;
    const accel = (bass.stalking ? 460 : 940) * this.perks.speedMult * feverBoost;
    bass.vx += ax * accel * dt;
    bass.vy += ay * accel * dt;

    bass.vx *= Math.pow(0.055, dt);
    bass.vy *= Math.pow(0.055, dt);

    bass.x += bass.vx * dt;
    bass.y += bass.vy * dt;
    bass.speed = Math.hypot(bass.vx, bass.vy);

    if (Math.abs(ax) > 0) {
      bass.facing = ax > 0 ? 1 : -1;
    }
    bass.tilt = (bass.vy / 420) * 0.35 * bass.facing;

    bass.x = Math.max(55, Math.min(905, bass.x));
    bass.y = Math.max(168, Math.min(555, bass.y));

    // Check if Bass is inside an Ambush Cover Zone
    bass.inCover = this.renderer.coverZones.some(
      (z) => Math.hypot(bass.x - z.x, bass.y - z.y) < z.r
    );

    // Update Prey & Lure Movements
    for (const item of st.items) {
      item.x += item.vx * gameDt;

      switch (item.spec.movementStyle) {
        case 'jerky_jig':
          item.y = item.baseY + Math.abs(Math.sin(st.time * 5.2 + item.idNum)) * -30;
          break;
        case 'tight_wobble':
          item.y = item.baseY + Math.sin(st.time * 18 + item.idNum) * 4.5;
          break;
        case 'surface_twitch':
          item.y = 162 + Math.sin(st.time * 10 + item.idNum) * 3.5;
          break;
        case 'bottom_hop':
          item.y = 538 - Math.abs(Math.sin(st.time * 4.4 + item.idNum)) * 44;
          break;
        case 's_glide':
          item.y = item.baseY + Math.sin(st.time * 3.2 + item.idNum) * 26;
          break;
        default:
          item.y = item.baseY + Math.sin(st.time * 2.6 + item.idNum) * 14;
          break;
      }

      if (item.x < 70) {
        item.x = 70;
        item.vx = Math.abs(item.vx);
      } else if (item.x > 890) {
        item.x = 890;
        item.vx = -Math.abs(item.vx);
      }

      if (item.spec.isLure && item.spec.hasRattle) {
        item.rattleCooldown -= dt;
        const d = Math.hypot(bass.x - item.x, bass.y - item.y);
        if (item.rattleCooldown <= 0 && d < 250) {
          window.soundEngine.playLureRattle();
          item.rattleCooldown = 1.4;
        }
      }
    }

    // Find closest target within inspection range
    let nearest = null;
    let minDist = 185 * this.perks.speedMult;
    for (const item of st.items) {
      const d = Math.hypot(bass.x - item.x, bass.y - item.y);
      if (d < minDist) {
        minDist = d;
        nearest = item;
      }
    }
    st.focusedItem = nearest;

    // Handle SPACEBAR Hold -> Stalk & 4x Loupe Inspection!
    if (this.keys['Space'] && st.focusedItem) {
      if (!bass.stalking) {
        bass.stalking = true;
        window.soundEngine.setStalkMode(true);
      }
      const target = st.focusedItem;
      bass.facing = target.x >= bass.x ? 1 : -1;

      const desiredX = target.x - bass.facing * 56;
      const desiredY = target.y;
      bass.x += (desiredX - bass.x) * 3.8 * dt;
      bass.y += (desiredY - bass.y) * 3.8 * dt;

      st.stalkProgress += dt * 0.65;
      bass.mouthOpen = Math.min(0.9, st.stalkProgress * 0.95);

      if (st.stalkProgress >= 1.0) {
        this.executeBite(target);
      }
    } else {
      if (bass.stalking) {
        bass.stalking = false;
        window.soundEngine.setStalkMode(false);
      }
      st.stalkProgress = 0;
      bass.mouthOpen = Math.max(0, bass.mouthOpen - dt * 4);
    }
  }

  // ==========================================================================
  // OVERLAYS, ROGUELITE UPGRADE PICKER & DEX MODAL
  // ==========================================================================
  updateOverlayUI() {
    const st = this.state;
    const menuEl = document.getElementById('menuOverlay');
    const waveEl = document.getElementById('waveOverlay');
    const overEl = document.getElementById('gameOverOverlay');

    menuEl.classList.toggle('hidden', st.mode !== 'MENU');
    waveEl.classList.toggle('hidden', st.mode !== 'WAVE_CLEAR');
    overEl.classList.toggle('hidden', st.mode !== 'GAME_OVER' && st.mode !== 'VICTORY');

    if (st.mode === 'WAVE_CLEAR') {
      document.getElementById('waveClearTitle').textContent = `${st.currentAngler.name} RAGE-QUIT!!`;
      document.getElementById('waveClearQuote').textContent = `"${st.currentAngler.quotes.defeated[0]}"`;
      document.getElementById('waveClearStats').textContent =
        `Bass Size: ${st.bassWeight.toFixed(1)} LBS  |  Score: ${st.score}  |  Max IQ Combo: ${st.maxCombo}x`;

      // Render 3 Roguelite Bass Evolution Upgrade Choices!
      const perkBox = document.getElementById('perkChoices');
      if (perkBox) {
        perkBox.innerHTML = '';
        const shuffled = [...window.BASS_UPGRADES].sort(() => Math.random() - 0.5).slice(0, 3);
        shuffled.forEach((perk) => {
          const btn = document.createElement('button');
          btn.className = 'comic-btn perk-card';
          btn.innerHTML = `<strong>${perk.name}</strong><span>${perk.desc}</span>`;
          btn.addEventListener('click', () => {
            perk.apply(this);
            this.startNextWave();
          });
          perkBox.appendChild(btn);
        });
      }
    }

    if (st.mode === 'GAME_OVER' || st.mode === 'VICTORY') {
      const isWin = st.mode === 'VICTORY';
      document.getElementById('endTitle').textContent = isWin
        ? '🏆 LAKE LEGEND! ALL KSK ANGLERS DEFEATED! 🏆'
        : '🎣 CAUGHT ON THE LINE! GAME OVER! 🎣';
      document.getElementById('endStats').textContent =
        `Final Bass Size: ${st.bassWeight.toFixed(1)} LBS  |  Score: ${st.score}  |  Max Combo: ${st.maxCombo}x  |  Dex: ${this.discoveredIds.size}/${window.ITEM_CATALOG.length}`;
      document.getElementById('btnAdRevive').style.display = isWin ? 'none' : 'inline-block';
    }
  }

  toggleDexModal(show) {
    const modal = document.getElementById('dexModal');
    modal.classList.toggle('hidden', !show);
    if (!show) return;

    const grid = document.getElementById('dexGrid');
    grid.innerHTML = '';

    window.ITEM_CATALOG.forEach((spec) => {
      const unlocked = this.discoveredIds.has(spec.id);
      const card = document.createElement('div');
      card.className = `dex-card ${spec.isLure ? 'lure-card' : 'prey-card'}`;
      card.innerHTML = `
        <div class="dex-badge">${spec.category} • ${spec.priceTag}</div>
        <h4>${unlocked ? spec.name : '??? (UNSEEN)'}</h4>
        <p class="dex-tell">${unlocked ? spec.tellText : 'Zoom in with [SPACE] or Bite in-game to unlock!'}</p>
        <p class="dex-desc">${unlocked ? spec.clueSummary : 'Swim close and hold SPACE to inspect with the 4x Loupe.'}</p>
      `;
      grid.appendChild(card);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new BiteOrBaitGame();
});
