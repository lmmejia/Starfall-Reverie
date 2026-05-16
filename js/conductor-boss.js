/* global Starfall */
/**
 * Boss lanes — Conductor of Smiles (Ch.1) & Memory Beast (Ch.2). Theme driven via window.__starfallBattle.
 */
(() => {
  const W = 360;
  const H = 400;
  const LANES = 3;
  const LANE_W = W / LANES;
  const PLAYER_Y = H - 52;
  const BOSS_HP_MAX = 255;
  const PLAYER_HP_MAX = 100;
  const STRIKE_DMG = 8;
  const STRIKE_CD_BASE = 0.82;
  /** Minimum seconds between strikes (hype only shaves a little off the base). */
  const STRIKE_CD_MIN = 0.48;
  const NOTE_DMG = 16;
  const TRAIN_DMG = 26;
  const I_FRAMES = 0.52;
  const CRIT_CHANCE = 0.2;
  const CRIT_MULT = 2.35;
  const HYPE_ON_HIT = 12;
  const HYPE_ON_CRIT_BONUS = 14;
  const HYPE_LOSS_ON_DAMAGE = 48;
  const HYPE_CAP = 100;
  const BATTLE_ALLY_KEY = "starfall-reverie-battle-ally-v1";

  function getBattleKey() {
    return window.__starfallBattle === "memory" ? "memory" : "conductor";
  }

  /** @param {"conductor"|"memory"} key */
  function battleTheme(key) {
    return THEME[key] || THEME.conductor;
  }

  const THEME = {
    conductor: {
      bossId: 9001,
      victoryStardust: 35,
      modalTitle: "Conductor of Smiles",
      phase1Label: "Phase 1 — Opening night",
      phase2Label: "Phase 2 — Encore!",
      prepSub: "Hype & streaks power up your strikes after GO",
      playHint:
        "Build hype with strikes. Pink zone = note coming down. Tram: stand in the cyan SAFE lane when you see TRACKS up top.",
      encoreHudMsg: "ENCORE! Faster patterns — don’t let the hype drop!",
      encoreCaption: "Faster! Louder! Kinder!",
      victoryHud: "You cleared the stage — reward unlocked.",
      victoryTitle: "The house lights fade",
      victoryBlurb:
        "The Conductor tips her hat — you made it through the encore.",
      defeatHud: "Curtains. Want another ticket?",
      defeatTitle: "Curtains",
      defeatBlurb:
        "The Conductor curtsies anyway. The crowd pretends it was scripted.",
      warmupHud: "Warm-up — safe until countdown ends",
      briefingTitle: "Before you fight",
      briefingLead:
        "Quick read — then you’ll get a safe countdown in the arena. Candies and Warp allies apply here too: pick an ally in the battle UI for bonus HP and damage. You can close this anytime.",
      briefingItems: [
        `<strong>You</strong> are the <strong>cyan circle</strong> at the bottom. There are <strong>three lanes</strong>: left, center, right — use <kbd>A</kbd> / <kbd>D</kbd> (or <kbd>W</kbd> for center).`,
        `<strong>Pink glowing zone</strong> at the top of a lane → a <strong>smile note</strong> will fall straight down that lane. Move away before it lands on you.`,
        `<strong>Tram</strong>: two lanes get a <strong>red “track” zone up top</strong> (gold dashes = rails). The <strong>lane that stays cyan / quiet</strong> is safe. After the warning, a <strong>tram box</strong> slams down the red tracks — don’t stand there.`,
        `<strong>Strike</strong> builds <strong>Hype</strong> for bigger hits; <strong>streaks</strong> and random <strong>crits</strong> help a lot. Getting hit shreds Hype.`,
        `Watch for <strong>note flurries</strong> and <strong>twin notes</strong> in the same lane — stay mobile.`,
        `<strong>Phase 2</strong> after she’s below half HP — faster patterns (Encore!).`,
      ],
      taunts: [
        "Smile wider, darling — the cheap seats are watching.",
        "You blink off-beat. How… authentic.",
        "House policy: joy is mandatory!",
        "The tram loves a straggler.",
        "Hold that grin until intermission!",
      ],
      captionTrain: "Red = tram tracks soon. Stand in the calm lane!",
      captionDouble: "Double smile-note — same lane twice!",
      captionFlurry: "Flurry — hop lanes!",
      streakCaption: "Crowd’s going wild — keep the streak!",
      hurtCaption: "Ouch — hype took a hit!",
      losePendingHud: "Hold on — let the stage clear…",
      trainTopLabel: "TRACKS",
      safeLabel: "SAFE",
      noteTeleRgb: "255 156 207",
      noteOrb: "#ff9ccf",
      noteHighlight: "#fff6fa",
      trainWarnRgb: "255 60 95",
      trainDashRgb: "255 210 120",
      trainChargeBody: "#ff4d7a",
      trainChargeWindow: "#fff5d6",
      trainChargeRoof: "#1a0f22",
      trainChargeLight: "#ffe08a",
      safeFillRgb: "126 232 255",
      safeStrokeRgb: "126 232 255",
      safeTextRgb: "201 255 255",
      encoreFlash0: "#fff8f0",
      encoreFlash1: "rgb(255 200 230 / 0.15)",
      starWarm: "rgb(255 230 180 / 0.18)",
      starCool: "rgb(126 232 255 / 0.15)",
      laneStroke: "rgb(255 200 230 / 0.12)",
      bg0: "#2a1838",
      bg1: "#4c2558",
      bg2: "#1a0f22",
      captionBoxStroke: "rgb(255 224 140 / 0.5)",
      captionText: "#ffe8c4",
      prepBorderRgb: "126 232 255",
      prepTitle: "#c9fff3",
      prepSubRgb: "201 184 217",
      strikeParticleCrit: ["#ffe08a", "#fff6c9", "#ff9ccf"],
      strikeParticleNorm: ["#7ee8ff", "#ff9ccf", "#fff"],
      hurtParticle: ["#ff6b9d", "#ff9ccf", "#fff"],
      victoryParticles: ["#ffe08a", "#7ee8ff", "#ff9ccf"],
    },
    memory: {
      bossId: 9002,
      victoryStardust: 40,
      modalTitle: "Memory Beast",
      phase1Label: "Phase 1 — Shallow sleep",
      phase2Label: "Phase 2 — Deep rot",
      prepSub: "Resolve sharpens strikes — don’t let regret drain your hype",
      playHint:
        "Build hype with strikes. Lavender zone = memory shard falling. Regret surge: stand in the teal CLEAR lane when you see SURGE at the top.",
      encoreHudMsg: "It wakes deeper — patterns tighten. Keep your mind in one lane!",
      encoreCaption: "All your unfinished sentences—at once!",
      victoryHud: "You tear a hole through the nightmare — candies spill through.",
      victoryTitle: "The pods dim",
      victoryBlurb:
        "The Beast unspools into frayed mist. For a heartbeat, the chamber is only breathing glass.",
      defeatHud: "Sleep claims another echo. Try again when you’re ready.",
      defeatTitle: "Folded under",
      defeatBlurb:
        "The whispers sound like your voice now—not because they’re true, but because the deep is a talented mimic.",
      warmupHud: "Stasis field — you can’t be hurt until the mind counts down",
      briefingTitle: "Before you descend",
      briefingLead:
        "Same arena, deadlier mood: you still get a safe prep countdown. Warp allies still grant bonus HP and damage. Read fast—the Beast doesn’t wait politely.",
      briefingItems: [
        `<strong>You</strong> remain the <strong>cyan circle</strong>; lanes are still <kbd>A</kbd> / <kbd>D</kbd> / <kbd>W</kbd> center.`,
        `<strong>Lavender glow</strong> telegraphs a <strong>memory shard</strong> plunging one lane. Move out before it strikes.`,
        `<strong>Regret surge</strong>: two lanes flood with <strong>violet warning bands</strong>. The <strong>lane that stays teal / quiet</strong> is <strong>CLEAR</strong>. After the pulse, a <strong>surge mass</strong> rams the violet lanes—don’t stand there.`,
        `<strong>Hype & streaks</strong> still amplify strikes; <strong>crits</strong> help pierce dreaming armor. Getting hit drains resolve fast.`,
        `Watch for <strong>shard flurries</strong> and <strong>twin shards</strong> in the same lane.`,
        `<strong>Phase 2</strong> below half HP — faster spawns and shorter telegraphs.`,
      ],
      taunts: [
        "That’s not déjà vu—that’s me borrowing your old guilt.",
        "Stay still; I’ll file your courage under ‘lost’.",
        "Every lane you hesitate in becomes mine.",
        "You taste like an apology half-written.",
        "The pods hum prettier when you’re afraid.",
      ],
      captionTrain:
        "Violet lanes = regret surge soon. Find the mind-path that stays CLEAR.",
      captionDouble: "Twin shards—same lane, twice.",
      captionFlurry: "Shards scatter—keep moving.",
      streakCaption: "Your focus holds — drive the shard home!",
      hurtCaption: "Regret clipped you — hype frays.",
      losePendingHud: "Wait—let the surge pass through you…",
      trainTopLabel: "SURGE",
      safeLabel: "CLEAR",
      noteTeleRgb: "186 140 255",
      noteOrb: "#c9b3ff",
      noteHighlight: "#eafcff",
      trainWarnRgb: "110 70 180",
      trainDashRgb: "120 220 200",
      trainChargeBody: "#5a3d8a",
      trainChargeWindow: "#7fd9c8",
      trainChargeRoof: "#24183a",
      trainChargeLight: "#b8a0ff",
      safeFillRgb: "80 200 190",
      safeStrokeRgb: "120 255 236",
      safeTextRgb: "200 255 248",
      encoreFlash0: "#d8c4ff",
      encoreFlash1: "rgb(80 40 120 / 0.2)",
      starWarm: "rgb(200 180 255 / 0.16)",
      starCool: "rgb(120 255 220 / 0.12)",
      laneStroke: "rgb(160 140 220 / 0.15)",
      bg0: "#120a1c",
      bg1: "#2a1842",
      bg2: "#080510",
      captionBoxStroke: "rgb(160 200 255 / 0.45)",
      captionText: "#dde8ff",
      prepBorderRgb: "120 200 255",
      prepTitle: "#bfefff",
      prepSubRgb: "170 160 220",
      strikeParticleCrit: ["#ffe08a", "#c9b3ff", "#7fd9c8"],
      strikeParticleNorm: ["#7ee8ff", "#c9b3ff", "#fff"],
      hurtParticle: ["#9b6dff", "#c9b3ff", "#fff"],
      victoryParticles: ["#c9b3ff", "#7fd9c8", "#ffe08a"],
    },
  };

  /** @type {HTMLDialogElement | null} */
  const dialog = document.querySelector("#boss-modal");
  /** @type {HTMLDialogElement | null} */
  const briefing = document.querySelector("#boss-briefing-modal");
  const canvas = document.querySelector("#boss-canvas");
  const btnClose = document.querySelector("#boss-close");
  const btnStoryBoss = document.querySelector("#btn-boss-fight");
  const btnBriefingStart = document.querySelector("#boss-briefing-start");
  const btnBriefingCancel = document.querySelector("#boss-briefing-cancel");
  const btnStrike = document.querySelector("#boss-strike");
  const hudPhase = document.querySelector("#boss-phase-label");
  const hudBossHp = document.querySelector("#boss-hp-bar");
  const hudPlayerHp = document.querySelector("#player-hp-bar");
  const hudMsg = document.querySelector("#boss-fight-msg");
  const hudHype = document.querySelector("#boss-hype-fill");
  const hudStreak = document.querySelector("#boss-streak-label");
  const portraitEl = document.querySelector("#boss-conductor-portrait");
  const victoryOverlay = document.querySelector("#boss-victory");
  const victoryStardustEl = document.querySelector("#boss-victory-stardust");
  const btnVictoryContinue = document.querySelector("#boss-victory-continue");
  const btnVictoryHome = document.querySelector("#boss-victory-home");
  const defeatOverlay = document.querySelector("#boss-defeat");
  const btnDefeatRetry = document.querySelector("#boss-defeat-retry");
  const btnDefeatHome = document.querySelector("#boss-defeat-home");
  const bossStardustDisplay = document.querySelector("#boss-stardust-display");
  const btnOpenWarp = document.querySelector("#boss-open-warp");
  /** @type {HTMLSelectElement | null} */
  const allySelect = document.querySelector("#boss-ally-select");
  const allyPortraitEl = document.querySelector("#boss-ally-portrait");
  const allyHintEl = document.querySelector("#boss-ally-hint");
  const briefingTitleEl = document.querySelector("#boss-briefing-title");
  const briefingLeadEl = document.querySelector("#boss-briefing-lead");
  const briefingStepsEl = document.querySelector("#boss-briefing-steps");
  const bossModalTitleEl = document.querySelector("#boss-modal-title");
  const victoryTitleEl = document.querySelector("#boss-victory-title");
  const victoryBlurbEl = document.querySelector("#boss-victory-blurb");
  const defeatTitleEl = document.querySelector("#boss-defeat-title");
  const defeatBlurbEl = document.querySelector("#boss-defeat-blurb");

  if (!dialog || !canvas || !btnStoryBoss) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = W;
  canvas.height = H;

  /** @type {AudioContext | null} */
  let actx = null;

  function resumeAudio() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") void actx.resume();
    } catch (_) {}
  }

  /** @param {number} freq @param {number} dur @param {OscillatorType} type @param {number} vol */
  function beep(freq, dur, type, vol) {
    if (!actx) return;
    try {
      const t0 = actx.currentTime;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t0);
      o.stop(t0 + dur);
    } catch (_) {}
  }

  function sfxStrike(crit) {
    if (crit) {
      beep(880, 0.07, "square", 0.07);
      beep(1320, 0.09, "square", 0.05);
    } else {
      beep(520, 0.06, "triangle", 0.09);
      beep(740, 0.05, "triangle", 0.045);
    }
  }

  function sfxHurt() {
    beep(140, 0.12, "sawtooth", 0.06);
    beep(90, 0.18, "sawtooth", 0.04);
  }

  function sfxTrain() {
    beep(180, 0.2, "square", 0.05);
    beep(120, 0.25, "square", 0.035);
  }

  /** @param {"conductor"|"memory"} bk */
  function sfxTrainForBattle(bk) {
    if (bk === "memory") {
      beep(95, 0.28, "sawtooth", 0.055);
      beep(60, 0.32, "sawtooth", 0.04);
    } else {
      sfxTrain();
    }
  }

  function sfxGo() {
    beep(660, 0.1, "square", 0.07);
    beep(880, 0.14, "square", 0.05);
  }

  function sfxEncore() {
    beep(392, 0.08, "square", 0.06);
    beep(523, 0.1, "square", 0.055);
    beep(784, 0.14, "square", 0.05);
  }

  function sfxWin() {
    beep(523, 0.1, "square", 0.05);
    beep(659, 0.1, "square", 0.05);
    beep(784, 0.12, "square", 0.05);
    beep(1046, 0.2, "square", 0.045);
  }

  /** @type {any} */
  let state;

  function laneCenterX(lane) {
    return lane * LANE_W + LANE_W / 2;
  }

  function shuffle(arr) {
    const o = arr.slice();
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  }

  function fillBriefing() {
    const t = battleTheme(getBattleKey());
    if (briefingTitleEl) briefingTitleEl.textContent = t.briefingTitle;
    if (briefingLeadEl) briefingLeadEl.textContent = t.briefingLead;
    if (briefingStepsEl) {
      briefingStepsEl.innerHTML = t.briefingItems.map((html) => "<li>" + html + "</li>").join("");
    }
  }

  function hideVictory() {
    if (!victoryOverlay) return;
    victoryOverlay.hidden = true;
    victoryOverlay.setAttribute("hidden", "");
  }

  function showVictory() {
    if (!victoryOverlay) return;
    victoryOverlay.removeAttribute("hidden");
    victoryOverlay.hidden = false;
    const t = battleTheme(state.battleKey);
    if (victoryStardustEl) victoryStardustEl.textContent = String(t.victoryStardust);
    if (victoryTitleEl) victoryTitleEl.textContent = t.victoryTitle;
    if (victoryBlurbEl) victoryBlurbEl.textContent = t.victoryBlurb;
    btnVictoryContinue?.focus();
  }

  function hideDefeat() {
    if (!defeatOverlay) return;
    defeatOverlay.hidden = true;
    defeatOverlay.setAttribute("hidden", "");
  }

  function showDefeat() {
    if (!defeatOverlay) return;
    defeatOverlay.removeAttribute("hidden");
    defeatOverlay.hidden = false;
    const t = battleTheme(state.battleKey);
    if (defeatTitleEl) defeatTitleEl.textContent = t.defeatTitle;
    if (defeatBlurbEl) defeatBlurbEl.textContent = t.defeatBlurb;
    btnDefeatRetry?.focus();
  }

  function openWarpTerminal() {
    const gm = document.querySelector("#gacha-modal");
    if (!gm) return;
    if (typeof gm.showModal === "function") gm.showModal();
    else gm.setAttribute("open", "");
    document.getElementById("gacha-close")?.focus();
  }

  function refreshBossGachaHud() {
    if (bossStardustDisplay && typeof Starfall !== "undefined") {
      bossStardustDisplay.textContent = String(Starfall.Persistence.loadCurrency().stardust);
    }
  }

  /** @returns {{ hpBonus: number, strikeBonus: number }} */
  function allyBonuses(char) {
    if (!char) return { hpBonus: 0, strikeBonus: 0 };
    if (char.rarity >= 5) return { hpBonus: 14, strikeBonus: 2 };
    if (char.rarity === 4) return { hpBonus: 8, strikeBonus: 1 };
    return { hpBonus: 4, strikeBonus: 0 };
  }

  function pickBattleAllyCharacter() {
    if (typeof Starfall === "undefined" || !allySelect) return null;
    const raw = allySelect.value;
    if (!raw) return null;
    const id = Number(raw);
    if (!Number.isFinite(id)) return null;
    return Starfall.Unlocks.getUnlockedCharacters().find((c) => c.id === id) || null;
  }

  function drawAllyPortrait() {
    if (!allyPortraitEl) return;
    const ctx = allyPortraitEl.getContext("2d");
    if (!ctx) return;
    const c = pickBattleAllyCharacter();
    if (!c || typeof Starfall === "undefined") {
      ctx.fillStyle = "#120b1a";
      ctx.fillRect(0, 0, allyPortraitEl.width, allyPortraitEl.height);
      return;
    }
    Starfall.drawPortrait(allyPortraitEl, c, { size: 40 });
  }

  function syncAllyHint() {
    if (!allyHintEl) return;
    if (typeof Starfall === "undefined") {
      allyHintEl.textContent = "";
      return;
    }
    const unlocked = Starfall.Unlocks.getUnlockedCharacters();
    const ally = pickBattleAllyCharacter();
    if (!ally) {
      allyHintEl.textContent = unlocked.length
        ? "Fighting solo — choose an ally for bonus HP and strike damage."
        : "Open Warp to unlock allies — they grant combat bonuses by rarity.";
      return;
    }
    const b = allyBonuses(ally);
    allyHintEl.textContent = "Ally bonus: +" + b.hpBonus + " max HP, +" + b.strikeBonus + " strike damage.";
  }

  function populateAllySelect() {
    if (!allySelect || typeof Starfall === "undefined") return;
    const unlocked = Starfall.Unlocks.getUnlockedCharacters();
    const saved = localStorage.getItem(BATTLE_ALLY_KEY);
    const prev = allySelect.value;

    allySelect.innerHTML = "";
    const o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = unlocked.length === 0 ? "No allies yet — open Warp" : "Solo (no ally bonus)";
    allySelect.appendChild(o0);
    for (const c of unlocked) {
      const o = document.createElement("option");
      o.value = String(c.id);
      o.textContent = c.name + " (" + "★".repeat(c.rarity) + ")";
      allySelect.appendChild(o);
    }

    if (prev && [...allySelect.options].some((opt) => opt.value === prev)) {
      allySelect.value = prev;
    } else if (saved && [...allySelect.options].some((opt) => opt.value === saved)) {
      allySelect.value = saved;
    } else if (unlocked[0]) {
      allySelect.value = String(unlocked[0].id);
      localStorage.setItem(BATTLE_ALLY_KEY, allySelect.value);
    } else {
      allySelect.value = "";
    }
    drawAllyPortrait();
    syncAllyHint();
  }

  function resetFight() {
    hideVictory();
    hideDefeat();
    refreshBossGachaHud();
    try {
      populateAllySelect();
    } catch (_) {
      /* keep fighting even if roster UI fails */
    }
    const ally = pickBattleAllyCharacter();
    const bon = allyBonuses(ally);
    if (allySelect) allySelect.disabled = false;

    const bk = getBattleKey();
    const th = battleTheme(bk);
    if (bossModalTitleEl) bossModalTitleEl.textContent = th.modalTitle;

    state = {
      battleKey: bk,
      playerLane: 1,
      bossHp: BOSS_HP_MAX,
      playerHp: PLAYER_HP_MAX + bon.hpBonus,
      playerHpMax: PLAYER_HP_MAX + bon.hpBonus,
      strikeBonus: bon.strikeBonus,
      playerLost: false,
      victoryFinalized: false,
      defeatFinalized: false,
      strikeCd: 0,
      iFrame: 0,
      phase: 1,
      nextSpawn: 0,
      attacks: [],
      status: "prep",
      prepEndAt: performance.now() + 4000,
      raf: 0,
      hype: 0,
      streak: 0,
      particles: [],
      fxTexts: [],
      starScroll: 0,
      hitShakeUntil: 0,
      encoreFlashUntil: 0,
      nextTauntAt: 0,
      caption: "",
      captionUntil: 0,
      lastCount: -1,
      phaseEnteredTwo: false,
    };
    if (hudMsg) hudMsg.textContent = "Read the tips above; countdown begins now (you can’t be hurt yet).";
    if (btnStrike) btnStrike.disabled = true;
    if (hudHype) hudHype.style.width = "0%";
    if (hudStreak) hudStreak.textContent = "Streak 0";
    drawBossPortrait();
    updateHud();
    if (hudPhase) hudPhase.textContent = th.warmupHud;
  }

  function drawBossPortrait() {
    if (!portraitEl || typeof Starfall === "undefined") return;
    const c = Starfall.getCharacter(battleTheme(state.battleKey).bossId);
    if (c) Starfall.drawPortrait(portraitEl, c, { size: 56 });
  }

  function updateHud() {
    const th = battleTheme(state.battleKey);
    if (hudPhase && state.status !== "prep")
      hudPhase.textContent = state.phase >= 2 ? th.phase2Label : th.phase1Label;
    const bp = Math.max(0, (state.bossHp / BOSS_HP_MAX) * 100);
    const pp = Math.max(0, (state.playerHp / state.playerHpMax) * 100);
    if (hudBossHp) hudBossHp.style.width = bp + "%";
    if (hudPlayerHp) hudPlayerHp.style.width = pp + "%";
    if (hudHype) hudHype.style.width = Math.min(HYPE_CAP, state.hype) + "%";
    if (hudStreak) hudStreak.textContent = "Streak " + state.streak;
  }

  function setCaption(text, durS) {
    state.caption = text;
    state.captionUntil = performance.now() / 1000 + durS;
  }

  function maybeTaunt(nowS) {
    if (state.status !== "play") return;
    if (nowS < state.nextTauntAt) return;
    state.nextTauntAt = nowS + 5.5 + Math.random() * 4;
    const taunts = battleTheme(state.battleKey).taunts;
    setCaption(taunts[Math.floor(Math.random() * taunts.length)], 2.4);
  }

  function setPhase() {
    if (state.bossHp <= 0) return;
    const half = BOSS_HP_MAX * 0.5;
    if (state.bossHp <= half && state.phase === 1 && !state.phaseEnteredTwo) {
      const th = battleTheme(state.battleKey);
      state.phaseEnteredTwo = true;
      state.phase = 2;
      state.nextSpawn = performance.now() / 1000 + 0.25;
      const nowS = performance.now() / 1000;
      state.encoreFlashUntil = nowS + 0.55;
      state.hitShakeUntil = performance.now() + 420;
      sfxEncore();
      if (hudMsg) hudMsg.textContent = th.encoreHudMsg;
      setCaption(th.encoreCaption, 2.8);
    }
  }

  function addParticles(x, y, n, spread, colors) {
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = spread * (0.4 + Math.random() * 0.9);
      state.particles.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 30 * Math.random(),
        life: 0.35 + Math.random() * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.floor(Math.random() * 3),
      });
    }
  }

  function addPop(x, y, text, color) {
    state.fxTexts.push({ x, y, text, color, life: 0.9, vy: -42 });
  }

  function strikeFx(crit, dmg, px) {
    const th = battleTheme(state.battleKey);
    const pal = crit ? th.strikeParticleCrit : th.strikeParticleNorm;
    addParticles(px, PLAYER_Y - 10, crit ? 16 : 10, 120, pal);
    addPop(W / 2 + (Math.random() - 0.5) * 40, 86, crit ? "CRIT " + dmg : "−" + dmg, crit ? "#ffe08a" : "#c9fff3");
  }

  function noteAttack(lane, t0, p2) {
    return {
      kind: "note",
      lane,
      t0,
      telegraph: p2 ? 0.42 : 0.58,
      y: 40,
      speed: p2 ? 330 : 255,
      hitApplied: false,
    };
  }

  function spawnAttack(nowS) {
    const p2 = state.phase >= 2;
    const th = battleTheme(state.battleKey);
    const r = Math.random();

    if (r < (p2 ? 0.28 : 0.24)) {
      const lanePairs = [
        [0, 1],
        [1, 2],
        [0, 2],
      ];
      const lanes = lanePairs[Math.floor(Math.random() * lanePairs.length)].slice();
      state.attacks.push({
        kind: "train",
        lanes,
        t0: nowS,
        telegraph: p2 ? 0.82 : 1.05,
        y: -90,
        hitApplied: false,
        honked: false,
      });
      sfxTrainForBattle(state.battleKey);
      setCaption(th.captionTrain, 1.45);
      return;
    }

    if (r < (p2 ? 0.5 : 0.44)) {
      const lane = Math.floor(Math.random() * LANES);
      state.attacks.push(noteAttack(lane, nowS, p2));
      state.attacks.push(noteAttack(lane, nowS + (p2 ? 0.26 : 0.36), p2));
      setCaption(th.captionDouble, 1.1);
      return;
    }

    if (r < (p2 ? 0.76 : 0.7)) {
      const lanes = shuffle([0, 1, 2]);
      const count = 2;
      const gap = p2 ? 0.2 : 0.3;
      for (let i = 0; i < count; i++) {
        state.attacks.push(noteAttack(lanes[i % 3], nowS + i * gap, p2));
      }
      setCaption(th.captionFlurry, 1);
      return;
    }

    state.attacks.push(noteAttack(Math.floor(Math.random() * LANES), nowS, p2));
  }

  function tryDamage(amount) {
    if (state.status === "win") return;
    if (state.status === "lose_pending" || state.status === "lose") return;
    if (state.status !== "play") return;
    if (state.iFrame > 0) return;
    state.playerHp = Math.max(0, state.playerHp - amount);
    state.iFrame = I_FRAMES;
    state.hype = Math.max(0, state.hype - HYPE_LOSS_ON_DAMAGE);
    state.streak = 0;
    state.hitShakeUntil = performance.now() + 320;
    const th = battleTheme(state.battleKey);
    sfxHurt();
    addParticles(laneCenterX(state.playerLane), PLAYER_Y, 14, 90, th.hurtParticle);
    setCaption(th.hurtCaption, 1.5);
    updateHud();
    if (state.playerHp <= 0) beginLoseSequence();
  }

  function beginLoseSequence() {
    if (state.status !== "play") return;
    if (state.playerLost || state.defeatFinalized) return;
    state.playerLost = true;
    state.status = "lose_pending";
    state.playerHp = 0;
    if (btnStrike) btnStrike.disabled = true;
    if (hudMsg) hudMsg.textContent = battleTheme(state.battleKey).losePendingHud;
    updateHud();
  }

  function finalizeDefeat() {
    if (!state || !state.playerLost || state.defeatFinalized) return;
    if (state.status !== "lose_pending") return;
    state.defeatFinalized = true;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.status = "lose";
    const th = battleTheme(state.battleKey);
    if (hudMsg) hudMsg.textContent = th.defeatHud;
    showDefeat();
    updateHud();
  }

  function finalizeVictory() {
    if (!state || state.victoryFinalized) return;
    state.victoryFinalized = true;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    sfxWin();
    showVictory();
    const th = battleTheme(state.battleKey);
    if (hudMsg) hudMsg.textContent = th.victoryHud;
    try {
      if (typeof Starfall !== "undefined") Starfall.Persistence.addStardust(th.victoryStardust);
    } catch (_) {}
    addParticles(W / 2, H / 2, 40, 200, th.victoryParticles);
    updateHud();
    try {
      window.dispatchEvent(
        new CustomEvent("starfall-chapter-boss-beaten", {
          bubbles: true,
          detail: { chapter: state.battleKey === "memory" ? 2 : 1 },
        }),
      );
    } catch (_) {}
  }

  function strike() {
    if (state.status !== "play" || state.strikeCd > 0) return;
    const hypeMult = 1 + Math.min(state.hype, HYPE_CAP) / 200;
    const crit = Math.random() < CRIT_CHANCE;
    const raw = (STRIKE_DMG + state.strikeBonus) * hypeMult * (crit ? CRIT_MULT : 1);
    const dmg = Math.max(1, Math.round(raw));
    state.bossHp = Math.max(0, state.bossHp - dmg);
    state.strikeCd = Math.max(
      STRIKE_CD_MIN,
      STRIKE_CD_BASE * (1 - 0.12 * (state.hype / HYPE_CAP)),
    );
    state.hype = Math.min(HYPE_CAP, state.hype + HYPE_ON_HIT + (crit ? HYPE_ON_CRIT_BONUS : 0));
    state.streak += 1;

    setPhase();
    sfxStrike(crit);
    strikeFx(crit, dmg, laneCenterX(state.playerLane));
    if (state.streak >= 5 && state.streak % 5 === 0) {
      setCaption(battleTheme(state.battleKey).streakCaption, 1.6);
    }
    updateHud();
    if (state.bossHp <= 0) {
      state.status = "win";
      if (btnStrike) btnStrike.disabled = true;
      state.attacks = [];
      finalizeVictory();
    }
  }

  function updateJuice(dt) {
    state.starScroll = (state.starScroll + dt * 55) % 120;
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    for (const f of state.fxTexts) {
      f.y += f.vy * dt;
      f.life -= dt;
      f.vy *= 0.96;
    }
    state.fxTexts = state.fxTexts.filter((f) => f.life > 0);
  }

  function updateAttacks(dt, nowS) {
    const nextInt = state.phase >= 2 ? 0.86 : 1.32;
    if (state.status === "play" && nowS >= state.nextSpawn) {
      spawnAttack(nowS);
      state.nextSpawn = nowS + nextInt + Math.random() * 0.38;
    }

    for (const a of state.attacks) {
      if (a.kind === "note") {
        const teleEnd = a.t0 + a.telegraph;
        if (nowS >= teleEnd) {
          a.y += a.speed * dt;
          if (
            !a.hitApplied &&
            a.y >= PLAYER_Y - 24 &&
            a.y <= PLAYER_Y + 20 &&
            a.lane === state.playerLane
          ) {
            a.hitApplied = true;
            tryDamage(NOTE_DMG);
          }
        }
        if (a.y > H + 40) a.dead = true;
      } else if (a.kind === "train") {
        const chargeStart = a.t0 + a.telegraph;
        if (nowS < chargeStart) {
          /* telegraph */
        } else {
          if (!a.honked) {
            a.honked = true;
            beep(200, 0.05, "square", 0.04);
          }
          const spd = state.phase >= 2 ? 520 : 395;
          a.y += spd * dt;
          if (
            !a.hitApplied &&
            a.y >= PLAYER_Y - 58 &&
            a.y <= PLAYER_Y + 38 &&
            a.lanes.includes(state.playerLane)
          ) {
            a.hitApplied = true;
            tryDamage(TRAIN_DMG);
            state.hitShakeUntil = performance.now() + 260;
          }
        }
        if (a.y > H + 120) a.dead = true;
      }
    }
    state.attacks = state.attacks.filter((x) => !x.dead);
  }

  function shakePx() {
    const t = performance.now();
    if (t >= state.hitShakeUntil) return { x: 0, y: 0 };
    const a = 1 - (state.hitShakeUntil - t) / 400;
    return { x: (Math.random() - 0.5) * 12 * a, y: (Math.random() - 0.5) * 10 * a };
  }

  function renderStars() {
    const th = battleTheme(state.battleKey);
    const s = state.starScroll;
    ctx.fillStyle = th.starWarm;
    for (let i = 0; i < 18; i++) {
      const x = ((i * 67 + s * 0.7) % W) | 0;
      const y = ((i * 41 + s * 1.3) % H) | 0;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = th.starCool;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 53 - s) % W) | 0;
      const y = ((i * 71 + s * 0.9) % H) | 0;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  function render(nowS) {
    const th = battleTheme(state.battleKey);
    ctx.imageSmoothingEnabled = false;
    const sh = shakePx();
    ctx.save();
    ctx.translate(sh.x, sh.y);

    if (state.encoreFlashUntil > nowS) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, th.encoreFlash0);
      g.addColorStop(1, th.encoreFlash1);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.35 * (state.encoreFlashUntil - nowS) + 0.2;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    const g2 = ctx.createLinearGradient(0, 0, 0, H);
    g2.addColorStop(0, th.bg0);
    g2.addColorStop(0.45, th.bg1);
    g2.addColorStop(1, th.bg2);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    renderStars();

    ctx.strokeStyle = th.laneStroke;
    ctx.lineWidth = 2;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, H);
      ctx.stroke();
    }

    if (performance.now() / 1000 < state.captionUntil && state.caption) {
      ctx.fillStyle = "rgb(0 0 0 / 0.45)";
      ctx.fillRect(8, 52, W - 16, 36);
      ctx.strokeStyle = th.captionBoxStroke;
      ctx.strokeRect(8, 52, W - 16, 36);
      ctx.fillStyle = th.captionText;
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      const lines = state.caption.match(/.{1,42}/g) || [state.caption];
      lines.slice(0, 2).forEach((ln, i) => {
        ctx.fillText(ln, W / 2, 68 + i * 12);
      });
    }

    for (const a of state.attacks) {
      if (a.kind === "note") {
        const cx = laneCenterX(a.lane);
        const teleEnd = a.t0 + a.telegraph;
        if (nowS < teleEnd) {
          const pulse = 0.5 + 0.5 * Math.sin(nowS * 14);
          ctx.fillStyle = "rgb(" + th.noteTeleRgb + " / " + (0.22 + pulse * 0.38) + ")";
          ctx.fillRect(a.lane * LANE_W + 4, 48, LANE_W - 8, 52);
        } else {
          ctx.shadowColor = th.noteOrb;
          ctx.shadowBlur = 10;
          ctx.fillStyle = th.noteOrb;
          if (state.battleKey === "memory") {
            ctx.save();
            ctx.translate(cx, a.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-12, -12, 24, 24);
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(cx, a.y, 15, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.fillStyle = th.noteHighlight;
          ctx.fillRect(cx - 3, a.y - 5, 6, 5);
        }
      } else if (a.kind === "train") {
        const chargeStart = a.t0 + a.telegraph;
        if (nowS < chargeStart) {
          const safeLane = [0, 1, 2].find((ln) => !a.lanes.includes(ln));
          if (safeLane !== undefined) {
            ctx.fillStyle = "rgb(" + th.safeFillRgb + " / 0.14)";
            ctx.fillRect(safeLane * LANE_W + 3, 0, LANE_W - 6, H);
            ctx.strokeStyle = "rgb(" + th.safeStrokeRgb + " / 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(safeLane * LANE_W + 4, 4, LANE_W - 8, H - 8);
            ctx.fillStyle = "rgb(" + th.safeTextRgb + " / 0.95)";
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = "center";
            ctx.fillText(th.safeLabel, laneCenterX(safeLane), H - 14);
          }
          const warnBottom = H * 0.4;
          for (const L of a.lanes) {
            const pulse = Math.sin(nowS * 14) * 0.12 + 0.88;
            ctx.fillStyle = "rgb(" + th.trainWarnRgb + " / " + (0.2 * pulse) + ")";
            ctx.fillRect(L * LANE_W + 2, 0, LANE_W - 4, warnBottom);
            ctx.fillStyle = "rgb(" + th.trainDashRgb + " / 0.4)";
            for (let y = 0; y < warnBottom - 6; y += 16) {
              ctx.fillRect(L * LANE_W + 2, y, LANE_W - 4, 7);
            }
          }
          ctx.fillStyle = th.captionText;
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.textAlign = "center";
          ctx.fillText(th.trainTopLabel, W / 2, 12);
        } else {
          const tw = a.lanes.length * LANE_W;
          const tx = Math.min(...a.lanes) * LANE_W;
          ctx.save();
          ctx.beginPath();
          ctx.rect(tx + 2, 0, tw - 4, H);
          ctx.clip();

          const bodyH = 118;
          ctx.fillStyle = th.trainChargeBody;
          ctx.fillRect(tx + 2, a.y, tw - 4, bodyH);
          ctx.fillStyle = th.trainChargeWindow;
          for (let i = 0; i < 9; i++) {
            ctx.fillRect(tx + 3 + i * 11, a.y + 14, 7, bodyH - 28);
          }
          ctx.fillStyle = th.trainChargeRoof;
          ctx.fillRect(tx + 6, a.y + 28, tw - 14, 24);
          ctx.fillStyle = th.trainChargeLight;
          ctx.beginPath();
          ctx.arc(tx + tw / 2, a.y + 18, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgb(255 255 255 / 0.9)";
          ctx.fillRect(tx + tw / 2 - 3, a.y + 14, 6, 5);
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = j % 2 ? th.trainChargeRoof : th.trainChargeLight;
            ctx.fillRect(tx + 12 + j * 22, a.y + 92, 14, 8);
          }
          ctx.restore();
        }
      }
    }

    for (const p of state.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life * 3);
      ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
      ctx.globalAlpha = 1;
    }

    const px = laneCenterX(state.playerLane);
    ctx.fillStyle = state.iFrame > 0 && Math.floor(performance.now() / 70) % 2 ? "#fff" : "#7ee8ff";
    ctx.beginPath();
    ctx.arc(px, PLAYER_Y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1228";
    ctx.fillRect(px - 6, PLAYER_Y - 4, 5, 6);
    ctx.fillRect(px + 1, PLAYER_Y - 4, 5, 6);
    ctx.fillStyle = "rgb(0 0 0 / 0.35)";
    ctx.beginPath();
    ctx.ellipse(px, PLAYER_Y + 20, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const f of state.fxTexts) {
      ctx.globalAlpha = Math.min(1, f.life * 1.2);
      ctx.fillStyle = f.color;
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.fillStyle = "rgb(255 255 255 / 0.45)";
    ctx.fillText("A", laneCenterX(0), H - 6);
    ctx.fillText("W", laneCenterX(1), H - 6);
    ctx.fillText("D", laneCenterX(2), H - 6);

    if (state.status === "prep") {
      ctx.fillStyle = "rgb(0 0 0 / 0.55)";
      ctx.fillRect(12, 12, W - 24, 40);
      ctx.strokeStyle = "rgb(" + th.prepBorderRgb + " / 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, W - 24, 40);
      ctx.fillStyle = th.prepTitle;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText("NO ENEMIES YET — move with A / D / W", W / 2, 30);
      ctx.fillStyle = "rgb(" + th.prepSubRgb + " / 0.95)";
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(th.prepSub, W / 2, 44);
    }

    ctx.restore();
  }

  let lastT = 0;
  function loop(t) {
    if (state.status === "lose") return;

    const nowS = t / 1000;
    const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
    lastT = t;

    if (state.status === "prep") {
      state.strikeCd = Math.max(0, state.strikeCd - dt);
      state.iFrame = Math.max(0, state.iFrame - dt);
      updateJuice(dt);
      if (t >= state.prepEndAt) {
        state.status = "play";
        state.nextSpawn = nowS + 1.1;
        state.nextTauntAt = nowS + 4;
        if (btnStrike) btnStrike.disabled = false;
        if (allySelect) allySelect.disabled = true;
        const th = battleTheme(state.battleKey);
        if (hudMsg) hudMsg.textContent = th.playHint;
        if (hudPhase)
          hudPhase.textContent = state.phase >= 2 ? th.phase2Label : th.phase1Label;
        sfxGo();
      } else {
        const leftSec = (state.prepEndAt - t) / 1000;
        const n = Math.ceil(leftSec);
        if (state.lastCount !== n) {
          state.lastCount = n;
          if (n >= 1) beep(540 - (3 - n) * 100, 0.09, "square", 0.055);
        }
        if (hudMsg) {
          const goLine =
            state.battleKey === "memory"
              ? "AWAKE — cut through the fog!"
              : "GO — juice the crowd!";
          hudMsg.textContent =
            n >= 1 ? "Countdown: " + n + " — warm up those keys!" : goLine;
        }
      }
      render(nowS);
      state.raf = requestAnimationFrame(loop);
      return;
    }

    if (state.status !== "play" && state.status !== "win" && state.status !== "lose_pending") return;

    state.strikeCd = Math.max(0, state.strikeCd - dt);
    state.iFrame = Math.max(0, state.iFrame - dt);
    updateJuice(dt);
    if (state.status === "play" || state.status === "win" || state.status === "lose_pending") {
      updateAttacks(dt, nowS);
    }
    if (state.status === "play") {
      maybeTaunt(nowS);
      if (btnStrike) btnStrike.disabled = state.strikeCd > 0;
    }
    render(nowS);

    if (state.status === "win" && state.attacks.length === 0 && !state.victoryFinalized) {
      finalizeVictory();
      return;
    }

    if (state.status === "lose_pending" && state.playerLost && state.attacks.length === 0 && !state.defeatFinalized) {
      finalizeDefeat();
      return;
    }

    if (
      state.status === "play" ||
      (state.status === "win" && state.attacks.length > 0) ||
      (state.status === "lose_pending" && state.attacks.length > 0)
    ) {
      state.raf = requestAnimationFrame(loop);
    }
  }

  function startFight() {
    if (state && state.raf) cancelAnimationFrame(state.raf);
    lastT = 0;
    resetFight();
    state.lastCount = -1;
    state.raf = requestAnimationFrame(loop);
  }

  function openBattle() {
    resumeAudio();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    startFight();
  }

  function closeBriefing() {
    if (!briefing) return;
    if (typeof briefing.close === "function") briefing.close();
    else briefing.removeAttribute("open");
  }

  function openBriefing() {
    fillBriefing();
    if (!briefing) {
      openBattle();
      return;
    }
    if (typeof briefing.showModal === "function") briefing.showModal();
    else briefing.setAttribute("open", "");
    btnBriefingStart?.focus();
  }

  function goHomeScreen() {
    try {
      window.dispatchEvent(new CustomEvent("starfall-go-home", { bubbles: true }));
    } catch (_) {}
    closeModal();
  }

  function closeModal() {
    hideVictory();
    hideDefeat();
    if (state && state.raf) cancelAnimationFrame(state.raf);
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  btnStoryBoss.addEventListener("click", () => openBriefing());

  btnBriefingStart?.addEventListener("click", () => {
    closeBriefing();
    openBattle();
  });

  btnBriefingCancel?.addEventListener("click", () => closeBriefing());

  briefing?.addEventListener("click", (e) => {
    if (e.target === briefing) closeBriefing();
  });

  btnClose?.addEventListener("click", () => closeModal());

  btnVictoryContinue?.addEventListener("click", () => closeModal());
  btnVictoryHome?.addEventListener("click", () => goHomeScreen());

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeModal();
  });

  btnStrike?.addEventListener("click", () => strike());

  btnDefeatRetry?.addEventListener("click", () => {
    hideDefeat();
    startFight();
  });

  btnDefeatHome?.addEventListener("click", () => goHomeScreen());

  btnOpenWarp?.addEventListener("click", () => openWarpTerminal());

  allySelect?.addEventListener("change", () => {
    localStorage.setItem(BATTLE_ALLY_KEY, allySelect.value);
    drawAllyPortrait();
    syncAllyHint();
  });

  window.addEventListener("starfall-stardust-changed", () => refreshBossGachaHud());

  window.addEventListener("starfall-roster-changed", () => {
    populateAllySelect();
  });

  document.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (
      state.status === "lose" ||
      state.status === "lose_pending" ||
      (state.status === "win" && state.victoryFinalized)
    ) return;

    const canMove =
      state.status === "prep" ||
      state.status === "play" ||
      (state.status === "win" && !state.victoryFinalized);
    if (!canMove) return;

    if (e.code === "KeyA") {
      e.preventDefault();
      state.playerLane = Math.max(0, state.playerLane - 1);
      return;
    }
    if (e.code === "KeyD") {
      e.preventDefault();
      state.playerLane = Math.min(LANES - 1, state.playerLane + 1);
      return;
    }
    if (e.code === "KeyW") {
      e.preventDefault();
      state.playerLane = 1;
      return;
    }

    if (state.status !== "play") return;

    if (e.code === "Space" || e.code === "KeyS") {
      e.preventDefault();
      strike();
    }
  });
})();
