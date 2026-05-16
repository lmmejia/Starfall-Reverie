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
const CHAPTER_PILL = document.getElementById("chapter-pill");
const GACHA_MODAL = document.getElementById("gacha-modal");
const BOSS_MODAL = document.getElementById("boss-modal");
const BTN_BOSS_FIGHT = document.getElementById("btn-boss-fight");

/** @typedef {{ glyph: string, title: string, flavor: string }} ShelfMeta */

const SLOT_META /** @type {Record<number, ShelfMeta>} */ = {
  1: { glyph: "✦", title: "Sugar prism", flavor: "A tiny crystal humming lullabies." },
  2: { glyph: "✧", title: "Gumdrop cradle", flavor: "Squishy-soft for cozy tales." },
  3: { glyph: "☆", title: "Tram ticket", flavor: "Valid for wherever you wake up." },
};

function isGachaOpen() {
  return !!(GACHA_MODAL && GACHA_MODAL.open);
}

const BOSS_BRIEFING_MODAL = document.getElementById("boss-briefing-modal");

function isBossOpen() {
  return (
    !!(BOSS_MODAL && BOSS_MODAL.open) ||
    !!(BOSS_BRIEFING_MODAL && BOSS_BRIEFING_MODAL.open)
  );
}

/**
 * @typedef {"player" | "major" | "minor" | "narration"} SpeakerRole
 */

/** @type {{ speaker: string, text: string, scene?: string, role: SpeakerRole }[]} */
const CHAPTER_1_BEATS = [
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
  {
    speaker: "Narration",
    text: "Then the brass bells begin—bright and wrong, like laughter tuned too sharp. A tram rounds the bend on rails of peppermint striping, and the crowd moves as one to board.",
    scene: "evening",
    role: "narration",
  },
  {
    speaker: "Usher",
    text: "Ticket, please! Admit one: happiness. No refunds for sincerity—we only validate joy.",
    scene: "tram",
    role: "major",
  },
  {
    speaker: "{name}",
    text: "You take the stub because refusing would make a scene. The paper tastes faintly of mint and copper—like a coin you’re meant to swallow.",
    scene: "tram",
    role: "player",
  },
  {
    speaker: "Narration",
    text: "The venue rises ahead in stacked layers of meringue light, curtains dripping gold foil. Spotlights hunt the windows until one finds you, plain and unvarnished, and refuses to look away.",
    scene: "stage",
    role: "narration",
  },
  {
    speaker: "Conductor of Smiles",
    text: "Oh—late, late! But the show loves a straggler. Step lightly, little plain star: the audience can taste hesitation.",
    scene: "stage",
    role: "major",
  },
  {
    speaker: "Crowd",
    text: "Delighted… delighted… delighted…",
    scene: "stage",
    role: "minor",
  },
  {
    speaker: "{name}",
    text: "Their cheers sync too perfectly. You feel less like a guest and more like a prop someone misplaced—real enough to ruin the shot.",
    scene: "stage",
    role: "player",
  },
  {
    speaker: "Narration",
    text: "The Conductor offers a gloved hand. Up close, the glove is stitched from ribbons and old invitations—polite things pressed into service as skin.",
    scene: "stage",
    role: "narration",
  },
  {
    speaker: "Conductor of Smiles",
    text: "One rule tonight, traveler: keep smiling until the credits roll. It’s kindness, really—we’re saving you from what happens when the lights go down.",
    scene: "stage",
    role: "major",
  },
];

