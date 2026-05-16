const NAME_SCREEN = document.getElementById("screen-name");
const STORY_SCREEN = document.getElementById("screen-story");
const NAME_INPUT = document.getElementById("player-name");
const BTN_BEGIN = document.getElementById("btn-begin");
const BTN_BACK = document.getElementById("btn-back");
const BTN_ADVANCE = document.getElementById("btn-advance");
const SPEAKER_EL = document.getElementById("speaker");
const LINE_EL = document.getElementById("line");
const BACKDROP = document.getElementById("scene-backdrop");
const CHAPTER_PILL = document.getElementById("chapter-pill");
const GACHA_MODAL = document.getElementById("gacha-modal");
const BOSS_MODAL = document.getElementById("boss-modal");
const BTN_BOSS_FIGHT = document.getElementById("btn-boss-fight");

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
/** 1 = Golden District, 2 = Sleeping Below */
let storyChapter = 1;
/** "beats" = linear story; "ending" = chapter end card + boss unlock */
let storyPhase = /** @type {"beats" | "ending"} */ ("beats");

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

function showScreen(story) {
  NAME_SCREEN.classList.toggle("screen--active", !story);
  NAME_SCREEN.hidden = story;
  STORY_SCREEN.classList.toggle("screen--active", story);
  STORY_SCREEN.hidden = !story;
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
    return;
  }
  beatIndex += 1;
  renderStory();
}

function goBack() {
  if (isGachaOpen() || isBossOpen()) return;
  if (storyPhase === "ending") {
    storyPhase = "beats";
    renderStory();
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
}

BTN_BEGIN.addEventListener("click", () => {
  const raw = NAME_INPUT.value.trim();
  playerName = raw.length ? raw.slice(0, 16) : "Traveler";
  beatIndex = 0;
  storyChapter = 1;
  storyPhase = "beats";
  window.__starfallBattle = "conductor";
  try {
    localStorage.removeItem(CH1_BOSS_BEATEN_KEY);
    localStorage.removeItem(CH2_BOSS_BEATEN_KEY);
  } catch (_) {}
  showScreen(true);
  renderStory();
});

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
  showScreen(false);
});
