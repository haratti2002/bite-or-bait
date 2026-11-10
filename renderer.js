// ============================================================================
// BITE OR BAIT — Next-Gen American Comic & Pop-Art Renderer (v3 Ultra Edition)
// ============================================================================

class ComicRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.halftonePattern = this.createHalftonePattern();
    this.kskLogo = new Image();
    this.kskLogo.src = 'ksk-baits-logo.png';
    this.sunbeams = [
      { x: 0.20, width: 115, angle: 0.16 },
      { x: 0.52, width: 145, angle: 0.12 },
      { x: 0.80, width: 105, angle: 0.18 }
    ];
    this.coverZones = [
      { x: 145, y: 495, r: 72, label: 'TIMBER COVER' },
      { x: 815, y: 485, r: 72, label: 'WEED BED COVER' }
    ];
  }

  createHalftonePattern() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 14;
    pCanvas.height = 14;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = 'rgba(0, 0, 0, 0.11)';
    pCtx.beginPath();
    pCtx.arc(3.5, 3.5, 1.8, 0, Math.PI * 2);
    pCtx.arc(10.5, 10.5, 1.8, 0, Math.PI * 2);
    pCtx.fill();
    return this.ctx.createPattern(pCanvas, 'repeat');
  }

  isInSunbeam(x, y, w, h) {
    const surfaceY = 148;
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
    const surfaceY = 148;

    ctx.save();

    // Screen Shake
    if (state.screenShake > 0) {
      const mag = state.screenShake * 14;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    // 1. ABOVE-WATER SKY, MOUNTAINS, PINE SHORELINE & LIVE ANGLER BOAT
    this.drawAboveWaterWorld(ctx, w, surfaceY, state, time);

    // 2. UNDERWATER GRADIENT & COMIC HALFTONE SHADING
    const waterGrad = ctx.createLinearGradient(0, surfaceY, 0, h);
    if (state.sonarTimer > 0) {
      waterGrad.addColorStop(0, '#093859');
      waterGrad.addColorStop(0.5, '#051e3e');
      waterGrad.addColorStop(1, '#020c1b');
    } else if (state.combo >= 4) {
      // Lunker Fever Mode warm golden-emerald tint
      waterGrad.addColorStop(0, '#1dd1a1');
      waterGrad.addColorStop(0.45, '#0e8a6d');
      waterGrad.addColorStop(1, '#062338');
    } else {
      waterGrad.addColorStop(0, '#18dcff');
      waterGrad.addColorStop(0.18, '#1dd1a1');
      waterGrad.addColorStop(0.65, '#0a3d62');
      waterGrad.addColorStop(1, '#041426');
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, surfaceY, w, h - surfaceY);

    ctx.fillStyle = this.halftonePattern;
    ctx.fillRect(0, surfaceY, w, h - surfaceY);

    // 3. VOLUMETRIC SUNBEAMS (GOD RAYS) & FLOATING PLANKTON MOTES
    this.drawSunbeams(ctx, w, h, surfaceY, time);

    // 4. INTERACTIVE UNDERWATER STRUCTURE (TIMBER LOGS, BOULDERS, WEED BEDS)
    this.drawUnderwaterStructure(ctx, w, h, surfaceY, state, time);

    // 5. SONAR PULSE WAVE
    if (state.sonarTimer > 0) {
      const progress = 1 - state.sonarTimer / state.sonarDuration;
      const maxR = Math.hypot(w, h);
      const r = progress * maxR * 0.85;
      ctx.save();
      ctx.beginPath();
      ctx.arc(state.sonarOrigin.x, state.sonarOrigin.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.restore();
    }

    // 6. AMBIENT BUBBLES & ACTION PARTICLES
    this.drawParticlesAndBubbles(ctx, state);

    // 7. DRAW PREY & KSK BAITS LURES (AND FISHING LINES TO THE BOAT ROD TIP!)
    for (const item of state.items) {
      this.drawItem(ctx, item, state, surfaceY, w, h);
    }

    // 8. DRAW ARTICULATED HERO BLACK BASS
    this.drawArticulatedBass(ctx, state.bass, state);

    // 9. DYNAMIC WATER SURFACE WAVES & FOAM
    this.drawWaterSurfaceLine(ctx, w, surfaceY, time);

    // 10. STALK MODE: 4X MAGNIFYING INSPECTOR LOUPE & ACTION SPEED LINES
    if (state.focusedItem && state.mode === 'PLAYING') {
      this.drawInspectorLoupe(ctx, w, h, state);
    }

    // 11. EMERGENCY SPIT-OUT REFLEX OR GILL-WASH AERIAL JUMP UI
    if (state.mode === 'SPIT_REFLEX') {
      this.drawSpitReflexUI(ctx, w, h, state);
    } else if (state.mode === 'GILL_WASH') {
      this.drawGillWashUI(ctx, w, h, state);
    }

    // 12. COMIC ONOMATOPOEIA POPUPS
    for (const pop of state.popups) {
      this.drawComicPopup(ctx, pop);
    }

    // 13. COMPACT COMIC HUD CORNERS (BASS STATS LEFT, ANGLER CUT-IN RIGHT)
    this.drawComicHUD(ctx, w, h, state);

    ctx.restore();
  }

  // ==========================================================================
  // 1. ABOVE-WATER SKY, SHORELINE & LIVE ANGLER BOAT WITH BENDING ROD
  // ==========================================================================
  drawAboveWaterWorld(ctx, w, surfaceY, state, time) {
    ctx.save();

    // Comic Sunset/Day Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
    skyGrad.addColorStop(0, '#ff7f50');
    skyGrad.addColorStop(0.55, '#feca57');
    skyGrad.addColorStop(1, '#fff3b0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, surfaceY);

    // Sunburst rays in sky
    ctx.save();
    ctx.translate(w * 0.5, surfaceY - 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const a1 = (i * Math.PI) / 10 - Math.PI;
      const a2 = a1 + 0.14;
      ctx.lineTo(Math.cos(a1) * 600, Math.sin(a1) * 600);
      ctx.lineTo(Math.cos(a2) * 600, Math.sin(a2) * 600);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Distant Mountain & Pine Tree Silhouette along shoreline
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(0, surfaceY - 36);
    ctx.lineTo(140, surfaceY - 62);
    ctx.lineTo(290, surfaceY - 28);
    ctx.lineTo(480, surfaceY - 54);
    ctx.lineTo(680, surfaceY - 25);
    ctx.lineTo(840, surfaceY - 58);
    ctx.lineTo(w, surfaceY - 32);
    ctx.lineTo(w, surfaceY);
    ctx.closePath();
    ctx.fill();

    // LIVE ANGLER BASS BOAT FLOATING ON THE SURFACE!
    const angler = state.currentAngler;
    const boatX = state.boatX || 480;
    const boatBob = Math.sin(time * 3.2) * 3.5;
    const boatY = surfaceY - 6 + boatBob;

    ctx.save();
    ctx.translate(boatX, boatY);
    if (state.anglerMood === 'teased') {
      ctx.rotate(Math.sin(time * 28) * 0.08);
    }

    // Angler Figure on the Boat
    const jumpOffset = state.anglerMood === 'teased' ? -Math.abs(Math.sin(time * 18)) * 18 : 0;
    ctx.fillStyle = angler.shirtColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-14, -44 + jumpOffset, 28, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = state.anglerMood === 'teased' ? '#ff6b81' : '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -54 + jumpOffset, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cap
    const hatFly = state.anglerMood === 'teased' ? -12 : 0;
    ctx.fillStyle = angler.hatColor;
    ctx.beginPath();
    ctx.arc(0, -60 + jumpOffset + hatFly, 12, Math.PI, 0);
    ctx.lineTo(18, -60 + jumpOffset + hatFly);
    ctx.lineTo(-14, -60 + jumpOffset + hatFly);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boat Hull (Sleek Bass Boat with KSK BAITS decal!)
    ctx.fillStyle = angler.boatColor || '#c0392b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-78, -18);
    ctx.lineTo(84, -18);
    ctx.lineTo(66, 8);
    ctx.lineTo(-64, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White racing stripe on boat hull
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(-55, -12, 110, 6);
    ctx.strokeRect(-55, -12, 110, 6);

    // Outboard Motor on left stern
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-88, -32, 16, 26);
    ctx.strokeRect(-88, -32, 16, 26);

    // Fishing Rod bending toward the water!
    const rodTwitch = Math.sin(time * (state.anglerMood === 'hooked' ? 22 : 4)) * 6;
    const rodTipLocalX = 76;
    const rodTipLocalY = -42 + rodTwitch;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, -32 + jumpOffset);
    ctx.quadraticCurveTo(46, -54, rodTipLocalX, rodTipLocalY);
    ctx.stroke();

    // Store world rod tip coordinates for lure fishing lines!
    state.rodTipX = boatX + rodTipLocalX;
    state.rodTipY = boatY + rodTipLocalY;

    ctx.restore();
    ctx.restore();
  }

  drawWaterSurfaceLine(ctx, w, surfaceY, time) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    for (let x = 0; x <= w; x += 20) {
      const wy = surfaceY + Math.sin(x * 0.03 + time * 4) * 4.5;
      ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  drawSunbeams(ctx, w, h, surfaceY, time) {
    ctx.save();
    for (const beam of this.sunbeams) {
      const startX = beam.x * w + Math.sin(time * 0.6 + beam.x * 10) * 20;
      const endX = startX + (h - surfaceY) * Math.tan(beam.angle);
      const grad = ctx.createLinearGradient(startX, surfaceY, endX, h);
      grad.addColorStop(0, 'rgba(255, 250, 190, 0.36)');
      grad.addColorStop(0.65, 'rgba(255, 250, 190, 0.10)');
      grad.addColorStop(1, 'rgba(255, 250, 190, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(startX - beam.width / 2, surfaceY);
      ctx.lineTo(startX + beam.width / 2, surfaceY);
      ctx.lineTo(endX + beam.width * 0.95, h);
      ctx.lineTo(endX - beam.width * 0.95, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================================================
  // 4. INTERACTIVE UNDERWATER COVER / AMBUSH ZONES (TIMBER & WEEDS)
  // ==========================================================================
  drawUnderwaterStructure(ctx, w, h, surfaceY, state, time) {
    ctx.save();

    // Left Ambush Zone: Fallen Submerged Timber Logs
    ctx.fillStyle = '#3d2314';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.save();
    ctx.translate(135, 515);
    ctx.rotate(-0.22);
    ctx.fillRect(-85, -18, 175, 34);
    ctx.strokeRect(-85, -18, 175, 34);
    // Branch stub
    ctx.fillRect(10, -56, 22, 42);
    ctx.strokeRect(10, -56, 22, 42);
    ctx.restore();

    // Swaying Kelp / Weed Beds
    const weedXList = [70, 195, 340, 620, 775, 835, 890];
    for (const wx of weedXList) {
      const isCoverWeed = wx > 740;
      const weedH = isCoverWeed ? 165 : 115;
      const sway = Math.sin(time * 2.2 + wx * 0.05) * 18;
      ctx.beginPath();
      ctx.moveTo(wx - 14, h);
      ctx.quadraticCurveTo(wx + sway * 0.5, h - weedH * 0.5, wx + sway, h - weedH);
      ctx.quadraticCurveTo(wx + 14 + sway * 0.5, h - weedH * 0.5, wx + 14, h);
      ctx.fillStyle = isCoverWeed ? 'rgba(20, 110, 70, 0.82)' : 'rgba(8, 60, 48, 0.65)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    // Highlight Cover Ambush Ring when Bass is inside Cover!
    for (const zone of this.coverZones) {
      const dist = Math.hypot(state.bass.x - zone.x, state.bass.y - zone.y);
      const inCover = dist < zone.r;
      ctx.save();
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
      ctx.strokeStyle = inCover ? '#00ffcc' : 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = inCover ? 3.5 : 1.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (inCover) {
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 STEALTH AMBUSH READY (x1.5 BONUS!)', zone.x, zone.y - zone.r - 8);
      }
      ctx.restore();
    }

    // Rocky Lakebed Floor
    ctx.fillStyle = '#061a23';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 24);
    for (let x = 0; x <= w; x += 48) {
      ctx.lineTo(x, h - 20 - Math.sin(x * 0.06) * 7);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.stroke();

    ctx.restore();
  }

  drawParticlesAndBubbles(ctx, state) {
    ctx.save();
    for (const b of state.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }

    if (state.particles) {
      for (const pt of state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // 7. DRAW PREY OR KSK BAITS LURE + FISHING LINE TO ANGLER'S ROD
  // ==========================================================================
  drawItem(ctx, item, state, surfaceY, w, h) {
    const bass = state.bass;
    const dist = Math.hypot(bass.x - item.x, bass.y - item.y);
    const isFocused = state.focusedItem === item;
    const inSunbeam = this.isInSunbeam(item.x, item.y, w, h);
    const sonarActive = state.sonarTimer > 0;
    const bassIsBelow = bass.y > item.y + 22;
    const stalkProgress = isFocused ? state.stalkProgress : 0;
    const visionBoost = state.perks ? state.perks.lineVisionBoost : 0;

    // 1. Draw Fishing Line from Angler's Rod Tip -> Surface Entry -> Lure Nose!
    if (item.spec.isLure) {
      let revealAlpha = item.spec.lineVisibility * 0.35 + visionBoost;
      if (inSunbeam) revealAlpha = Math.max(revealAlpha, 0.88);
      if (sonarActive) revealAlpha = 1.0;
      if (stalkProgress > 0.15) revealAlpha = Math.max(revealAlpha, 0.45 + stalkProgress * 0.55);
      if (bassIsBelow) revealAlpha = Math.max(revealAlpha, 0.85);

      const entryX = item.anchorX || item.x;
      ctx.save();

      // Above-water line from rod tip to surface entry point
      if (state.rodTipX) {
        ctx.beginPath();
        ctx.moveTo(state.rodTipX, state.rodTipY);
        ctx.quadraticCurveTo(
          (state.rodTipX + entryX) * 0.5,
          surfaceY - 12,
          entryX,
          surfaceY
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Underwater line from surface to lure
      ctx.beginPath();
      ctx.moveTo(entryX, surfaceY);
      ctx.quadraticCurveTo(
        (entryX + item.x) * 0.5 + Math.sin(state.time * 5) * 6,
        (surfaceY + item.y) * 0.5,
        item.x,
        item.y - 4
      );
      if (sonarActive) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3.2;
        ctx.setLineDash([7, 4]);
      } else {
        ctx.strokeStyle = `rgba(235, 250, 255, ${Math.min(1, revealAlpha)})`;
        ctx.lineWidth = inSunbeam || stalkProgress > 0.3 ? 2.5 : 1.5;
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    const facing = item.vx >= 0 ? 1 : -1;
    ctx.scale(facing, 1);
    ctx.rotate(item.angle || 0);

    // Focused Target Lock-On Reticle
    if (isFocused && state.mode === 'PLAYING') {
      ctx.save();
      ctx.scale(facing, 1);
      const r = 44 + Math.sin(state.time * 10) * 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = bass.stalking ? '#ffea00' : 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = bass.stalking ? 4 : 2.5;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw Hooks on Lures
    if (item.spec.isLure) {
      let hookAlpha = item.spec.hookPosition === 'hidden_belly' ? 0.22 + visionBoost : 0.85;
      if (bassIsBelow || sonarActive || stalkProgress > 0.25 || inSunbeam) {
        hookAlpha = 1.0;
      }
      this.drawDetailedHooks(ctx, item.spec, hookAlpha, sonarActive, state.time);
    }

    // Draw Detailed Organism or KSK BAITS Lure Body
    this.drawEntityBody(ctx, item.spec, item.idNum, state.time, bassIsBelow, stalkProgress, sonarActive);

    // Sonar X-Ray Badge
    if (sonarActive) {
      ctx.save();
      ctx.scale(facing, 1);
      if (item.spec.isLure) {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-34, -22, 68, 44);
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ METAL HOOK & WIRE!', 0, -28);
      } else {
        const beat = 1 + Math.sin(state.time * 18) * 0.22;
        ctx.scale(beat, beat);
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 14px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❤ LIVE PREY', 0, -26);
      }
      ctx.restore();
    }

    // Rattle Sound Onomatopoeia Cue
    if (item.spec.isLure && item.spec.hasRattle && Math.sin(state.time * 12 + item.idNum) > 0.7 && dist < 320) {
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

  drawDetailedHooks(ctx, spec, alpha, sonarActive, time) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.strokeStyle = sonarActive ? '#00ffff' : '#ecf0f1';
    ctx.lineWidth = sonarActive ? 3.5 : 2.8;

    const drawTreble = (hx, hy) => {
      // Split ring hanger
      ctx.beginPath();
      ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
      ctx.stroke();
      // Shank & 3 barbed prongs
      ctx.beginPath();
      ctx.moveTo(hx, hy + 3);
      ctx.lineTo(hx, hy + 15);
      ctx.arc(hx - 5.5, hy + 15, 5.5, 0, Math.PI * 0.9, false);
      ctx.moveTo(hx, hy + 15);
      ctx.arc(hx + 5.5, hy + 15, 5.5, 0, Math.PI * 0.9, false);
      ctx.stroke();

      // Specular 4-point star glint on sharp hook point!
      if (alpha > 0.65 && Math.sin(time * 9 + hx) > 0.2) {
        const gx = hx - 10;
        const gy = hy + 14;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(gx, gy - 6);
        ctx.lineTo(gx + 2, gy - 2);
        ctx.lineTo(gx + 6, gy);
        ctx.lineTo(gx + 2, gy + 2);
        ctx.lineTo(gx, gy + 6);
        ctx.lineTo(gx - 2, gy + 2);
        ctx.lineTo(gx - 6, gy);
        ctx.lineTo(gx - 2, gy - 2);
        ctx.closePath();
        ctx.fill();
      }
    };

    if (spec.hookPosition === 'belly_and_tail') {
      drawTreble(-2, 9);
      drawTreble(-24, 3);
    } else if (spec.hookPosition === 'hidden_belly') {
      drawTreble(2, 7);
      drawTreble(-15, 7);
    } else if (spec.hookPosition === 'middle') {
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.arc(0, 9, 12, -0.2, Math.PI * 1.15, false);
      ctx.stroke();
    } else if (spec.hookPosition === 'top_hook') {
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.arc(-4, -9, 11, 0.3, Math.PI * 1.35, true);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawEntityBody(ctx, spec, idNum, time, bassIsBelow, stalkProgress, sonarActive) {
    const pCol = spec.primaryColor;
    const sCol = spec.secondaryColor;

    switch (spec.shape) {
      case 'worm': {
        ctx.save();
        if (spec.isLure) {
          // Brass bullet weight at nose
          ctx.fillStyle = '#f1c40f';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(30, 0);
          ctx.lineTo(17, -8);
          ctx.lineTo(17, 8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = -26; i <= 18; i += 5) {
          const wv = Math.sin(time * (spec.isLure ? 13 : 6) + i * 0.22) * (spec.isLure ? 3.5 : 7.5);
          if (i === -26) ctx.moveTo(i, wv);
          else ctx.lineTo(i, wv);
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 16;
        ctx.stroke();
        ctx.strokeStyle = pCol;
        ctx.lineWidth = 10;
        ctx.stroke();
        // Earthworm clitellum ring on real worm
        if (!spec.isLure) {
          ctx.strokeStyle = sCol;
          ctx.lineWidth = 11;
          ctx.beginPath();
          ctx.moveTo(4, -2);
          ctx.lineTo(10, -1);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      case 'crankbait': {
        ctx.save();
        // Polycarbonate diving lip
        ctx.fillStyle = 'rgba(210, 248, 255, 0.85)';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(18, 2);
        ctx.lineTo(34, 13);
        ctx.lineTo(27, 17);
        ctx.lineTo(13, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fat crankbait body
        ctx.fillStyle = sCol;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 23, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red gill slash
        ctx.fillStyle = pCol;
        ctx.beginPath();
        ctx.arc(10, 0, 12, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Internal X-ray rattle balls when stalking or sonar
        if (stalkProgress > 0.25 || sonarActive) {
          ctx.fillStyle = '#00ffff';
          ctx.beginPath();
          ctx.arc(-4 + Math.sin(time * 30) * 3, 2, 3.5, 0, Math.PI * 2);
          ctx.arc(-11 - Math.sin(time * 30) * 3, 1, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crosshair painted lure eye
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(13, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(13, -3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'frog': {
        ctx.save();
        const kick = Math.sin(time * 8 + idNum) * 6;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3.5;

        if (spec.isLure) {
          // Silicone rubber skirt strands
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 3;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(-18, i * 4);
            ctx.quadraticCurveTo(-29, i * 7 + kick, -38, i * 5 - kick);
            ctx.stroke();
          }
        } else {
          // Muscular webbed frog legs
          ctx.fillStyle = pCol;
          ctx.beginPath();
          ctx.ellipse(-20, -9 + kick * 0.4, 11, 4.5, -0.4, 0, Math.PI * 2);
          ctx.ellipse(-20, 9 - kick * 0.4, 11, 4.5, 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = bassIsBelow ? sCol : pCol;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 21, 13.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spots on back
        if (!bassIsBelow) {
          ctx.fillStyle = '#1e5128';
          ctx.beginPath();
          ctx.arc(-6, -4, 3, 0, Math.PI * 2);
          ctx.arc(2, 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(11, -9, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(12, -9, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'craw': {
        ctx.save();
        const pinch = Math.abs(Math.sin(time * 6.5)) * 5;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        if (spec.isLure) {
          ctx.strokeStyle = sCol;
          for (let a = -0.6; a <= 0.6; a += 0.2) {
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(-19, Math.sin(a + time * 6) * 16);
            ctx.stroke();
          }
          ctx.fillStyle = '#1e272e';
          ctx.strokeStyle = '#000';
          ctx.beginPath();
          ctx.arc(14, 0, 8.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = pCol;
        ctx.beginPath();
        ctx.ellipse(-4, 0, 17, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = sCol;
        ctx.beginPath();
        ctx.ellipse(19, -10 - pinch * 0.4, 11, 5.5, 0.3, 0, Math.PI * 2);
        ctx.ellipse(19, 10 + pinch * 0.4, 11, 5.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'bluegill': {
        ctx.save();
        const wag = Math.sin(time * 9 + idNum) * 5;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3.5;

        ctx.fillStyle = sCol;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-34, -13 + wag);
        ctx.lineTo(-34, 13 + wag);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pCol;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 16.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = sCol;
        ctx.beginPath();
        ctx.arc(8, 7, 9.5, 0, Math.PI, false);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(4, -1, 4.2, 0, Math.PI * 2);
        ctx.fill();

        if (spec.isLure) {
          // Jointed Swimbait V-cut hinge seam + metal pins
          ctx.strokeStyle = (stalkProgress > 0.2 || sonarActive) ? '#ffea00' : '#000';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(-2, -16);
          ctx.lineTo(-2, 16);
          ctx.stroke();
          ctx.fillStyle = '#dfe6e9';
          ctx.beginPath();
          ctx.arc(-2, -6, 2.5, 0, Math.PI * 2);
          ctx.arc(-2, 6, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = spec.isLure ? '#ff3838' : '#ffffff';
        ctx.beginPath();
        ctx.arc(14, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(15, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'minnow':
      default: {
        const tailWag = Math.sin(time * 12 + idNum) * 5;
        ctx.save();
        ctx.fillStyle = sCol;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-31, -10 + tailWag);
        ctx.lineTo(-27, 0);
        ctx.lineTo(-31, 10 + tailWag);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pCol;
        ctx.beginPath();
        ctx.ellipse(0, 0, 23, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red breathing gill curve
        ctx.strokeStyle = '#eb4d4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(7, 0, 6, -0.7, 0.7);
        ctx.stroke();

        const blink = Math.sin(time * 3.2 + idNum) > 0.92;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(13, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (!blink) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(14, -2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        break;
      }
    }
  }

  // ==========================================================================
  // 8. ARTICULATED HERO BLACK BASS WITH SUCTION VORTEX & FEVER AURA
  // ==========================================================================
  drawArticulatedBass(ctx, bass, state) {
    ctx.save();
    ctx.translate(bass.x, bass.y);

    const scale = bass.scale || 1;
    ctx.scale(bass.facing * scale, scale);
    ctx.rotate(bass.tilt || 0);

    const wagSpeed = bass.stalking ? 4.5 : 13;
    const wagAmp = bass.speed > 35 ? 11 : 4.5;
    const tailWag = Math.sin(state.time * wagSpeed) * wagAmp;
    const midWag = Math.cos(state.time * wagSpeed) * (wagAmp * 0.4);
    const mouthOpen = bass.mouthOpen || 0;

    // Lunker Fever Golden Comic Aura (When Combo >= 4)
    if (state.combo >= 4) {
      ctx.save();
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.ellipse(-4, 0, 52, 32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Water Suction Streamlines when Mouth is Open (Stalking or Inhaling!)
    if (mouthOpen > 0.2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.65)';
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        const flowOffset = ((state.time * 90) % 28);
        ctx.beginPath();
        ctx.moveTo(64 - flowOffset, i * 14);
        ctx.quadraticCurveTo(44, i * 6, 30, i * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';

    // 1. Spiny Anterior Dorsal & Rounded Soft Posterior Dorsal Fin
    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.moveTo(-30, -15 + midWag * 0.3);
    ctx.lineTo(-20, -32 + midWag * 0.5);
    ctx.lineTo(-12, -25);
    ctx.lineTo(-4, -33);
    ctx.lineTo(6, -23);
    ctx.lineTo(15, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ventral / Anal Fin
    ctx.beginPath();
    ctx.moveTo(-26, 14 + midWag * 0.3);
    ctx.lineTo(-16, 26 + midWag * 0.5);
    ctx.lineTo(-6, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Broad Articulated Caudal Tail Fin
    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.moveTo(-36, midWag * 0.5);
    ctx.lineTo(-62, -21 + tailWag);
    ctx.lineTo(-54, tailWag * 0.65);
    ctx.lineTo(-62, 21 + tailWag);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Sculpted Largemouth Bass Torso with Metallic Green-Gold Gradient
    const bodyGrad = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGrad.addColorStop(0, '#143625');
    bodyGrad.addColorStop(0.45, '#40916c');
    bodyGrad.addColorStop(0.75, '#b7e4c7');
    bodyGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(34, -4);
    ctx.quadraticCurveTo(10, -25, -20, -18 + midWag * 0.3);
    ctx.quadraticCurveTo(-40, -10 + midWag * 0.5, -40, midWag * 0.5);
    ctx.quadraticCurveTo(-40, 10 + midWag * 0.5, -20, 18 + midWag * 0.3);
    ctx.quadraticCurveTo(12, 24, 34, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Diamond Scale Cross-Hatching & Iconic Dark Lateral Stripe
    ctx.fillStyle = '#081c15';
    for (let sx = -32; sx <= 16; sx += 8.5) {
      const sy = Math.sin(sx * 0.3) * 2 + (sx < -10 ? midWag * 0.25 : 0);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5.5, 3.8, 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Flaring Operculum (Gill Plate)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(8, 1, 13, -0.85, 0.95);
    ctx.stroke();
    if (mouthOpen > 0.25) {
      ctx.strokeStyle = '#ff3838';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(6, 1, 13, -0.65, 0.75);
      ctx.stroke();
    }

    // 6. Bucket Mouth Jaw Mechanics
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    if (mouthOpen > 0.05) {
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.arc(29, 3, 15 * mouthOpen, -Math.PI * 0.48, Math.PI * 0.58);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#52b788';
      ctx.beginPath();
      ctx.moveTo(18, 10);
      ctx.lineTo(40, 12 + mouthOpen * 13);
      ctx.lineTo(25, 20 + mouthOpen * 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(34, 4);
      ctx.quadraticCurveTo(24, 9, 15, 4);
      ctx.stroke();
    }

    // 7. Translucent Rayed Pectoral Fin
    const finFlap = Math.sin(state.time * 10) * 4.5;
    ctx.fillStyle = 'rgba(82, 183, 136, 0.88)';
    ctx.beginPath();
    ctx.moveTo(4, 7);
    ctx.quadraticCurveTo(-12, 18 + finFlap, -8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 8. Fierce Predator Eye & Deal-With-It Shades
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(20, -6, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(22, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(20.5, -7.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (bass.stalking) {
      ctx.beginPath();
      ctx.moveTo(12, -14);
      ctx.lineTo(28, -9);
      ctx.lineWidth = 4.5;
      ctx.stroke();
    }

    if (bass.coolTimer > 0) {
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2.2;
      ctx.fillRect(13, -12, 17, 9);
      ctx.strokeRect(13, -12, 17, 9);
    }

    ctx.restore();
  }

  // ==========================================================================
  // 10. THE "KSK 4X INSPECTOR LOUPE" (PICTURE-IN-PICTURE MAGNIFYING GLASS!)
  // ==========================================================================
  drawInspectorLoupe(ctx, w, h, state) {
    const item = state.focusedItem;
    const progress = state.stalkProgress;
    const stalking = state.bass.stalking;

    ctx.save();

    if (!stalking) {
      // Sleek non-intrusive comic action prompt pill above target when nearby
      const pillW = 248;
      const pillH = 28;
      const px = Math.max(16, Math.min(w - pillW - 16, item.x - pillW / 2));
      const py = Math.max(162, item.y - 64);

      ctx.fillStyle = '#ffea00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillRect(px, py, pillW, pillH);
      ctx.strokeRect(px, py, pillW, pillH);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔍 HOLD [SPACE]: ZOOM  |  [C] TEASE  |  [X] BITE', px + pillW / 2, py + 19);
      ctx.restore();
      return;
    }

    // Holding SPACE: Draw comic speed lines & circular 4x X-Ray Magnifying Lens!
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const r1 = 220 + Math.sin(state.time * 16 + a * 4) * 18;
      const r2 = Math.max(w, h);
      ctx.beginPath();
      ctx.moveTo(item.x + Math.cos(a) * r1, item.y + Math.sin(a) * r1);
      ctx.lineTo(item.x + Math.cos(a) * r2, item.y + Math.sin(a) * r2);
      ctx.stroke();
    }

    const loupeR = 62;
    const offsetX = item.x < w * 0.5 ? 120 : -120;
    const lx = Math.max(95, Math.min(w - 95, item.x + offsetX));
    const ly = Math.max(225, Math.min(h - 95, item.y - 30));

    // Connector Line from Target to Loupe
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(item.x, item.y);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // Circular Magnifying Lens Background
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, loupeR, 0, Math.PI * 2);
    ctx.fillStyle = '#041426';
    ctx.fill();
    ctx.clip();

    // Grid lines inside lens
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.22)';
    ctx.lineWidth = 1;
    for (let gx = lx - loupeR; gx <= lx + loupeR; gx += 14) {
      ctx.beginPath();
      ctx.moveTo(gx, ly - loupeR);
      ctx.lineTo(gx, ly + loupeR);
      ctx.stroke();
    }

    // Draw 1.75x Magnified Target inside Loupe!
    ctx.translate(lx, ly);
    ctx.scale(1.75, 1.75);
    if (item.spec.isLure) {
      this.drawDetailedHooks(ctx, item.spec, 1.0, true, state.time);
    }
    this.drawEntityBody(ctx, item.spec, item.idNum, state.time, true, 0.95, true);
    ctx.restore();

    // Outer Loupe Frame + Stalk Progress Ring!
    ctx.beginPath();
    ctx.arc(lx, ly, loupeR, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(lx, ly, loupeR + 6, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = progress > 0.72 ? '#ffea00' : '#00ffcc';
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    // Comic Clue Caption Tag attached to Loupe
    const tagW = 305;
    const tagH = 58;
    const tx = Math.max(16, Math.min(w - tagW - 16, lx - tagW / 2));
    const ty = ly - loupeR - tagH - 12;

    ctx.fillStyle = '#ffea00';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.fillRect(tx, ty, tagW, tagH);
    ctx.strokeRect(tx, ty, tagW, tagH);

    ctx.fillStyle = item.spec.isLure ? '#d63031' : '#009432';
    ctx.font = 'bold 13px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.spec.loupeBadge || item.spec.tellText, tx + tagW / 2, ty + 21);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
    const mult = progress > 0.72 ? 'EXTREME x5' : progress > 0.45 ? 'SUPER x3' : 'x2';
    ctx.fillText(`RELEASE [SPACE] = TEASE (${mult})  |  100% / [X] = BITE!`, tx + tagW / 2, ty + 45);

    ctx.restore();
  }

  // ==========================================================================
  // 11. SPIT-OUT REFLEX & GILL-WASH OVERLAYS
  // ==========================================================================
  drawSpitReflexUI(ctx, w, h, state) {
    ctx.save();
    ctx.fillStyle = 'rgba(214, 48, 49, 0.38)';
    ctx.fillRect(0, 0, w, h);

    const boxW = 470;
    const boxH = 132;
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
    ctx.fillText('⚠️ IT\'S A KSK LURE!! HOOK IN MOUTH!! ⚠️', w / 2, by + 42);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px "Impact", "Arial Black", sans-serif';
    ctx.fillText('SLAM [← LEFT] OR [SPACE] NOW TO SPIT IT BACK!!', w / 2, by + 76);

    const ratio = Math.max(0, state.spitTimer / state.spitWindow);
    ctx.fillStyle = '#222';
    ctx.fillRect(bx + 30, by + 92, boxW - 60, 22);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(bx + 30, by + 92, (boxW - 60) * ratio, 22);
    ctx.strokeRect(bx + 30, by + 92, boxW - 60, 22);
    ctx.restore();
  }

  drawGillWashUI(ctx, w, h, state) {
    ctx.save();
    const boxW = 450;
    const boxH = 120;
    const bx = (w - boxW) / 2;
    const by = h - 165;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#e84118';
    ctx.font = 'italic bold 24px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪝 HOOKED!! MASH [SPACE] OR [↑] FOR GILL WASH!!', w / 2, by + 40);

    const ratio = Math.min(1, state.gillWashProgress / 100);
    ctx.fillStyle = '#2f3640';
    ctx.fillRect(bx + 30, by + 60, boxW - 60, 30);
    ctx.fillStyle = '#fbc531';
    ctx.fillRect(bx + 30, by + 60, (boxW - 60) * ratio, 30);
    ctx.strokeRect(bx + 30, by + 60, boxW - 60, 30);
    ctx.restore();
  }

  drawComicPopup(ctx, pop) {
    ctx.save();
    ctx.translate(pop.x, pop.y);
    const scale = Math.min(1.2, pop.age * 8);
    ctx.scale(scale, scale);
    ctx.rotate(pop.rot || -0.06);

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
        const py = Math.sin(a) * (r * 0.52);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = `italic bold ${pop.size || 26}px "Impact", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

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
  // 13. COMPACT COMIC HUD CORNERS (SO THE SKY & BOAT ARE CLEARLY VISIBLE!)
  // ==========================================================================
  drawComicHUD(ctx, w, h, state) {
    const angler = state.currentAngler;
    ctx.save();

    // LEFT HUD CARD: BASS SIZE, SCORE, HUNGER, SONAR & COMBO
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.fillRect(12, 10, 275, 106);
    ctx.strokeRect(12, 10, 275, 106);

    ctx.fillStyle = state.combo >= 4 ? '#ff3838' : '#ffea00';
    ctx.fillRect(12, 10, 275, 25);
    ctx.strokeRect(12, 10, 275, 25);

    ctx.fillStyle = state.combo >= 4 ? '#ffffff' : '#000000';
    ctx.font = 'bold 14px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    const comboTxt = state.combo >= 2 ? ` • 🔥${state.combo}x IQ` : '';
    ctx.fillText(`🐟 ${state.bassWeight.toFixed(1)} LBS | SCORE: ${state.score}${comboTxt}`, 20, 28);

    // Hunger Bar
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
    ctx.fillText('HUNGER:', 20, 54);
    ctx.fillStyle = '#222';
    ctx.fillRect(76, 43, 120, 13);
    ctx.fillStyle = state.hunger < 25 ? '#ff3838' : '#2ecc71';
    ctx.fillRect(76, 43, 120 * (state.hunger / 100), 13);
    ctx.strokeRect(76, 43, 120, 13);

    // Sonar Bar
    ctx.fillStyle = '#000';
    ctx.fillText('SONAR [Z]:', 20, 74);
    ctx.fillStyle = '#222';
    ctx.fillRect(76, 63, 120, 13);
    ctx.fillStyle = state.sonarCooldown <= 0 ? '#00d2d3' : '#f39c12';
    const sRatio = state.sonarCooldown <= 0 ? 1 : 1 - state.sonarCooldown / state.sonarMaxCooldown;
    ctx.fillRect(76, 63, 120 * sRatio, 13);
    ctx.strokeRect(76, 63, 120, 13);

    ctx.fillStyle = '#000';
    ctx.fillText(`LIVES: ${'🐟 '.repeat(state.lives)}`, 20, 102);

    // Official KSK BAITS mini badge inside Left HUD
    if (this.kskLogo && this.kskLogo.complete && this.kskLogo.naturalWidth > 0) {
      ctx.drawImage(this.kskLogo, 206, 44, 72, 36);
    }

    // RIGHT HUD CARD: ANGLER PATIENCE & LIVE COMIC SPEECH BUBBLE
    const rW = 355;
    const rX = w - rW - 12;
    ctx.fillStyle = 'rgba(255, 248, 220, 0.94)';
    ctx.fillRect(rX, 10, rW, 106);
    ctx.strokeRect(rX, 10, rW, 106);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px "Impact", "Arial Black", sans-serif';
    ctx.fillText(`${angler.title}`, rX + 12, 28);

    // Angler Patience Bar
    ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
    ctx.fillText('PATIENCE:', rX + 12, 50);
    const barW = rW - 86;
    ctx.fillStyle = '#222';
    ctx.fillRect(rX + 70, 38, barW, 14);
    const sanityRatio = Math.max(0, state.anglerSanity / angler.sanityMax);
    ctx.fillStyle = sanityRatio < 0.35 ? '#e84118' : '#ff9f43';
    ctx.fillRect(rX + 70, 38, barW * sanityRatio, 14);
    ctx.strokeRect(rX + 70, 38, barW, 14);

    // Speech Bubble
    ctx.fillStyle = state.anglerMood === 'teased' ? '#ffea00' : '#ffffff';
    ctx.fillRect(rX + 10, 60, rW - 20, 46);
    ctx.strokeRect(rX + 10, 60, rW - 20, 46);

    ctx.fillStyle = '#000000';
    ctx.font = 'italic bold 13px "Impact", "Arial Black", sans-serif';
    ctx.fillText(`"${state.anglerQuote}"`, rX + 18, 88);

    ctx.restore();
  }
}

window.ComicRenderer = ComicRenderer;
