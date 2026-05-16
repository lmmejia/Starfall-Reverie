const SAVE_SCREEN = document.getElementById("screen-save");
const NAME_SCREEN = document.getElementById("screen-name");
const STORY_SCREEN = document.getElementById("screen-story");
const SHELF_PANEL = document.getElementById("save-shelf-panel");
const TOP_HINT = document.getElementById("top-phase-hint");
const NAME_INPUT = document.getElementById("player-name");
const BTN_BEGIN = document.getElementById("btn-begin");
const BTN_SAVE_BACK = document.getElementById("btn-slot-change");
const BTN_BACK = document.getElementById("btn-back");
const BTN_ADVANCE = document.getElementById("btn-advance");
const BTN_SAVE_QUIT = document.getElementById("btn-save-quit");
const BTN_NAME_SAVE_QUIT = document.getElementById("btn-name-save-quit");
const SPEAKER_EL = document.getElementById("speaker");
const LINE_EL = document.getElementById("line");
const BACKDROP = document.getElementById("scene-backdrop");
const GACHA_MODAL = document.getElementById("gacha-modal");

/** @typedef {{ glyph: string, title: string, flavor: string }} ShelfMeta */

const SLOT_META /** @type {Record<number, ShelfMeta>} */ = {
  1: { glyph: "✦", title: "Sugar prism", flavor: "A tiny crystal humming lullabies." },
  2: { glyph: "✧", title: "Gumdrop cradle", flavor: "Squishy-soft for cozy tales." },
  3: { glyph: "☆", title: "Tram ticket", flavor: "Valid for wherever you wake up." },
};

function isGachaOpen() {
  return !!(GACHA_MODAL && GACHA_MODAL.open);
}

/** @typedef {"player" | "major" | "minor" | "narration"} SpeakerRole */

/** @type {{ speaker: string, text: string, scene?: string, role: SpeakerRole }[]} */
const OPENING_BEATS = [
  {
    speaker: "…",
    text: "You didn’t mean to find Candyland. You were only passing through—another road, another sky—until the air turned thick with sugar and the stars looked like sprinkles.",
    scene: "gate",
    role: "narration",
  },
  {
    speaker: "…",
    text: "The gate smiles at you. Not like a person. Like something painted to be polite.",
    scene: "gate",
    role: "narration",
  },
  {
    speaker: "Narration",
    text: "Everyone here is beautiful in a loud way: ribboned coats, gumdrop buttons, hair like spun sugar. You feel plain as dry bread—and they notice.",
    scene: "street",
    role: "narration",
  },
  {
    speaker: "Patissier",
    text: "Oh! A plain traveler! How… authentic! Would you like a complimentary glaze? It brings out the joy!",
    scene: "street",
    role: "major",
  },
  {
    speaker: "{name}",
    text: "Something’s wrong. The laughter hits the same beat, like a song looped one shade too bright. Even the confetti falls on schedule.",
    scene: "street",
    role: "player",
  },
  {
    speaker: "Small voice",
    text: "They took her to the Pantry… they said she was spoiling…",
    scene: "street",
    role: "minor",
  },
  {
    speaker: "Elegant guard",
    text: "Please remain delightful for the other guests. Unhappiness is litter—and we keep the streets clean.",
    scene: "street",
    role: "major",
  },
  {
    speaker: "Narration",
    text: "You don’t belong here. That might be the only honest thing Candyland can’t decorate.",
    scene: "street",
    role: "narration",
  },
];

/** @type {SpeakerRole} */
const ENDING_ROLE = "narration";

const ENDING_SPEAKER = "To be continued";
const ENDING_TEXT =
  "The tram bells ring for the Grand Evening. A masked host waits where happiness is house policy…";

let playerName = "Traveler";
let beatIndex = 0;
let showingEnding = false;
/** Separate from beatIndex — beat 0 can be name-entry or first story line */
let startedStory = false;

if (typeof SaveSession !== "undefined") {
  SaveSession.setIntroProvider(() => {
    const nameFromField =
      NAME_SCREEN && !NAME_SCREEN.hidden
        ? (NAME_INPUT.value.trim().slice(0, 16) ||
            playerName ||
            "Traveler")
        : playerName || "Traveler";
    return {
      playerName: nameFromField,
      beatIndex,
      showingEnding,
      startedStory,
    };
  });
}

