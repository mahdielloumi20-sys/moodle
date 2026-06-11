

function translateError(message) {
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
    if (message.includes("Email not confirmed")) return "Veuillez confirmer votre email.";
    if (message.includes("User already registered")) return "Cet email est déjà utilisé.";
    if (message.includes("Password should be at least")) return "Mot de passe trop court (min 6 caractères).";
    return "Une erreur est survenue. Réessayez.";
}

function showError(id, message, isSuccess = false) {
    const box = document.getElementById(id);
    if (!box) {
        console.error("Element introuvable :", id);
        return;
    }
    box.textContent = message;
    box.style.display = "block";
    
    if (isSuccess) {
        box.style.backgroundColor = "#d4edda";
        box.style.color = "#155724";
        box.style.borderColor = "#c3e6cb";
    } else {
        box.style.backgroundColor = ""; // Reprend le style CSS d'erreur par défaut
        box.style.color = "";
    }
}

/* =========================
   SIGNUP (INSCRIPTION)
========================= */
const signupForm = document.getElementById('registerForm'); // Assure-toi que ton <form> HTML a bien id="registerForm"

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupération des valeurs de tes 5 champs
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const firstName = document.getElementById('regFirstName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();

        // Vérification de sécurité
        if (!email || !password || !firstName || !lastName || !phone) {
            showError("signup-error", "Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Appel au SDK Supabase
        const { data, error } = await window.supabaseInstance.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: { 
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone
                }
            }
        });

        console.log("Supabase response:", data, error);

        if (error) {
            showError("signup-error", translateError(error.message), false);
        } else {
            showError("signup-error", "Compte créé avec succès !", true);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    });
}

// Masquer la boîte d'erreur dès que l'utilisateur modifie un champ
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
        const errorBox = document.getElementById("signup-error");
        if (errorBox) errorBox.style.display = "none";
    });
});