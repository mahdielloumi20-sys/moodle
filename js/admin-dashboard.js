document.addEventListener("DOMContentLoaded", async () => {
  // 1. Vérifier si on a une session via le sessionStorage (connexion via auth-supabase.js)
  const hasCustomSession = !!sessionStorage.getItem("iccaAccessToken");

  // 2. Vérifier si on a une session via le SDK Supabase (secours)
  const sessionResult = window.supabaseInstance?.auth?.getSession
    ? await window.supabaseInstance.auth.getSession()
    : { data: { session: null } };
  const { data: { session } } = sessionResult;

  // 3. Validation : si aucune session, rediriger vers le login
  if (!hasCustomSession && !session?.user) {
    console.warn("Session non trouvée, redirection vers le login.");
    window.location.href = "../html/login.html";
    return;
  }

  // 4. Vérifier le rôle réel UNIQUEMENT si iccaAuthenticatedUserRole est absent
  //    On utilise iccaCurrentUserId (écrit à la connexion) — jamais session.user.id
  //    car le SDK peut garder la session d'un autre utilisateur (ex: Mahdi Feki)
  const storedUserId = sessionStorage.getItem("iccaCurrentUserId");
  const alreadyHasRole = !!sessionStorage.getItem("iccaAuthenticatedUserRole");

  if (!alreadyHasRole && storedUserId && window.supabaseInstance) {
    try {
      const { data: profile } = await window.supabaseInstance
        .from("profiles")
        .select("role")
        .eq("id", storedUserId)
        .limit(1)
        .maybeSingle();
      if (profile?.role) {
        sessionStorage.setItem("iccaAuthenticatedUserRole", profile.role);
      }
    } catch (e) {
      console.warn("[admin-dashboard] Impossible de vérifier le rôle Supabase :", e.message);
    }
  }

  // 5. Redirection basée UNIQUEMENT sur iccaAuthenticatedUserRole
  const actualRole = sessionStorage.getItem("iccaAuthenticatedUserRole");
  if (actualRole === "trainer") {
    window.location.replace("../html/trainer-dashboard.html");
    return;
  }
  if (actualRole === "participant") {
    window.location.replace("../html/participant-dashboard.html");
    return;
  }

  // Remettre iccaCurrentUserRole en cohérence
  sessionStorage.setItem("iccaCurrentUserRole", "admin");

  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("admin", "dashboard");
  }
});