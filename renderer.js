// ============================================================================
// BITE OR BAIT - Style 1: American Comic & Bass Pop-Art Renderer
// ============================================================================

class ComicRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.halftonePattern = this.createHalftonePattern();
    this.kskLogo = new Image();
    this.kskLogo.src = 'ksk-baits-logo.png';
    this.sunbeams = [
      { x: 0.22, width: 110, angle: 0.18 },
      { x: 0.55, width: 140, angle: 0.14 },
      { x: 0.82, width: 95, angle: 0.20 }
    ];
  }

  createHalftonePattern() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    pCtx.beginPath();
    pCtx.arc(4, 4, 2, 0, Math.PI * 2);
    pCtx.arc(12, 12, 2, 0, Math.PI * 2);
    pCtx.fill();
    return this.ctx.createPattern(pCanvas, 'repeat');
  }

  // Helper to Check if Item is in a Sunbeam (makes invisible fishing line glint!)
  isInSunbeam(x, y, w, h) {
    const surfaceY = 125;
    if (y < surfaceY) return false;
    const dy = y - surfaceY;
    for (const beam of this.sunbeams) {
      const centerAtY = beam.x * w + dy * Math.tan(beam.angle);
      if (Math.abs(x - centerAtY) < beam.width * 0.55) {
        return true;
      }
    }
    return false;
  }

  drawScene(state) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = state.time;

    ctx.save();

    // Screen shake effect
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake * 12;
      const dy = (Math.random() - 0.5) * state.screenShake * 12;
      ctx.translate(dx, dy);
    }

    // 1. Sky & Surface Band
    const surfaceY = 125;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
    skyGrad.addColorStop(0, '#ff9f43');
    skyGrad.addColorStop(1, '#feca57');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, surfaceY);

    // 2. Underwater Gradient
    const waterGrad = ctx.createLinearGradient(0, surfaceY, 0, h);
    if (state.sonarTimer > 0) {
      waterGrad.addColorStop(0, '#0a3d62');
      waterGrad.addColorStop(0.5, '#072448');
      waterGrad.addColorStop(1, '#041124');
    } else {
      waterGrad.addColorStop(0, '#1dd1a1');
      waterGrad.addColorStop(0.35, '#10ac84');
      waterGrad.addColorStop(0.8, '#0a3d62');
      waterGrad.addColorStop(1, '#05192d');
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, surfaceY, w, h - surfaceY);

    // Comic halftone overlay
    ctx.fillStyle = this.halftonePattern;
    ctx.fillRect(0, surfaceY, w, h - surfaceY);

    // 3. Sunbeams (God Rays) - Reveal Hidden Fishing Lines!
    ctx.save();
    for (const beam of this.sunbeams) {
      const startX = beam.x * w + Math.sin(time * 0.7 + beam.x * 10) * 18;
      const endX = startX + (h - surfaceY) * Math.tan(beam.angle);
      const grad = ctx.createLinearGradient(startX, surfaceY, endX, h);
      grad.addColorStop(0, 'rgba(255, 249, 180, 0.34)');
      grad.addColorStop(0.7, 'rgba(255, 249, 180, 0.08)');
      grad.addColorStop(1, 'rgba(255, 249, 180, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(startX - beam.width / 2, surfaceY);
      ctx.lineTo(startX + beam.width / 2, surfaceY);
      ctx.lineTo(endX + beam.width * 0.9, h);
      ctx.lineTo(endX - beam.width * 0.9, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. Underwater Silhouette Weeds & Timber Structure
    this.drawUnderwaterScenery(ctx, w, h, surfaceY, time);

    // 5. Animated Water Surface Line (Thick Comic Ink)
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    for (let x = 0; x <= w; x += 24) {
      const wy = surfaceY + Math.sin(x * 0.025 + time * 3.5) * 4;
      ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 6. Sonar Expanding Ring
    if (state.sonarTimer > 0) {
      const progress = 1 - state.sonarTimer / state.sonarDuration;
      const maxR = Math.hypot(w, h);
      const r = progress * maxR * 0.85;
      ctx.save();
      ctx.beginPath();
      ctx.arc(state.sonarOrigin.x, state.sonarOrigin.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Ambient Bubbles
    for (const b of state.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }

    // 8. Draw Prey & Lures
    for (const item of state.items) {
      this.drawItem(ctx, item, state, surfaceY, w, h);
    }

    // 9. Draw Player Black Bass
    this.drawBass(ctx, state.bass, state);

    // 10. Stalk Mode Comic Speed Lines & Inspection Loupe
    if (state.bass.stalking && state.focusedItem) {
      this.drawStalkOverlay(ctx, w, h, state);
    }

    // 11. Emergency Spit-Out Reflex Bar OR Gill-Wash Jump Mini-Game
    if (state.mode === 'SPIT_REFLEX') {
      this.drawSpitReflexUI(ctx, w, h, state);
    } else if (state.mode === 'GILL_WASH') {
      this.drawGillWashUI(ctx, w, h, state);
    }

    // 12. Comic Onomatopoeia Bursts ("PSYCH!!", "CHOMP!!", "TEASE x5!!")
    for (const pop of state.popups) {
      this.drawComicPopup(ctx, pop);
    }

    // 13. Top Comic Panel HUD (Angler Cut-in, Sanity Gauge, Bass Stats)
    this.drawTopComicHUD(ctx, w, h, state, surfaceY);

    ctx.restore();
  }

  drawUnderwaterScenery(ctx, w, h, surfaceY, time) {
    ctx.save();
    // Background weeds
    const weedPositions = [0.08, 0.18, 0.35, 0.62, 0.78, 0.92];
    for (const pos of weedPositions) {
      const baseX = pos * w;
      const weedH = 110 + (pos * 137 % 65);
      ctx.beginPath();
      ctx.moveTo(baseX - 12, h);
      const sway = Math.sin(time * 2 + pos * 10) * 16;
      ctx.quadraticCurveTo(baseX + sway * 0.5, h - weedH * 0.5, baseX + sway, h - weedH);
      ctx.quadraticCurveTo(baseX + 12 + sway * 0.5, h - weedH * 0.5, baseX + 12, h);
      ctx.fillStyle = 'rgba(6, 52, 45, 0.65)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#031d1a';
      ctx.stroke();
    }

    // Bottom gravel & comic ink rim
    ctx.fillStyle = '#072227';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 22);
    for (let x = 0; x <= w; x += 60) {
      ctx.lineTo(x, h - 18 - Math.sin(x * 0.05) * 6);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // DRAW PREY OR LURE (WITH ANGLE, SUNBEAM, SONAR & STALK SECRETS!)
  // ==========================================================================
  drawItem(ctx, item, state, surfaceY, w, h) {
    const bass = state.bass;
    const dist = Math.hypot(bass.x - item.x, bass.y - item.y);
    const isFocused = state.focusedItem === item;
    const inSunbeam = this.isInSunbeam(item.x, item.y, w, h);
    const sonarActive = state.sonarTimer > 0;
    const bassIsBelow = bass.y > item.y + 24;
    const stalkProgress = isFocused ? state.stalkProgress : 0;

    // Determine how clearly hidden features (line & hooks) are revealed
    let revealAlpha = 0.12;
    if (item.spec.isLure) {
      revealAlpha = item.spec.lineVisibility * 0.35;
      if (inSunbeam) revealAlpha = Math.max(revealAlpha, 0.85);
      if (sonarActive) revealAlpha = 1.0;
      if (stalkProgress > 0.2) revealAlpha = Math.max(revealAlpha, 0.35 + stalkProgress * 0.65);
      if (bassIsBelow) revealAlpha = Math.max(revealAlpha, 0.9);
    }

    // 1. Draw Fishing Line (If Lure)
    if (item.spec.isLure) {
      ctx.save();
      ctx.beginPath();
      const anchorX = item.anchorX || item.x;
      ctx.moveTo(anchorX, surfaceY);
      ctx.quadraticCurveTo(
        (anchorX + item.x) * 0.5 + Math.sin(state.time * 4) * 6,
        (surfaceY + item.y) * 0.5,
        item.x,
        item.y - 6
      );
      if (sonarActive) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
      } else if (inSunbeam || stalkProgress > 0.4) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, revealAlpha + 0.2)})`;
        ctx.lineWidth = 2.4;
      } else {
        ctx.strokeStyle = `rgba(220, 245, 255, ${revealAlpha})`;
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    const facing = item.vx >= 0 ? 1 : -1;
    ctx.scale(facing, 1);
    ctx.rotate(item.angle || 0);

    // Target Highlight Ring when Bass is close enough to Stalk
    if (isFocused && state.mode === 'PLAYING') {
      ctx.save();
      ctx.scale(facing, 1); // unflip text/ring
      const ringRadius = 46;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = bass.stalking ? '#ffdd00' : 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = bass.stalking ? 4 : 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Stalk Progress Arc (Tease Zone vs Bite Zone!)
      if (bass.stalking && stalkProgress > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius + 6, -Math.PI / 2, -Math.PI / 2 + stalkProgress * Math.PI * 2);
        ctx.strokeStyle = stalkProgress > 0.78 ? '#ff2e63' : '#00ffcc';
        ctx.lineWidth = 7;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Draw Hooks (If Lure)
    if (item.spec.isLure) {
      let hookAlpha = item.spec.hookPosition === 'hidden_belly' ? 0.18 : 0.78;
      if (bassIsBelow || sonarActive || stalkProgress > 0.35 || inSunbeam) {
        hookAlpha = 1.0;
      }
      this.drawHooks(ctx, item.spec, hookAlpha, sonarActive, state.time);
    }

    // 3. Draw Body Shape in Bold Comic Style
    const pCol = item.spec.primaryColor;
    const sCol = item.spec.secondaryColor;

    switch (item.spec.shape) {
      case 'worm':
        this.drawWormShape(ctx, item, pCol, sCol, state.time);
        break;
      case 'crankbait':
        this.drawCrankbaitShape(ctx, item, pCol, sCol, state.time);
        break;
      case 'frog':
        this.drawFrogShape(ctx, item, pCol, sCol, state.time, bassIsBelow);
        break;
      case 'craw':
        this.drawCrawShape(ctx, item, pCol, sCol, state.time);
        break;
      case 'bluegill':
        this.drawBluegillShape(ctx, item, pCol, sCol, state.time, stalkProgress, sonarActive);
        break;
      case 'minnow':
      default:
        this.drawMinnowShape(ctx, item, pCol, sCol, state.time);
        break;
    }

    // 4. Sonar Overlay (Heartbeat for Real Prey vs Wireframe Hazard for Lure)
    if (sonarActive) {
      ctx.save();
      ctx.scale(facing, 1);
      if (item.spec.isLure) {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-32, -22, 64, 44);
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('METAL HOOK DETECTED!', 0, -28);
      } else {
        const beat = 1 + Math.sin(state.time * 18) * 0.25;
        ctx.scale(beat, beat);
        ctx.fillStyle = '#ff3838';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❤ PULSE', 0, -24);
      }
      ctx.restore();
    }

    // 5. Rattle Visual Cue ("*CLICK-CLACK*")
    if (item.spec.isLure && item.spec.hasRattle && Math.sin(state.time * 12 + item.idNum) > 0.75 && dist < 340) {
      ctx.save();
      ctx.scale(facing, 1);
      ctx.fillStyle = '#ffea00';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = 'italic bold 13px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText('*CLICK-CLACK*', 0, 36);
      ctx.fillText('*CLICK-CLACK*', 0, 36);
      ctx.restore();
    }

    ctx.restore();
  }

  drawHooks(ctx, spec, alpha, sonarActive, time) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = sonarActive ? '#00ffff' : '#dfe6e9';
    ctx.lineWidth = sonarActive ? 3.5 : 2.8;

    const drawTreble = (hx, hy) => {
      ctx.beginPath();
      // Shank
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx, hy + 14);
      // Left bend
      ctx.arc(hx - 5, hy + 14, 5, 0, Math.PI, false);
      // Right bend
      ctx.moveTo(hx, hy + 14);
      ctx.arc(hx + 5, hy + 14, 5, 0, Math.PI, false);
      ctx.stroke();

      // Glint star on hook point
      if (alpha > 0.75 && Math.sin(time * 8 + hx) > 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(hx - 10, hy + 13, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (spec.hookPosition === 'belly_and_tail') {
      drawTreble(-4, 8);
      drawTreble(-24, 2);
    } else if (spec.hookPosition === 'hidden_belly') {
      drawTreble(0, 6);
      drawTreble(-16, 6);
    } else if (spec.hookPosition === 'middle') {
      // Big worm offset hook
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.arc(0, 8, 11, -0.2, Math.PI * 1.15, false);
      ctx.stroke();
    } else if (spec.hookPosition === 'top_hook') {
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.arc(-4, -8, 10, 0.3, Math.PI * 1.3, true);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawWormShape(ctx, item, pCol, sCol, time) {
    ctx.save();
    // If Texas-Rig lure, draw brass bullet sinker on the nose!
    if (item.spec.isLure) {
      ctx.fillStyle = '#d4af37';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(16, -7);
      ctx.lineTo(16, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = -24; i <= 18; i += 6) {
      const wave = Math.sin(time * (item.spec.isLure ? 12 : 6) + i * 0.22) * (item.spec.isLure ? 3 : 7);
      if (i === -24) ctx.moveTo(i, wave);
      else ctx.lineTo(i, wave);
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 15;
    ctx.stroke();
    ctx.strokeStyle = pCol;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = sCol;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  drawMinnowShape(ctx, item, pCol, sCol, time) {
    const tailWag = Math.sin(time * 12 + item.idNum) * 5;
    ctx.save();
    // Tail
    ctx.fillStyle = sCol;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-30, -10 + tailWag);
    ctx.lineTo(-27, 0);
    ctx.lineTo(-30, 10 + tailWag);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.fillStyle = pCol;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blinking organic eye
    const blink = Math.sin(time * 3 + item.idNum) > 0.92;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(12, -2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (!blink) {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(13, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCrankbaitShape(ctx, item, pCol, sCol, time) {
    ctx.save();
    // Clear plastic diving lip at the front!
    ctx.fillStyle = 'rgba(200, 245, 255, 0.8)';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(18, 2);
    ctx.lineTo(32, 12);
    ctx.lineTo(26, 15);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fat crankbait body
    ctx.fillStyle = sCol;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red head pattern
    ctx.fillStyle = pCol;
    ctx.beginPath();
    ctx.arc(10, 0, 11, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Rigid painted cross-eye
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(12, -2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(12, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFrogShape(ctx, item, pCol, sCol, time, bassIsBelow) {
    ctx.save();
    const kick = Math.sin(time * 8 + item.idNum) * 6;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3.5;

    if (item.spec.isLure) {
      // Fake rubber tassel legs
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-18, i * 4);
        ctx.quadraticCurveTo(-28, i * 7 + kick, -36, i * 5 - kick);
        ctx.stroke();
      }
    } else {
      // Real jointed frog legs
      ctx.fillStyle = pCol;
      ctx.beginPath();
      ctx.ellipse(-20, -8 + kick * 0.4, 10, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-20, 8 - kick * 0.4, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Frog Body
    ctx.fillStyle = bassIsBelow ? sCol : pCol;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bulging frog eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(10, -9, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(11, -9, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCrawShape(ctx, item, pCol, sCol, time) {
    ctx.save();
    const pinch = Math.abs(Math.sin(time * 6)) * 5;
    ctx.fillStyle = pCol;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // If Jig Lure, draw silicone skirt strands & lead head
    if (item.spec.isLure) {
      ctx.strokeStyle = sCol;
      for (let a = -0.6; a <= 0.6; a += 0.2) {
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-18, Math.sin(a + time * 5) * 16);
        ctx.stroke();
      }
      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.arc(14, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Body segments
    ctx.fillStyle = pCol;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Claws
    ctx.fillStyle = sCol;
    ctx.beginPath();
    ctx.ellipse(18, -10 - pinch * 0.4, 10, 5, 0.3, 0, Math.PI * 2);
    ctx.ellipse(18, 10 + pinch * 0.4, 10, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawBluegillShape(ctx, item, pCol, sCol, time, stalkProgress, sonarActive) {
    ctx.save();
    const wag = Math.sin(time * 9 + item.idNum) * 5;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3.5;

    // Dorsal & Tail
    ctx.fillStyle = sCol;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-32, -12 + wag);
    ctx.lineTo(-32, 12 + wag);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deep sunfish body
    ctx.fillStyle = pCol;
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orange breast patch
    ctx.fillStyle = sCol;
    ctx.beginPath();
    ctx.arc(8, 7, 9, 0, Math.PI, false);
    ctx.fill();

    // Bluegill ear flap
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(4, -1, 4, 0, Math.PI * 2);
    ctx.fill();

    // If Jointed Swimbait Lure: draw mechanical hinge seam in the middle!
    if (item.spec.isLure) {
      ctx.strokeStyle = (stalkProgress > 0.25 || sonarActive) ? '#ffea00' : '#111';
      ctx.lineWidth = (stalkProgress > 0.25 || sonarActive) ? 3.5 : 2;
      ctx.beginPath();
      ctx.moveTo(-2, -16);
      ctx.lineTo(-2, 16);
      ctx.stroke();
      // Metal hinge rivets
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.arc(-2, -6, 2.2, 0, Math.PI * 2);
      ctx.arc(-2, 6, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye
    ctx.fillStyle = item.spec.isLure ? '#ff3838' : '#ffffff';
    ctx.beginPath();
    ctx.arc(14, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(15, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================================
  // DRAW THE PLAYER HERO: COMIC LARGEMOUTH BLACK BASS!
  // ==========================================================================
  drawBass(ctx, bass, state) {
    ctx.save();
    ctx.translate(bass.x, bass.y);

    const scale = bass.scale || 1;
    ctx.scale(bass.facing * scale, scale);
    ctx.rotate(bass.tilt || 0);

    const wagSpeed = bass.stalking ? 4 : 12;
    const tailWag = Math.sin(state.time * wagSpeed) * (bass.speed > 20 ? 10 : 4);
    const mouthOpen = bass.mouthOpen || 0; // 0 to 1

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';

    // 1. Spiny Dorsal Fin & Soft Second Dorsal
    ctx.fillStyle = '#1e5128';
    ctx.beginPath();
    ctx.moveTo(-28, -16);
    ctx.lineTo(-18, -30);
    ctx.lineTo(-10, -24);
    ctx.lineTo(-4, -31);
    ctx.lineTo(8, -22);
    ctx.lineTo(14, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Broad Tail Fin (Caudal)
    ctx.fillStyle = '#1e5128';
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.lineTo(-58, -19 + tailWag);
    ctx.lineTo(-52, 0 + tailWag * 0.6);
    ctx.lineTo(-58, 19 + tailWag);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Torpedo Bass Body
    const bodyGrad = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGrad.addColorStop(0, '#1e5128');
    bodyGrad.addColorStop(0.55, '#4e9f3d');
    bodyGrad.addColorStop(0.8, '#d8e9a8');
    bodyGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 38, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4. Signature Black Bass Lateral Stripe (Comic Ink Blotches)
    ctx.fillStyle = '#0b1d0e';
    for (let sx = -32; sx <= 16; sx += 9) {
      ctx.beginPath();
      ctx.ellipse(sx, 0 + Math.sin(sx) * 2, 5.5, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Articulated Bucket Mouth (Upper & Lower Jaw)
    if (mouthOpen > 0.05) {
      // Wide open vacuum mouth cavity!
      ctx.fillStyle = '#eb4d4b';
      ctx.beginPath();
      ctx.arc(28, 3, 14 * mouthOpen, -Math.PI * 0.45, Math.PI * 0.55);
      ctx.fill();
      ctx.stroke();

      // Protruding lower bucket jaw
      ctx.fillStyle = '#4e9f3d';
      ctx.beginPath();
      ctx.moveTo(18, 10);
      ctx.lineTo(38, 12 + mouthOpen * 12);
      ctx.lineTo(24, 19 + mouthOpen * 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Closed grumpy comic jaw line
      ctx.beginPath();
      ctx.moveTo(33, 4);
      ctx.quadraticCurveTo(24, 8, 16, 4);
      ctx.stroke();
    }

    // 6. Pectoral Fin
    const finFlap = Math.sin(state.time * 9) * 4;
    ctx.fillStyle = '#4e9f3d';
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.quadraticCurveTo(-10, 16 + finFlap, -6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 7. Expressive Comic Eye (Squinting when stalking, Cool Sunglasses after Tease!)
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(20, -6, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(22, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Angry/Focused Comic Brow when Stalking
    if (bass.stalking) {
      ctx.beginPath();
      ctx.moveTo(12, -14);
      ctx.lineTo(28, -9);
      ctx.lineWidth = 4.5;
      ctx.stroke();
    }

    // Deal-With-It Cool Shades right after teasing an angler!
    if (bass.coolTimer > 0) {
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(13, -12, 16, 9);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.lineTo(13, -9);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // STALK MODE MAGNIFIER & SPEED LINES OVERLAY
  // ==========================================================================
  drawStalkOverlay(ctx, w, h, state) {
    const item = state.focusedItem;
    const progress = state.stalkProgress;

    ctx.save();
    // Comic action lines around screen edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 3;
    const cx = item.x;
    const cy = item.y;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 14) {
      const r1 = 210 + Math.sin(state.time * 15 + a * 5) * 20;
      const r2 = Math.max(w, h);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }

    // Comic Inspection Banner above the target
    const boxW = 350;
    const boxH = 68;
    const bx = Math.max(20, Math.min(w - boxW - 20, item.x - boxW / 2));
    const by = Math.max(145, item.y - 108);

    ctx.fillStyle = '#ffea00';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';

    if (progress < 0.3) {
      ctx.fillText('🔍 STALKING CLOSER... KEEP HOLDING [SPACE]!', bx + boxW / 2, by + 24);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Get past 30% to inspect & enter TEASE ZONE!', bx + boxW / 2, by + 48);
    } else {
      // Reveal the visual clue!
      ctx.fillStyle = item.spec.isLure ? '#d63031' : '#009432';
      ctx.fillText(`CLUE: ${item.spec.tellText}`, bx + boxW / 2, by + 23);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px "Impact", "Arial Black", sans-serif';
      const mult = progress > 0.72 ? 'EXTREME x5' : progress > 0.5 ? 'GREAT x3' : 'x2';
      ctx.fillText(
        `[RELEASE SPACE] = TEASE (${mult})   |   [100% HOLD / X] = BITE!`,
        bx + boxW / 2,
        by + 50
      );
    }
    ctx.restore();
  }

  // ==========================================================================
  // EMERGENCY 0.65s "SPIT OUT!!" REFLEX BAR
  // ==========================================================================
  drawSpitReflexUI(ctx, w, h, state) {
    ctx.save();
    ctx.fillStyle = 'rgba(214, 48, 49, 0.35)';
    ctx.fillRect(0, 0, w, h);

    const boxW = 460;
    const boxH = 130;
    const bx = (w - boxW) / 2;
    const by = (h - boxH) / 2;

    ctx.fillStyle = '#ffea00';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#d63031';
    ctx.font = 'italic bold 28px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ IT\'S PLASTIC!! HOOK IN MOUTH!! ⚠️', w / 2, by + 42);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px "Impact", "Arial Black", sans-serif';
    ctx.fillText('PRESS [← LEFT] OR [SPACE] NOW TO SPIT IT OUT!!', w / 2, by + 76);

    // Timer bar
    const ratio = Math.max(0, state.spitTimer / state.spitWindow);
    ctx.fillStyle = '#222';
    ctx.fillRect(bx + 30, by + 92, boxW - 60, 22);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(bx + 30, by + 92, (boxW - 60) * ratio, 22);
    ctx.strokeRect(bx + 30, by + 92, boxW - 60, 22);
    ctx.restore();
  }

  // ==========================================================================
  // GILL WASH (AERIAL JUMP ESCAPE) MINI-GAME UI
  // ==========================================================================
  drawGillWashUI(ctx, w, h, state) {
    ctx.save();
    const boxW = 440;
    const boxH = 120;
    const bx = (w - boxW) / 2;
    const by = h - 165;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#e84118';
    ctx.font = 'italic bold 25px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪝 HOOKED!! MASH [SPACE] OR [↑] FOR GILL WASH!!', w / 2, by + 40);

    // Mash progress bar
    const ratio = Math.min(1, state.gillWashProgress / 100);
    ctx.fillStyle = '#2f3640';
    ctx.fillRect(bx + 30, by + 60, boxW - 60, 30);
    ctx.fillStyle = '#fbc531';
    ctx.fillRect(bx + 30, by + 60, (boxW - 60) * ratio, 30);
    ctx.strokeRect(bx + 30, by + 60, boxW - 60, 30);
    ctx.restore();
  }

  // ==========================================================================
  // COMIC ONOMATOPOEIA POPUPS ("PSYCH!!", "CHOMP!!", "PTUI!!")
  // ==========================================================================
  drawComicPopup(ctx, pop) {
    ctx.save();
    ctx.translate(pop.x, pop.y);
    const scale = Math.min(1.2, pop.age * 8);
    ctx.scale(scale, scale);
    ctx.rotate(pop.rot || -0.08);

    // Jagged Comic Starburst Polygon behind text
    if (pop.burst) {
      ctx.fillStyle = pop.bgColor || '#ffea00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const spikes = 12;
      const outerR = pop.width || 95;
      const innerR = outerR * 0.68;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / spikes;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * (r * 0.55);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = `italic bold ${pop.size || 28}px "Impact", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Thick comic drop-shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(pop.text, 4, 4);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(pop.text, 0, 0);

    ctx.fillStyle = pop.color || '#ffffff';
    ctx.fillText(pop.text, 0, 0);
    ctx.restore();
  }

  // ==========================================================================
  // TOP COMIC STRIP HUD: ANGLER REACTION PANEL & BASS STATS
  // ==========================================================================
  drawTopComicHUD(ctx, w, h, state, surfaceY) {
    const angler = state.currentAngler;
    ctx.save();

    // 1. Left Panel: BASS STATS (Weight, Hunger, Lives, Sonar)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.fillRect(14, 12, 290, 102);
    ctx.strokeRect(14, 12, 290, 102);

    // Yellow comic header tag
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(14, 12, 290, 26);
    ctx.strokeRect(14, 12, 290, 26);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 15px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🐟 BASS SIZE: ${state.bassWeight.toFixed(1)} LBS  |  SCORE: ${state.score}`, 24, 30);

    // Hunger Bar
    ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
    ctx.fillText('HUNGER:', 24, 58);
    ctx.fillStyle = '#222';
    ctx.fillRect(82, 46, 130, 15);
    ctx.fillStyle = state.hunger < 25 ? '#ff3838' : '#2ecc71';
    ctx.fillRect(82, 46, 130 * (state.hunger / 100), 15);
    ctx.strokeRect(82, 46, 130, 15);

    // Sonar Bar
    ctx.fillStyle = '#000';
    ctx.fillText('SONAR [Z]:', 24, 80);
    ctx.fillStyle = '#222';
    ctx.fillRect(82, 68, 130, 15);
    ctx.fillStyle = state.sonarCooldown <= 0 ? '#00d2d3' : '#f39c12';
    const sRatio = state.sonarCooldown <= 0 ? 1 : 1 - state.sonarCooldown / state.sonarMaxCooldown;
    ctx.fillRect(82, 68, 130 * sRatio, 15);
    ctx.strokeRect(82, 68, 130, 15);

    // Lives (Hooks Escaped)
    ctx.fillStyle = '#000';
    ctx.fillText(`CHANCES: ${'🐟 '.repeat(state.lives)}`, 24, 104);

    // 2. Center/Right Comic Panel: ANGLER CUT-IN & SANITY METER!
    const panelW = w - 332;
    const panelX = 318;
    ctx.fillStyle = '#fff5d6';
    ctx.fillRect(panelX, 12, panelW, 102);
    ctx.strokeRect(panelX, 12, panelW, 102);

    // Draw Animated Comic Angler Portrait inside Panel
    this.drawAnglerPortrait(ctx, panelX + 54, 68, angler, state.anglerMood);

    // Angler Name & Rage/Sanity Bar
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 15px "Impact", "Arial Black", sans-serif';
    ctx.fillText(`${angler.title} — ${angler.name}`, panelX + 110, 32);

    // Angler Sanity (Mental HP) Bar
    ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
    ctx.fillText('ANGLER PATIENCE:', panelX + 110, 54);
    const barW = Math.min(250, panelW - 315);
    ctx.fillStyle = '#222';
    ctx.fillRect(panelX + 215, 41, barW, 16);
    const sanityRatio = Math.max(0, state.anglerSanity / angler.sanityMax);
    ctx.fillStyle = sanityRatio < 0.35 ? '#e84118' : '#ff9f43';
    ctx.fillRect(panelX + 215, 41, barW * sanityRatio, 16);
    ctx.strokeRect(panelX + 215, 41, barW, 16);

    // Official KSK BAITS Logo Badge in top-right of Angler Panel
    if (this.kskLogo && this.kskLogo.complete && this.kskLogo.naturalWidth > 0) {
      const logoBoxW = 86;
      const logoBoxH = 42;
      const logoBoxX = panelX + panelW - logoBoxW - 10;
      const logoBoxY = 18;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH);
      ctx.drawImage(this.kskLogo, logoBoxX + 6, logoBoxY + 4, logoBoxW - 12, logoBoxH - 8);
      ctx.lineWidth = 4;
    }

    // Comic Speech Bubble from the Angler!
    const bubbleX = panelX + 110;
    const bubbleY = 64;
    const bubbleW = panelW - 124;
    const bubbleH = 40;
    ctx.fillStyle = state.anglerMood === 'teased' ? '#ffea00' : '#ffffff';
    ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
    ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

    ctx.fillStyle = '#000000';
    ctx.font = 'italic bold 15px "Impact", "Arial Black", sans-serif';
    ctx.fillText(`"${state.anglerQuote}"`, bubbleX + 14, bubbleY + 26);

    ctx.restore();
  }

  drawAnglerPortrait(ctx, cx, cy, angler, mood) {
    ctx.save();
    ctx.translate(cx, cy);

    // Portrait frame circle
    ctx.fillStyle = mood === 'teased' ? '#ff4757' : '#70a1ff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Shoulders
    ctx.fillStyle = angler.shirtColor;
    ctx.beginPath();
    ctx.arc(0, 32, 26, Math.PI, 0, false);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = mood === 'teased' ? '#ff6b81' : '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hat (flies up when teased!)
    const hatLift = mood === 'teased' ? -10 : 0;
    ctx.fillStyle = angler.hatColor;
    ctx.beginPath();
    ctx.arc(0, -12 + hatLift, 17, Math.PI, 0, false);
    ctx.lineTo(24, -12 + hatLift);
    ctx.lineTo(-18, -12 + hatLift);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes & Mouth based on mood
    if (mood === 'teased') {
      // Popping comic eyes & screaming mouth!
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-6, -4, 6, 0, Math.PI * 2);
      ctx.arc(7, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-6, -4, 2, 0, Math.PI * 2);
      ctx.arc(7, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, 7, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Smug / focused eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(-10, -7, 8, 4);
      ctx.fillRect(2, -7, 8, 4);
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.lineTo(6, 5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

window.ComicRenderer = ComicRenderer;
