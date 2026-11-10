// ============================================================================
// BITE OR BAIT - Core Game Loop & MacBook Keyboard Action Controller
// ============================================================================

class BiteOrBaitGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new window.ComicRenderer(this.canvas);

    this.keys = {};
    this.discoveredIds = new Set();

    this.state = {
      mode: 'MENU', // MENU, PLAYING, SPIT_REFLEX, GILL_WASH, WAVE_CLEAR, GAME_OVER, VICTORY
      time: 0,
      waveIndex: 0,
      currentAngler: window.ANGLERS[0],
      anglerSanity: window.ANGLERS[0].sanityMax,
      anglerMood: 'idle',
      anglerQuote: window.ANGLERS[0].quotes.idle[0],
      moodTimer: 0,

      score: 0,
      bassWeight: 2.5, // Starts at 2.5 lbs, grows to 15+ lbs Lunker!
      hunger: 100,
      lives: 3,

      sonarTimer: 0,
      sonarDuration: 2.6,
      sonarCooldown: 0,
      sonarMaxCooldown: 5.5,
      sonarOrigin: { x: 0, y: 0 },

      bass: {
        x: 240,
        y: 360,
        vx: 0,
        vy: 0,
        speed: 0,
        facing: 1,
        tilt: 0,
        scale: 1,
        mouthOpen: 0,
        stalking: false,
        coolTimer: 0
      },

      items: [],
      focusedItem: null,
      stalkProgress: 0,
      hookedItem: null,

      spitTimer: 0,
      spitWindow: 0.75,
      gillWashProgress: 0,

      popups: [],
      bubbles: [],
      screenShake: 0,
      nextItemId: 1
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
    for (let i = 0; i < 22; i++) {
      this.state.bubbles.push({
        x: Math.random() * 960,
        y: 140 + Math.random() * 440,
        r: 2 + Math.random() * 5,
        vy: 18 + Math.random() * 28
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

    // UI Buttons
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

    // Start from Menu with Space or Enter
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

    // 1. Emergency Spit-Out Reflex Mode!
    if (st.mode === 'SPIT_REFLEX') {
      if (code === 'ArrowLeft' || code === 'KeyA' || code === 'Space') {
        this.succeedSpitOut();
      }
      return;
    }

    // 2. Gill-Wash Jump Mini-Game Mode!
    if (st.mode === 'GILL_WASH') {
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        st.gillWashProgress += 17;
        st.screenShake = 0.25;
        window.soundEngine.playSplash();
        if (st.gillWashProgress >= 100) {
          this.succeedGillWash();
        }
      }
      return;
    }

    if (st.mode !== 'PLAYING') return;

    // 3. Sonar Ping (Z / Shift)
    if (code === 'KeyZ' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.triggerSonar();
    }

    // 4. Instant Bite Key (X or Enter)
    if ((code === 'KeyX' || code === 'Enter') && st.focusedItem) {
      this.executeBite(st.focusedItem);
    }

    // 5. Instant Tease / Tail-Slap Key (C)
    if (code === 'KeyC' && st.focusedItem) {
      this.executeTease(st.focusedItem, Math.max(0.45, st.stalkProgress));
    }
  }

  onKeyRelease(code) {
    const st = this.state;
    if (st.mode !== 'PLAYING') return;

    // Releasing SPACE while Stalking triggers TEASE if inside the Tease Zone!
    if (code === 'Space' && st.bass.stalking) {
      if (st.focusedItem && st.stalkProgress >= 0.22 && st.stalkProgress < 0.98) {
        this.executeTease(st.focusedItem, st.stalkProgress);
      }
      st.bass.stalking = false;
      st.stalkProgress = 0;
      window.soundEngine.setStalkMode(false);
    }
  }

  // ==========================================================================
  // GAME FLOW & WAVE MANAGEMENT
  // ==========================================================================
  startNewGame() {
    const st = this.state;
    st.waveIndex = 0;
    st.score = 0;
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
    st.focusedItem = null;
    st.stalkProgress = 0;
    st.sonarCooldown = 0;
    st.sonarTimer = 0;

    st.bass.x = 220;
    st.bass.y = 360;
    st.bass.vx = 0;
    st.bass.vy = 0;
    st.bass.stalking = false;
    st.bass.mouthOpen = 0;

    window.soundEngine.setUnderwater(true);
    window.soundEngine.setStalkMode(false);

    // Spawn initial targets
    for (let i = 0; i < 5; i++) {
      this.spawnItem();
    }

    this.addPopup(480, 260, `${st.currentAngler.title}`, '#ffea00', 32, true, 160);
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

    // Ensure a good mix of Real Prey and Fake Lures on screen
    const currentReal = st.items.filter((i) => !i.spec.isLure).length;
    const currentFake = st.items.filter((i) => i.spec.isLure).length;

    let pool = eligible;
    if (currentReal === 0) {
      pool = eligible.filter((i) => !i.isLure);
    } else if (currentFake === 0) {
      pool = eligible.filter((i) => i.isLure);
    }

    const spec = pool[Math.floor(Math.random() * pool.length)];
    const fromRight = Math.random() > 0.35;
    const startX = fromRight ? 180 + Math.random() * 720 : 120 + Math.random() * 680;
    let startY = 175 + Math.random() * 340;
    if (spec.shape === 'frog') startY = 138 + Math.random() * 22;
    if (spec.shape === 'craw') startY = 515 + Math.random() * 45;

    this.state.items.push({
      idNum: st.nextItemId++,
      spec,
      x: startX,
      y: startY,
      baseY: startY,
      anchorX: startX + (Math.random() - 0.5) * 70,
      vx: (fromRight ? -1 : 1) * (32 + Math.random() * 35),
      vy: 0,
      angle: 0,
      rattleCooldown: 1 + Math.random() * 2
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
    this.addPopup(st.bass.x, st.bass.y - 48, 'SONAR PING!!', '#00ffff', 24, true, 90);
  }

  executeTease(item, stalkLevel) {
    const st = this.state;
    this.discoveredIds.add(item.spec.id);

    // Quick backflip turn away from the target!
    const dir = st.bass.x < item.x ? -1 : 1;
    st.bass.vx = dir * 290;
    st.bass.vy = -80;
    st.bass.facing = dir;
    st.bass.stalking = false;
    st.bass.mouthOpen = 0;
    st.stalkProgress = 0;
    window.soundEngine.setStalkMode(false);

    if (item.spec.isLure) {
      // SUCCESSFUL LURE TEASE!
      let mult = 1;
      let label = 'NICE TEASE!';
      if (stalkLevel >= 0.72) {
        mult = 5;
        label = 'EXTREME TEASE x5!!';
      } else if (stalkLevel >= 0.48) {
        mult = 3;
        label = 'SUPER TEASE x3!!';
      } else {
        mult = 2;
        label = 'PSYCH!! x2!';
      }

      const pts = Math.round(item.spec.points * mult);
      const rageDmg = Math.round(item.spec.angerDamage * (0.7 + stalkLevel * 0.9));

      st.score += pts;
      st.anglerSanity = Math.max(0, st.anglerSanity - rageDmg);
      st.anglerMood = 'teased';
      st.moodTimer = 2.5;
      const quotes = st.currentAngler.quotes.teased;
      st.anglerQuote = quotes[Math.floor(Math.random() * quotes.length)];

      st.bass.coolTimer = 2.2;
      st.screenShake = 0.35;

      window.soundEngine.playTease(mult);
      this.addPopup(item.x, item.y - 25, label, '#ffea00', 30, true, 120);
      this.addPopup(item.x, item.y + 22, `+${pts} PTS! (-${rageDmg} PATIENCE)`, '#00ffcc', 20, false);

      this.removeItem(item);
      this.checkWaveCompletion();
    } else {
      // Oops! You teased/scared away REAL FOOD!
      window.soundEngine.playSwim(1.5);
      this.addPopup(item.x, item.y - 20, 'OOPS! SCARED REAL FOOD AWAY!', '#ff9f43', 22, true, 125);
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
      // DELICIOUS REAL PREY!
      st.score += item.spec.points;
      st.bassWeight += item.spec.weightGain;
      st.bass.scale = Math.min(1.55, 1 + (st.bassWeight - 2.5) * 0.045);
      st.hunger = Math.min(100, st.hunger + item.spec.hungerRestore);

      // Eating pond prey in front of the angler also annoys the angler slightly!
      st.anglerSanity = Math.max(0, st.anglerSanity - 10);

      window.soundEngine.playChomp();
      this.addPopup(item.x, item.y - 24, 'CHOMP!! REAL PREY!', '#2ecc71', 30, true, 115);
      this.addPopup(
        item.x,
        item.y + 20,
        `+${item.spec.weightGain.toFixed(1)} LBS! +${item.spec.points} PTS`,
        '#ffffff',
        20,
        false
      );

      this.removeItem(item);
      this.checkWaveCompletion();
    } else {
      // DANGER! YOU BIT A FAKE LURE! Trigger 0.75s Emergency Spit-Out Reflex!
      st.mode = 'SPIT_REFLEX';
      st.hookedItem = item;
      st.spitTimer = st.spitWindow;
      st.screenShake = 0.45;
      window.soundEngine.playPlasticAlarm();
    }
  }

  succeedSpitOut() {
    const st = this.state;
    const item = st.hookedItem;
    st.mode = 'PLAYING';
    st.bass.mouthOpen = 0;
    st.bass.vx = -st.bass.facing * 260;

    const bonus = 400;
    st.score += bonus;
    st.anglerSanity = Math.max(0, st.anglerSanity - 35);
    st.anglerMood = 'teased';
    st.moodTimer = 2.8;
    const quotes = st.currentAngler.quotes.spit;
    st.anglerQuote = quotes[Math.floor(Math.random() * quotes.length)];

    window.soundEngine.playSpitOut();
    if (item) {
      this.addPopup(item.x, item.y - 25, 'PTUI!! SPIT BACK AT ANGLER!!', '#00ffcc', 30, true, 140);
      this.removeItem(item);
    }
    this.checkWaveCompletion();
  }

  failSpitOutAndHook() {
    const st = this.state;
    st.mode = 'GILL_WASH';
    st.gillWashProgress = 20;
    st.anglerMood = 'hooked';
    st.anglerQuote = st.currentAngler.quotes.hooked[0];
    st.screenShake = 0.6;
    window.soundEngine.playHooked();
    this.addPopup(st.bass.x, st.bass.y - 40, 'HOOKSET!! MASH [SPACE]!!', '#ff3838', 30, true, 130);
  }

  succeedGillWash() {
    const st = this.state;
    st.mode = 'PLAYING';
    st.bass.y = 135;
    st.bass.vy = 140;
    st.bass.mouthOpen = 0;

    window.soundEngine.setUnderwater(false);
    window.soundEngine.playSplash();
    setTimeout(() => window.soundEngine.setUnderwater(true), 450);

    if (st.hookedItem) {
      this.removeItem(st.hookedItem);
      st.hookedItem = null;
    }

    st.score += 250;
    st.anglerSanity = Math.max(0, st.anglerSanity - 25);
    st.anglerMood = 'teased';
    st.moodTimer = 2.5;
    st.anglerQuote = 'NOOO!! IT THREW THE HOOK ON THE JUMP!!';

    this.addPopup(st.bass.x, 155, 'GILL WASH ESCAPE!!', '#ffea00', 32, true, 135);
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
      st.hunger = Math.max(50, st.hunger);
      this.addPopup(480, 300, 'BARELY ESCAPED! (-1 CHANCE)', '#ff3838', 28, true, 130);
    }
  }

  triggerRewardedAdRevive() {
    // Simulates Poki / CrazyGames Rewarded Ad SDK callback!
    const st = this.state;
    st.lives = 2;
    st.hunger = 100;
    st.sonarCooldown = 0;
    st.mode = 'PLAYING';
    this.addPopup(480, 280, '⚡ MIRACLE GILL-WASH REVIVE!! ⚡', '#ffea00', 32, true, 150);
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
    if (this.state.items.length < 5) {
      setTimeout(() => {
        if (this.state.mode === 'PLAYING') this.spawnItem();
      }, 650);
    }
  }

  addPopup(x, y, text, color = '#fff', size = 26, burst = false, width = 100) {
    this.state.popups.push({
      x: Math.max(110, Math.min(850, x)),
      y: Math.max(155, Math.min(540, y)),
      text,
      color,
      size,
      burst,
      width,
      bgColor: color === '#ffea00' ? '#e84118' : '#ffea00',
      rot: (Math.random() - 0.5) * 0.18,
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
      st.screenShake = Math.max(0, st.screenShake - dt * 2.2);
    }

    // Update ambient bubbles
    for (const b of st.bubbles) {
      b.y -= b.vy * dt;
      if (b.y < 130) {
        b.y = 590;
        b.x = Math.random() * 960;
      }
    }

    // Update Comic Popups
    for (const p of st.popups) {
      p.age += dt;
      p.y -= 22 * dt;
    }
    st.popups = st.popups.filter((p) => p.age < p.life);

    // Handle Emergency Spit-Out Reflex Timer
    if (st.mode === 'SPIT_REFLEX') {
      st.spitTimer -= dt;
      if (st.spitTimer <= 0) {
        this.failSpitOutAndHook();
      }
      return;
    }

    // Handle Gill-Wash Jump Mini-Game
    if (st.mode === 'GILL_WASH') {
      st.gillWashProgress -= 24 * dt;
      st.bass.y = Math.max(135, st.bass.y - 95 * dt);
      if (st.gillWashProgress <= 0) {
        this.loseLifeFromHook();
      }
      return;
    }

    if (st.mode !== 'PLAYING') return;

    const timeScale = st.bass.stalking ? 0.35 : 1.0;
    const gameDt = dt * timeScale;

    // Timers
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

    // Hunger drain
    st.hunger = Math.max(0, st.hunger - dt * 1.65);
    if (st.hunger <= 0) {
      st.lives -= 1;
      if (st.lives <= 0) {
        st.mode = 'GAME_OVER';
        this.updateOverlayUI();
        return;
      } else {
        st.hunger = 75;
        this.addPopup(st.bass.x, st.bass.y - 30, 'STARVING!! EAT REAL PREY! (-1 CHANCE)', '#ff3838', 24, true, 145);
      }
    }

    // Update Player Bass Swimming via MacBook Keyboard (Arrows or WASD)
    const bass = st.bass;
    let ax = 0;
    let ay = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) ax -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) ax += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) ay -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) ay += 1;

    const accel = bass.stalking ? 420 : 880;
    bass.vx += ax * accel * dt;
    bass.vy += ay * accel * dt;

    // Water drag
    bass.vx *= Math.pow(0.06, dt);
    bass.vy *= Math.pow(0.06, dt);

    bass.x += bass.vx * dt;
    bass.y += bass.vy * dt;
    bass.speed = Math.hypot(bass.vx, bass.vy);

    if (Math.abs(ax) > 0) {
      bass.facing = ax > 0 ? 1 : -1;
    }
    bass.tilt = (bass.vy / 400) * 0.35 * bass.facing;

    // Keep Bass inside underwater bounds
    bass.x = Math.max(55, Math.min(905, bass.x));
    bass.y = Math.max(155, Math.min(555, bass.y));

    // Update Prey & Lure Movements
    for (const item of st.items) {
      item.x += item.vx * gameDt;

      // Distinct movement signatures for Real Prey vs Fake Lures!
      switch (item.spec.movementStyle) {
        case 'jerky_jig':
          item.y = item.baseY + Math.abs(Math.sin(st.time * 5 + item.idNum)) * -28;
          break;
        case 'tight_wobble':
          item.y = item.baseY + Math.sin(st.time * 16 + item.idNum) * 4;
          break;
        case 'surface_twitch':
          item.y = 142 + Math.sin(st.time * 10 + item.idNum) * 3;
          break;
        case 'bottom_hop':
          item.y = 535 - Math.abs(Math.sin(st.time * 4.2 + item.idNum)) * 42;
          break;
        case 's_glide':
          item.y = item.baseY + Math.sin(st.time * 3 + item.idNum) * 24;
          break;
        default:
          // Smooth organic swim
          item.y = item.baseY + Math.sin(st.time * 2.5 + item.idNum) * 14;
          break;
      }

      // Wrap or bounce horizontally
      if (item.x < 70) {
        item.x = 70;
        item.vx = Math.abs(item.vx);
      } else if (item.x > 890) {
        item.x = 890;
        item.vx = -Math.abs(item.vx);
      }

      // Play metallic rattle sound if bass is close to a rattling lure
      if (item.spec.isLure && item.spec.hasRattle) {
        item.rattleCooldown -= dt;
        const d = Math.hypot(bass.x - item.x, bass.y - item.y);
        if (item.rattleCooldown <= 0 && d < 240) {
          window.soundEngine.playLureRattle();
          item.rattleCooldown = 1.4;
        }
      }
    }

    // Find closest target within inspection range
    let nearest = null;
    let minDist = 175;
    for (const item of st.items) {
      const d = Math.hypot(bass.x - item.x, bass.y - item.y);
      if (d < minDist) {
        minDist = d;
        nearest = item;
      }
    }
    st.focusedItem = nearest;

    // Handle SPACEBAR Hold -> Stalk & Approach Mechanic!
    if (this.keys['Space'] && st.focusedItem) {
      if (!bass.stalking) {
        bass.stalking = true;
        window.soundEngine.setStalkMode(true);
      }
      const target = st.focusedItem;
      bass.facing = target.x >= bass.x ? 1 : -1;

      // Gently pull bass nose toward target
      const desiredX = target.x - bass.facing * 54;
      const desiredY = target.y;
      bass.x += (desiredX - bass.x) * 3.5 * dt;
      bass.y += (desiredY - bass.y) * 3.5 * dt;

      st.stalkProgress += dt * 0.62;
      bass.mouthOpen = Math.min(0.85, st.stalkProgress * 0.9);

      // Holding all the way to 100% triggers BITE!
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
  // HTML OVERLAY & LURE ENCYCLOPEDIA (DEX) MODAL
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
        `Current Bass Size: ${st.bassWeight.toFixed(1)} LBS  |  Score: ${st.score}`;
    }

    if (st.mode === 'GAME_OVER' || st.mode === 'VICTORY') {
      const isWin = st.mode === 'VICTORY';
      document.getElementById('endTitle').textContent = isWin
        ? '🏆 LAKE LEGEND! ALL ANGLERS DEFEATED! 🏆'
        : '🎣 CAUGHT ON THE LINE! GAME OVER! 🎣';
      document.getElementById('endStats').textContent =
        `Final Bass Size: ${st.bassWeight.toFixed(1)} LBS  |  Total Score: ${st.score}  |  Dex Unlocked: ${this.discoveredIds.size}/${window.ITEM_CATALOG.length}`;
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
        <p class="dex-tell">${unlocked ? spec.tellText : 'Inspect or Bite in-game to unlock!'}</p>
        <p class="dex-desc">${unlocked ? spec.clueSummary : 'Swim close and hold SPACE to reveal its secret.'}</p>
      `;
      grid.appendChild(card);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new BiteOrBaitGame();
});
