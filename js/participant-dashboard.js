sessionStorage.setItem("iccaCurrentUserRole", "participant");
if (!sessionStorage.getItem("iccaCurrentUserId")) {
  sessionStorage.setItem("iccaCurrentUserId", "user_2");
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("participant", "dashboard");
  }
});
