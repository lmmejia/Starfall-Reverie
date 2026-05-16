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

function isGachaOpen() {
  return !!(GACHA_MODAL && GACHA_MODAL.open);
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
];

/** @type {SpeakerRole} */
const ENDING_ROLE = "narration";

const ENDING_SPEAKER = "To be continued";
const ENDING_TEXT =
  "The tram bells ring for the Grand Evening. A masked host waits where happiness is house policy…";

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
}

function renderStory() {
  if (showingEnding) {
    applyEnding();
  } else {
    applyBeat();
  }
  updateNav();
}

function advance() {
  if (isGachaOpen()) return;
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
  if (isGachaOpen()) return;
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
