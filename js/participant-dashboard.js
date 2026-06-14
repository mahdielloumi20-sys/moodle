document.addEventListener("DOMContentLoaded", async () => {
  // 1. Vérifier si on a une session via ton propre système (sessionStorage)
  const hasCustomSession = !!sessionStorage.getItem("iccaAccessToken");

  // 2. Vérifier si on a une session via le SDK Supabase (au cas où)
  const { data: { session } } = await window.supabaseInstance.auth.getSession();

  // 3. Si aucun des deux n'est présent, on redirige vers le login
  if (!hasCustomSession && !session?.user) {
    console.warn("Aucune session trouvée, redirection vers le login.");
    window.location.href = "../html/login.html";
    return;
  }

  // 4. Si la session existe, on assure la cohérence de l'ID utilisateur
  if (session?.user) {
    sessionStorage.setItem("iccaCurrentUserId", session.user.id);
  }

  // 5. On affiche la page
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("participant", "dashboard");
  }
});