/** @type {HTMLElement | null} */
const bootGhost = document.querySelector(".story-app");

function applyBootIfAny() {
  const boot = window.__STAR_INTRO_BOOT__;
  if (!boot) return false;
  delete window.__STAR_INTRO_BOOT__;
  playerName = typeof boot.playerName === "string" ? boot.playerName : "Traveler";
  beatIndex =
    typeof boot.beatIndex === "number"
      ? Math.max(0, Math.min(boot.beatIndex, OPENING_BEATS.length + 10))
      : 0;
  showingEnding = !!boot.showingEnding;
  startedStory =
    typeof SaveSession !== "undefined" &&
    typeof SaveSession.inferStoryStarted === "function"
      ? SaveSession.inferStoryStarted({
          startedStory:
            typeof boot.startedStory === "boolean"
              ? boot.startedStory
              : undefined,
          beatIndex,
          showingEnding,
          pity:
            typeof Starfall !== "undefined"
              ? Starfall.Persistence.loadPity()
              : undefined,
          unlockIds:
            typeof Starfall !== "undefined"
              ? Starfall.Unlocks.parseUnlockSnapshot()
              : undefined,
        })
      : !!(beatIndex > 0 || showingEnding);
  NAME_INPUT.value = playerName;
  return true;
}

function interpolate(text, name) {
  return text.replaceAll("{name}", name);
}

/** @param {SpeakerRole} role */
function setSpeakerRole(role) {
  SPEAKER_EL.className = `speaker speaker--${role}`;
}

function setTopHint(phase) {
  if (!TOP_HINT) return;
  if (phase === "story") {
    TOP_HINT.textContent = "Space — next · ← / Backspace — back";
  } else if (phase === "name") {
    TOP_HINT.textContent = "Name yourself, then descend into Candyland…";
  } else {
    TOP_HINT.textContent = "Pick one of three cloud crystals · Butterbase keeps your sleepy progress";
  }
}

function activateShelfPhase() {
  if (!SAVE_SCREEN || !NAME_SCREEN || !STORY_SCREEN) return;
  SAVE_SCREEN.hidden = false;
  SAVE_SCREEN.classList.add("screen--active");
  NAME_SCREEN.hidden = true;
  NAME_SCREEN.classList.remove("screen--active");
  STORY_SCREEN.hidden = true;
  STORY_SCREEN.classList.remove("screen--active");
  if (bootGhost) bootGhost.dataset.phase = "shelf";
  setTopHint("shelf");
}

function activateNamePhase() {
  SAVE_SCREEN.hidden = true;
  SAVE_SCREEN.classList.remove("screen--active");
  NAME_SCREEN.hidden = false;
  NAME_SCREEN.classList.add("screen--active");
  STORY_SCREEN.hidden = true;
  STORY_SCREEN.classList.remove("screen--active");
  if (bootGhost) bootGhost.dataset.phase = "name";
  setTopHint("name");
}

function activateStoryPhase() {
  SAVE_SCREEN.hidden = true;
  SAVE_SCREEN.classList.remove("screen--active");
  NAME_SCREEN.hidden = true;
  NAME_SCREEN.classList.remove("screen--active");
  STORY_SCREEN.hidden = false;
  STORY_SCREEN.classList.add("screen--active");
  if (bootGhost) bootGhost.dataset.phase = "story";
  setTopHint("story");
}

function applyBeat() {
  const beat = OPENING_BEATS[beatIndex];
  const scene = beat.scene ?? "street";
  BACKDROP.dataset.scene = scene;
  setSpeakerRole(beat.role);
  SPEAKER_EL.textContent = interpolate(beat.speaker, playerName);
  LINE_EL.textContent = interpolate(beat.text, playerName);
}

function applyEnding() {
  setSpeakerRole(ENDING_ROLE);
  SPEAKER_EL.textContent = ENDING_SPEAKER;
  LINE_EL.textContent = ENDING_TEXT;
}

