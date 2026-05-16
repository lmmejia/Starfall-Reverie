/**
 * Starfall Reverie — shared runtime for gacha + battle scenes.
 * Load before your game scripts: <script src="shared/starfall.js"></script>
 * Use: Starfall.getCharacter(id), Starfall.drawPortrait(canvas, char), Starfall.Unlocks.*
 */
(function () {
  const UNLOCK_STORAGE = "starfall-reverie-unlocks-v1";
  const PITY_STORAGE = "starfall-reverie-pity-v1";

  /** @typedef {{ id: number, name: string, role: string, rarity: 3 | 4 | 5 }} Character */

  /** @type {Character[]} */
  const ROSTER = [
    { id: 1, name: "Luna Prism", role: "Starlit striker", rarity: 5 },
    { id: 2, name: "Kiko Comet", role: "Blink duelist", rarity: 5 },
    { id: 3, name: "Nova Lullaby", role: "Dream support", rarity: 5 },
    { id: 11, name: "Momo Patch", role: "Patch-healer bot", rarity: 4 },
    { id: 12, name: "Pip Nebula", role: "Sticky debuffs", rarity: 4 },
    { id: 13, name: "Rune Tea", role: "Shield bard", rarity: 4 },
    { id: 14, name: "Jelly Volt", role: "Chain spark", rarity: 4 },
    { id: 101, name: "Bit Bean", role: "Starter sprout", rarity: 3 },
    { id: 102, name: "Dust Bunny", role: "Lucky flop", rarity: 3 },
    { id: 103, name: "Sugar Slime", role: "Snack tank", rarity: 3 },
    { id: 104, name: "Mochi Moth", role: "Glow scout", rarity: 3 },
    { id: 105, name: "Puff Circuit", role: "Tiny EMP", rarity: 3 },
  ];

  /** @returns {Character | undefined} */
  function getCharacter(id) {
    return ROSTER.find((c) => c.id === id);
  }

  function getRoster() {
    return ROSTER.slice();
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickRandom(arr, rnd) {
    return arr[Math.floor(rnd() * arr.length)];
  }

  function roundedBlock(ctx, x, y, w, h, r) {
    ctx.fillRect(x + r, y, w - 2 * r, h);
    ctx.fillRect(x, y + r, w, h - 2 * r);
    ctx.fillRect(x + r, y + r, r, r);
    ctx.fillRect(x + w - 2 * r, y + r, r, r);
  }

  function sparkle(ctx, rnd, bx, by, color) {
    ctx.fillStyle = color;
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(bx + k * 3, by + (rnd() > 0.5 ? -2 : 2), 2, 8);
      ctx.fillRect(bx + k * 3 - 2, by + 4, 8, 2);
    }
  }

  /**
   * Draw procedural pixel portrait. Coordinate space is always 96×96; optionally scales to canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {Character} char
   * @param {{ size?: number }} [opts]
   */
  function drawPortrait(canvas, char, opts) {
    const px = opts && opts.size != null ? opts.size : 96;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    if (px !== 96) ctx.scale(px / 96, px / 96);

    const rnd = mulberry32(char.id * 99991 + char.rarity * 17);

    ctx.clearRect(0, 0, 96, 96);
    const bgHue = rnd() * 360;
    ctx.fillStyle = "hsl(" + bgHue.toFixed(0) + " 42% 18%)";
    ctx.fillRect(0, 0, 96, 96);

    const skin =
      rnd() > 0.55 ? "#ffdacb" : rnd() > 0.35 ? "#f3c9a9" : "#e8bea4";
    const hairChoices = ["#ffb7d9", "#9de3ff", "#c9f5a9", "#d4bbff", "#ffe08a"];
    const hair = pickRandom(hairChoices, rnd);
    const blush = "#ff8fb5";
    const eye = rnd() > 0.5 ? "#222" : "#3a2742";
    const ox = Math.floor(rnd() * 5) - 2;
    const oy = Math.floor(rnd() * 4) - 1;

    ctx.fillStyle = hair;
    for (let hx = 20; hx < 76; hx += 4) {
      for (let hy = 18 + rnd() * 8; hy < 54; hy += 4 + rnd() * 4) {
        if (rnd() > 0.55) ctx.fillRect(hx, hy, 4, 8);
      }
    }

    ctx.fillStyle = skin;
    roundedBlock(ctx, 32 + ox, 36 + oy, 32, 32, 12);

    ctx.fillStyle = eye;
    ctx.fillRect(40 + ox, 48 + oy, 8, 6);
    ctx.fillRect(54 + ox, 48 + oy, 8, 6);
    ctx.fillStyle = "#fff";
    ctx.fillRect(42 + ox, 49 + oy, 2, 2);
    ctx.fillRect(56 + ox, 49 + oy, 2, 2);

    ctx.fillStyle = blush + "aa";
    ctx.fillRect(36 + ox, 56 + oy, 6, 4);
    ctx.fillRect(60 + ox, 56 + oy, 6, 4);

    ctx.fillStyle = eye;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(46 + ox + i * 2 - 4, 60 + oy + Math.abs(i - 2), 2, 2);
    }

    ctx.fillStyle = hair;
    for (let i = 28; i < 68; i += 6)
      ctx.fillRect(i + ox, 30 + oy, 6, 8 + rnd() * 6);

    if (char.rarity >= 5) {
      sparkle(ctx, rnd, 74, 20, "#ffe08a");
      sparkle(ctx, rnd, 16, 70, "#fff6c9");
    } else if (char.rarity === 4) {
      sparkle(ctx, rnd, 80, 24, "#c9b3ff");
    }
  }

  /** @typedef {{ unlockedIds: number[] }} UnlockState */

  function parseUnlockSnapshot() {
    try {
      /** @type {unknown} */
      const raw = localStorage.getItem(UNLOCK_STORAGE);
      if (!raw) return /** @type {number[]} */ ([]);
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .map((n) => Number(n))
        .filter((n) => ROSTER.some((c) => c.id === n));
    } catch {
      return [];
    }
  }

  function saveUnlockIds(ids) {
    const unique = Array.from(new Set(ids)).sort((a, b) => a - b);
    localStorage.setItem(UNLOCK_STORAGE, JSON.stringify(unique));
  }

  /** @param {Character} char */
  function unlockCharacter(char) {
    const ids = parseUnlockSnapshot();
    if (!ids.includes(char.id)) {
      ids.push(char.id);
      saveUnlockIds(ids);
    }
  }

  function isUnlocked(id) {
    return parseUnlockSnapshot().includes(id);
  }

  /** @returns {Character[]} Owned units in roster order */
  function getUnlockedCharacters() {
    const set = new Set(parseUnlockSnapshot());
    return ROSTER.filter((c) => set.has(c.id));
  }

  /** @typedef {{ pullsSinceFive: number, pullsSinceFourPlus: number, totalPulls: number }} PitySnap */

  function loadPity() {
    try {
      /** @type {unknown} */
      const raw = localStorage.getItem(PITY_STORAGE);
      if (!raw) return { pullsSinceFive: 0, pullsSinceFourPlus: 0, totalPulls: 0 };
      const o = JSON.parse(raw);
      return {
        pullsSinceFive:
          typeof o.pullsSinceFive === "number" ? o.pullsSinceFive : 0,
        pullsSinceFourPlus:
          typeof o.pullsSinceFourPlus === "number" ? o.pullsSinceFourPlus : 0,
        totalPulls: typeof o.totalPulls === "number" ? o.totalPulls : 0,
      };
    } catch {
      return { pullsSinceFive: 0, pullsSinceFourPlus: 0, totalPulls: 0 };
    }
  }

  /** @param {PitySnap} snap */
  function savePity(snap) {
    localStorage.setItem(PITY_STORAGE, JSON.stringify(snap));
  }

  window.Starfall = {
    ROSTER: ROSTER,
    getCharacter: getCharacter,
    getRoster: getRoster,
    drawPortrait: drawPortrait,

    mulberry32: mulberry32,
    pickRandom: pickRandom,

    Unlocks: {
      STORAGE_KEY: UNLOCK_STORAGE,
      unlockCharacter: unlockCharacter,
      isUnlocked: isUnlocked,
      getUnlockedCharacters: getUnlockedCharacters,
      /** @internal */
      parseUnlockSnapshot: parseUnlockSnapshot,
      saveUnlockIds: saveUnlockIds,
    },

    Persistence: {
      PITY_STORAGE_KEY: PITY_STORAGE,
      loadPity: loadPity,
      savePity: savePity,
    },
  };
})();
