const SUPABASE_ROLE_ROUTES = {
  admin: "admin-dashboard.html",
  trainer: "trainer-dashboard.html",
  participant: "participant-dashboard.html"
};

function normalizeWorkspaceRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return SUPABASE_ROLE_ROUTES[normalized] ? normalized : null;
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = window.getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: options.headers?.Authorization || `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    mode: "cors",
    credentials: "omit"
  });

  const rawText = await response.text();
  let data = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message = data?.msg || data?.error_description || data?.message || `Erreur Supabase (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

window.getWorkspaceRouteForRole = function getWorkspaceRouteForRole(role) {
  const normalizedRole = normalizeWorkspaceRole(role);
  return SUPABASE_ROLE_ROUTES[normalizedRole || "participant"] || SUPABASE_ROLE_ROUTES.participant;
};

window.signInWithSupabase = async function signInWithSupabase(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  if (!cleanEmail || !cleanPassword) {
    throw new Error("L'adresse e-mail et le mot de passe sont obligatoires.");
  }

  let authData;
  try {
    authData = await supabaseRequest(`/auth/v1/token?grant_type=password`, {
      method: "POST",
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword
      })
    });
  } catch (error) {
    if (error?.status === 400 || error?.status === 401) {
      throw new Error("Identifiants invalides ou compte non confirmé.");
    }
    if (String(error?.message || "").toLowerCase().includes("failed to fetch")) {
      throw new Error("Le navigateur ne peut pas joindre Supabase. Dans Supabase, ajoute aussi http://127.0.0.1:5500 et http://localhost:5500 dans URL Configuration, puis réessaie.");
    }
    throw error;
  }

  const authUser = authData?.user;
  const accessToken = authData?.access_token;

  if (!authUser || !accessToken) {
    throw new Error("Réponse Supabase incomplète.");
  }

  let profile = null;
  try {
    const profileData = await supabaseRequest(
      `/rest/v1/profiles?select=id,email,first_name,last_name,role&id=eq.${encodeURIComponent(authUser.id)}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation"
        }
      }
    );
    profile = Array.isArray(profileData) ? profileData[0] : null;
  } catch {
    const fallbackRole = normalizeWorkspaceRole(
      authUser.user_metadata?.role || authUser.app_metadata?.role
    );
    profile = {
      id: authUser.id,
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || "",
      last_name: authUser.user_metadata?.last_name || "",
      role: fallbackRole || "participant"
    };
  }

  const role = normalizeWorkspaceRole(profile.role) || "participant";
  const redirectTo = window.getWorkspaceRouteForRole(role);
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || authUser.email || "Utilisateur";

  sessionStorage.setItem("iccaCurrentUserId", authUser.id);
  sessionStorage.setItem("iccaCurrentUserRole", role);
  sessionStorage.setItem("iccaCurrentUserEmail", authUser.email || cleanEmail);
  sessionStorage.setItem("iccaCurrentUserName", displayName);
  sessionStorage.setItem("iccaAccessToken", accessToken);
  sessionStorage.setItem("iccaRefreshToken", authData.refresh_token || "");

  return {
    user: authUser,
    profile,
    role,
    redirectTo
  };
};
