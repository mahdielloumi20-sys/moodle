# moodle

## Connexion Supabase

Ce projet utilise Supabase pour l'authentification par e-mail et mot de passe.

### 1. Variables d'environnement

Le projet lit les valeurs Supabase via `js/env.js`, généré à partir de `.env`.

Variables attendues :

```env
SUPABASE_URL=https://rizudkdynwtyrhxflqa.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_5ki77V65y3jBsqWe2xjXsA_g53tQpHy
```

### 2. SQL à exécuter dans Supabase

Ouvre l'éditeur SQL Supabase et exécute `supabase-setup.sql`.

Ce script crée :

- la table `public.profiles`
- les politiques RLS pour lire et modifier son propre profil
- le trigger qui crée automatiquement le profil à l'inscription

### 3. Comptes à créer dans Supabase

Dans Supabase, crée un utilisateur Auth pour chaque rôle :

- un administrateur
- un formateur
- un utilisateur simple

Pour chaque compte, renseigne dans les métadonnées utilisateur :

```json
{
  "role": "admin",
  "first_name": "Karim",
  "last_name": "Karray"
}
```

Utilise `admin`, `trainer` ou `participant` comme valeur de rôle.

### 4. Vérifications importantes

- Vérifie que le provider **Email** est activé dans Supabase Auth.
- Si les e-mails de confirmation sont activés, il faudra confirmer les comptes avant connexion.
- Le `publishable key` n'est pas un secret, mais ne mets jamais la `service_role key` dans le front-end.

### 5. Flux de login

La page de connexion appelle `signInWithPassword`, puis lit `public.profiles.role` pour rediriger vers :

- `admin-dashboard.html`
- `trainer-dashboard.html`
- `participant-dashboard.html`

### 6. Tester la connexion

Ouvre la page de connexion dans ton serveur local habituel puis teste avec les e-mails et mots de passe créés dans Supabase.

Si tu vois encore `Failed to fetch`, vérifie :

- l'URL Supabase dans `.env`
- que le fichier `js/env.js` a bien été généré
- que le navigateur charge bien `js/auth-supabase.js`
- que le compte est confirmé si la confirmation e-mail est activée
