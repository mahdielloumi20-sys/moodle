window.getSupabaseConfig = function getSupabaseConfig() {
  const env = window.APP_ENV || {};
  const url = String(env.SUPABASE_URL || window.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = String(env.SUPABASE_PUBLISHABLE_KEY || window.SUPABASE_PUBLISHABLE_KEY || "").trim();

  if (!url || !key) {
    throw new Error("Configuration Supabase manquante. Vérifie js/env.js et .env.");
  }

  return { url, key };
};

window.getSupabaseHeaders = function getSupabaseHeaders(accessToken = null) {
  const { key } = window.getSupabaseConfig();
  const headers = {
    apikey: key,
    Authorization: accessToken ? `Bearer ${accessToken}` : `Bearer ${key}`,
    "Content-Type": "application/json"
  };

  return headers;
};

window.getSupabaseUrl = function getSupabaseUrl(path) {
  const { url } = window.getSupabaseConfig();
  return `${url}${path.startsWith("/") ? path : `/${path}`}`;
};

document.addEventListener("DOMContentLoaded", () => {
  try {
    window.getSupabaseConfig();
  } catch (error) {
    console.warn(error.message);
  }
});

// ... (Tu gardes tout ton code existant au-dessus : getSupabaseConfig, getSupabaseUrl, etc.)

try {
  // 1. On récupère proprement l'URL et la clé nettoyées
  const config = window.getSupabaseConfig();

  // 2. On initialise le client officiel Supabase depuis l'objet global du CDN
  const client = window.supabase.createClient(config.url, config.key);

  // 3. On l'attache DIRECTEMENT à window.supabaseInstance pour qu'il soit accessible partout !
  window.supabaseInstance = client;

  console.log("✅");
} catch (error) {
  console.error("Erreur lors de l'initialisation du client Supabase :", error.message);
}