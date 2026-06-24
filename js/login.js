const DEMO_ACCOUNTS = {
  participant: {
    email: "mahdielloumi12@gmail.com",
    password: "mahdi123"
  },
  trainer: {
    email: "mahdielloumi20@gmail.com",
    password: "mahdi123"
  },
  admin: {
    email: "fkiyoussef8@gmail.com",
    password: "youssef123"
  }
};

function fillDemoAccount(role) {
  const account = DEMO_ACCOUNTS[role];
  if (!account) return;

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  emailInput.value = account.email;
  passwordInput.value = account.password;
  passwordInput.focus();

  showToast(`Compte ${role} pret a utiliser.`, "info");
}

async function handleLogin() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const result = await window.signInWithSupabase(email, password);
    const firstName = result.profile?.first_name || result.user?.email || "Utilisateur";
    showToast(`Bienvenue ${firstName} !`, "success");

    window.setTimeout(() => {
      window.location.href = result.redirectTo;
    }, 450);
  } catch (error) {
    const message = error?.message || "La connexion a echoue.";
    showToast(message, "danger");
    passwordInput.focus();
  }
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

  emailInput.value = DEMO_ACCOUNTS.participant.email;
  passwordInput.value = DEMO_ACCOUNTS.participant.password;
});
