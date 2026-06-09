sessionStorage.setItem("iccaCurrentUserRole", "trainer");
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await window.supabaseInstance.auth.getSession();
  if (!session?.user) {
    window.location.href = "../index.html"; // redirige vers login si pas connecté
    return;
  }
  sessionStorage.setItem("iccaCurrentUserId", session.user.id);
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("participant", "dashboard");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("trainer", "dashboard");
  }
});