function updateNav() {
  const atFirstBeat = beatIndex === 0 && !showingEnding;
  BTN_BACK.disabled = atFirstBeat;
}

function renderStory() {
  if (showingEnding) {
    applyEnding();
  } else {
    applyBeat();
  }
  updateNav();
}

function scheduleCloudSave() {
  if (typeof SaveSession !== "undefined") SaveSession.schedulePersist();
}

/** Sync typed name into state right before an explicit cloud flush */
function snapshotPlayerNameFromInputIfNaming() {
  if (NAME_SCREEN && !NAME_SCREEN.hidden) {
    const raw = NAME_INPUT.value.trim();
    if (raw.length) playerName = raw.slice(0, 16);
  }
}

/** Flush cloud save, then reload to the save-crystal home */
function quitToShelfAfterSave(/** @type {HTMLButtonElement | null} */ triggerBtn) {
  if (typeof SaveSession === "undefined") return;
  if (isGachaOpen()) return;

  snapshotPlayerNameFromInputIfNaming();

  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.textContent = "Saving…";
  }

  SaveSession.persistNow()
    .then((ok) => {
      if (ok === false) {
        alert(
          "Cloud save didn't go through — check your network and Butterbase status. You'll still return to the crystal menu."
        );
      }
    })
    .finally(() => {
      SaveSession.setActiveSlot(0);
      window.location.reload();
    });
}

function advance() {
  if (isGachaOpen()) return;
  if (showingEnding) {
    return;
  }
  if (beatIndex >= OPENING_BEATS.length - 1) {
    showingEnding = true;
    renderStory();
    scheduleCloudSave();
    return;
  }
  beatIndex += 1;
  renderStory();
  scheduleCloudSave();
}

function goBack() {
  if (isGachaOpen()) return;
  if (showingEnding) {
    showingEnding = false;
    renderStory();
    scheduleCloudSave();
    return;
  }
  if (beatIndex <= 0) {
    return;
  }
  beatIndex -= 1;
  renderStory();
  scheduleCloudSave();
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slugTime(iso) {
  try {
    if (!iso) return "";
    const d = new Date(String(iso));
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function renderShelf(rows) {
  if (!SHELF_PANEL || typeof SaveSession === "undefined") return;

  SHELF_PANEL.innerHTML = "";

  /** @type {Map<number, any>} */
  const bySlot = new Map();
  (rows || []).forEach((row) => {
    bySlot.set(Number(row.slot_index), row);
  });

  for (let slot = 1; slot <= 3; slot++) {
    const meta = SLOT_META[slot];
    const remote = bySlot.get(slot);
    /** @type {any} */
    const pay =
      remote && typeof remote.payload === "object" && remote.payload !== null
        ? remote.payload
        : null;
    const hasSave = !!remote;
    const lineRaw =
      remote && typeof remote.label === "string" && remote.label.trim()
        ? remote.label.trim()
        : pay && typeof pay.playerName === "string" && pay.playerName.trim()
          ? pay.playerName.trim()
          : "Empty nest";
    const upd = slugTime(remote && remote.updated_at);

    const el = document.createElement("article");
    el.className = "save-crystal-card";
    el.innerHTML =
      `
      <div class="save-crystal__glyph" aria-hidden="true">${meta.glyph}</div>
      <div class="save-crystal__body">
        <h2 class="save-crystal__title">${escapeHtml(meta.title)}</h2>
        <p class="save-crystal__flavor">${escapeHtml(meta.flavor)}</p>
        <div class="save-crystal__status">
          <span class="save-crystal__line">${escapeHtml(lineRaw)}</span>
          ${upd ? `<span class="save-crystal__time">${escapeHtml(upd)}</span>` : `<span class="save-crystal__time">Awaiting voyager…</span>`}
        </div>
        <div class="save-crystal__buttons">
          <button type="button" class="story-btn save-crystal__continue" data-slot="${slot}" data-do="resume" ${hasSave ? "" : "disabled"}>Continue</button>
          <button type="button" class="story-btn story-btn-ghost save-crystal__fresh" data-slot="${slot}" data-do="fresh">New voyage</button>
        </div>
      </div>
      `.trim();

    SHELF_PANEL.appendChild(el);
  }

  SHELF_PANEL.querySelectorAll("button[data-do]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slotNum = Number(/** @type {HTMLElement} */ (btn).dataset.slot);
      const kind = /** @type {HTMLElement} */ (btn).dataset.do;
      if (!(slotNum >= 1 && slotNum <= 3)) return;
      /** @type {HTMLElement} */
      const parentCard = btn.closest(".save-crystal-card");
      if (kind === "resume") {
        btn.setAttribute("disabled", "disabled");
        if (parentCard) parentCard.classList.add("save-crystal-card--busy");
        SaveSession.reloadFromCloud(slotNum).catch(() => {
          btn.removeAttribute("disabled");
          if (parentCard) parentCard.classList.remove("save-crystal-card--busy");
          alert("Couldn't reach Butterbase saves — check network / console.");
        });
        return;
      }
      SaveSession.resetStarfallLocals();
      SaveSession.setActiveSlot(slotNum);
      playerName = "Traveler";
      beatIndex = 0;
      showingEnding = false;
      startedStory = false;
      NAME_INPUT.value = "";
      NAME_INPUT.placeholder = "Traveler";
      activateNamePhase();
      scheduleCloudSave();
    });
  });

  if (typeof SaveSession !== "undefined" && SaveSession.refreshShelfAuthBar) {
    SaveSession.refreshShelfAuthBar();
  }
}

