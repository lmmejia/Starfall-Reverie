const NAME_SCREEN = document.getElementById("screen-name");
const STORY_SCREEN = document.getElementById("screen-story");
const NAME_INPUT = document.getElementById("player-name");
const BTN_BEGIN = document.getElementById("btn-begin");
const BTN_BACK = document.getElementById("btn-back");
const BTN_ADVANCE = document.getElementById("btn-advance");
const SPEAKER_EL = document.getElementById("speaker");
const LINE_EL = document.getElementById("line");
const BACKDROP = document.getElementById("scene-backdrop");
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

const CH1_BOARDING_BONUS_KEY = "starfall-ch1-boarding-bonus-v1";
/** First “evening / tram” beat index — grant bonus candies once when the player reaches it */
const CH1_STARDUST_BEAT_INDEX = 8;

/** @type {SpeakerRole} */
const ENDING_ROLE = "narration";

const ENDING_SPEAKER = "End of scene — for now";
const ENDING_TEXT =
  "The backstage hums like a held breath. Somewhere in Candyland, wishes are counted in sugar-gloss—and you’ve got candies for the Warp if you need allies. What happens next is up to you.";

let playerName = "Traveler";
let beatIndex = 0;
/** True while the post-script “To be continued” card is showing */
let showingEnding = false;

function interpolate(text, name) {
  return text.replaceAll("{name}", name);
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
  if (BTN_BOSS_FIGHT) {
    BTN_BOSS_FIGHT.hidden = !showingEnding;
  }
}

function grantChapterOneBoardingBonusOnce() {
  if (typeof Starfall === "undefined") return;
  if (showingEnding) return;
  if (beatIndex !== CH1_STARDUST_BEAT_INDEX) return;
  if (localStorage.getItem(CH1_BOARDING_BONUS_KEY)) return;
  Starfall.Persistence.addStardust(40);
  localStorage.setItem(CH1_BOARDING_BONUS_KEY, "1");
}

function renderStory() {
  if (showingEnding) {
    applyEnding();
  } else {
    applyBeat();
    grantChapterOneBoardingBonusOnce();
  }
  updateNav();
}

function advance() {
  if (isGachaOpen() || isBossOpen()) return;
  if (showingEnding) {
    return;
  }
  if (beatIndex >= OPENING_BEATS.length - 1) {
    showingEnding = true;
    renderStory();
    return;
  }
  beatIndex += 1;
  renderStory();
}

function goBack() {
  if (isGachaOpen() || isBossOpen()) return;
  if (showingEnding) {
    showingEnding = false;
    renderStory();
    return;
  }
  if (beatIndex <= 0) {
    return;
  }
  beatIndex -= 1;
  renderStory();
}

BTN_BEGIN.addEventListener("click", () => {
  const raw = NAME_INPUT.value.trim();
  playerName = raw.length ? raw.slice(0, 16) : "Traveler";
  beatIndex = 0;
  showingEnding = false;
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

/** Home navigation from battle end screens. Assign window.__starfallGoHome to override (hub route, etc.). */
window.addEventListener("starfall-go-home", () => {
  if (typeof window.__starfallGoHome === "function") {
    window.__starfallGoHome();
    return;
  }
  showingEnding = false;
  beatIndex = 0;
  showScreen(false);
});