/** Chapter 2 — The Sleeping Below */
const CHAPTER_2_BEATS = [
  {
    speaker: "Narration",
    text: "After the encore, the floor doesn’t feel solid anymore. A seam opens where the stage lights can’t excuse themselves—stairs descending into breath that’s too calm, too deliberate.",
    scene: "descent",
    role: "narration",
  },
  {
    speaker: "…",
    text: "Down here, sound comes muffled, as if the world above were only a dream someone forgot to wake from.",
    scene: "descent",
    role: "narration",
  },
  {
    speaker: "{name}",
    text: "Each step leaves a faint echo that returns wrong: longer, softer, like it isn’t bouncing off stone but through glass.",
    scene: "vault",
    role: "player",
  },
  {
    speaker: "Narration",
    text: "The vault widens into a chamber big enough to house weather. Rows of dream-pods hang from the ceiling—glass ovals humming with pale light, bodies inside sleeping with smiles that never twitch.",
    scene: "pods",
    role: "narration",
  },
  {
    speaker: "Archive attendant",
    text: "Quiet, please. The sleepers are catalogued. If you need a regret withdrawn, file the proper form—nostalgia is hazardous waste down here.",
    scene: "pods",
    role: "major",
  },
  {
    speaker: "Sleeper (muffled)",
    text: "I was going to say sorry… I was going to…",
    scene: "pods",
    role: "minor",
  },
  {
    speaker: "Narration",
    text: "Some pods flicker. Inside, memories sharpen into theater: a door that never opened, a name you didn’t call back, a kindness you gave only when it cost nothing.",
    scene: "tether",
    role: "narration",
  },
  {
    speaker: "{name}",
    text: "The images aren’t mine alone—they overlap, stitched from everyone’s leftovers until they feel like a crowd living in one skull.",
    scene: "tether",
    role: "player",
  },
  {
    speaker: "Narration",
    text: "Thick cables vein the floor like roots, carrying corrupted echoes: laughter clipped into static, apologies looped until they sound like threats.",
    scene: "deep",
    role: "narration",
  },
  {
    speaker: "Chorus of whispers",
    text: "You kept it… you kept it… you kept it…",
    scene: "chorus",
    role: "minor",
  },
  {
    speaker: "Narration",
    text: "At the chamber’s heart the pods thin out. The air pulses—slow, heavy, like a sleeping beast turning under a blanket of stolen dreams.",
    scene: "chamber",
    role: "narration",
  },
  {
    speaker: "Memory Beast",
    text: "You carry so many unfinished sentences. Give them to me—I’ll finish them badly, beautifully, forever.",
    scene: "beast",
    role: "major",
  },
  {
    speaker: "{name}",
    text: "It isn’t a mouth that speaks. It’s pressure—regret and want fused until they have weight, reaching out with ribbons of old faces that dissolve before you can name them.",
    scene: "beast",
    role: "player",
  },
  {
    speaker: "Memory Beast",
    text: "Don’t struggle. The deep sleep is merciful. Down here, nobody has to remember being brave.",
    scene: "beast",
    role: "major",
  },
];

const CH1_BOARDING_BONUS_KEY = "starfall-ch1-boarding-bonus-v1";
/** First “evening / tram” beat index — grant bonus candies once when the player reaches it */
const CH1_STARDUST_BEAT_INDEX = 8;

const CH2_POD_BONUS_KEY = "starfall-ch2-pod-bonus-v1";
/** Beat where the dream pods are first shown in force */
const CH2_POD_BONUS_BEAT_INDEX = 3;

const CH1_BOSS_BEATEN_KEY = "starfall-reverie-ch1-boss-beaten-v1";
const CH2_BOSS_BEATEN_KEY = "starfall-reverie-ch2-boss-beaten-v1";

/** @param {number} chapter 1 or 2 */
function isChapterBossBeaten(chapter) {
  const k = chapter === 1 ? CH1_BOSS_BEATEN_KEY : CH2_BOSS_BEATEN_KEY;
  return localStorage.getItem(k) === "1";
}

/** @type {SpeakerRole} */
const ENDING_ROLE = "narration";

const ENDING_SPEAKER_CH1 = "End of scene — for now";
const ENDING_TEXT_CH1 =
  "The backstage hums like a held breath. Somewhere in Candyland, wishes are counted in sugar-gloss—and you’ve got candies for the Warp if you need allies. When you’re ready, face the Conductor on the terms the house allows.";

const ENDING_SPEAKER_CH2 = "End of chapter two — for now";
const ENDING_TEXT_CH2 =
  "The Beast scatters into threadbare mist—not gone, only unwound for a moment. The pods dim, but the chamber remembers you. Candies earned in the deep stain your pockets like cold embers—use them if you dare climb back toward waking air.";

let playerName = "Traveler";
let beatIndex = 0;
let showingEnding = false;
/** Separate from beatIndex — beat 0 can be name-entry or first story line */
let startedStory = false;
/** 1 = Golden District, 2 = Sleeping Below */
let storyChapter = 1;
/** "beats" = linear story; "ending" = chapter end card + boss unlock */
let storyPhase = /** @type {"beats" | "ending"} */ ("beats");

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
      ? Math.max(
          0,
          Math.min(
            boot.beatIndex,
            Math.max(CHAPTER_1_BEATS.length, CHAPTER_2_BEATS.length) + 10
          )
        )
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

function getBeats() {
  return storyChapter === 1 ? CHAPTER_1_BEATS : CHAPTER_2_BEATS;
}

