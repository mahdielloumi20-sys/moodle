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


// --- FLUX MOT DE PASSE OUBLIÉ DÉDIÉ À VOTRE INSTANCE ---

// Étape 1 : L'utilisateur demande un lien de réinitialisation
async function triggerPasswordReset() {
  const emailInput = document.getElementById("loginEmail");
  const email = emailInput.value.trim();

  if (!email) {
    showToast("Veuillez saisir votre adresse e-mail dans le champ ci-dessus.", "info");
    emailInput.focus();
    return;
  }

  // Récupération de votre client Supabase personnalisé
  const supabase = window.supabaseInstance || window.initSupabaseClient();
  if (!supabase) {
    showToast("Le client Supabase n'est pas initialisé.", "danger");
    return;
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    
    // Appel via votre instance officielle
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    showToast("Si le compte existe, un e-mail de réinitialisation vous a été envoyé.", "success");
  } catch (error) {
    showToast(error.message || "Une erreur est survenue.", "danger");
  }
}

// Étape 2 : Détection du retour de l'utilisateur (Lien cliqué dans l'e-mail)
document.addEventListener("DOMContentLoaded", () => {
  // Vos configurations de comptes démo existantes
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  if (emailInput && passwordInput) {
    emailInput.value = DEMO_ACCOUNTS.participant.email;
    passwordInput.value = DEMO_ACCOUNTS.participant.password;
  }

  // Écoute de l'URL contenant le token de récupération (recovery)
  if (window.location.hash && window.location.hash.includes("type=recovery")) {
    // Un léger timeout permet à supabaseInstance de finaliser la capture de session en arrière-plan
    window.setTimeout(() => {
      openResetModal();
    }, 500);
  }
});

function openResetModal() {
  const modal = document.getElementById("resetModal");
  if (modal) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("newPassword").focus();
  }
}

function closeResetModal() {
  const modal = document.getElementById("resetModal");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
  // Nettoyage propre de l'URL pour retirer les tokens d'accès sensibles
  window.history.replaceState(null, null, window.location.pathname);
}

// Étape 3 : Validation et Envoi du nouveau mot de passe
async function handlePasswordUpdate() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMsg = document.getElementById("passwordError");

  if (newPassword !== confirmPassword) {
    errorMsg.style.display = "block";
    return;
  } else {
    errorMsg.style.display = "none";
  }

  const supabase = window.supabaseInstance || window.initSupabaseClient();
  if (!supabase) {
    showToast("Le client Supabase n'est pas disponible.", "danger");
    return;
  }

  try {
    // Mise à jour de l'utilisateur actuellement authentifié via le lien email
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    showToast("Votre mot de passe a été mis à jour avec succès !", "success");
    closeResetModal();
  } catch (error) {
    showToast(error.message || "Impossible de mettre à jour le mot de passe.", "danger");
  }
}