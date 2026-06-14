document.addEventListener("DOMContentLoaded", async () => {
  // 1. Vérifier si on a une session via ton système (sessionStorage)
  const hasCustomSession = !!sessionStorage.getItem("iccaAccessToken");

  // 2. Vérifier si on a une session via le SDK Supabase (secours)
  const { data: { session } } = await window.supabaseInstance.auth.getSession();

  // 3. Validation : Si aucun des deux n'existe, on bloque et on redirige
  if (!hasCustomSession && !session?.user) {
    console.warn("Session non trouvée, redirection vers le login.");
    window.location.href = "../html/login.html";
    return;
  }

  // 4. Si la session SDK existe, on synchronise l'ID utilisateur
  if (session?.user) {
    sessionStorage.setItem("iccaCurrentUserId", session.user.id);
  }

  // 5. Initialisation propre (On définit le rôle et on affiche la page)
  sessionStorage.setItem("iccaCurrentUserRole", "trainer");
  
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("trainer", "dashboard");
  }
});