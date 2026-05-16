/* global Starfall */

(() => {
  if (typeof Starfall === "undefined") {
    console.error(
      'Load shared/starfall.js before game.js (<script src="shared/starfall.js"></script>).'
    );
    return;
  }

  const BASE_FIVE_RATE = 0.008;
  const BASE_FOUR_RATE = 0.056;

  const pityLoad = Starfall.Persistence.loadPity();
  let pullsSinceFive = pityLoad.pullsSinceFive;
  let pullsSinceFourPlus = pityLoad.pullsSinceFourPlus;
  let totalPulls = pityLoad.totalPulls;

  let warpBusy = false;

  const els = {
    portrait: /** @type {HTMLCanvasElement} */ (document.getElementById("portrait")),
    starsRow: /** @type {HTMLElement} */ (document.getElementById("stars-row")),
    charName: /** @type {HTMLElement} */ (document.getElementById("char-name")),
    tagline: /** @type {HTMLElement} */ (document.getElementById("tagline")),
    pityFive: /** @type {HTMLElement} */ (document.getElementById("pity-five")),
    pityFour: /** @type {HTMLElement} */ (document.getElementById("pity-four")),
    totalPulls: /** @type {HTMLElement} */ (document.getElementById("total-pulls")),
    resultCard: /** @type {HTMLElement} */ (document.getElementById("result-card")),
    burst: /** @type {HTMLElement} */ (document.getElementById("burst")),
    log: /** @type {HTMLElement} */ (document.getElementById("warp-log")),
    pullOne: /** @type {HTMLButtonElement} */ (document.getElementById("pull-one")),
    pullTen: /** @type {HTMLButtonElement} */ (document.getElementById("pull-ten")),
    rosterGrid: /** @type {HTMLElement} */ (document.getElementById("roster-grid")),
    currency: /** @type {HTMLElement} */ (document.getElementById("currency")),
  };

  function pool(rarity) {
    return Starfall.getGachaRoster().filter((c) => c.rarity === rarity);
  }

  function randomFromPool(rarity, rnd) {
    const list = pool(rarity);
    return Starfall.pickRandom(list, rnd);
  }

  function warpOnce() {
    pullsSinceFive += 1;
    pullsSinceFourPlus += 1;
    totalPulls += 1;

    /** @type {Character} */
    let char;
    const roll = Math.random();

    if (pullsSinceFive >= 80) {
      char = randomFromPool(5, Math.random);
      pullsSinceFive = 0;
      pullsSinceFourPlus = 0;
    } else if (pullsSinceFourPlus >= 10) {
      const wantFive = roll < BASE_FIVE_RATE * 4;
      if (wantFive) {
        char = randomFromPool(5, Math.random);
        pullsSinceFive = 0;
        pullsSinceFourPlus = 0;
      } else {
        char = randomFromPool(4, Math.random);
        pullsSinceFourPlus = 0;
      }
    } else if (roll < BASE_FIVE_RATE) {
      char = randomFromPool(5, Math.random);
      pullsSinceFive = 0;
      pullsSinceFourPlus = 0;
    } else if (roll < BASE_FIVE_RATE + BASE_FOUR_RATE) {
      char = randomFromPool(4, Math.random);
      pullsSinceFourPlus = 0;
    } else {
      char = randomFromPool(3, Math.random);
    }

    return char;
  }

  function persistPityState() {
    Starfall.Persistence.savePity({
      pullsSinceFive,
      pullsSinceFourPlus,
      totalPulls,
    });
    if (typeof SaveSession !== "undefined") SaveSession.schedulePersist();
  }

  function renderStars(rarity) {
    const n = rarity;
    const row = els.starsRow;
    row.innerHTML = "";
    row.className = "stars star" + rarity;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = "★";
      row.appendChild(s);
    }
    row.setAttribute("aria-label", n + "-star rarity");
  }

  function flashBurst(rarity) {
    els.burst.classList.remove("flash");
    void els.burst.offsetWidth;
    if (rarity >= 5) els.burst.classList.add("flash");
  }

  /**
   * @param {{ id: number, name: string, role: string, rarity: 3|4|5 }} char
   * @param {{ skipBurst?: boolean, teaser?: boolean }} [opts]
   */
  function paintResult(char, opts) {
    const skipBurst = opts && opts.skipBurst;
    const teaser = !!(opts && opts.teaser);

    ["r3", "r4", "r5", "teaser-roll"].forEach((c) =>
      els.resultCard.classList.remove(c)
    );
    els.resultCard.classList.add("r" + char.rarity);
    if (teaser) els.resultCard.classList.add("teaser-roll");

    renderStars(char.rarity);
    els.charName.textContent = char.name;
    els.tagline.textContent = char.role;
    Starfall.drawPortrait(els.portrait, char, { size: 96 });

    if (!skipBurst && !teaser) flashBurst(char.rarity);
  }

  function refreshPullButtons() {
    const cur = Starfall.Persistence.loadCurrency().stardust;
    const c1 = Starfall.WISH_COST_SINGLE;
    const c10 = Starfall.WISH_COST_TEN;
    els.pullOne.disabled = warpBusy || cur < c1;
    els.pullTen.disabled = warpBusy || cur < c10;
    if (els.pullOne) els.pullOne.title = cur < c1 ? "Need " + c1 + " candies" : "Cost: " + c1 + " candies";
    if (els.pullTen) els.pullTen.title = cur < c10 ? "Need " + c10 + " candies" : "Cost: " + c10 + " candies";
  }

  function hud() {
    const snap = Starfall.Persistence.loadCurrency();
    els.currency.textContent = String(snap.stardust);
    refreshPullButtons();

    const toFive = Math.max(0, 80 - pullsSinceFive);
    els.pityFive.textContent = String(toFive);
    els.pityFour.textContent = String(pullsSinceFourPlus);
    els.totalPulls.textContent = String(totalPulls);
    persistPityState();
  }

  function prependLog(char) {
    const li = document.createElement("li");
    const left = document.createElement("strong");
    left.textContent = char.name;
    const right = document.createElement("span");
    right.textContent = "★".repeat(char.rarity);
    li.className = "log-r" + char.rarity;
    li.appendChild(left);
    li.appendChild(right);
    els.log.prepend(li);
    while (els.log.children.length > 24) els.log.removeChild(els.log.lastChild);
  }

  function pickBest(list) {
    return list.reduce((a, b) => (b.rarity > a.rarity ? b : a));
  }

  function unlockMany(chars) {
    chars.forEach((c) => Starfall.Unlocks.unlockCharacter(c));
    renderOwnedRoster();
    if (typeof SaveSession !== "undefined") SaveSession.schedulePersist();
    try {
      window.dispatchEvent(new CustomEvent("starfall-roster-changed"));
    } catch (_) {}
  }

  function runWarpReveal(finalChar, onDone) {
    const start = performance.now();
    const totalMs = 1950 + Math.random() * 750;
    let nextSwapAt = start;
    let swapGapMs = 30;

    paintResult(Starfall.pickRandom(Starfall.getGachaRoster(), Math.random), {
      teaser: true,
      skipBurst: true,
    });
    els.resultCard.classList.add("is-spinning");

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / totalMs);

      if (progress >= 1) {
        els.resultCard.classList.remove("is-spinning");
        paintResult(finalChar);
        hud();
        onDone && onDone();
        return;
      }

      if (now >= nextSwapAt) {
        const stillChaos = progress < 0.84;
        const display = stillChaos
          ? Starfall.pickRandom(Starfall.getGachaRoster(), Math.random)
          : finalChar;
        paintResult(display, { teaser: true, skipBurst: true });
        swapGapMs = 24 + Math.pow(progress, 2.35) * 540;
        nextSwapAt = now + swapGapMs;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /** @returns {Promise<void>} */
  function waitReveal(finalChar) {
    return new Promise((resolve) => {
      warpBusy = true;
      refreshPullButtons();
      runWarpReveal(finalChar, () => {
        warpBusy = false;
        hud();
        resolve();
      });
    });
  }

  async function doPull(times) {
    if (warpBusy) return;

    const cost = times === 10 ? Starfall.WISH_COST_TEN : Starfall.WISH_COST_SINGLE;
    const cur = Starfall.Persistence.loadCurrency();
    if (cur.stardust < cost) {
      window.alert(
        "Not enough candies — you need " +
          cost +
          " for this warp (you have " +
          cur.stardust +
          ").",
      );
      hud();
      return;
    }
    Starfall.Persistence.saveCurrency({ stardust: cur.stardust - cost });

    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(warpOnce());
      prependLog(results[results.length - 1]);
    }
    unlockMany(results);

    hud();
    const showcase = pickBest(results);
    await waitReveal(showcase);
    hud();
    return results;
  }

  /** Roster vault — same sprites smaller; fighting scene can reuse Starfall.drawPortrait(full canvas, char). */
  function renderOwnedRoster() {
    if (!els.rosterGrid) return;
    els.rosterGrid.innerHTML = "";
    Starfall.getGachaRoster().forEach((char) => {
      const cell = document.createElement("article");
      cell.className =
        "roster-cell r" +
        char.rarity +
        (Starfall.Unlocks.isUnlocked(char.id) ? " owned" : " locked");

      const cv = document.createElement("canvas");
      cv.className = "roster-mini";
      cv.width = cv.height = 1;
      Starfall.drawPortrait(cv, char, { size: 56 });

      const name = document.createElement("p");
      name.className = "roster-name";
      name.textContent = Starfall.Unlocks.isUnlocked(char.id)
        ? char.name
        : "???";

      const tag = document.createElement("span");
      tag.className = "mini-stars";
      tag.textContent = "★".repeat(char.rarity);
      tag.setAttribute("aria-hidden", "true");

      cell.appendChild(cv);
      cell.appendChild(tag);
      cell.appendChild(name);
      els.rosterGrid.appendChild(cell);
    });
  }

  window.addEventListener("starfall-stardust-changed", () => {
    hud();
    renderOwnedRoster();
  });

  paintResult(pool(5)[1], { skipBurst: true });
  hud();
  renderOwnedRoster();

  els.pullOne.addEventListener("click", () => {
    void doPull(1);
  });
  els.pullTen.addEventListener("click", () => {
    void doPull(10);
  });

  window.addEventListener("starfall-local-reset", () => {
    try {
      const p = Starfall.Persistence.loadPity();
      pullsSinceFive = p.pullsSinceFive;
      pullsSinceFourPlus = p.pullsSinceFourPlus;
      totalPulls = p.totalPulls;
    } catch (_) {
      pullsSinceFive = 0;
      pullsSinceFourPlus = 0;
      totalPulls = 0;
    }
    hud();
    renderOwnedRoster();
  });
})();
