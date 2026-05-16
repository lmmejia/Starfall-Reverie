# Instructions for Cursor / agents — Starfall Reverie sprites

Use this doc when implementing **battle UI**, party select, HUD portraits, etc. Sprite art is **procedural Canvas drawing**, not PNG/SVG assets.

---

## Where the code lives

| File | Purpose |
|------|---------|
| `shared/starfall.js` | **`window.Starfall`** — roster data, **`drawPortrait`**, unlock helpers, gacha pity persistence |
| `game.js` | Gacha page only — **do not duplicate** roster or portrait logic here |

---

## Loading (HTML)

Battle / other pages **must load the shared bundle before any script that uses it**:

```html
<script src="shared/starfall.js"></script>
<!-- then your combat script -->
<script src="js/battle.js"></script>
```

Paths are relative to the page URL. Example: page at `/Starfall-Reverie/fight/` should use **`../shared/starfall.js`** (adjust per folder depth).

Serve over **HTTP** (e.g. MAMP): avoid depending on fragile `file://` setups when testing.

---

## How “sprites” work

There are **no image files**. `Starfall.drawPortrait(canvasElement, character, options)` redraws pixels into the canvas every call.

- Default logical art size is **96×96**; `drawPortrait` resizes `canvas.width` / `canvas.height`.
- Passing `{ size: 128 }` (or any positive number) scales the portrait to that square.
- Appearance is **stable per character**: same `character.id` ⇒ same procedural look.

---

## Data shape (`Character`)

Roster entries look like:

```ts
// Conceptual shape (actually plain objects)
type Character = {
  id: number;
  name: string;
  role: string;
  rarity: 3 | 4 | 5;
};
```

---

## Public API (`window.Starfall`)

Always guard for load order:

```js
if (typeof Starfall === "undefined") {
  throw new Error("Load shared/starfall.js before this script");
}
```

| Member | Usage |
|--------|--------|
| `Starfall.ROSTER` | Read-only array of all heroes (avoid mutating). |
| `Starfall.getRoster()` | Copy-safe list (new array). |
| `Starfall.getCharacter(id)` | Returns `Character` or **`undefined`** if unknown id — always handle `undefined`. |
| `Starfall.drawPortrait(canvas, char, opts?)` | Draw full portrait (`opts`: `{ size?: number }`). |
| `Starfall.Unlocks.isUnlocked(id)` | Gate party / selectable units tied to gacha unlocks. |
| `Starfall.Unlocks.getUnlockedCharacters()` | All owned units, same order as canonical roster filter. |

Unlock state lives in **`localStorage`** (`starfall-reverie-unlocks-v1`). It is populated when players pull on the gacha page. Battle code should assume **possible empty roster** unless you add starters.

Persistence for gacha pity is separate (`Starfall-reverie-pity-v1` via `Starfall.Persistence`); battles usually ignore it unless you deliberately sync meta.

---

## Minimal battle usage

Draw the hero Luna if owned:

```js
const hero = Starfall.getCharacter(1);
if (!hero || !Starfall.Unlocks.isUnlocked(hero.id)) {
  // Cannot use in party
}
const portrait = document.getElementById("heroPortrait");
Starfall.drawPortrait(portrait, hero, { size: 96 });
```

Enemies/NPCs that are **not** gacha pulls can reuse `drawPortrait` with a synthetic object **only if** you add matching ids/names/rarities to the canonical roster — otherwise extend the system thoughtfully (agents: ask the repo owner before inventing phantom ids that collide).

---

## Conventions agents should follow

1. **Single source of truth**: extend `shared/starfall.js` roster + drawing only when adding real characters everyone should share.
2. **Do not** copy-paste `drawPortrait` into another file — duplicates will drift apart.
3. **Canvas/CSS**: combat pages should style display size via CSS (`width`/`height` on canvas) **after** intrinsic pixels are set by `drawPortrait`, or redraw at `{ size }` matching your layout pixel ratio.
4. **Frameworks (React/Vue/etc.)**: load `starfall.js` globally (via `index.html`) or shim `window.Starfall` before components mount; hooks can wrap `drawPortrait` in `useEffect`/`useLayoutEffect` when refs attach.
