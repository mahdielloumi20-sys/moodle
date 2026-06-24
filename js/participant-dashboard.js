document.addEventListener("DOMContentLoaded", async () => {
  // 1. Vérifier si on a une session via le sessionStorage
  const hasCustomSession = !!sessionStorage.getItem("iccaAccessToken");

  // 2. Vérifier si on a une session via le SDK Supabase (secours)
  const sessionResult = window.supabaseInstance?.auth?.getSession
    ? await window.supabaseInstance.auth.getSession()
    : { data: { session: null } };
  let { data: { session } } = sessionResult;

  // Tentative de restauration de session via les tokens stockés
  if (!session && sessionStorage.getItem("iccaAccessToken") && sessionStorage.getItem("iccaRefreshToken") && window.supabaseInstance?.auth?.setSession) {
    const restored = await window.supabaseInstance.auth.setSession({
      access_token: sessionStorage.getItem("iccaAccessToken"),
      refresh_token: sessionStorage.getItem("iccaRefreshToken")
    });
    session = restored.data?.session || null;
  }

  // 3. Si aucune session, rediriger vers le login
  if (!hasCustomSession && !session?.user) {
    console.warn("Aucune session trouvée, redirection vers le login.");
    window.location.href = "../html/login.html";
    return;
  }

  // 4. Vérifier le rôle réel UNIQUEMENT si iccaAuthenticatedUserRole est absent
  //    On utilise iccaCurrentUserId (écrit à la connexion) — jamais session.user.id
  //    car le SDK peut garder la session d'un autre utilisateur
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
      console.warn("[participant-dashboard] Impossible de vérifier le rôle Supabase :", e.message);
    }
  }

  // 5. Redirection basée UNIQUEMENT sur iccaAuthenticatedUserRole
  const actualRole = sessionStorage.getItem("iccaAuthenticatedUserRole");
  if (actualRole === "admin") {
    window.location.replace("../html/admin-dashboard.html");
    return;
  }
  if (actualRole === "trainer") {
    window.location.replace("../html/trainer-dashboard.html");
    return;
  }

  // 6. Afficher la page participant
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("participant", "dashboard");
  }
});