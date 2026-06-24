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

window.initSupabaseClient = function initSupabaseClient() {
  if (window.supabaseInstance) return window.supabaseInstance;
  if (!window.supabase?.createClient) {
    console.warn("SDK Supabase non charge.");
    return null;
  }

  const { url, key } = window.getSupabaseConfig();
  window.supabaseInstance = window.supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return window.supabaseInstance;
};

document.addEventListener("DOMContentLoaded", () => {
  try {
    window.getSupabaseConfig();
    window.initSupabaseClient();
  } catch (error) {
    console.warn(error.message);
  }
});