/** Which boss fight the battle script should load (story sets this when the boss screen is relevant). */
function syncBossBattleKey() {
  window.__starfallBattle =
    storyPhase === "ending" && storyChapter === 2 ? "memory" : "conductor";
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

function updateChapterPill() {
  if (!CHAPTER_PILL) return;
  CHAPTER_PILL.textContent =
    storyChapter === 1 ? "Ch. 1 — The Golden District" : "Ch. 2 — The Sleeping Below";
}

function applyBeat() {
  const beat = getBeats()[beatIndex];
  const scene = beat.scene ?? "street";
  BACKDROP.dataset.scene = scene;
  setSpeakerRole(beat.role);
  SPEAKER_EL.textContent = interpolate(beat.speaker, playerName);
  LINE_EL.textContent = interpolate(beat.text, playerName);
}

function applyEnding() {
  const speaker = storyChapter === 1 ? ENDING_SPEAKER_CH1 : ENDING_SPEAKER_CH2;
  const text = storyChapter === 1 ? ENDING_TEXT_CH1 : ENDING_TEXT_CH2;
  BACKDROP.dataset.scene = storyChapter === 1 ? "stage" : "beast";
  setSpeakerRole(ENDING_ROLE);
  SPEAKER_EL.textContent = speaker;
  LINE_EL.textContent = text;
}

function updateNav() {
  syncBossBattleKey();
  const atFirstBeatCh1 =
    storyChapter === 1 && storyPhase === "beats" && beatIndex === 0;
  BTN_BACK.disabled = atFirstBeatCh1;
  if (BTN_BOSS_FIGHT) {
    BTN_BOSS_FIGHT.hidden = storyPhase !== "ending";
    BTN_BOSS_FIGHT.textContent =
      storyChapter === 2
        ? "Face the Memory Beast (battle)"
        : "Face the Conductor (battle)";
  }
  if (BTN_ADVANCE) {
    const needCh1Boss =
      storyPhase === "ending" && storyChapter === 1 && !isChapterBossBeaten(1);
    BTN_ADVANCE.disabled = needCh1Boss;
    BTN_ADVANCE.title = needCh1Boss
      ? "Win the boss battle against the Conductor to unlock Chapter 2."
      : "";
  }
}

function grantChapterOneBoardingBonusOnce() {
  if (typeof Starfall === "undefined") return;
  if (storyPhase === "ending") return;
  if (storyChapter !== 1) return;
  if (beatIndex !== CH1_STARDUST_BEAT_INDEX) return;
  if (localStorage.getItem(CH1_BOARDING_BONUS_KEY)) return;
  Starfall.Persistence.addStardust(40);
  localStorage.setItem(CH1_BOARDING_BONUS_KEY, "1");
}

function grantChapterTwoPodBonusOnce() {
  if (typeof Starfall === "undefined") return;
  if (storyPhase === "ending") return;
  if (storyChapter !== 2) return;
  if (beatIndex !== CH2_POD_BONUS_BEAT_INDEX) return;
  if (localStorage.getItem(CH2_POD_BONUS_KEY)) return;
  Starfall.Persistence.addStardust(35);
  localStorage.setItem(CH2_POD_BONUS_KEY, "1");
}

function renderStory() {
  updateChapterPill();
  if (storyPhase === "ending") {
    applyEnding();
  } else {
    applyBeat();
    grantChapterOneBoardingBonusOnce();
    grantChapterTwoPodBonusOnce();
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
  if (isGachaOpen() || isBossOpen()) return;
  if (storyPhase === "ending") {
    if (storyChapter === 1) {
      if (!isChapterBossBeaten(1)) return;
      storyChapter = 2;
      beatIndex = 0;
      storyPhase = "beats";
      renderStory();
    }
    return;
  }
  const beats = getBeats();
  if (beatIndex >= beats.length - 1) {
    storyPhase = "ending";
    renderStory();
    scheduleCloudSave();
    return;
  }
  beatIndex += 1;
  renderStory();
  scheduleCloudSave();
}

function goBack() {
  if (isGachaOpen() || isBossOpen()) return;
  if (storyPhase === "ending") {
    storyPhase = "beats";
    renderStory();
    scheduleCloudSave();
    return;
  }
  if (beatIndex <= 0) {
    if (storyChapter === 2) {
      storyChapter = 1;
      storyPhase = "ending";
      renderStory();
    }
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
  storyChapter = 1;
  storyPhase = "beats";
  window.__starfallBattle = "conductor";
  try {
    localStorage.removeItem(CH1_BOSS_BEATEN_KEY);
    localStorage.removeItem(CH2_BOSS_BEATEN_KEY);
  } catch (_) {}
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
  if (!STORY_SCREEN.classList.contains("screen--active") || isGachaOpen() || isBossOpen()) {
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

/** Persist boss wins; refresh story nav so “Next” unlocks after closing the battle modal. */
window.addEventListener("starfall-chapter-boss-beaten", (e) => {
  const ch = e.detail && e.detail.chapter;
  try {
    if (ch === 1) localStorage.setItem(CH1_BOSS_BEATEN_KEY, "1");
    else if (ch === 2) localStorage.setItem(CH2_BOSS_BEATEN_KEY, "1");
  } catch (_) {}
  if (STORY_SCREEN.classList.contains("screen--active")) {
    updateNav();
  }
});

/** Home navigation from battle end screens. Assign window.__starfallGoHome to override (hub route, etc.). */
window.addEventListener("starfall-go-home", () => {
  if (typeof window.__starfallGoHome === "function") {
    window.__starfallGoHome();
    return;
  }
  storyChapter = 1;
  beatIndex = 0;
  storyPhase = "beats";
  window.__starfallBattle = "conductor";
  activateStoryPhase();
  renderStory();
});
