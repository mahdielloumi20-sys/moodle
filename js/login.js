const users = [
  {
    id: "admin_1",
    firstName: "Karim",
    lastName: "Karray",
    email: "k.karray@iccanada.ca",
    role: "admin"
  },
  {
    id: "trainer_1",
    firstName: "Leïla",
    lastName: "Bensaïd",
    email: "l.bensaid@iccanada.ca",
    role: "trainer"
  },
  {
    id: "user_2",
    firstName: "Sarah",
    lastName: "Trabelsi",
    email: "s.trabelsi@example.com",
    role: "participant"
  }
];

const routesByRole = {
  admin: "admin-dashboard.html",
  trainer: "admin-dashboard.html",
  participant: "admin-dashboard.html"
};

function getUser(userId) {
  return users.find(user => user.id === userId);
}

function handleLogin() {
  const emailInput = document.getElementById("loginEmail");
  const email = emailInput.value.trim().toLowerCase();
  const user = users.find(item => item.email.toLowerCase() === email);

  if (!user) {
    showToast("Adresse e-mail introuvable. Utilisez les comptes de démo ci-dessus.", "danger");
    emailInput.focus();
    return;
  }

  loginAs(user.id);
}

function loginAs(userId) {
  const user = getUser(userId);
  if (!user) return;

  sessionStorage.setItem("iccaCurrentUserId", user.id);
  sessionStorage.setItem("iccaCurrentUserRole", user.role);
  showToast(`Bienvenue ${user.firstName} !`, "success");

  const target = routesByRole[user.role] || "admin-dashboard.html";
  window.setTimeout(() => {
    window.location.href = target;
  }, 450);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  emailInput.value = "s.trabelsi@example.com";
  passwordInput.value = "demo";
});