function hydrateFromCloudContinuation() {
  const hadBoot = applyBootIfAny();
  if (hadBoot) {
    if (startedStory) {
      activateStoryPhase();
      renderStory();
    } else {
      activateNamePhase();
    }
    scheduleCloudSave();
    return true;
  }
  return false;
}

function bindShelfReload() {
  if (typeof SaveSession === "undefined") return Promise.resolve();

  const renderEmpty = () => renderShelf([]);

  return SaveSession.listRemoteSlots()
    .then((data) => renderShelf(Array.isArray(data.slots) ? data.slots : []))
    .catch(() => {
      renderEmpty();
      if (TOP_HINT) {
        TOP_HINT.textContent = "Cloud sleepy — reconnect to Butterbase anytime…";
      }
    });
}

if (!hydrateFromCloudContinuation()) {
  activateShelfPhase();
}

void bindShelfReload();

BTN_BEGIN.addEventListener("click", () => {
  const raw = NAME_INPUT.value.trim();
  playerName = raw.length ? raw.slice(0, 16) : "Traveler";
  beatIndex = 0;
  showingEnding = false;
  startedStory = true;
  activateStoryPhase();
  renderStory();
  scheduleCloudSave();
  if (typeof SaveSession !== "undefined") {
    void SaveSession.persistNow();
  }
});

if (BTN_SAVE_BACK && typeof SaveSession !== "undefined") {
  BTN_SAVE_BACK.addEventListener("click", () => {
    quitToShelfAfterSave(BTN_SAVE_BACK);
  });
}

if (BTN_SAVE_QUIT && typeof SaveSession !== "undefined") {
  BTN_SAVE_QUIT.addEventListener("click", () => {
    quitToShelfAfterSave(BTN_SAVE_QUIT);
  });
}

if (BTN_NAME_SAVE_QUIT && typeof SaveSession !== "undefined") {
  BTN_NAME_SAVE_QUIT.addEventListener("click", () => {
    quitToShelfAfterSave(BTN_NAME_SAVE_QUIT);
  });
}

BTN_ADVANCE.addEventListener("click", advance);
BTN_BACK.addEventListener("click", goBack);

document.addEventListener("keydown", (e) => {
  if (!STORY_SCREEN.classList.contains("screen--active") || isGachaOpen()) {
    return;
  }
  if (e.code === "Space") {
    e.preventDefault();
    advance();
  }
  if (e.code === "ArrowLeft" || e.code === "Backspace") {
    e.preventDefault();
    if (!BTN_BACK.disabled) {
      goBack();
    }
  }
});

NAME_INPUT.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    BTN_BEGIN.click();
  }
});
