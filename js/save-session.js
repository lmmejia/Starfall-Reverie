/* Cloud save slots · Butterbase HTTP fn `save-slots` + local hydration */
(function () {
  var BOOT_KEY = "starfall_cloud_bootstrap_v1";
  var SLOT_KEY = "starfall_active_slot_v1";
  var INSTALL_KEY = "starfall_installation_id_v1";
  var CLOUD_AUTH_KEY = "starfall_bb_cloud_auth_v1";

  /** @typedef {{ pullsSinceFive: number, pullsSinceFourPlus: number, totalPulls: number }} PitySnap */
  /** @typedef {{ schemaVersion?: number, playerName?: string, beatIndex?: number, storyChapter?: number, storyPhase?: string, showingEnding?: boolean, unlockIds?: number[], pity?: PitySnap }} SavePayload */

  /** @returns {typeof window.STARFALL_BUTTERBASE} */
  function cfg() {
    var bb = window.STARFALL_BUTTERBASE;
    if (
      !bb ||
      !bb.SAVE_FN_URL ||
      !bb.APP_ID ||
      !bb.API_ORIGIN ||
      typeof bb.APP_ID !== "string" ||
      typeof bb.API_ORIGIN !== "string"
    ) {
      throw new Error(
        'Load shared/butterbase-config.js before save-session.js (missing STARFALL_BUTTERBASE fields).'
      );
    }
    return bb;
  }

  function oauthCallbackAbs() {
    return new URL("auth-callback.html", window.location.href).href;
  }

  /** Absolute URL → Butterbase Google OAuth (redirect_to fills auth-callback.html). */
  function googleOAuthHref() {
    var c = cfg();
    return (
      c.API_ORIGIN +
      "/auth/" +
      encodeURIComponent(c.APP_ID) +
      "/oauth/google?redirect_to=" +
      encodeURIComponent(oauthCallbackAbs())
    );
  }

  function readRawCloudAuth() {
    try {
      var raw = window.localStorage.getItem(CLOUD_AUTH_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return o && typeof o === "object" ? o : null;
    } catch (_) {
      return null;
    }
  }

  /** OAuth access_token if present and not past expiry slack, else null. */
  function usableAccessToken() {
    var o = readRawCloudAuth();
    if (!o || typeof o.access_token !== "string" || !o.access_token) {
      return null;
    }
    var expMs = Number(o.expires_at_ms) || 0;
    if (expMs > 0 && Date.now() > expMs - 60000) {
      return null;
    }
    return o.access_token;
  }

  function cloudAuthHeaders() {
    var t = usableAccessToken();
    if (!t) return {};
    return { Authorization: "Bearer " + t };
  }

  /** Shelf UI hook — safe if #save-shelf-auth is absent. */
  function refreshShelfAuthBar() {
    var el = document.getElementById("save-shelf-auth");
    if (!el || !window.STARFALL_BUTTERBASE) return;
    var tok = usableAccessToken();
    var stale = readRawCloudAuth();
    var hasStale =
      !!(stale &&
        typeof stale.access_token === "string" &&
        stale.access_token) && !tok;

    el.innerHTML = "";

    function addOutButton() {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "Sign out";
      b.className = "story-btn story-btn-ghost save-shelf__oauth-out";
      b.addEventListener("click", function () {
        try {
          window.localStorage.removeItem(CLOUD_AUTH_KEY);
        } catch (_) {}
        refreshShelfAuthBar();
      });
      el.appendChild(b);
    }

    if (tok) {
      var lab = document.createElement("span");
      lab.className = "save-shelf__auth-label";
      lab.textContent =
        "Signed in · cloud crystals follow your Google account on each browser.";
      el.appendChild(lab);
      addOutButton();
      return;
    }

    if (hasStale) {
      var w = document.createElement("span");
      w.className = "save-shelf__auth-warn";
      w.textContent = "Cloud login expired.";
      el.appendChild(w);
    }

    var a = document.createElement("a");
    a.className = "story-btn story-btn-primary save-shelf__oauth-google";
    a.rel = "nofollow noopener";
    a.href = googleOAuthHref();
    a.textContent = "Continue with Google";
    el.appendChild(a);
  }

  function installId() {
    try {
      var cur = window.localStorage.getItem(INSTALL_KEY);
      if (cur && /^[0-9a-f-]{36}$/i.test(cur)) return cur;
      var next =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Math.random()).slice(2) + "-" + Date.now();
      window.localStorage.setItem(INSTALL_KEY, next);
      return next;
    } catch {
      var mem = "__starfallIID";
      window[mem] =
        window[mem] ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "offline-" + Date.now());
      return window[mem];
    }
  }

  function activeSlot() {
    try {
      var s = Number(window.localStorage.getItem(SLOT_KEY) || "");
      return s >= 1 && s <= 3 ? s : 0;
    } catch {
      return 0;
    }
  }

  function setActiveSlot(n) {
    try {
      if (n >= 1 && n <= 3) window.localStorage.setItem(SLOT_KEY, String(n));
      else window.localStorage.removeItem(SLOT_KEY);
    } catch (_) {}
  }

  /** @type {null | (() => { playerName: string, beatIndex: number, storyChapter?: number, storyPhase?: string, showingEnding: boolean, startedStory: boolean })} */
  var introProvider = null;

  /**
   * beatIndex === 0 is ambiguous (name vs first line); use pity pulls / unlocks as signals.
   * @param {any} blob
   */
  function inferStartedStoryFromPayload(blob) {
    if (!blob || typeof blob !== "object") return false;
    var ph = blob.storyPhase;
    if (ph === "resolution" || ph === "complete" || ph === "ending")
      return true;
    if (!!blob.showingEnding) return true;

    var sch = Number(blob.storyChapter);
    if (sch >= 2 && sch <= 3) return true;

    var beat =
      typeof blob.beatIndex === "number"
        ? blob.beatIndex
        : Number(blob.beatIndex) || 0;
    if (beat > 0) return true;

    var pity =
      blob.pity && typeof blob.pity === "object" ? blob.pity : null;
    if (pity != null && Number(pity.totalPulls) > 0) return true;

    var ids = blob.unlockIds;
    if (Array.isArray(ids) && ids.length > 0) return true;

    if (typeof blob.startedStory === "boolean") return blob.startedStory;

    return false;
  }

  function consumeBootstrap() {
    try {
      var raw = window.sessionStorage.getItem(BOOT_KEY);
      if (!raw) return;
      window.sessionStorage.removeItem(BOOT_KEY);
      var data = JSON.parse(raw);
      if (!data || typeof data.slot !== "number") return;

      var slotNum = Number(data.slot);
      if (!(slotNum >= 1 && slotNum <= 3)) return;
      setActiveSlot(slotNum);

      if (
        typeof window.Starfall !== "undefined" &&
        data.unlockIds &&
        Array.isArray(data.unlockIds)
      ) {
        window.Starfall.Unlocks.saveUnlockIds(
          /** @type {number[]} */ (data.unlockIds)
        );
      }
      if (
        typeof window.Starfall !== "undefined" &&
        data.pity &&
        typeof data.pity === "object"
      ) {
        window.Starfall.Persistence.savePity({
          pullsSinceFive: Number(data.pity.pullsSinceFive) || 0,
          pullsSinceFourPlus: Number(data.pity.pullsSinceFourPlus) || 0,
          totalPulls: Number(data.pity.totalPulls) || 0,
        });
      }

      window.__STAR_INTRO_BOOT__ = {
        playerName:
          typeof data.playerName === "string" ? data.playerName : "Traveler",
        beatIndex: Math.max(
          0,
          Math.min(
            typeof data.beatIndex === "number"
              ? data.beatIndex
              : Number(data.beatIndex) || 0,
            9999
          )
        ),
        storyChapter:
          typeof data.storyChapter === "number" &&
          data.storyChapter >= 1 &&
          data.storyChapter <= 3
            ? data.storyChapter
            : 1,
        storyPhase:
          typeof data.storyPhase === "string" &&
          (data.storyPhase === "beats" ||
            data.storyPhase === "ending" ||
            data.storyPhase === "resolution" ||
            data.storyPhase === "complete")
            ? data.storyPhase
            : data.showingEnding
              ? "ending"
              : "beats",
        showingEnding: !!data.showingEnding,
        startedStory: inferStartedStoryFromPayload(data),
      };
    } catch (_) {}
  }

  consumeBootstrap();

  /** @returns {SavePayload} */
  function snapshotPayload(slotOverride) {
    var slotUse = slotOverride || activeSlot();
    var pity =
      typeof window.Starfall !== "undefined"
        ? window.Starfall.Persistence.loadPity()
        : { pullsSinceFive: 0, pullsSinceFourPlus: 0, totalPulls: 0 };
    var unlockIds =
      typeof window.Starfall !== "undefined"
        ? window.Starfall.Unlocks.parseUnlockSnapshot()
        : [];

    var intro = introProvider ? introProvider() : null;

    return {
      schemaVersion: 1,
      slot: slotUse,
      pity: pity,
      unlockIds: unlockIds.slice(),
      playerName: intro && intro.playerName ? intro.playerName : "Traveler",
      beatIndex: intro ? intro.beatIndex : 0,
      storyChapter:
        intro &&
        typeof intro.storyChapter === "number" &&
        intro.storyChapter >= 1 &&
        intro.storyChapter <= 3
          ? intro.storyChapter
          : 1,
      storyPhase:
        intro &&
        typeof intro.storyPhase === "string" &&
        (intro.storyPhase === "beats" ||
          intro.storyPhase === "ending" ||
          intro.storyPhase === "resolution" ||
          intro.storyPhase === "complete")
          ? intro.storyPhase
          : intro && intro.showingEnding
            ? "ending"
            : "beats",
      showingEnding: intro ? !!intro.showingEnding : false,
      startedStory: intro ? !!intro.startedStory : false,
    };
  }

  /** @returns {Promise<unknown>} */
  function persistNow() {
    var slot = activeSlot();
    var url = cfg().SAVE_FN_URL;
    if (!(slot >= 1 && slot <= 3)) return Promise.resolve(true);

    var body = snapshotPayload(slot);
    var label = body.playerName || "Traveler";
    /** @type {SavePayload} */
    var payload = {
      pity: body.pity,
      unlockIds: body.unlockIds,
      playerName: body.playerName,
      beatIndex: body.beatIndex,
      storyChapter: body.storyChapter,
      storyPhase: body.storyPhase,
      showingEnding: body.showingEnding,
      startedStory: !!body.startedStory,
      schemaVersion: 1,
    };

    var headers = Object.assign({}, cloudAuthHeaders(), {
      "Content-Type": "application/json",
    });

    return window
      .fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          action: "save",
          installation_id: installId(),
          slot_index: slot,
          label: label,
          payload: payload,
        }),
      })
      .then(function (res) {
        if (!res.ok) throw new Error("save_failed");
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  /** @returns {Promise<unknown>} */
  function reloadFromCloud(slot) {
    var url = cfg().SAVE_FN_URL;
    var headers = Object.assign({}, cloudAuthHeaders(), {
      "Content-Type": "application/json",
    });

    return window
      .fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          action: "list",
          installation_id: installId(),
        }),
      })
      .then(function (res) {
        if (!res.ok) throw new Error("list_failed");
        return res.json();
      })
      .then(function (data) {
        var rows = Array.isArray(data.slots) ? data.slots : [];
        /** @type {any} */
        var row = rows.find(function (r) {
          return Number(r.slot_index) === slot;
        });

        /** @type {SavePayload|null} */
        var pl = row && row.payload ? row.payload : null;
        if (!pl || typeof pl !== "object") {
          return Promise.resolve(null);
        }

        /** @type {SavePayload & {slot: number}} */
        var boot = {
          schemaVersion: 1,
          slot: slot,
          playerName:
            typeof pl.playerName === "string" ? pl.playerName : "Traveler",
          beatIndex:
            typeof pl.beatIndex === "number"
              ? pl.beatIndex
              : Number(pl.beatIndex) || 0,
          storyChapter:
            typeof pl.storyChapter === "number" &&
            pl.storyChapter >= 1 &&
            pl.storyChapter <= 3
              ? pl.storyChapter
              : 1,
          storyPhase:
            typeof pl.storyPhase === "string" &&
            (pl.storyPhase === "beats" ||
              pl.storyPhase === "ending" ||
              pl.storyPhase === "resolution" ||
              pl.storyPhase === "complete")
              ? pl.storyPhase
              : pl.showingEnding
                ? "ending"
                : "beats",
          showingEnding: !!pl.showingEnding,
          unlockIds:
            Array.isArray(pl.unlockIds) &&
            pl.unlockIds.every(function (n) {
              return typeof n === "number";
            })
              ? pl.unlockIds.slice()
              : [],
          pity:
            pl.pity && typeof pl.pity === "object"
              ? {
                  pullsSinceFive: Number(pl.pity.pullsSinceFive) || 0,
                  pullsSinceFourPlus: Number(pl.pity.pullsSinceFourPlus) || 0,
                  totalPulls: Number(pl.pity.totalPulls) || 0,
                }
              : {
                  pullsSinceFive: 0,
                  pullsSinceFourPlus: 0,
                  totalPulls: 0,
                },
        };

        boot.startedStory = inferStartedStoryFromPayload({
          startedStory:
            typeof pl.startedStory === "boolean" ? pl.startedStory : undefined,
          beatIndex: boot.beatIndex,
          showingEnding: boot.showingEnding,
          storyPhase: boot.storyPhase,
          pity: boot.pity,
          unlockIds: boot.unlockIds,
        });
        try {
          sessionStorage.setItem(BOOT_KEY, JSON.stringify(boot));
        } catch (_) {}
        window.location.reload();
        return boot;
      });
  }

  var persistTimer = 0;

  /** @returns {void} */
  function schedulePersist() {
    window.clearTimeout(persistTimer);
    persistTimer = window.setTimeout(function () {
      persistNow();
    }, 900);
  }

  /** @returns {void} */
  function resetStarfallLocals() {
    try {
      if (typeof Starfall !== "undefined") {
        localStorage.removeItem(Starfall.Unlocks.STORAGE_KEY);
        localStorage.removeItem(Starfall.Persistence.PITY_STORAGE_KEY);
      }
    } catch (_) {}
    try {
      window.dispatchEvent(new CustomEvent("starfall-local-reset"));
    } catch (_) {}
  }

  window.SaveSession = {
    BOOT_KEY: BOOT_KEY,
    installId: installId,
    activeSlot: activeSlot,
    setActiveSlot: setActiveSlot,
    setIntroProvider: function (fn) {
      introProvider = typeof fn === "function" ? fn : null;
    },

    reloadFromCloud: reloadFromCloud,
    persistNow: persistNow,
    schedulePersist: schedulePersist,

    /** True if save data indicates the reader should skip name entry — see inferStartedStoryFromPayload */
    inferStoryStarted: inferStartedStoryFromPayload,

    resetStarfallLocals: resetStarfallLocals,

    /** @returns {Promise<any>} */
    listRemoteSlots: function () {
      var url = cfg().SAVE_FN_URL;
      var headers = Object.assign({}, cloudAuthHeaders(), {
        "Content-Type": "application/json",
      });
      return window
        .fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            action: "list",
            installation_id: installId(),
          }),
        })
        .then(function (res) {
          return res.ok ? res.json() : Promise.reject(new Error("list_failed"));
        });
    },

    oauthGoogleHref: googleOAuthHref,
    refreshShelfAuthBar: refreshShelfAuthBar,
  };
})();
