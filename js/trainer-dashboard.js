sessionStorage.setItem("iccaCurrentUserRole", "trainer");
if (!sessionStorage.getItem("iccaCurrentUserId")) {
  sessionStorage.setItem("iccaCurrentUserId", "trainer_1");
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderWorkspacePage === "function") {
    renderWorkspacePage("trainer", "dashboard");
  }
});
