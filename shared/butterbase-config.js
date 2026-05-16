/**
 * Butterbase (cloud) identifiers for Starfall Reverie.
 * Provisioned MCP app + HTTP function save-slots.
 *
 * Google sign-in requires an OAuth Client whose authorized redirect URIs include
 * https://api.butterbase.ai/auth/app_fsnh32adbjpf/oauth/google/callback —
 * configure the client in Butterbase (e.g. manage_oauth configure) with that callback.
 */
window.STARFALL_BUTTERBASE = Object.freeze({
  APP_ID: "app_fsnh32adbjpf",
  API_ORIGIN: "https://api.butterbase.ai",
  SAVE_FN_URL:
    "https://api.butterbase.ai/v1/app_fsnh32adbjpf/fn/save-slots",
});
