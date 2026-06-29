let users = [];
let courses = [];
let enrollments = [];
let enrollmentRequests = [];
let payments = [];
let certificates = [];
let activityLog = [];
let groups = [];
let accessRules = [];

// ─── Persistance locale des demandes (mode démo sans Supabase) ─────────────
const REQUESTS_STORAGE_KEY = "icca_enrollment_requests";

function saveRequestsToStorage() {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(enrollmentRequests));
  } catch {}
}

function loadRequestsFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && saved.length > 0) {
      // Merge: Supabase data takes priority, demo requests fill the rest
      enrollmentRequests = saved;
    }
  } catch {}
}

// Chargement immédiat au démarrage (avant Supabase)
loadRequestsFromStorage();

// ─── Persistance locale des cours importés via ZIP (mode démo sans Supabase) ──
const IMPORTED_COURSES_STORAGE_KEY = "icca_imported_courses";

function saveImportedCoursesToStorage() {
  try {
    const imported = courses.filter(c => c.isLocalImport);
    localStorage.setItem(IMPORTED_COURSES_STORAGE_KEY, JSON.stringify(imported));
  } catch {}
}

function loadImportedCoursesFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(IMPORTED_COURSES_STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      saved.forEach(savedCourse => {
        if (!courses.some(c => c.id === savedCourse.id)) {
          courses.push(savedCourse);
        }
      });
    }
  } catch {}
}

loadImportedCoursesFromStorage();

// ─── Catalogue démo ────────────────────────────────────────────────────────────
// Ces cours s'affichent toujours dans le catalogue du participant (démo locale).
// Quand Supabase est connecté, ils sont remplacés par les vraies données.
const DEMO_CATALOG_COURSES = [
  {
    id: "demo_cyber",
    title: "Cybersécurité Fondamentale",
    status: "published",
    trainerId: "trainer_2",
    category: "Sécurité",
    duration: "24h",
    price: 299,
    level: "Débutant",
    description: "Maîtrisez les bases de la cybersécurité : menaces, cryptographie, sécurité réseau et bonnes pratiques RGPD. Inclut des labs pratiques et un quiz final certifiant.",
    modules: [
      { title: "Introduction aux cybermenaces", desc: "Phishing, ransomware, ingénierie sociale – identifier et se protéger." },
      { title: "Cryptographie & PKI", desc: "Chiffrement symétrique/asymétrique, certificats SSL/TLS." },
      { title: "Sécurité réseau", desc: "Firewalls, VPN, intrusion detection, segmentation réseau." },
      { title: "Conformité & RGPD", desc: "Obligations légales, gestion des données personnelles." }
    ],
    quiz: [
      { title: "Quiz – Cybermenaces", questions: 15 },
      { title: "Quiz – Cryptographie", questions: 12 },
      { title: "Examen final certifiant", questions: 40 }
    ],
    sessions: [
      { title: "Séance Zoom – Intro Cybersécurité", startsAt: "2026-07-05T14:00:00", type: "zoom" },
      { title: "Atelier Lab – Analyse de vulnérabilités", startsAt: "2026-07-12T10:00:00", type: "atelier" },
      { title: "Séance Zoom – Révisions & QnA", startsAt: "2026-07-19T14:00:00", type: "zoom" }
    ]
  },
  {
    id: "demo_ia",
    title: "Intelligence Artificielle & Productivité",
    status: "published",
    trainerId: "trainer_1",
    category: "IA & Tech",
    duration: "18h",
    price: 249,
    level: "Intermédiaire",
    description: "Exploitez les outils d'IA générative (ChatGPT, Copilot, Midjourney) pour booster votre productivité personnelle et professionnelle au quotidien.",
    modules: [
      { title: "Panorama de l'IA générative", desc: "LLMs, diffusion models, cas d'usage métier." },
      { title: "Prompt Engineering avancé", desc: "Techniques de prompting, chaînes de raisonnement." },
      { title: "Automatisation avec Copilot", desc: "Intégration Office 365, scripts no-code." },
      { title: "Éthique & gouvernance IA", desc: "Biais algorithmiques, cadre réglementaire EU AI Act." }
    ],
    quiz: [
      { title: "Quiz – Panorama IA", questions: 10 },
      { title: "Projet pratique – Automatisation", questions: 5 }
    ],
    sessions: [
      { title: "Séance Zoom – IA & Productivité", startsAt: "2026-07-08T15:00:00", type: "zoom" },
      { title: "Workshop – Prompt Engineering", startsAt: "2026-07-15T09:30:00", type: "atelier" }
    ]
  },
  {
    id: "demo_marketing",
    title: "Marketing Digital & Réseaux Sociaux",
    status: "published",
    trainerId: "trainer_2",
    category: "Marketing",
    duration: "20h",
    price: 199,
    level: "Débutant",
    description: "Créez et pilotez des campagnes digitales efficaces sur Meta, LinkedIn et TikTok. Apprenez le SEO, le content marketing et l'analyse de performance.",
    modules: [
      { title: "Stratégie digitale 360°", desc: "Positionnement, personas, entonnoir de conversion." },
      { title: "SEO & Content Marketing", desc: "Optimisation moteurs, rédaction SEO, blogging." },
      { title: "Publicité payante (SEM & Social Ads)", desc: "Google Ads, Meta Ads – ciblage et budgets." },
      { title: "Analytics & reporting", desc: "GA4, Meta Business Suite, tableaux de bord." }
    ],
    quiz: [
      { title: "Quiz – Stratégie & SEO", questions: 18 },
      { title: "Quiz – Publicité en ligne", questions: 14 }
    ],
    sessions: [
      { title: "Séance Zoom – Stratégie Marketing", startsAt: "2026-07-10T11:00:00", type: "zoom" },
      { title: "Atelier – Création de campagnes", startsAt: "2026-07-17T14:00:00", type: "atelier" }
    ]
  },
  {
    id: "demo_data",
    title: "Data Analytics & Business Intelligence",
    status: "published",
    trainerId: "trainer_2",
    category: "Data",
    duration: "30h",
    price: 349,
    level: "Avancé",
    description: "Maîtrisez Power BI, SQL et les fondamentaux de la data science pour transformer vos données brutes en insights décisionnels actionnables.",
    modules: [
      { title: "SQL pour l'analyse de données", desc: "Requêtes avancées, jointures, optimisation." },
      { title: "Power BI – Visualisation", desc: "Dashboards interactifs, DAX, publication." },
      { title: "Python pour la data", desc: "Pandas, Matplotlib, premiers modèles prédictifs." },
      { title: "Gouvernance des données", desc: "Data quality, data catalog, rôles et responsabilités." }
    ],
    quiz: [
      { title: "Quiz – SQL Fondamentaux", questions: 20 },
      { title: "Quiz – Power BI", questions: 15 },
      { title: "Examen final Data Analytics", questions: 35 }
    ],
    sessions: [
      { title: "Séance Zoom – SQL & BI", startsAt: "2026-07-07T10:00:00", type: "zoom" },
      { title: "Workshop – Power BI en pratique", startsAt: "2026-07-14T09:00:00", type: "atelier" },
      { title: "Séance Zoom – Python & Prédictif", startsAt: "2026-07-21T10:00:00", type: "zoom" }
    ]
  },
  {
    id: "demo_leadership",
    title: "Leadership & Management Agile",
    status: "published",
    trainerId: "trainer_1",
    category: "Soft Skills",
    duration: "16h",
    price: 179,
    level: "Intermédiaire",
    description: "Développez votre posture de leader agile : gestion d'équipe, communication non-violente, OKRs et conduite du changement dans les organisations modernes.",
    modules: [
      { title: "Leadership situationnel", desc: "Styles de management, adaptation au contexte." },
      { title: "Méthodes Agile & Scrum", desc: "Sprints, rétrospectives, rôles Scrum." },
      { title: "Communication & intelligence émotionnelle", desc: "Écoute active, feedback constructif." },
      { title: "OKRs & conduite du changement", desc: "Objectifs mesurables, résistance au changement." }
    ],
    quiz: [
      { title: "Quiz – Leadership", questions: 12 },
      { title: "Quiz – Agile & Scrum", questions: 16 }
    ],
    sessions: [
      { title: "Séance Zoom – Leadership Agile", startsAt: "2026-07-09T13:00:00", type: "zoom" },
      { title: "Atelier – Simulation Scrum", startsAt: "2026-07-16T09:00:00", type: "atelier" }
    ]
  },
  {
    id: "demo_nocode",
    title: "No-Code & Automatisation Web",
    status: "published",
    trainerId: "trainer_2",
    category: "Tech",
    duration: "22h",
    price: 229,
    level: "Débutant",
    description: "Créez des applications web et automatisez vos workflows sans écrire une ligne de code grâce à Bubble, Make (Integromat), Airtable et Zapier.",
    modules: [
      { title: "Introduction au No-Code", desc: "Écosystème, cas d'usage, choisir les bons outils." },
      { title: "Bubble – Créer une app web", desc: "Interface drag-and-drop, base de données, logique." },
      { title: "Make & Zapier – Automatisation", desc: "Workflows multi-étapes, intégrations API." },
      { title: "Airtable – Base de données visuelle", desc: "Vues, formules, automatisations intégrées." }
    ],
    quiz: [
      { title: "Quiz – No-Code Fondamentaux", questions: 10 },
      { title: "Projet final – Mini-app No-Code", questions: 3 }
    ],
    sessions: [
      { title: "Séance Zoom – No-Code Overview", startsAt: "2026-07-11T14:00:00", type: "zoom" },
      { title: "Workshop – Bubble & Make", startsAt: "2026-07-18T10:00:00", type: "atelier" }
    ]
  }
];

// Notification locale : stocke les décisions d'admin vues et non vues
const NOTIF_STORAGE_KEY = "icca_request_notifications";

function getUnseenNotifications(uid) {
  try {
    const seen = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "{}");
    return enrollmentRequests.filter(req =>
      req.userId === uid &&
      (req.status === "approved" || req.status === "rejected") &&
      !seen[req.id]
    );
  } catch { return []; }
}

function markNotificationsAsSeen(ids) {
  try {
    const seen = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "{}");
    ids.forEach(id => { seen[id] = true; });
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(seen));
  } catch {}
}

// Stocke temporairement les IDs de la notification affichée pour éviter
// d'injecter du JSON brut dans un attribut onclick (ce qui cassait le HTML).
let pendingNotificationIds = [];

function acknowledgeLoginNotifications() {
  markNotificationsAsSeen(pendingNotificationIds);
  pendingNotificationIds = [];
  closeModal();
}

function showLoginNotifications(uid) {
  const unseen = getUnseenNotifications(uid);
  if (!unseen.length) return;
  const lines = unseen.map(req => {
    const course = getCourseAny(req.courseId);
    const title = course ? escapeHTML(course.title) : "une formation";
    if (req.status === "approved") {
      return `
        <div class="notif-line notif-line--success" style="display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border,#e5e7eb);">
          <span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#d1fae5;display:grid;place-items:center;color:#059669;">${icon("check", 15)}</span>
          <div>
            <div style="font-weight:600;font-size:14px;">${title}</div>
            <div style="color:#059669;font-size:13px;margin-top:2px;">✅ Accès approuvé — Le cours est maintenant disponible dans <strong>Mes cours</strong>.</div>
          </div>
        </div>`;
    } else {
      return `
        <div class="notif-line notif-line--danger" style="display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border,#e5e7eb);">
          <span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#fee2e2;display:grid;place-items:center;color:#dc2626;">${icon("x", 15)}</span>
          <div>
            <div style="font-weight:600;font-size:14px;">${title}</div>
            <div style="color:#dc2626;font-size:13px;margin-top:2px;">❌ Demande refusée par l'administration. Vous pouvez renvoyer une demande depuis le catalogue.</div>
          </div>
        </div>`;
    }
  }).join("");
  const ids = unseen.map(r => r.id);
  pendingNotificationIds = ids;
  showModal(
    "🔔 Nouvelles notifications",
    `<div style="max-height:360px;overflow-y:auto;">${lines}</div>`,
    `<button class="btn btn-secondary" onclick="navigate('requests'); acknowledgeLoginNotifications();">${icon("fileText", 14)} Voir mes demandes</button>
     <button class="btn btn-primary" onclick="acknowledgeLoginNotifications();">${icon("check", 14)} Compris</button>`
  );
}

function getDemoCourse(id) {
  return DEMO_CATALOG_COURSES.find(c => c.id === id);
}

function getDemoCourseSessions(courseId) {
  const c = getDemoCourse(courseId);
  return c ? c.sessions.map((s, i) => ({ id: `sess_${courseId}_${i}`, courseId, ...s })) : [];
}

function getDemoCourseQuiz(courseId) {
  const c = getDemoCourse(courseId);
  return c ? c.quiz.map((q, i) => ({ id: `quiz_${courseId}_${i}`, courseId, ...q })) : [];
}

function getParticipantApprovedCourseIds(uid) {
  return enrollmentRequests
    .filter(req => req.userId === uid && req.status === "approved")
    .map(req => req.courseId);
}

function getParticipantAllCourses(uid) {
  // Cours via enrollments normaux
  const enrolled = getParticipantCourses(uid);
  // Cours démo approuvés (non dans enrollments)
  const approvedIds = getParticipantApprovedCourseIds(uid);
  const demoApproved = approvedIds
    .filter(id => !enrolled.some(item => item.course && item.course.id === id))
    .map(id => {
      const course = getDemoCourse(id) || getCourse(id);
      const req = enrollmentRequests.find(r => r.userId === uid && r.courseId === id);
      return {
        enrollment: { id: `enr_demo_${id}`, userId: uid, courseId: id, paymentStatus: "paid", enrollmentDate: req ? req.requestedAt : new Date().toISOString().split("T")[0] },
        course,
        progress: 0
      };
    })
    .filter(item => item.course);
  return [...enrolled, ...demoApproved];
}

function levelBadge(level) {
  const map = { "Débutant": "badge--success", "Intermédiaire": "badge--warn", "Avancé": "badge--danger" };
  return `<span class="badge ${map[level] || "badge--info"}">${escapeHTML(level)}</span>`;
}

function categoryBadge(cat) {
  return `<span class="badge badge--info">${escapeHTML(cat)}</span>`;
}

let trainerSessions = [];
let trainerEvaluations = [];
let trainerSubmissions = [];
let submissions = [];

// =============================================================================
// COUCHE SUPABASE DYNAMIQUE

// Charge les vraies données depuis Supabase et met à jour les variables ci-dessus,
// puis re-rend la page courante pour afficher les données réelles.
// =============================================================================

async function syncSupabaseData() {
  if (!window.supabaseInstance) return;
  try {
    let { data: { session } } = await window.supabaseInstance.auth.getSession();
    const storedAccessToken = sessionStorage.getItem("iccaAccessToken");
    const storedRefreshToken = sessionStorage.getItem("iccaRefreshToken");

    if (!session && storedAccessToken && storedRefreshToken && window.supabaseInstance.auth.setSession) {
      const sessionResult = await window.supabaseInstance.auth.setSession({
        access_token: storedAccessToken,
        refresh_token: storedRefreshToken
      });
      session = sessionResult.data?.session || null;
    }

    // ⚠️ Priorité absolue à iccaCurrentUserId (écrit par auth-supabase.js après vérification du profil).
    // session.user.id peut être périmé si le SDK Supabase garde la session d'un utilisateur précédent.
    const currentUserId = sessionStorage.getItem("iccaCurrentUserId") || session?.user?.id;
    if (!currentUserId) return;

    // --- Profils (utilisateurs) ---
    let { data: profilesData } = await window.supabaseInstance
      .from('profiles')
      .select('id, email, first_name, last_name, role');

    const storedRole = sessionStorage.getItem("iccaAuthenticatedUserRole") || sessionStorage.getItem("iccaCurrentUserRole");
    if (storedRole === "admin" && (!profilesData || profilesData.length <= 1)) {
      const { data: adminProfilesData, error: adminProfilesError } = await window.supabaseInstance
        .rpc("admin_list_profiles");

      if (!adminProfilesError && adminProfilesData) {
        profilesData = adminProfilesData;
      }
    }

    if (profilesData && profilesData.length > 0) {
      users = profilesData.map(p => ({
        id: p.id,
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        role: p.role || "participant",
        email: p.email || "",
        avatar: ((p.first_name?.[0] || "") + (p.last_name?.[0] || "")).toUpperCase() || ""
      }));
    }

    // --- Formations ---
    const { data: coursesData } = await window.supabaseInstance
      .from('courses')
      .select('id, title, status, trainer_id');
    if (coursesData && coursesData.length > 0) {
      courses = coursesData.map(c => ({
        id: c.id,
        title: c.title || "Sans titre",
        status: c.status || "draft",
        trainerId: c.trainer_id || null
      }));
    }
    // Les cours importés localement (ZIP, mode démo) ne sont pas encore dans
    // le schéma Supabase complet : on les remet dans la liste s'ils manquent.
    loadImportedCoursesFromStorage();

    // --- Inscriptions ---
    const { data: enrollmentsData } = await window.supabaseInstance
      .from('enrollments')
      .select('id, user_id, course_id, payment_status, enrolled_at');
    if (enrollmentsData && enrollmentsData.length > 0) {
      enrollments = enrollmentsData.map(e => ({
        id: e.id,
        userId: e.user_id,
        courseId: e.course_id,
        paymentStatus: e.payment_status || "pending",
        enrollmentDate: e.enrolled_at ? e.enrolled_at.split("T")[0] : ""
      }));
    }

    // --- Sessions / Calendrier ---
    const { data: sessionsData } = await window.supabaseInstance
      .from('sessions')
      .select('id, course_id, title, starts_at, type')
      .order('starts_at', { ascending: true });
    if (sessionsData && sessionsData.length > 0) {
      trainerSessions = sessionsData.map(s => ({
        id: s.id,
        courseId: s.course_id,
        title: s.title,
        startsAt: s.starts_at,
        type: s.type || "zoom"
      }));
    }

    // --- Évaluations ---
    const { data: evaluationsData } = await window.supabaseInstance
      .from('evaluations')
      .select('id, course_id, title, kind, status');
    if (evaluationsData && evaluationsData.length > 0) {
      trainerEvaluations = evaluationsData.map(e => ({
        id: e.id,
        courseId: e.course_id,
        title: e.title,
        kind: e.kind || "quiz",
        status: e.status || "draft"
      }));
    }

    // --- Soumissions ---
    const { data: submissionsData } = await window.supabaseInstance
      .from('submissions')
      .select('id, user_id, course_id, title, kind, status, submitted_at');
    if (submissionsData && submissionsData.length > 0) {
      trainerSubmissions = submissionsData.map(s => ({
        id: s.id,
        userId: s.user_id,
        courseId: s.course_id,
        title: s.title,
        kind: s.kind || "devoir",
        status: s.status || "submitted",
        submittedAt: s.submitted_at || ""
      }));
      submissions = trainerSubmissions;
    }

    // --- Certificats ---
    const { data: certsData } = await window.supabaseInstance
      .from('certificates')
      .select('id, user_id, course_id, issued_at');
    if (certsData && certsData.length > 0) {
      certificates = certsData.map(c => ({
        id: c.id,
        userId: c.user_id,
        courseId: c.course_id,
        issueDate: c.issued_at ? c.issued_at.split("T")[0] : ""
      }));
    }

    // --- Demandes d'inscription ---
    const { data: requestsData } = await window.supabaseInstance
      .from('enrollment_requests')
      .select('id, user_id, course_id, status, requested_at');
    if (requestsData && requestsData.length > 0) {
      // Supabase a des données → on les utilise comme source principale
      // APRÈS
enrollmentRequests = requestsData.map(r => {
  const profile = (profilesData || []).find(p => p.id === r.user_id);
  const participantName = (profile
    ? [profile.first_name, profile.last_name].filter(v => v && v !== "null").join(" ").trim() || profile.email
    : "") || r.participant_name || "";
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    status: r.status || "pending",
    requestedAt: r.requested_at ? r.requested_at.split("T")[0] : "",
    participantName,
    participantEmail: profile?.email || ""
  };
});
      // On fusionne avec les demandes locales non encore synchronisées
      const localRequests = (() => {
        try { return JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || "[]"); } catch { return []; }
      })();
      localRequests.forEach(lr => {
        if (!enrollmentRequests.some(sr => sr.id === lr.id)) {
          enrollmentRequests.push(lr);
        }
      });
      saveRequestsToStorage();

      // Correction rétroactive : remplace "Utilisateur" par le vrai nom
// pour les demandes déjà sauvegardées avec le fallback générique
enrollmentRequests = enrollmentRequests.map(req => {
  if (!req.participantName || req.participantName === "Utilisateur" || req.participantName.startsWith("Utilisateur (") || req.participantName === "null null" || req.participantName.trim() === "null" || req.participantName.trim() === "") {
    const profile = (profilesData || []).find(p => p.id === req.userId);
    if (profile) {
      req.participantName =[profile.first_name, profile.last_name].filter(v => v && v !== "null").join(" ").trim()
  || profile.email
  || "Participant"
    }
  }
  return req;
});
saveRequestsToStorage(); // re-sauvegarde avec les vrais noms
    } else {
      // Pas de données Supabase → on garde ce qui est en localStorage
      loadRequestsFromStorage();
    }

    // Synchronise le chip utilisateur dans la topbar
    if (typeof syncUserChip === "function") syncUserChip();

    // Ne pas écraser iccaCurrentUserId : il a été écrit par auth-supabase.js avec le bon userId
    // sessionStorage.setItem("iccaCurrentUserId", currentUserId); // ← supprimé intentionnellement


    // Persiste le prénom/nom/email du user connecté en session
   // ✅ currentProfile défini EN PREMIER (avant toute utilisation)
    const currentProfile = profilesData?.find(p => p.id === currentUserId);

    // Persiste le prénom/nom/email du user connecté en session
    if (currentProfile) {
      sessionStorage.setItem("iccaCurrentUserFirstName", currentProfile.first_name || "");
      sessionStorage.setItem("iccaCurrentUserLastName", currentProfile.last_name || "");
      sessionStorage.setItem("iccaCurrentUserEmail", currentProfile.email || "");
      // ⚠️ Ne PAS écraser iccaAuthenticatedUserRole ici : il a déjà été défini par
      // auth-supabase.js avec le bon rôle du compte connecté. Si on le réécrit depuis
      // currentProfile, on risque de le remplacer par le rôle d'un autre utilisateur
      // (ex: si le SDK Supabase avait encore la session d'un compte précédent).
      // if (currentProfile.role) {
      //   sessionStorage.setItem("iccaAuthenticatedUserRole", currentProfile.role);
      // }
    }

   
    // Re-rendu — on préserve le rôle actuellement affiché (peut être switché)
    renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), currentWorkspaceView || "dashboard");

    // Affiche les notifications non lues maintenant que les vraies demandes sont chargées
    if (getWorkspaceRole() === "participant") {
      setTimeout(() => showLoginNotifications(currentUserId), 300);
    }

  } catch (err) {
    // Supabase indisponible → les données statiques restent affichées
    console.warn("[syncSupabaseData] Supabase non disponible, données démo affichées :", err.message);
  }
}

// =============================================================================
// =============================================================================
// SESSION & HELPERS
// =============================================================================

function getSessionUserId() {
  return sessionStorage.getItem("iccaCurrentUserId") || "admin_1";
}

function getSessionUser() {
  const id = getSessionUserId();
  const fallbackRole = sessionStorage.getItem("iccaAuthenticatedUserRole") || sessionStorage.getItem("iccaCurrentUserRole") || "admin";
  
  // Priorité 1 : données persistées en sessionStorage par auth-supabase.js
  const storedFirstName = sessionStorage.getItem("iccaCurrentUserFirstName");
  const storedLastName = sessionStorage.getItem("iccaCurrentUserLastName");
  const storedEmail = sessionStorage.getItem("iccaCurrentUserEmail");
  const storedUserName = sessionStorage.getItem("iccaCurrentUserName");

  if (storedFirstName || storedLastName || storedEmail) {
    // CORRECTION : On ne met plus l'e-mail par défaut dans le prénom s'il est absent
    const firstName = storedFirstName || "";
    const lastName = storedLastName || "";
    
    // Génération intelligente des initiales de l'avatar
    let avatar = "";
    if (firstName || lastName) {
      avatar = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase();
    } else if (storedUserName && !storedUserName.includes("@")) {
      avatar = storedUserName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    } else {
      avatar = fallbackRole[0].toUpperCase();
    }

    return { id, firstName, lastName, role: fallbackRole, email: storedEmail || "", avatar };
  }
  
  // Priorité 2 : chercher dans users[] (chargé depuis Supabase)
  return getUser(id) || {
    id,
    firstName: fallbackRole === "trainer" ? "Formateur" : fallbackRole === "participant" ? "Utilisateur" : "Admin",
    lastName: "",
    role: fallbackRole,
    avatar: fallbackRole === "trainer" ? "FT" : fallbackRole === "participant" ? "UT" : "AD"
  };
}

function syncUserChip() {
  const chip = document.querySelector(".user-chip");
  if (!chip) return;
  
  const currentUser = getSessionUser();
  const label = currentUser.role === "trainer" ? "Formateur connecté"
              : currentUser.role === "participant" ? "Participant connecté"
              : "Administrateur connecté";

  // Récupération du nom (Ta logique exacte)
  let name = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
  const savedUserName = sessionStorage.getItem("iccaCurrentUserName");

  // Sécurité : Si le prénom/nom est vide ou contient un e-mail, on applique la valeur de l'image (iccaCurrentUserName)
  if ((!name || name.includes("@")) && savedUserName) {
    name = savedUserName;
  } else if (!name) {
    name = "Compte connecté";
  }

  // Ajustement de l'avatar si jamais il affiche la première lettre de l'e-mail
  let avatarText = currentUser.avatar;
  if ((!currentUser.firstName || currentUser.firstName.includes("@")) && savedUserName && !savedUserName.includes("@")) {
    avatarText = savedUserName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  chip.setAttribute("aria-label", label);

  // CORRECTION : On conserve EXACTEMENT ta structure HTML originale pour ne pas casser ton CSS,
  // et on injecte simplement le chevron et la boîte du menu à la suite.
  chip.innerHTML = `
    <span class="avatar">${avatarText || "IC"}</span>
    <span>${escapeHTML(name)}</span>
    <span class="user-chip-chevron">▼</span>
    
    <div class="user-chip-dropdown">
      <a href="profile.html" class="dropdown-item">
        <span class="dropdown-icon">👤</span> Mon Profil
      </a>
      <button id="logout-btn" class="dropdown-item logout-item" type="button">
        <span class="dropdown-icon">🚪</span> Déconnexion
      </button>
    </div>
  `;
}

// 🛑 ÉCOUTEUR GLOBAL UNIQUE : À mettre tout à la fin de ton fichier dashboard.js (hors de toute fonction)
// Cette méthode intercepte les clics de manière centralisée et règle tous les bugs de clics.
document.addEventListener("click", (e) => {
  const chip = document.querySelector(".user-chip");
  if (!chip) return;

  // 1. Gestion du clic sur le bouton Déconnexion
  if (e.target.closest("#logout-btn")) {
    sessionStorage.clear(); // Vide proprement toute la session
    window.location.href = "login.html"; // Redirection
    return;
  }

  // 2. Gestion de l'ouverture / fermeture du menu au clic sur le chip
  if (chip.contains(e.target)) {
    // Si on clique sur le menu déroulant lui-même, on laisse le lien s'ouvrir normalement
    if (e.target.closest(".user-chip-dropdown")) return;
    
    // Sinon, on intercepte le clic pour afficher/masquer la liste
    e.preventDefault();
    chip.classList.toggle("active");
  } else {
    // Si on clique n'importe où ailleurs sur la page, on ferme le menu
    chip.classList.remove("active");
  }
});

function getWorkspaceRole() {
  return sessionStorage.getItem("iccaAuthenticatedUserRole") || sessionStorage.getItem("iccaCurrentUserRole") || getSessionUser().role || "admin";
}

function getUser(id) {
  return users.find(u => u.id === id) || null;
}

function getCourse(id) {
  return courses.find(c => c.id === id) || null;
}

// Résout un cours depuis Supabase OU depuis les cours démo
function getCourseAny(id) {
  return getCourse(id) || getDemoCourse(id) || null;
}

// Résout le nom affiché d'un utilisateur même si absent de users[]
// APRÈS
function getUserDisplayName(userId) {
  const u = getUser(userId);
  if (u) {
    const name = [u.firstName, u.lastName]
      .filter(v => v && v !== "null")
      .join(" ").trim();
    if (name) return name;
    if (u.email) return u.email;
  }
  if (userId === getSessionUserId()) {
    const email = sessionStorage.getItem("iccaCurrentUserEmail");
    if (email) return email;
    const role = sessionStorage.getItem("iccaAuthenticatedUserRole") || sessionStorage.getItem("iccaCurrentUserRole") || "participant";
    return role === "participant" ? "Participant" : role === "trainer" ? "Formateur" : "Administrateur";
  }
  const byId = users.find(u => u.id === userId);
  if (byId?.email) return byId.email;
  return "Participant";
}
function getRequestsByStatus(status) {
  return enrollmentRequests.filter(r => r.status === status);
}

function getCoursesByStatus(status) {
  return courses.filter(c => c.status === status);
}

function getTrainerCourseIds(uid) {
  // On combine la map statique (démo) ET les cours dynamiques (Supabase / import ZIP)
  // dont le trainerId correspond, pour ne jamais masquer un cours réel.
  const staticIds = trainerCoursesByUser[uid] || [];
  const dynamicIds = courses.filter(c => c.trainerId === uid).map(c => c.id);
  return [...new Set([...staticIds, ...dynamicIds])];
}

function getTrainerCourses(uid) {
  const ids = getTrainerCourseIds(uid);
  return courses.filter(c => ids.includes(c.id));
}

function getParticipantCourses(uid) {
  return enrollments
    .filter(e => e.userId === uid)
    .map(e => ({
      enrollment: e,
      course: getCourse(e.courseId),
      progress: getCourseProgress(uid, e.courseId)
    }));
}

function getTrainerStats(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const participants = enrollments.filter(e => trainerCourses.some(c => c.id === e.courseId));
  const subs = trainerSubmissions.filter(s => trainerCourses.some(c => c.id === s.courseId));
  const pendingCorrections = subs.filter(s => s.status === "submitted" && s.kind === "devoir").length;
  const upcomingSessions = trainerSessions.filter(s => trainerCourses.some(c => c.id === s.courseId)).length;
  return { trainerCourses, participants, submissions: subs, pendingCorrections, upcomingSessions };
}

function getCourseProgress(userId, courseId) {
  if (certificates.some(cert => cert.userId === userId && cert.courseId === courseId)) return 100;
  const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
  if (!enrollment) return 0;
  return enrollment.paymentStatus === "paid" ? 72 : 35;
}

function getCourseParticipants(courseId) {
  return enrollments
    .filter(e => e.courseId === courseId)
    .map(e => ({
      enrollment: e,
      user: getUser(e.userId),
      progress: getCourseProgress(e.userId, courseId)
    }));
}

function normalizePaymentStatus(status) {
  return ["paid", "free", "failed", "cancelled", "pending"].includes(status) ? status : "pending";
}

function effectivePaymentStatus(enrollment) {
  return normalizePaymentStatus(enrollment.paymentStatus);
}

function paymentStatusLabel(status) {
  const normalized = normalizePaymentStatus(status);
  if (normalized === "paid") return '<span class="badge badge--success">Payé</span>';
  if (normalized === "free") return '<span class="badge badge--info">Offert</span>';
  if (normalized === "failed") return '<span class="badge badge--danger">Échoué</span>';
  if (normalized === "cancelled") return '<span class="badge badge--danger">Annulé</span>';
  return '<span class="badge badge--warn">En attente</span>';
}

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtMoney(amount, currency = "CAD") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

function escapeHTML(value) {
  if (value == null) return "";
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// =============================================================================
// ICONS
// =============================================================================

const ICONS = {
  alertCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8"></rect><rect x="13" y="3" width="8" height="8"></rect><rect x="3" y="13" width="8" height="8"></rect><rect x="13" y="13" width="8" height="8"></rect></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 19 10 13 14 17 20 7"></polyline><polyline points="20 7 20 13 14 13"></polyline></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 3 7 12 12 21 7 12 2"></polygon><polyline points="3 12 12 17 21 12"></polyline><polyline points="3 17 12 22 21 17"></polyline></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l-.02.06a2 2 0 1 1-3.3 0l-.02-.06A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33l-.06.02a2 2 0 1 1 0-3.3l.06.02A1.65 1.65 0 0 0 4.6 9c0-.37-.13-.72-.33-1l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.32 0 .67-.13 1-.33a1.65 1.65 0 0 0 .33-1.82l.02-.06a2 2 0 1 1 3.3 0l.02.06A1.65 1.65 0 0 0 15 4.6c.37 0 .72.13 1 .33.27.2.48.48.6.82l.06.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9c0 .37.13.72.33 1 .2.27.48.48.82.6l.06.02a2 2 0 1 1 0 3.3l-.06-.02A1.65 1.65 0 0 0 19.4 15Z"></path></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-2a8 8 0 0 1 16 0v2"></path></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
};

function icon(name, size = 18) {
  const svg = ICONS[name] || ICONS.alertCircle;
  return `<span class="nav-icon" style="display:inline-grid;place-items:center;width:${size}px;height:${size}px">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</span>`;
}

// =============================================================================
// BADGES
// =============================================================================

function renderStatusBadge(status) {
  const map = {
    draft: ["badge badge--info", "Brouillon"],
    published: ["badge badge--success", "Publié"],
    submitted_for_review: ["badge badge--warn", "Soumis"],
    submitted: ["badge badge--warn", "Déposé"],
    approved: ["badge badge--success", "Approuvé"],
    needs_correction: ["badge badge--danger", "À corriger"],
    pending: ["badge badge--warn", "En attente"],
    graded: ["badge badge--success", "Corrigé"],
    paid: ["badge badge--success", "Payé"]
  };
  const [klass, label] = map[status] || ["badge", status || "—"];
  return `<span class="${klass}">${label}</span>`;
}

// =============================================================================
// PARAMÈTRES ADMIN
// =============================================================================

const ADMIN_SETTINGS_STORAGE_KEY = "icca_admin_settings";
const DEFAULT_ADMIN_SETTINGS = {
  platformName: "IC Canada Academy LMS",
  language: "fr",
  timezone: "Africa/Tunis",
  currency: "CAD",
  certThreshold: 80,
  certAutoEmit: false,
  certCodeFormat: "ICCA-{YEAR}-{SEQUENCE}",
  notifEnrollRequest: true,
  notifEnrollDecision: true,
  notifCourseSubmit: true,
  notifGrade: true,
  notifCertificate: true,
  passwordPolicy: "strong",
  mfa: "admins",
  sessionDuration: "8h"
};

function loadAdminSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY) || "null");
    return { ...DEFAULT_ADMIN_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
}

const adminSettings = loadAdminSettings();
let currentAdminView = "dashboard";
let currentWorkspaceView = "dashboard";
let currentWorkspaceRole = getWorkspaceRole();
let appState = {
  trackingCourseFilter: "",
  trackingGroupFilter: "",
  usersRoleFilter: "all",
  trainerEvalTab: "quiz",
  trainerSelectedCourseId: ""
};

function persistAdminSettings() {
  try { localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(adminSettings)); } catch {}
}

// =============================================================================
// RENDER — ADMIN
// =============================================================================

function renderAdminDashboard() {
  const totalUsers = users.length;
  const totalParticipants = users.filter(u => u.role === "participant").length;
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "published").length;
  const pendingRequests = getRequestsByStatus("pending").length;
  const pendingCourses = getCoursesByStatus("submitted_for_review").length;
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const totalCertificates = certificates.length;

  return `
    <div class="breadcrumb"><span>Administration</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">${icon("shield", 20)} Pilotage global</h1>
        <p class="page-subtitle">Vue d'ensemble de la plateforme IC Canada Academy LMS</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('import_export')">${icon("download", 16)} Export</button>
        <button class="btn btn-primary" onclick="openCreateUser()">${icon("plus", 16)} Nouvel utilisateur</button>
      </div>
    </div>

    ${pendingRequests > 0 || pendingCourses > 0 ? `
      <div class="alert-card">
        <div class="alert-row">
          <div class="alert-icon">${icon("alertCircle", 22)}</div>
          <div class="alert-content">
            <strong>Actions en attente</strong>
            <div class="alert-detail">
              ${pendingRequests > 0 ? `<strong>${pendingRequests}</strong> demande${pendingRequests > 1 ? "s" : ""} d'inscription` : ""}
              ${pendingRequests > 0 && pendingCourses > 0 ? " • " : ""}
              ${pendingCourses > 0 ? `<strong>${pendingCourses}</strong> cours à valider` : ""}
            </div>
          </div>
          ${pendingRequests > 0 ? `<button class="btn btn-sm btn-secondary" onclick="navigate('requests')">Traiter les demandes</button>` : ""}
          ${pendingCourses > 0 ? `<button class="btn btn-sm btn-secondary" onclick="navigate('course_review')">Valider les cours</button>` : ""}
        </div>
      </div>
    ` : ""}

    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-head"><span class="kpi-label">Utilisateurs</span><div class="kpi-icon">${icon("users", 18)}</div></div>
        <div class="kpi-value">${totalUsers}</div>
        <div class="kpi-delta">${totalParticipants} participants</div>
      </div>
      <div class="kpi kpi--accent">
        <div class="kpi-head"><span class="kpi-label">Formations</span><div class="kpi-icon">${icon("book", 18)}</div></div>
        <div class="kpi-value">${totalCourses}</div>
        <div class="kpi-delta">${publishedCourses} publiées</div>
      </div>
      <div class="kpi kpi--success">
        <div class="kpi-head"><span class="kpi-label">Revenus encaissés</span><div class="kpi-icon">${icon("card", 18)}</div></div>
        <div class="kpi-value" style="font-size:24px;">${fmtMoney(totalRevenue)}</div>
        <div class="kpi-delta positive">${pendingPayments} en attente</div>
      </div>
      <div class="kpi kpi--gold">
        <div class="kpi-head"><span class="kpi-label">Certificats émis</span><div class="kpi-icon">${icon("award", 18)}</div></div>
        <div class="kpi-value">${totalCertificates}</div>
      </div>
    </div>

    <div class="grid-main">
      <div>
        <div class="section-title"><h2>Inscriptions récentes</h2><a href="javascript:void(0)" onclick="event.preventDefault(); navigate('enrollments')">Voir tout →</a></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th>Paiement</th></tr></thead>
            <tbody>
              ${enrollments.slice(-5).reverse().map(e => {
    const u = getUser(e.userId);
    const c = getCourse(e.courseId);
    return `<tr>
                <td><div class="person-cell"><span class="avatar">${u ? u.avatar : ""}</span><strong>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</strong></div></td>
                <td>${c ? escapeHTML(c.title) : "-"}</td>
                <td>${fmtDate(e.enrollmentDate)}</td>
                <td>${paymentStatusLabel(effectivePaymentStatus(e))}</td>
              </tr>`;
  }).join("")}
            </tbody>
          </table>
        </div>

        <div class="section-title" style="margin-top:24px;"><h2>Demandes en attente</h2></div>
        ${pendingRequests > 0 ? `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th></th></tr></thead>
              <tbody>
                ${getRequestsByStatus("pending").slice(0, 5).map(r => {
    const participantName = r.participantName || getUserDisplayName(r.userId);
    const c = getCourseAny(r.courseId);
    return `<tr>
                    <td>${escapeHTML(participantName)}</td>
                    <td>${c ? escapeHTML(c.title) : "-"}</td>
                    <td>${fmtDate(r.requestedAt)}</td>
                    <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="openRequest('${r.id}')">${icon("eye", 13)} Examiner</button></td>
                  </tr>`;
  }).join("")}
              </tbody>
            </table>
          </div>
        ` : '<p class="empty" style="padding:20px;">Aucune demande en attente.</p>'}
      </div>

      <div>
        <div class="card">
          <h3 class="card-title">${icon("clock", 18)} Activité récente</h3>
          ${activityLog.slice(0, 6).map(log => {
            const actor = getUser(log.actorId);
            return `
              <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div style="font-size:13px;">${escapeHTML(log.details)}</div>
                  <div class="activity-time">${actor ? escapeHTML(actor.firstName) : ""} • ${fmtDate(log.at)}</div>
                </div>
              </div>
            </div>`;
  }).join("")}
        </div>
        <div class="card" style="margin-top:18px;">
          <h3 class="card-title">${icon("zap", 18)} Actions rapides</h3>
          <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" onclick="openCreateUser()">${icon("plus", 14)} Ajouter utilisateur</button>
          <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" onclick="navigate('groups')">${icon("users", 14)} Gérer les groupes</button>
          <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" onclick="navigate('certificates')">${icon("award", 14)} Émettre certificats</button>
          <button class="btn btn-secondary" style="width:100%;" onclick="navigate('import_export')">${icon("download", 14)} Export complet</button>
        </div>
      </div>
    </div>
  `;
}

function renderAdminSettings() {
  const s = adminSettings;
  return `
    <div class="breadcrumb"><span>Administration</span><span>Paramètres</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Paramètres LMS</h1>
        <p class="page-subtitle">Ajustez les règles de la plateforme, les notifications et la sécurité.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="resetSettings()">${icon("x", 16)} Réinitialiser</button>
        <button class="btn btn-primary" onclick="saveSettings()">${icon("check", 16)} Enregistrer</button>
      </div>
    </div>

    <div class="settings-grid">
      <section class="settings-card">
        <div class="card-head">Plateforme</div>
        <div class="form-group">
          <label for="set_name">Nom de la plateforme</label>
          <input class="form-control" type="text" id="set_name" value="${escapeHTML(s.platformName)}">
        </div>
        <div class="form-group">
          <label for="set_language">Langue par défaut</label>
          <select class="form-control" id="set_language">
            <option value="fr" ${s.language === "fr" ? "selected" : ""}>Français (Canada)</option>
            <option value="en" ${s.language === "en" ? "selected" : ""}>English</option>
            <option value="ar" ${s.language === "ar" ? "selected" : ""}>العربية</option>
          </select>
        </div>
        <div class="form-group">
          <label for="set_timezone">Fuseau horaire</label>
          <select class="form-control" id="set_timezone">
            <option value="America/Montreal" ${s.timezone === "America/Montreal" ? "selected" : ""}>America/Montreal (UTC-5)</option>
            <option value="Africa/Tunis" ${s.timezone === "Africa/Tunis" ? "selected" : ""}>Africa/Tunis (UTC+1)</option>
            <option value="Europe/Paris" ${s.timezone === "Europe/Paris" ? "selected" : ""}>Europe/Paris (UTC+1)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="set_currency">Devise</label>
          <select class="form-control" id="set_currency">
            <option value="CAD" ${s.currency === "CAD" ? "selected" : ""}>CAD - Dollar canadien</option>
            <option value="USD" ${s.currency === "USD" ? "selected" : ""}>USD - Dollar américain</option>
            <option value="EUR" ${s.currency === "EUR" ? "selected" : ""}>EUR - Euro</option>
            <option value="TND" ${s.currency === "TND" ? "selected" : ""}>TND - Dinar tunisien</option>
          </select>
        </div>
      </section>

      <section class="settings-card">
        <div class="card-head">Certificats</div>
        <div class="form-group">
          <label for="set_cert_threshold">Seuil de progression pour certification</label>
          <input class="form-control" type="number" id="set_cert_threshold" min="0" max="100" value="${s.certThreshold}">
        </div>
        <div class="form-group">
          <label for="set_cert_auto">Émission automatique</label>
          <select class="form-control" id="set_cert_auto">
            <option value="manual" ${!s.certAutoEmit ? "selected" : ""}>Manuelle (validation admin)</option>
            <option value="auto" ${s.certAutoEmit ? "selected" : ""}>Automatique dès le seuil atteint</option>
          </select>
        </div>
        <div class="form-group">
          <label for="set_cert_format">Format de code</label>
          <input class="form-control" type="text" id="set_cert_format" value="${escapeHTML(s.certCodeFormat)}">
        </div>
        <div class="settings-note">Les certificats suivent le seuil configuré ci-dessus et peuvent être générés automatiquement ou validés manuellement.</div>
      </section>

      <section class="settings-card">
        <div class="card-head">Notifications</div>
        <label class="toggle-line"><input type="checkbox" id="set_notif_enroll_req" ${s.notifEnrollRequest ? "checked" : ""}> Demande d'inscription → admin</label>
        <label class="toggle-line"><input type="checkbox" id="set_notif_enroll_dec" ${s.notifEnrollDecision ? "checked" : ""}> Décision admin → participant</label>
        <label class="toggle-line"><input type="checkbox" id="set_notif_course" ${s.notifCourseSubmit ? "checked" : ""}> Cours soumis → admin</label>
        <label class="toggle-line"><input type="checkbox" id="set_notif_grade" ${s.notifGrade ? "checked" : ""}> Devoir corrigé → participant</label>
        <label class="toggle-line"><input type="checkbox" id="set_notif_cert" ${s.notifCertificate ? "checked" : ""}> Certificat émis → participant</label>
      </section>

      <section class="settings-card">
        <div class="card-head">Sécurité</div>
        <div class="form-group">
          <label for="set_pwd_policy">Politique de mot de passe</label>
          <select class="form-control" id="set_pwd_policy">
            <option value="standard" ${s.passwordPolicy === "standard" ? "selected" : ""}>Standard (8 caractères min.)</option>
            <option value="strong" ${s.passwordPolicy === "strong" ? "selected" : ""}>Renforcée (12 + spéciaux)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="set_mfa">Double authentification</label>
          <select class="form-control" id="set_mfa">
            <option value="optional" ${s.mfa === "optional" ? "selected" : ""}>Optionnelle</option>
            <option value="admins" ${s.mfa === "admins" ? "selected" : ""}>Requise pour les admins</option>
            <option value="all" ${s.mfa === "all" ? "selected" : ""}>Requise pour tous</option>
          </select>
        </div>
        <div class="form-group">
          <label for="set_session">Durée de session</label>
          <select class="form-control" id="set_session">
            <option value="2h" ${s.sessionDuration === "2h" ? "selected" : ""}>2 heures</option>
            <option value="8h" ${s.sessionDuration === "8h" ? "selected" : ""}>8 heures</option>
            <option value="24h" ${s.sessionDuration === "24h" ? "selected" : ""}>24 heures</option>
          </select>
        </div>
        <div class="settings-note">Ces réglages protègent les accès administrateur et facilitent le contrôle de la plateforme au quotidien.</div>
      </section>
    </div>

    <section class="danger-card">
      <div class="card-head danger">Zone de danger</div>
      <p>Cette action supprime toutes les données locales sauvegardées par la démo. Elle est irréversible.</p>
      <button class="btn btn-danger" onclick="if(confirm('Vider tout le cache LMS ? Cette action est irréversible.')) { clearLMSStorage(); location.reload(); }">${icon("x", 16)} Vider le cache LMS</button>
    </section>
  `;
}

const trainerCoursesByUser = {
  trainer_1: ["course_admin_digitale", "course_gp_transfo", "course_employabilite", "course_ia_productivite"],
  trainer_2: ["course_bi_data", "course_nocode", "course_marketing", "course_video", "course_cyber", "course_freelance"]
};

function getActualWorkspaceRole() {
  return sessionStorage.getItem("iccaAuthenticatedUserRole") || sessionStorage.getItem("iccaCurrentUserRole") || getSessionUser().role || "participant";
}

function getAccessibleWorkspaceRoles() {
  const actualRole = getActualWorkspaceRole();
  if (actualRole === "admin") return ["admin", "trainer", "participant"];
  if (actualRole === "trainer") return ["trainer", "participant"];
  return ["participant"];
}

function roleDisplayName(role) {
  if (role === "admin") return "Admin";
  if (role === "trainer") return "Formateur";
  return "Utilisateur";
}

function setupWorkspaceShell(role) {
  const currentUser = getSessionUser();
  const sidebar = document.querySelector(".sidebar");
  const topbar = document.querySelector(".topbar");
  if (!sidebar || !topbar) return;

  // Construire les rôles accessibles selon l'URL (rôle authentifié)
  const isAdminPageShell = window.location.pathname.includes("admin-dashboard");
  const isTrainerPageShell = window.location.pathname.includes("trainer-dashboard");
  const isParticipantPageShell = window.location.pathname.includes("participant-dashboard");
  const authenticatedRoleShell = isAdminPageShell ? "admin" : isTrainerPageShell ? "trainer" : isParticipantPageShell ? "participant" : role;
  const allowedRoles = authenticatedRoleShell === "admin" ? ["admin", "trainer", "participant"]
                     : authenticatedRoleShell === "trainer" ? ["trainer", "participant"]
                     : ["participant"];
  const hasRoleSwitcher = allowedRoles.length > 1;
  const roleLabel = role === "trainer" ? "Espace formateur" : role === "participant" ? "Espace apprenant" : "Espace administrateur";
  const brandLine = role === "trainer" ? "Teaching Studio" : "Learning Platform";
  const navItems = role === "trainer" ? [
    ["dashboard", "Tableau de bord"],
    ["myteaching", "Mes formations"],
    ["courses", "Mes cours"],
    ["calendar", "Calendrier"],
    ["evaluations", "Quiz & devoirs"],
    ["corrections", "Corrections"],
    ["remises", "Remises"],
    ["participants", "Participants"],
    ["tracking", "Suivi"],
    ["preview", "Cours de la formation"],
    ["submissions", "Demandes"],
    ["studio", "Studio"],
    ["import", "Import"]
  ] : role === "participant" ? [
    ["dashboard", "Tableau de bord"],
    ["catalog", "Catalogue"],
    ["courses", "Mes cours"],
    ["modules", "Modules en cours"],
    ["resources", "Ressources"],
    ["requests", "Demandes"],
    ["certificates", "Certificats"]
  ] : [
    ["dashboard", "Tableau de bord"],
    ["tracking", "Suivi global"],
    ["users", "Utilisateurs"],
    ["catalog", "Catalogue"],
    ["requests", "Demandes"],
    ["settings", "Paramètres"]
  ];

  document.body.classList.toggle("dashboard-only", false);
  document.body.classList.remove("participant-preview");
  sidebar.hidden = false;
  sidebar.innerHTML = `
    <div class="brand">
      <div class="brand-mark">IC</div>
      <div>
        <strong>IC Canada Academy</strong>
        <span>${brandLine}</span>
      </div>
    </div>
    <div class="sidebar-section-title">${role === "trainer" ? "Formateur" : role === "participant" ? "Apprenant" : "Administration"}</div>
    <nav class="nav-list">
      ${navItems.map(([view, label], index) => {
        const uid2 = getSessionUserId();
        const isParticipant = role === "participant";
        const hasPendingNotif = isParticipant && view === "requests" && getUnseenNotifications(uid2).length > 0;
        const badge = hasPendingNotif ? ` <span style="display:inline-block;min-width:18px;height:18px;border-radius:999px;background:#e53e3e;color:#fff;font-size:11px;font-weight:700;line-height:18px;text-align:center;margin-left:6px;">${getUnseenNotifications(uid2).length}</span>` : "";
        return `<a class="nav-item${index === 0 ? " active" : ""}" href="javascript:void(0)" data-view="${view}" onclick="navigate('${view}'); return false;" ${index === 0 ? 'aria-current="page"' : ""}>${label}${badge}</a>`;
      }).join("")}
    </nav>
  `;

 topbar.innerHTML = `
    <div>
      <div class="topbar-kicker">${roleLabel}</div>
      <div class="topbar-title">${role === "trainer" ? "Programme Jeunes Talents - Formateur" : role === "participant" ? "Programme Jeunes Talents - Apprenant" : "Programme Jeunes Talents"}</div>
    </div>
    <div class="topbar-actions">
      ${hasRoleSwitcher ? `
        <nav class="role-switcher" aria-label="Changer de tableau de bord">
          ${allowedRoles.map(accessRole => `
            <button class="role-switcher-btn${accessRole === role ? " active" : ""}" type="button" onclick="switchWorkspaceRole('${accessRole}')" ${accessRole === role ? 'aria-current="page"' : ""}>
              ${roleDisplayName(accessRole)}
            </button>
          `).join("")}
        </nav>
      ` : ""}
      
      <div class="user-chip" aria-label="${currentUser.role === "trainer" ? "Formateur connecté" : currentUser.role === "participant" ? "Participant connecté" : "Administrateur connecté"}">
        <span class="avatar">${currentUser.avatar || (currentUser.firstName?.[0] || "IC")}</span>
        <span class="user-name">${escapeHTML(`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || sessionStorage.getItem("iccaCurrentUserEmail") || "Compte connecté")}</span>
        <span class="user-chip-chevron">▼</span>
        
        <div class="user-chip-dropdown">
          <a href="profile.html" class="dropdown-item">
            <span class="dropdown-icon">👤</span> Mon Profil
          </a>
          <button id="logout-btn" class="dropdown-item logout-item" type="button">
            <span class="dropdown-icon">🚪</span> Déconnexion
          </button>
        </div>
      </div>
    </div>
  `;
  document.title = role === "trainer" ? "Formateur - Tableau de bord" : role === "participant" ? "Utilisateur - Tableau de bord" : "Administration - Tableau de bord";
}

function trainerCourseCard(course, uid) {
  const participants = enrollments.filter(enrollment => enrollment.courseId === course.id);
  const pending = trainerSubmissions.filter(sub => sub.courseId === course.id && sub.status === "submitted").length;
  const completed = participants.filter(enrollment => getCourseProgress(enrollment.userId, enrollment.courseId) >= 70).length;
  return `
    <div class="card">
      <div class="card-title">${icon("book", 18)} ${escapeHTML(course.title)}</div>
      <p class="card-subtitle">${participants.length} participant${participants.length > 1 ? "s" : ""} • ${pending} devoir${pending > 1 ? "s" : ""} à corriger</p>
      <div class="kpi-grid" style="grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 14px;">
        <div class="kpi" style="padding:14px;"><div class="kpi-label">Inscrits</div><div class="kpi-value" style="font-size:24px;">${participants.length}</div></div>
        <div class="kpi kpi--success" style="padding:14px;"><div class="kpi-label">Avancement</div><div class="kpi-value" style="font-size:24px;">${participants.length ? Math.round((completed / participants.length) * 100) : 0}%</div></div>
        <div class="kpi kpi--accent" style="padding:14px;"><div class="kpi-label">Remises</div><div class="kpi-value" style="font-size:24px;">${pending}</div></div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="navigate('preview')">${icon("eye", 13)} Prévisualiser</button>
        <button class="btn btn-primary btn-sm" onclick="navigate('remises')">${icon("upload", 13)} Voir les remises</button>
      </div>
    </div>
  `;
}

function trainerEmptyState(title, message) {
  return `<div class="empty-state"><div class="empty-icon">${icon("clock", 26)}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p></div>`;
}

function renderAdminTracking() {
  const courseFilter = appState.trackingCourseFilter || "";
  const groupFilter = appState.trackingGroupFilter || "";
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesCourse = !courseFilter || enrollment.courseId === courseFilter;
    const matchesGroup = !groupFilter || groups.some(group => group.id === groupFilter && group.members.includes(enrollment.userId) && group.courseId === enrollment.courseId);
    return matchesCourse && matchesGroup;
  });
  const avgProgress = filteredEnrollments.length
    ? Math.round(filteredEnrollments.reduce((sum, enrollment) => sum + getCourseProgress(enrollment.userId, enrollment.courseId), 0) / filteredEnrollments.length)
    : 0;

  return `
    <div class="breadcrumb"><span>Administration</span><span>Suivi global</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Suivi global LMS</h1>
        <p class="page-subtitle">Performance des formations, progression des cohortes et occupation des groupes.</p>
      </div>
      <div class="page-actions">
        <select class="form-control" style="min-width:240px;" onchange="appState.trackingCourseFilter = this.value; renderAdminPage('tracking');">
          <option value="">Toutes les formations</option>
          ${courses.map(course => `<option value="${course.id}" ${courseFilter === course.id ? "selected" : ""}>${escapeHTML(course.title)}</option>`).join("")}
        </select>
        <select class="form-control" style="min-width:220px;" onchange="appState.trackingGroupFilter = this.value; renderAdminPage('tracking');">
          <option value="">Tous les groupes</option>
          ${groups.map(group => `<option value="${group.id}" ${groupFilter === group.id ? "selected" : ""}>${escapeHTML(group.name)}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">Inscriptions actives</span><div class="kpi-icon">${icon("users", 18)}</div></div><div class="kpi-value">${filteredEnrollments.length}</div></div>
      <div class="kpi kpi--success"><div class="kpi-head"><span class="kpi-label">Progression moyenne</span><div class="kpi-icon">${icon("clock", 18)}</div></div><div class="kpi-value">${avgProgress}%</div></div>
      <div class="kpi kpi--gold"><div class="kpi-head"><span class="kpi-label">Certificats émis</span><div class="kpi-icon">${icon("award", 18)}</div></div><div class="kpi-value">${certificates.length}</div></div>
      <div class="kpi kpi--accent"><div class="kpi-head"><span class="kpi-label">Groupes visibles</span><div class="kpi-icon">${icon("layers", 18)}</div></div><div class="kpi-value">${groups.length}</div></div>
    </div>

    <div class="grid-main">
      <div>
        ${courses.filter(course => course.status === "published").map(course => {
          const participants = getCourseParticipants(course.id);
          const visible = !courseFilter || course.id === courseFilter;
          if (!visible) return "";
          const avg = participants.length ? Math.round(participants.reduce((sum, item) => sum + item.progress, 0) / participants.length) : 0;
          return `
            <div class="card" style="margin-bottom:16px;">
              <div class="card-title">${icon("book", 18)} ${escapeHTML(course.title)}</div>
              <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:12px;">
                <div><strong>${participants.length}</strong><div style="color:var(--text-muted); font-size:12px;">Inscrits</div></div>
                <div><strong>${avg}%</strong><div style="color:var(--text-muted); font-size:12px;">Progression moyenne</div></div>
                <div><strong>${certificates.filter(cert => cert.courseId === course.id).length}</strong><div style="color:var(--text-muted); font-size:12px;">Certificats</div></div>
              </div>
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Participant</th><th>Progression</th><th>Paiement</th></tr></thead>
                  <tbody>
                    ${participants.slice(0, 4).map(item => `
                      <tr>
                        <td><div class="person-cell"><span class="avatar">${item.user ? item.user.avatar : ""}</span><strong>${item.user ? escapeHTML(`${item.user.firstName} ${item.user.lastName}`) : "-"}</strong></div></td>
                        <td>${item.progress}%</td>
                        <td>${paymentStatusLabel(effectivePaymentStatus(item.enrollment))}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }).join("") || '<div class="empty-state"><h3>Aucune donnée pour ce filtre</h3><p>Sélectionnez une autre formation ou un autre groupe.</p></div>'}
      </div>

      <div>
        <div class="card">
          <h3 class="card-title">${icon("layers", 18)} Cohortes</h3>
          ${groups.map(group => {
            const course = getCourse(group.courseId);
            return `
              <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div><strong>${escapeHTML(group.name)}</strong></div>
                  <div class="activity-time">${course ? escapeHTML(course.title) : "-"} • ${group.members.length} membres</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderAdminUsers() {
  const roleFilter = appState.usersRoleFilter || "all";
  const filteredUsers = users.filter(user => roleFilter === "all" || user.role === roleFilter);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Utilisateurs</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Utilisateurs</h1>
        <p class="page-subtitle">${users.length} comptes actifs sur la plateforme.</p>
      </div>
      <div class="page-actions">
        <select class="form-control" style="min-width:220px;" onchange="appState.usersRoleFilter = this.value; renderAdminPage('users');">
          <option value="all" ${roleFilter === "all" ? "selected" : ""}>Tous les rôles</option>
          <option value="admin" ${roleFilter === "admin" ? "selected" : ""}>Administrateurs</option>
          <option value="trainer" ${roleFilter === "trainer" ? "selected" : ""}>Formateurs</option>
          <option value="participant" ${roleFilter === "participant" ? "selected" : ""}>Participants</option>
        </select>
        <button class="btn btn-secondary" onclick="showToast('Import CSV utilisateurs (démo)', 'info')">${icon("upload", 14)} Import CSV</button>
        <button class="btn btn-primary" onclick="openCreateUser()">${icon("plus", 14)} Nouvel utilisateur</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Formation(s)</th><th></th></tr></thead>
        <tbody>
          ${filteredUsers.map(user => {
            const enrollCount = enrollments.filter(enrollment => enrollment.userId === user.id).length;
            const roleClass = user.role === "admin" ? "badge badge--danger" : user.role === "trainer" ? "badge badge--info" : "badge badge--success";
            const roleLabel = user.role === "admin" ? "Admin" : user.role === "trainer" ? "Formateur" : "Participant";
            return `
              <tr>
                <td><div class="person-cell"><span class="avatar">${user.avatar}</span><strong>${escapeHTML(`${user.firstName} ${user.lastName}`)}</strong></div></td>
                <td><span class="${roleClass}">${roleLabel}</span></td>
                <td>${enrollCount}</td>
                <td class="td-actions"><button class="btn btn-sm btn-secondary" onclick="showToast('Prévisualisation du compte ${escapeHTML(user.firstName)}', 'info')">${icon("eye", 13)} Voir</button></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminRoles() {
  const permissions = [
    ["Créer un cours", true, true, false],
    ["Valider un cours", true, false, false],
    ["S'inscrire à un cours", true, true, true],
    ["Émettre un certificat", true, false, false],
    ["Gérer les utilisateurs", true, false, false]
  ];
  return `
    <div class="breadcrumb"><span>Administration</span><span>Rôles</span></div>
    <div class="page-header"><div><h1 class="page-title">Rôles & permissions</h1><p class="page-subtitle">Matrice simplifiée des droits visibles dans l'interface.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Permission</th><th>Admin</th><th>Formateur</th><th>Participant</th></tr></thead>
        <tbody>
          ${permissions.map(permission => `<tr><td><strong>${permission[0]}</strong></td><td>${permission[1] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td><td>${permission[2] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td><td>${permission[3] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCatalog() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Catalogue</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Catalogue des formations</h1>
        <p class="page-subtitle">${courses.length} formations publiées dans le LMS.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Formation</th><th>Inscriptions</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${courses.map(course => `
            <tr>
              <td><strong>${escapeHTML(course.title)}</strong></td>
              <td>${enrollments.filter(enrollment => enrollment.courseId === course.id).length}</td>
              <td>${renderStatusBadge(course.status)}</td>
              <td class="td-actions"><button class="btn btn-sm btn-secondary" onclick="showToast('Aperçu du cours ${escapeHTML(course.title)}', 'info')">${icon("eye", 13)} Voir</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCourseReview() {
  const pendingCourses = getCoursesByStatus("submitted_for_review");
  return `
    <div class="breadcrumb"><span>Administration</span><span>Validation des cours</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Validation des cours</h1>
        <p class="page-subtitle">Aucune soumission en attente pour cette démo, mais le workflow reste en place.</p>
      </div>
    </div>
    ${pendingCourses.length ? `
      <div class="grid-2">${pendingCourses.map(course => `<div class="card"><h3 class="card-title">${escapeHTML(course.title)}</h3><p class="card-subtitle">Cours soumis pour examen.</p></div>`).join("")}</div>
    ` : '<div class="empty-state"><h3>Aucun cours à examiner</h3><p>Les cours publiés sont déjà validés dans la maquette de démonstration.</p></div>'}
  `;
}

function renderAdminRequests() {
  const pendingRequests = getRequestsByStatus("pending");
  return `
    <div class="breadcrumb"><span>Administration</span><span>Demandes</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Demandes d'inscription</h1>
        <p class="page-subtitle">${pendingRequests.length} demande(s) en attente de traitement.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${pendingRequests.map(request => {
            const participantName = request.participantName || getUserDisplayName(request.userId);
            const course = getCourseAny(request.courseId);
            return `
              <tr>
                <td>${escapeHTML(participantName)}</td>
                <td>${course ? escapeHTML(course.title) : "-"}</td>
                <td>${fmtDate(request.requestedAt)}</td>
                <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="openRequest('${request.id}')">${icon("eye", 13)} Examiner</button></td>
              </tr>
            `;
          }).join("") || '<tr><td colspan="4"><div class="empty-state"><h3>Aucune demande</h3><p>Tout est à jour.</p></div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminEnrollments() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Inscriptions</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Inscriptions</h1>
        <p class="page-subtitle">Vue rapide des inscriptions actives et de leur paiement.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Progression</th><th>Paiement</th></tr></thead>
        <tbody>
          ${enrollments.map(enrollment => {
            const user = getUser(enrollment.userId);
            const course = getCourse(enrollment.courseId);
            return `
              <tr>
                <td>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</td>
                <td>${course ? escapeHTML(course.title) : "-"}</td>
                <td>${getCourseProgress(enrollment.userId, enrollment.courseId)}%</td>
                <td>${paymentStatusLabel(enrollment.paymentStatus)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminGroups() {
  const selectedGroup = groups[0];
  return `
    <div class="breadcrumb"><span>Administration</span><span>Groupes & accès</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Groupes & accès</h1>
        <p class="page-subtitle">Gestion des cohortes et du verrouillage des modules.</p>
      </div>
    </div>
    <div class="grid-main">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Groupe</th><th>Formation</th><th>Membres</th></tr></thead>
          <tbody>
            ${groups.map(group => {
              const course = getCourse(group.courseId);
              return `
                <tr>
                  <td><strong>${escapeHTML(group.name)}</strong></td>
                  <td>${course ? escapeHTML(course.title) : "-"}</td>
                  <td>${group.members.length}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3 class="card-title">${icon("layers", 18)} Accès du groupe</h3>
        ${accessRules.filter(rule => rule.groupId === selectedGroup.id).map(rule => `
          <div class="activity-item">
            <span class="activity-dot"></span>
            <div class="activity-content">
              <div><strong>${escapeHTML(rule.module)}</strong></div>
              <div class="activity-time">${rule.open ? "Ouvert" : "Verrouillé"}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAdminPayments() {
  const totalPaid = payments.filter(payment => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Paiements</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Paiements</h1>
        <p class="page-subtitle">${fmtMoney(totalPaid)} encaissés dans cette démo.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Référence</th><th>Montant</th><th>Statut</th></tr></thead>
        <tbody>
          ${payments.map(payment => `<tr><td>${escapeHTML(payment.id)}</td><td>${fmtMoney(payment.amount)}</td><td>${paymentStatusLabel(payment.status)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCertificates() {
  const eligible = enrollments.filter(enrollment => getCourseProgress(enrollment.userId, enrollment.courseId) >= 80);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Certificats</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Certificats</h1>
        <p class="page-subtitle">${certificates.length} certificat(s) déjà émis, ${eligible.length} éligible(s).</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Éligibilité</th></tr></thead>
        <tbody>
          ${eligible.map(enrollment => {
            const user = getUser(enrollment.userId);
            const course = getCourse(enrollment.courseId);
            return `
              <tr>
                <td>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</td>
                <td>${course ? escapeHTML(course.title) : "-"}</td>
                <td>${renderStatusBadge("approved")}</td>
              </tr>
            `;
          }).join("") || '<tr><td colspan="3"><div class="empty-state"><h3>Aucun participant éligible</h3><p>La progression minimale n’est pas encore atteinte.</p></div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminImportExport() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Import / Export</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Import / Export</h1>
        <p class="page-subtitle">Sauvegarde et synchronisation des données de la plateforme.</p>
      </div>
    </div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Export</div>
        <p class="settings-note">Exporte les utilisateurs, formations, inscriptions et paiements vers une archive JSON de démonstration.</p>
        <button class="btn btn-primary" onclick="showToast('Export généré (démo)', 'success')">${icon("download", 14)} Export complet</button>
      </div>
      <div class="settings-card">
        <div class="card-head">Import</div>
        <p class="settings-note">Charge un fichier de démonstration pour restaurer un environnement similaire à la maquette.</p>
        <button class="btn btn-secondary" onclick="showToast('Import simulé (démo)', 'info')">${icon("upload", 14)} Importer</button>
      </div>
    </div>
  `;
}

function renderAdminActivity() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Journal d'activité</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Journal d'activité</h1>
        <p class="page-subtitle">Historique récent des actions marquantes sur la plateforme.</p>
      </div>
    </div>
    <div class="card">
      ${activityLog.map(entry => {
        const actor = getUser(entry.actorId);
        return `
          <div class="activity-item">
            <span class="activity-dot"></span>
            <div class="activity-content">
              <div><strong>${escapeHTML(entry.details)}</strong></div>
              <div class="activity-time">${actor ? escapeHTML(`${actor.firstName} ${actor.lastName}`) : "-"} • ${fmtDate(entry.at)}</div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderTrainerDashboard(uid) {
  const { trainerCourses, participants, submissions, pendingCorrections, upcomingSessions } = getTrainerStats(uid);
  const readyToGrade = submissions.filter(sub => sub.status === "submitted").length;
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pilote d'enseignement</h1>
        <p class="page-subtitle">Suivez vos cours, vos remises et vos prochaines sessions depuis un seul écran.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('preview')">${icon("eye", 16)} Prévisualiser</button>
        <button class="btn btn-primary" onclick="navigate('corrections')">${icon("edit", 16)} Corriger</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">Mes formations</span><div class="kpi-icon">${icon("book", 18)}</div></div><div class="kpi-value">${trainerCourses.length}</div><div class="kpi-delta">cours suivis</div></div>
      <div class="kpi kpi--accent"><div class="kpi-head"><span class="kpi-label">Participants</span><div class="kpi-icon">${icon("users", 18)}</div></div><div class="kpi-value">${participants.length}</div><div class="kpi-delta">${participants.length ? "apprenants actifs" : "aucun apprenant"}</div></div>
      <div class="kpi kpi--success"><div class="kpi-head"><span class="kpi-label">Devoirs à corriger</span><div class="kpi-icon">${icon("upload", 18)}</div></div><div class="kpi-value">${pendingCorrections}</div><div class="kpi-delta positive">${readyToGrade} remises à traiter</div></div>
      <div class="kpi kpi--gold"><div class="kpi-head"><span class="kpi-label">Séances à venir</span><div class="kpi-icon">${icon("calendar", 18)}</div></div><div class="kpi-value">${upcomingSessions}</div></div>
    </div>

    <div class="grid-main">
      <div>
        <div class="section-title"><h2>Mes cours</h2><a href="javascript:void(0)" onclick="event.preventDefault(); navigate('myteaching')">Voir tout →</a></div>
        <div class="grid-2">
          ${trainerCourses.slice(0, 4).map(course => trainerCourseCard(course, uid)).join("") || trainerEmptyState("Aucun cours assigné", "Aucune formation n'est liée à votre compte formateur.")}
        </div>
      </div>
      <div>
        <div class="card">
          <h3 class="card-title">${icon("clock", 18)} Agenda proche</h3>
          ${trainerSessions.map(session => {
            const course = getCourse(session.courseId);
            return `
              <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div><strong>${escapeHTML(session.title)}</strong></div>
                  <div class="activity-time">${course ? escapeHTML(course.title) : "-"} • ${fmtDate(session.startsAt)}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
        <div class="card" style="margin-top:16px;">
          <h3 class="card-title">${icon("zap", 18)} Actions rapides</h3>
          <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" onclick="navigate('evaluations')">${icon("fileText", 14)} Gérer les évaluations</button>
          <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" onclick="navigate('participants')">${icon("users", 14)} Voir les participants</button>
          <button class="btn btn-secondary" style="width:100%;" onclick="navigate('studio')">${icon("settings", 14)} Ouvrir le studio</button>
        </div>
      </div>
    </div>
  `;
}

function renderTrainerMyTeaching(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Mes formations</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Mes formations</h1>
        <p class="page-subtitle">Les cours sous votre responsabilité et leur état global.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('courses')">${icon("book", 16)} Liste des cours</button>
        <button class="btn btn-primary" onclick="navigate('import')">${icon("upload", 16)} Importer un cours</button>
      </div>
    </div>
    <div class="grid-2">
      ${trainerCourses.map(course => trainerCourseCard(course, uid)).join("") || trainerEmptyState("Aucune formation", "Votre compte formateur n'est lié à aucune formation pour le moment.")}
    </div>
  `;
}

function renderTrainerCourses(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Mes cours</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Mes cours</h1>
        <p class="page-subtitle">${trainerCourses.length} cours visibles dans votre périmètre.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Cours</th><th>Participants</th><th>Remises</th><th></th></tr></thead>
        <tbody>
          ${trainerCourses.map(course => {
            const participants = enrollments.filter(enrollment => enrollment.courseId === course.id);
            const pending = trainerSubmissions.filter(sub => sub.courseId === course.id && sub.status === "submitted").length;
            return `
              <tr>
                <td><strong>${escapeHTML(course.title)}</strong></td>
                <td>${participants.length}</td>
                <td>${pending}</td>
                <td class="td-actions">
                  <button class="btn btn-sm btn-secondary" onclick="navigate('myteaching')">${icon("eye", 13)} Ouvrir</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerCalendar(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Calendrier</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Calendrier</h1>
        <p class="page-subtitle">Séances Zoom, ateliers et échéances de vos cours.</p>
      </div>
    </div>
    <div class="card">
      ${trainerSessions.filter(session => trainerCourses.some(course => course.id === session.courseId)).map(session => {
        const course = getCourse(session.courseId);
        return `
          <div class="activity-item">
            <span class="activity-dot"></span>
            <div class="activity-content">
              <div><strong>${escapeHTML(session.title)}</strong></div>
              <div class="activity-time">${course ? escapeHTML(course.title) : "-"} • ${fmtDate(session.startsAt)}</div>
            </div>
          </div>
        `;
      }).join("") || trainerEmptyState("Aucun événement", "Aucune séance n'est planifiée pour vos cours.")}
    </div>
  `;
}

function renderTrainerEvaluations(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const tab = appState.trainerEvalTab || "quiz";
  const filtered = trainerEvaluations.filter(item => trainerCourses.some(course => course.id === item.courseId));
  const quizCount = filtered.filter(item => item.kind === "quiz").length;
  const devoirCount = filtered.filter(item => item.kind === "devoir").length;
  const autreCount = filtered.filter(item => item.kind === "autre").length;
  const visible = filtered.filter(item => tab === "quiz" ? item.kind === "quiz" : tab === "devoirs" ? item.kind === "devoir" : item.kind === "autre");
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Quiz & devoirs</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Quiz & devoirs</h1>
        <p class="page-subtitle">${quizCount} quiz • ${devoirCount} devoirs • ${autreCount} autres ressources évaluatives</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="appState.trainerEvalTab='quiz'; renderWorkspacePage('formateur','evaluations');">${icon("book", 14)} Quiz</button>
        <button class="btn btn-secondary" onclick="appState.trainerEvalTab='devoirs'; renderWorkspacePage('formateur','evaluations');">${icon("upload", 14)} Devoirs</button>
        <button class="btn btn-secondary" onclick="appState.trainerEvalTab='autres'; renderWorkspacePage('formateur','evaluations');">${icon("fileText", 14)} Autres</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Évaluation</th><th>Cours</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${visible.map(item => {
            const course = getCourse(item.courseId);
            return `
              <tr>
                <td><strong>${escapeHTML(item.title)}</strong></td>
                <td>${course ? escapeHTML(course.title) : "-"}</td>
                <td>${renderStatusBadge(item.status)}</td>
                <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="showToast('Ouverture de ${escapeHTML(item.title)}', 'info')">${icon("eye", 13)} Voir</button></td>
              </tr>
            `;
          }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune évaluation", "Aucun élément ne correspond à l'onglet sélectionné.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerCorrections(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const pending = trainerSubmissions.filter(sub => trainerCourses.some(course => course.id === sub.courseId) && sub.kind === "devoir" && sub.status === "submitted");
  const graded = trainerSubmissions.filter(sub => trainerCourses.some(course => course.id === sub.courseId) && sub.kind === "devoir" && sub.status === "graded");
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Corrections</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Corrections de devoirs</h1>
        <p class="page-subtitle">${pending.length} devoir${pending.length > 1 ? "s" : ""} en attente, ${graded.length} déjà corrigé${graded.length > 1 ? "s" : ""}.</p>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h3 class="card-title">${icon("upload", 18)} À corriger</h3>
        ${pending.map(sub => {
          const user = getUser(sub.userId);
          const course = getCourse(sub.courseId);
          return `
            <div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-content">
                <div><strong>${escapeHTML(sub.title)}</strong></div>
                <div class="activity-time">${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"} • ${course ? escapeHTML(course.title) : "-"}</div>
              </div>
            </div>
          `;
        }).join("") || trainerEmptyState("Aucun devoir en attente", "Toutes les remises de devoirs ont déjà été traitées.")}
      </div>
      <div class="card">
        <h3 class="card-title">${icon("check", 18)} Récemment corrigés</h3>
        ${graded.map(sub => {
          const user = getUser(sub.userId);
          return `
            <div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-content">
                <div><strong>${escapeHTML(sub.title)}</strong></div>
                <div class="activity-time">${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"} • Noté</div>
              </div>
            </div>
          `;
        }).join("") || trainerEmptyState("Aucun devoir corrigé", "Aucune correction récente n'est disponible.")}
      </div>
    </div>
  `;
}

function renderTrainerRemises(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const submissions = trainerSubmissions.filter(sub => trainerCourses.some(course => course.id === sub.courseId));
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Remises</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Remises</h1>
        <p class="page-subtitle">Tous les fichiers déposés par les participants, devoirs ou documents complémentaires.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Remise</th><th>Type</th><th>Statut</th></tr></thead>
        <tbody>
          ${submissions.map(sub => {
            const user = getUser(sub.userId);
            return `
              <tr>
                <td>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</td>
                <td><strong>${escapeHTML(sub.title)}</strong></td>
                <td>${sub.kind === "devoir" ? "Devoir" : "Autre"}</td>
                <td>${renderStatusBadge(sub.status)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerParticipants(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const rows = enrollments.filter(enrollment => trainerCourses.some(course => course.id === enrollment.courseId)).map(enrollment => {
    const user = getUser(enrollment.userId);
    const course = getCourse(enrollment.courseId);
    return { user, course, progress: getCourseProgress(enrollment.userId, enrollment.courseId), enrollment };
  });
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Participants</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Participants</h1>
        <p class="page-subtitle">Suivi des apprenants inscrits dans vos formations.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Progression</th><th>Paiement</th></tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td><div class="person-cell"><span class="avatar">${row.user ? row.user.avatar : ""}</span><strong>${row.user ? escapeHTML(`${row.user.firstName} ${row.user.lastName}`) : "-"}</strong></div></td>
              <td>${row.course ? escapeHTML(row.course.title) : "-"}</td>
              <td>${row.progress}%</td>
              <td>${paymentStatusLabel(row.enrollment.paymentStatus)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerTracking(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Suivi</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Suivi de progression</h1>
        <p class="page-subtitle">Vue d'ensemble des cohortes et de l'avancement de vos apprenants.</p>
      </div>
    </div>
    <div class="grid-2">
      ${trainerCourses.map(course => {
        const participants = enrollments.filter(enrollment => enrollment.courseId === course.id);
        const avg = participants.length ? Math.round(participants.reduce((sum, enrollment) => sum + getCourseProgress(enrollment.userId, enrollment.courseId), 0) / participants.length) : 0;
        return `
          <div class="card">
            <div class="card-title">${icon("chart", 18)} ${escapeHTML(course.title)}</div>
            <div class="kpi-value" style="font-size:28px;">${avg}%</div>
            <div class="progress-bar" style="height:10px; background:#e9eef5; border-radius:999px; overflow:hidden; margin-top:10px;"><div class="progress-bar-fill" style="width:${avg}%; height:100%; background:linear-gradient(135deg, var(--accent), var(--primary));"></div></div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ─── helpers pour la page Cours d'une formation ──────────────────────────────

function courseTypeLabel(type) {
  const map = {
    html: "Page HTML",
    excel: "Feuille Excel",
    powerpoint: "Présentation",
    json: "Données JSON",
    markdown: "Markdown",
    dragdrop: "Glisser-déposer",
    video: "Vidéo YouTube"
  };
  return map[type] || "Fichier";
}

function courseTypeIcon(type) {
  const map = {
    html: "zap",
    excel: "grid",
    powerpoint: "layers",
    json: "settings",
    markdown: "fileText",
    dragdrop: "upload",
    video: "eye"
  };
  return icon(map[type] || "fileText", 15);
}

function courseTypeBadgeClass(type) {
  const map = {
    html: "badge--info",
    excel: "badge--success",
    powerpoint: "badge--warn",
    json: "badge--info",
    markdown: "",
    dragdrop: "",
    video: "badge--danger"
  };
  return map[type] || "";
}

function openAddCourseModal(formationId) {
  const types = [
    { key: "html",        label: "Page HTML",         desc: "Un fichier .html structuré comme module de cours." },
    { key: "excel",       label: "Feuille Excel",      desc: "Tableur .xlsx affiché en lecture dans la formation." },
    { key: "powerpoint",  label: "Présentation PPT",   desc: "Diaporama .pptx converti en cours interactif." },
    { key: "json",        label: "Données JSON",       desc: "Contenu structuré au format .json." },
    { key: "markdown",    label: "Fichier Markdown",   desc: "Document .md rendu en page de cours." },
    { key: "dragdrop",    label: "Glisser-déposer",    desc: "Déposez n'importe quel fichier directement." },
    { key: "video",       label: "Vidéo YouTube",      desc: "Lien YouTube intégré en lecteur dans la page." }
  ];

  const body = `
    <p style="color:var(--text-muted);font-size:13px;margin:0 0 18px;">
      Choisissez le type de contenu à ajouter à cette formation.
    </p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
      ${types.map(t => `
        <button
          class="btn btn-secondary"
          style="display:flex;align-items:center;gap:10px;text-align:left;padding:12px 14px;height:auto;line-height:1.3;"
          onclick="closeModal(); showToast('Ajout d\'un cours «\u202f${t.label}\u202f» — fonctionnalité à venir.', 'info')">
          <span style="flex-shrink:0;opacity:.7;">${courseTypeIcon(t.key)}</span>
          <span>
            <strong style="font-size:13px;font-weight:700;display:block;">${t.label}</strong>
            <span style="font-size:11px;color:var(--text-muted);font-weight:400;">${t.desc}</span>
          </span>
        </button>
      `).join("")}
    </div>
  `;

  showModal(
    `${icon("plus", 16)} Ajouter un cours`,
    body,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>`
  );
}

function renderTrainerPreview(uid) {
  const trainerFormations = getTrainerCourses(uid);

  if (!trainerFormations.length) {
    return `
      <div class="breadcrumb"><span>Espace Formateur</span><span>Cours d'une formation</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Cours d'une formation</h1>
          <p class="page-subtitle">Sélectionnez une formation pour gérer ses cours.</p>
        </div>
      </div>
      ${trainerEmptyState("Aucune formation", "Votre compte n'est lié à aucune formation pour le moment.")}
    `;
  }

  // Formation sélectionnée
  if (!appState.trainerSelectedCourseId || !trainerFormations.find(f => f.id === appState.trainerSelectedCourseId)) {
    appState.trainerSelectedCourseId = trainerFormations[0].id;
  }
  const selectedFormation = trainerFormations.find(f => f.id === appState.trainerSelectedCourseId);
  const modules = Array.isArray(selectedFormation?.modules) ? selectedFormation.modules : [];

  // Injecter un champ 'type' de démo si absent (les modules mock n'ont pas de type)
  const DEMO_TYPES = ["html", "video", "markdown", "powerpoint", "excel", "json", "dragdrop"];
  const displayModules = modules.map((m, i) => ({
    ...m,
    type: m.type || DEMO_TYPES[i % DEMO_TYPES.length]
  }));

  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Cours de la formation</span></div>
    <div class="page-header" style="flex-wrap:wrap;gap:12px;">
      <div style="flex:1;min-width:200px;">
        <h1 class="page-title">Cours de la formation</h1>
        <p class="page-subtitle">Gérez et prévisualisez les cours insérés dans cette formation.</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <select
          class="form-control"
          style="min-width:240px;"
          onchange="appState.trainerSelectedCourseId = this.value; renderWorkspacePage(getWorkspaceRole(), 'preview');">
          ${trainerFormations.map(f => `
            <option value="${f.id}" ${f.id === appState.trainerSelectedCourseId ? "selected" : ""}>${escapeHTML(f.title)}</option>
          `).join("")}
        </select>
        <button
          class="btn btn-primary"
          onclick="openAddCourseModal('${selectedFormation.id}')">
          ${icon("plus", 15)} Ajouter un cours
        </button>
      </div>
    </div>

    ${displayModules.length === 0 ? `
      <div style="margin-top:8px;">
        ${trainerEmptyState("Aucun cours", "Cette formation ne contient pas encore de cours. Ajoutez-en un avec le bouton ci-dessus.")}
      </div>
    ` : `
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
        ${displayModules.map((m, idx) => `
          <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
            <div style="flex-shrink:0;width:38px;height:38px;border-radius:10px;background:var(--surface-2,#f1f3f7);display:flex;align-items:center;justify-content:center;color:var(--primary);">
              ${courseTypeIcon(m.type)}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:3px;">${escapeHTML(m.title)}</div>
              ${m.desc ? `<div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(m.desc)}</div>` : ""}
            </div>
            <span class="badge ${courseTypeBadgeClass(m.type)}" style="flex-shrink:0;">${courseTypeIcon(m.type)} ${courseTypeLabel(m.type)}</span>
            <div style="flex-shrink:0;display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="showToast('Prévisualisation du cours «\u202f${escapeHTML(m.title)}\u202f» — fonctionnalité à venir.', 'info')">${icon("eye", 13)} Aperçu</button>
              <button class="btn btn-secondary btn-sm" onclick="showToast('Modification du cours «\u202f${escapeHTML(m.title)}\u202f» — fonctionnalité à venir.', 'info')">${icon("edit", 13)}</button>
              <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="showToast('Suppression désactivée en mode démo.', 'warn')">${icon("trash", 13)}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `}
  `;
}

function renderTrainerSubmissions(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const items = trainerSubmissions.filter(sub => trainerCourses.some(course => course.id === sub.courseId));
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Demandes de validation</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Demandes de validation</h1>
        <p class="page-subtitle">Remises et documents à relire avant validation.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Élément</th><th>Type</th><th>Statut</th></tr></thead>
        <tbody>
          ${items.map(item => {
            const user = getUser(item.userId);
            return `
              <tr>
                <td>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</td>
                <td>${escapeHTML(item.title)}</td>
                <td>${item.kind === "devoir" ? "Devoir" : "Document"}</td>
                <td>${renderStatusBadge(item.status)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerStudio(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const selectedCourse = trainerCourses.find(course => course.id === appState.trainerSelectedCourseId) || trainerCourses[0];
  appState.trainerSelectedCourseId = selectedCourse ? selectedCourse.id : "";
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Studio</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Studio pédagogique</h1>
        <p class="page-subtitle">Outils rapides pour faire évoluer vos contenus et vos évaluations.</p>
      </div>
    </div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Sélection du cours</div>
        <select class="form-control" onchange="appState.trainerSelectedCourseId = this.value; renderWorkspacePage('formateur','studio');">
          ${trainerCourses.map(course => `<option value="${course.id}" ${selectedCourse && selectedCourse.id === course.id ? "selected" : ""}>${escapeHTML(course.title)}</option>`).join("")}
        </select>
        ${selectedCourse ? `
          <div class="settings-note" style="margin-top:12px;">${escapeHTML(selectedCourse.title)} est le cours actuellement édité dans le studio.</div>
        ` : trainerEmptyState("Aucun cours", "Sélectionnez un cours pour entrer dans le studio.")}
      </div>
      <div class="settings-card">
        <div class="card-head">Outils rapides</div>
        <button class="btn btn-secondary" onclick="showToast('Nouveau module (démo)', 'info')" style="width:100%; margin-bottom:8px;">${icon("plus", 14)} Ajouter un module</button>
        <button class="btn btn-secondary" onclick="showToast('Nouvelle ressource (démo)', 'info')" style="width:100%; margin-bottom:8px;">${icon("upload", 14)} Ajouter une ressource</button>
        <button class="btn btn-secondary" onclick="navigate('evaluations')" style="width:100%; margin-bottom:8px;">${icon("fileText", 14)} Gérer les évaluations</button>
        <button class="btn btn-secondary" onclick="navigate('preview')" style="width:100%;">${icon("eye", 14)} Prévisualiser</button>
      </div>
    </div>
  `;
}

function renderTrainerImport(uid) {
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Import</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Import d'une formation</h1>
        <p class="page-subtitle">Importez vos fichiers .html (modules) et .pdf (ressources) pour créer une formation.</p>
      </div>
    </div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Démarrer un import</div>
        <p class="settings-note">Sélectionnez un ou plusieurs fichiers <strong>.html</strong> (un module sera créé par fichier) et <strong>.pdf</strong> (ajoutés comme ressources téléchargeables). La formation est créée immédiatement avec le nom du dossier ou fichier comme titre — vous pourrez le modifier depuis "Mes formations".</p>
        <input type="file" id="trainerImportFilesInput" accept=".html,.htm,.pdf,.zip" multiple style="display:none" onchange="handleTrainerImportFilesChange(event)">
        <button class="btn btn-primary" onclick="triggerTrainerImportFiles()">${icon("upload", 14)} Choisir des fichiers</button>
      </div>
      <div class="settings-card">
        <div class="card-head">Conseils</div>
        <div class="settings-note">
          Un fichier <strong>.html</strong> = un module (son titre est repris depuis la balise &lt;title&gt; ou le nom du fichier).<br>
          Un fichier <strong>.pdf</strong> = une ressource jointe au module.<br>
          Vous pouvez aussi déposer un <strong>.zip</strong> unique au format avancé (<code>course.json</code>, <code>content/modules.json</code>, <code>evaluation/quiz.json</code>). Ajoutez <code>"course_date": "2026-09-01T09:00:00"</code> dans <code>course.json</code> pour pré-remplir la date — sinon elle vous sera demandée à l'import.
        </div>
      </div>
    </div>
  `;
}

// ─── Import d'une formation depuis des fichiers HTML/PDF sélectionnés ──────
// Chaque .html devient un module, chaque .pdf devient une ressource.
// Le titre/prix/catégorie/etc. sont saisis dans une fenêtre après sélection.
// Un .zip unique (course.json + content/modules.json + evaluation/quiz.json)
// reste accepté pour un import entièrement automatisé.

let pendingImportFiles = null;
let pendingZipCourseData = null;

function triggerTrainerImportFiles() {
  const input = document.getElementById("trainerImportFilesInput");
  if (input) input.click();
}

async function handleTrainerImportFilesChange(event) {
  const fileList = Array.from(event.target.files || []);
  event.target.value = ""; // permet de resélectionner les mêmes fichiers plus tard
  if (fileList.length === 0) return;

  // Un seul fichier .zip -> parcours avancé entièrement automatisé
  if (fileList.length === 1 && fileList[0].name.toLowerCase().endsWith(".zip")) {
    await importCourseFromZipFile(fileList[0]);
    return;
  }

  const invalid = fileList.filter(f => !/\.(html?|pdf)$/i.test(f.name));
  if (invalid.length > 0) {
    showToast(`Type de fichier non supporté : ${invalid.map(f => f.name).join(", ")}. Utilisez uniquement des fichiers .html ou .pdf (ou un .zip seul).`, "danger");
    return;
  }

  pendingImportFiles = fileList;
  // Déduire le titre depuis le nom du dossier commun ou du premier fichier HTML
  const htmlFile = fileList.find(f => /\.html?$/i.test(f.name));
  const firstFile = htmlFile || fileList[0];
  // Essayer de récupérer le nom de dossier commun (webkitRelativePath) sinon le nom de fichier sans extension
  let autoTitle = "";
  if (firstFile.webkitRelativePath) {
    autoTitle = firstFile.webkitRelativePath.split("/")[0];
  }
  if (!autoTitle) {
    autoTitle = firstFile.name.replace(/\.[^.]+$/, "");
  }
  confirmTrainerImportFromFilesAuto(fileList, autoTitle);
}

function openTrainerImportDetailsModal(fileList) {
  const htmlCount = fileList.filter(f => /\.html?$/i.test(f.name)).length;
  const pdfCount = fileList.filter(f => /\.pdf$/i.test(f.name)).length;
  showModal(
    "Informations de la formation",
    `
    <p class="settings-note">${htmlCount} fichier(s) HTML détecté(s) comme modules, ${pdfCount} fichier(s) PDF détecté(s) comme ressources.</p>
    <div class="form-group">
      <label for="imp_title">Titre de la formation *</label>
      <input class="form-control" type="text" id="imp_title" placeholder="ex : Initiation au Marketing Digital">
    </div>
    <div class="form-group">
      <label for="imp_category">Catégorie</label>
      <input class="form-control" type="text" id="imp_category" placeholder="ex : Marketing">
    </div>
    <div class="form-group">
      <label for="imp_duration">Durée</label>
      <input class="form-control" type="text" id="imp_duration" placeholder="ex : 12h">
    </div>
    <div class="form-group">
      <label for="imp_price">Prix (€)</label>
      <input class="form-control" type="number" id="imp_price" min="0" value="0">
    </div>
    <div class="form-group">
      <label for="imp_level">Niveau</label>
      <select class="form-control" id="imp_level">
        <option value="Débutant">Débutant</option>
        <option value="Intermédiaire">Intermédiaire</option>
        <option value="Avancé">Avancé</option>
      </select>
    </div>
    <div class="form-group">
      <label for="imp_description">Description</label>
      <textarea class="form-control" id="imp_description" rows="3" placeholder="Présentation courte de la formation"></textarea>
    </div>
    <div class="form-group">
      <label for="imp_course_date">Date du cours <span style="color:var(--danger,#e53e3e);">*</span> <span style="font-size:12px;color:var(--text-muted);">(obligatoire — sera affiché dans le calendrier des apprenants)</span></label>
      <input class="form-control" type="datetime-local" id="imp_course_date">
    </div>
    <div class="form-group">
      <label for="imp_quiz_file">Importer un quiz <span style="font-size:12px;color:var(--text-muted);">(optionnel — fichier .json)</span></label>
      <input type="file" id="imp_quiz_file" accept=".json" class="form-control" style="padding:6px;">
      <div class="settings-note" style="margin-top:6px;">Format attendu : <code>[{"title":"Titre question","questions":10}, …]</code></div>
    </div>
    `,
    `<button class="btn btn-secondary" onclick="cancelTrainerImportFiles()">Annuler</button>
     <button class="btn btn-primary" onclick="confirmTrainerImportFromFiles()">${icon("check", 14)} Créer la formation</button>`
  );
}

function cancelTrainerImportFiles() {
  pendingImportFiles = null;
  closeModal();
}

// Import automatique sans fenêtre intermédiaire : le titre = nom du dossier / fichier importé
async function confirmTrainerImportFromFilesAuto(fileList, autoTitle) {
  if (!fileList || fileList.length === 0) return;

  showToast("Traitement des fichiers en cours…", "info");

  try {
    const htmlFiles = fileList.filter(f => /\.html?$/i.test(f.name));
    const pdfFiles  = fileList.filter(f => /\.pdf$/i.test(f.name));

    const modules = [];
    for (const file of htmlFiles) {
      modules.push(await extractModuleFromHTMLFile(file));
    }
    const resources = pdfFiles.map(file => ({ name: file.name, sizeKB: Math.round(file.size / 1024) }));

    const uid = getSessionUserId();
    const newCourse = {
      id: `course_import_${Date.now()}`,
      title: autoTitle,
      status: "published",
      trainerId: uid,
      category: "Général",
      duration: "-",
      price: 0,
      level: "Débutant",
      description: "",
      modules,
      quiz: [],
      sessions: [],
      resources,
      resourceCount: resources.length,
      isLocalImport: true
    };

    courses.push(newCourse);
    saveImportedCoursesToStorage();

    if (window.supabaseInstance) {
      (async () => {
        try {
          await window.supabaseInstance.from("courses").insert({
            id: newCourse.id,
            title: newCourse.title,
            status: newCourse.status,
            trainer_id: uid
          });
        } catch (e) {
          console.warn("[import auto] Supabase insert échoué, cours sauvegardé localement.", e.message);
        }
      })();
    }

    pendingImportFiles = null;
    showToast(`Formation "${newCourse.title}" importée (${modules.length} module(s), ${resources.length} ressource(s)).`, "success");
    renderWorkspacePage("trainer", "myteaching");
  } catch (e) {
    console.error("[import auto] Erreur :", e);
    showToast("Erreur lors de l'import : " + e.message, "danger");
  }
}

async function extractModuleFromHTMLFile(file) {
  try {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, "text/html");
    const title = (doc.querySelector("title")?.textContent || doc.querySelector("h1")?.textContent || file.name.replace(/\.html?$/i, "")).trim();
    const bodyText = (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
    return { title: title || file.name, desc: bodyText.slice(0, 400), sourceFile: file.name };
  } catch (e) {
    console.warn(`[import fichiers] Impossible d'analyser ${file.name}`, e.message);
    return { title: file.name, desc: "", sourceFile: file.name };
  }
}

async function confirmTrainerImportFromFiles() {
  if (!pendingImportFiles || pendingImportFiles.length === 0) {
    closeModal();
    return;
  }

  const title = (document.getElementById("imp_title")?.value || "").trim();
  if (!title) {
    showToast("Le titre de la formation est obligatoire.", "danger");
    return;
  }

  const courseDate = document.getElementById("imp_course_date")?.value || "";
  if (!courseDate) {
    showToast("La date du cours est obligatoire.", "danger");
    document.getElementById("imp_course_date")?.focus();
    return;
  }

  const category = document.getElementById("imp_category")?.value.trim() || "Général";
  const duration = document.getElementById("imp_duration")?.value.trim() || "-";
  const price = Number(document.getElementById("imp_price")?.value) || 0;
  const level = document.getElementById("imp_level")?.value || "Débutant";
  const description = document.getElementById("imp_description")?.value.trim() || "";

  // Lecture optionnelle du fichier quiz JSON
  let importedQuiz = [];
  const quizFileInput = document.getElementById("imp_quiz_file");
  if (quizFileInput?.files?.length > 0) {
    try {
      const quizText = await quizFileInput.files[0].text();
      const parsed = JSON.parse(quizText);
      if (Array.isArray(parsed)) {
        importedQuiz = parsed;
      } else {
        showToast("Fichier quiz ignoré : le JSON doit être un tableau.", "info");
      }
    } catch (e) {
      showToast("Fichier quiz ignoré : JSON invalide.", "info");
    }
  }

  const filesToProcess = pendingImportFiles;

  closeModal();
  showToast("Traitement des fichiers en cours…", "info");

  try {
    const htmlFiles = filesToProcess.filter(f => /\.html?$/i.test(f.name));
    const pdfFiles = filesToProcess.filter(f => /\.pdf$/i.test(f.name));

    const modules = [];
    for (const file of htmlFiles) {
      modules.push(await extractModuleFromHTMLFile(file));
    }
    const resources = pdfFiles.map(file => ({ name: file.name, sizeKB: Math.round(file.size / 1024) }));

    const uid = getSessionUserId();
    const newCourse = {
      id: `course_import_${Date.now()}`,
      title,
      status: "published",
      trainerId: uid,
      category,
      duration,
      price,
      level,
      description,
      modules,
      quiz: importedQuiz,
      sessions: courseDate ? [{ title: `Séance – ${title}`, startsAt: courseDate, type: "zoom" }] : [],
      resources,
      resourceCount: resources.length,
      isLocalImport: true
    };

    courses.push(newCourse);
    saveImportedCoursesToStorage();

    if (window.supabaseInstance) {
      try {
        await window.supabaseInstance.from("courses").insert({
          id: newCourse.id,
          title: newCourse.title,
          status: newCourse.status,
          trainer_id: uid
        });
      } catch (e) {
        console.warn("[import fichiers] Insertion Supabase échouée, le cours reste enregistré localement.", e.message);
      }
    }

    pendingImportFiles = null;
    showToast(`Formation "${newCourse.title}" créée avec ${modules.length} module(s) et ${resources.length} ressource(s) PDF.`, "success");
    navigate("courses");
  } catch (e) {
    console.error("[import fichiers] Échec du traitement :", e);
    showToast("Une erreur est survenue pendant le traitement des fichiers.", "danger");
  }
}

// ─── Import avancé : un .zip unique entièrement automatisé ─────────────────
// Structure attendue dans le ZIP :
//   course.json              -> { title, category, duration, price, level, description }
//   content/modules.json     -> [ { title, desc } ]
//   evaluation/quiz.json     -> [ { title, questions } ]
//   resources/...            -> fichiers de ressources (comptés pour l'instant)

async function readJSONFromZip(zip, possiblePaths) {
  for (const path of possiblePaths) {
    const entry = zip.file(path);
    if (!entry) continue;
    try {
      const text = await entry.async("string");
      return JSON.parse(text);
    } catch (e) {
      console.warn(`[import ZIP] "${path}" n'a pas pu être lu comme JSON valide.`, e.message);
    }
  }
  return null;
}

async function importCourseFromZipFile(file) {
  if (!window.JSZip) {
    showToast("Le module de lecture ZIP n'a pas pu être chargé. Rechargez la page et réessayez.", "danger");
    return;
  }

  showToast("Lecture du paquet ZIP en cours…", "info");

  try {
    const zip = await window.JSZip.loadAsync(file);

    const courseData = await readJSONFromZip(zip, ["course.json", "info.json"]);
    if (!courseData || !courseData.title) {
      showToast(`ZIP invalide : un fichier "course.json" avec au moins un champ "title" est requis à la racine du paquet.`, "danger");
      return;
    }

    const modulesData = (await readJSONFromZip(zip, ["content/modules.json"])) || [];
    const quizData = (await readJSONFromZip(zip, ["evaluation/quiz.json"])) || [];
    const resourceFiles = Object.keys(zip.files).filter(path => path.startsWith("resources/") && !zip.files[path].dir);

    const uid = getSessionUserId();
    const courseTitle = String(courseData.title).trim();

    // Si course.json ne fournit pas de date, on demande à l'utilisateur
    if (!courseData.course_date) {
      // Stocker les données parsées pour les réutiliser après confirmation
      pendingZipCourseData = { courseData, modulesData, quizData, resourceFiles, uid, courseTitle };
      showModal(
        "Date du cours obligatoire",
        `<p class="settings-note">Le fichier <strong>course.json</strong> ne contient pas de champ <code>course_date</code>. Renseignez la date du cours — elle sera affichée dans le calendrier des apprenants.</p>
        <div class="form-group">
          <label for="zip_course_date">Date du cours <span style="color:var(--danger,#e53e3e);">*</span></label>
          <input class="form-control" type="datetime-local" id="zip_course_date">
        </div>`,
        `<button class="btn btn-secondary" onclick="closeModal(); pendingZipCourseData = null;">Annuler</button>
         <button class="btn btn-primary" onclick="confirmZipCourseDate()">${icon("check", 14)} Confirmer</button>`
      );
      return;
    }

    const zipCourseDate = courseData.course_date || "";
    const newCourse = {
      id: `course_import_${Date.now()}`,
      title: courseTitle,
      status: "published",
      trainerId: uid,
      category: courseData.category || "Général",
      duration: courseData.duration || "-",
      price: Number(courseData.price) || 0,
      level: courseData.level || "Débutant",
      description: courseData.description || "",
      modules: Array.isArray(modulesData) ? modulesData : [],
      quiz: Array.isArray(quizData) ? quizData : [],
      sessions: zipCourseDate ? [{ title: `Séance – ${courseTitle}`, startsAt: zipCourseDate, type: "zoom" }] : [],
      resourceCount: resourceFiles.length,
      isLocalImport: true
    };

    courses.push(newCourse);
    saveImportedCoursesToStorage();

    if (window.supabaseInstance) {
      try {
        await window.supabaseInstance.from("courses").insert({
          id: newCourse.id,
          title: newCourse.title,
          status: newCourse.status,
          trainer_id: uid
        });
      } catch (e) {
        console.warn("[import ZIP] Insertion Supabase échouée, le cours reste enregistré localement.", e.message);
      }
    }

    showToast(`Formation "${newCourse.title}" importée (${newCourse.modules.length} module(s), ${newCourse.quiz.length} quiz, ${resourceFiles.length} ressource(s)).`, "success");
    navigate("courses");
  } catch (e) {
    console.error("[import ZIP] Échec du parsing du paquet :", e);
    showToast("Impossible de lire ce fichier ZIP. Vérifiez qu'il n'est pas corrompu et respecte la structure attendue.", "danger");
  }
}

// Appelée depuis la modale ZIP quand course.json n'a pas de course_date
async function confirmZipCourseDate() {
  const zipCourseDate = document.getElementById("zip_course_date")?.value || "";
  if (!zipCourseDate) {
    showToast("La date du cours est obligatoire.", "danger");
    document.getElementById("zip_course_date")?.focus();
    return;
  }
  if (!pendingZipCourseData) { closeModal(); return; }
  const { courseData, modulesData, quizData, resourceFiles, uid, courseTitle } = pendingZipCourseData;
  pendingZipCourseData = null;
  closeModal();

  const newCourse = {
    id: `course_import_${Date.now()}`,
    title: courseTitle,
    status: "published",
    trainerId: uid,
    category: courseData.category || "Général",
    duration: courseData.duration || "-",
    price: Number(courseData.price) || 0,
    level: courseData.level || "Débutant",
    description: courseData.description || "",
    modules: Array.isArray(modulesData) ? modulesData : [],
    quiz: Array.isArray(quizData) ? quizData : [],
    sessions: [{ title: `Séance – ${courseTitle}`, startsAt: zipCourseDate, type: "zoom" }],
    resourceCount: resourceFiles.length,
    isLocalImport: true
  };

  courses.push(newCourse);
  saveImportedCoursesToStorage();

  if (window.supabaseInstance) {
    try {
      await window.supabaseInstance.from("courses").insert({
        id: newCourse.id, title: newCourse.title, status: newCourse.status, trainer_id: uid
      });
    } catch (e) {
      console.warn("[import ZIP] Insertion Supabase échouée, le cours reste enregistré localement.", e.message);
    }
  }

  showToast(`Formation "${newCourse.title}" importée (${newCourse.modules.length} module(s), ${newCourse.quiz.length} quiz, ${resourceFiles.length} ressource(s)).`, "success");
  navigate("courses");
}

function renderParticipantDashboard(uid) {
  const participantCourses = getParticipantCourses(uid);
  const nextCourse = participantCourses[0];
  const completedCount = participantCourses.filter(item => item.progress >= 100).length;
  const pendingAssignments = submissions.filter(sub => sub.userId === uid && sub.status !== "graded").length;
  const myRequests = enrollmentRequests.filter(req => req.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Mon parcours</h1>
        <p class="page-subtitle">Vos cours, votre progression et vos certificats au même endroit.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('catalog')">${icon("book", 16)} Catalogue</button>
        <button class="btn btn-secondary" onclick="navigate('courses')">${icon("book", 16)} Mes cours</button>
        <button class="btn btn-primary" onclick="navigate('certificates')">${icon("award", 16)} Certificats</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">Cours suivis</span><div class="kpi-icon">${icon("book", 18)}</div></div><div class="kpi-value">${participantCourses.length}</div></div>
      <div class="kpi kpi--success"><div class="kpi-head"><span class="kpi-label">Terminés</span><div class="kpi-icon">${icon("check", 18)}</div></div><div class="kpi-value">${completedCount}</div></div>
      <div class="kpi kpi--accent"><div class="kpi-head"><span class="kpi-label">Progression moyenne</span><div class="kpi-icon">${icon("chart", 18)}</div></div><div class="kpi-value">${participantCourses.length ? Math.round(participantCourses.reduce((sum, item) => sum + item.progress, 0) / participantCourses.length) : 0}%</div></div>
      <div class="kpi kpi--gold"><div class="kpi-head"><span class="kpi-label">Remises à suivre</span><div class="kpi-icon">${icon("upload", 18)}</div></div><div class="kpi-value">${pendingAssignments}</div></div>
    </div>

    <div class="grid-main">
      <div>
        <div class="section-title"><h2>Mes cours</h2><a href="javascript:void(0)" onclick="event.preventDefault(); navigate('courses')">Voir tout →</a></div>
        <div class="grid-2">
          ${participantCourses.map(item => `
            <div class="card">
              <div class="card-title">${icon("book", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
              <div class="settings-note">Progression actuelle : <strong>${item.progress}%</strong></div>
              <div class="progress-bar" style="height:10px; background:#e9eef5; border-radius:999px; overflow:hidden; margin:12px 0 14px;"><div class="progress-bar-fill" style="width:${item.progress}%; height:100%; background:linear-gradient(135deg, var(--accent), var(--primary));"></div></div>
              <button class="btn btn-secondary btn-sm" onclick="navigate('assignments')">${icon("upload", 13)} Voir mes remises</button>
            </div>
          `).join("") || trainerEmptyState("Aucun cours", "Aucune formation n'est actuellement liée à votre compte.")}
        </div>
      </div>
      <div>
        <div class="card">
          <h3 class="card-title">${icon("clock", 18)} Prochaine étape</h3>
          ${nextCourse ? `
            <div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-content">
                <div><strong>${escapeHTML(nextCourse.course.title)}</strong></div>
                <div class="activity-time">${fmtDate(nextCourse.enrollment.enrollmentDate)} • Démarrer par le premier module disponible</div>
              </div>
            </div>
          ` : trainerEmptyState("Rien à afficher", "Votre tableau de bord se remplira dès votre première inscription.")}
        </div>
        <div class="card" style="margin-top:16px;">
          <h3 class="card-title">${icon("bell", 18)} Notifications</h3>
          ${(() => {
            const unread = getUnseenNotifications(uid);
            return unread.length > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#92400e;display:flex;align-items:center;gap:8px;">${icon("alertCircle", 15)} <strong>${unread.length} notification(s) non lue(s)</strong> — <a href="javascript:void(0)" onclick="showLoginNotifications('${uid}')" style="color:#b45309;text-decoration:underline;">Voir maintenant</a></div>` : "";
          })()}
          ${myRequests.map(req => {
            const course = getCourseAny(req.courseId);
            const statusLabel = req.status === "approved" ? "Approuvée ✅" : req.status === "rejected" ? "Refusée ❌" : "En attente ⏳";
            return `
              <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div><strong>${course ? escapeHTML(course.title) : "Demande"}</strong> - ${statusLabel}</div>
                  <div class="activity-time">${fmtDate(req.requestedAt)}</div>
                </div>
              </div>
            `;
          }).join("") || trainerEmptyState("Aucune notification", "Vos réponses d'administration apparaîtront ici.")}
        </div>
        <div class="card" style="margin-top:16px;">
          <h3 class="card-title">${icon("award", 18)} Certificats</h3>
          ${certificates.filter(cert => cert.userId === uid).map(cert => {
            const course = getCourse(cert.courseId);
            return `
              <div class="activity-item">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div><strong>${course ? escapeHTML(course.title) : "Certificat"}</strong></div>
                  <div class="activity-time">${fmtDate(cert.issueDate)}</div>
                </div>
              </div>
            `;
          }).join("") || trainerEmptyState("Aucun certificat", "Vos certificats apparaîtront ici une fois vos parcours terminés.")}
        </div>
      </div>
    </div>
  `;
}

function renderParticipantCourses(uid) {
  const participantCourses = getParticipantAllCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Mes cours</span></div>
    <div class="page-header"><div><h1 class="page-title">Mes cours</h1><p class="page-subtitle">Vos formations actives et votre progression détaillée.</p></div></div>
    <div class="grid-2">
      ${participantCourses.map(item => {
        const courseId = item.course ? item.course.id : null;
        const demo = courseId ? getDemoCourse(courseId) : null;
        
        // 🌟 CORRECTION : On charge les modules dynamiques créés par le formateur
        const dynamicModules = courseId ? loadFormationModules(courseId) : [];
        // On affiche les modules dynamiques s'ils existent, sinon on se rabat sur la démo
        const modulesToDisplay = dynamicModules.length > 0 ? dynamicModules : (demo ? demo.modules : []);

        return `
          <div class="card" style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
              <div class="card-title" style="margin:0;">${icon("book", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
              ${demo ? levelBadge(demo.level) : ""}
            </div>
            ${demo ? `<div style="display:flex; gap:6px; flex-wrap:wrap;">${categoryBadge(demo.category)}<span class="badge badge--info">${icon("clock", 12)} ${demo.duration}</span></div>` : ""}
            <div class="settings-note">Inscrit le ${fmtDate(item.enrollment.enrollmentDate)} • Accès ${item.enrollment.paymentStatus === "paid" ? "validé" : "en attente"}</div>
            <div class="progress-bar" style="height:10px; background:#e9eef5; border-radius:999px; overflow:hidden;"><div style="width:${item.progress}%; height:100%; background:linear-gradient(135deg, var(--accent), var(--primary));"></div></div>
            <div class="settings-note">${item.progress}% complété</div>
            
            <div style="margin-top:4px;">
              <div class="settings-note" style="font-weight:600; margin-bottom:6px;">Modules disponibles :</div>
              ${modulesToDisplay.map((m, i) => `
                <div class="activity-item" style="margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px; border-radius:6px;">
                  <div style="display:flex; align-items:center; gap:8px; width:75%;">
                    <span class="activity-dot"></span>
                    <div class="activity-content">
                      <div><strong>${escapeHTML(m.title || `Module ${i+1}`)}</strong></div>
                      <div class="activity-time" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(m.desc || "")}</div>
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:11px;" 
                    onclick="handleParticipantModuleClick('${courseId}', '${m.id || i}', '${m.type || 'video'}', ${i})">
                    Lire
                  </button>
                </div>
              `).join("") || `<div class="settings-note" style="color:var(--text-muted);">Aucun module dans cette formation.</div>`}
            </div>

            <div class="row-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:auto;">
              <button class="btn btn-secondary btn-sm" onclick="navigate('modules')">${icon("layers", 13)} Modules</button>
              <button class="btn btn-secondary btn-sm" onclick="navigate('calendar')">${icon("calendar", 13)} Calendrier</button>
              <button class="btn btn-primary btn-sm" onclick="navigate('quiz')">${icon("check", 13)} Quiz</button>
            </div>
          </div>
        `;
      }).join("") || trainerEmptyState("Aucun cours", "Vos formations approuvées apparaîtront ici. Consultez le catalogue pour en demander l'accès.")}
    </div>
  `;
}

function renderParticipantModules(uid) {
  const participantCourses = getParticipantCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Modules en cours</span></div>
    <div class="page-header"><div><h1 class="page-title">Modules en cours</h1><p class="page-subtitle">Les chapitres ouverts pour vos formations actives.</p></div></div>
    <div class="grid-2">
      ${participantCourses.map(item => {
        const courseId = item.course ? item.course.id : null;
        const demo = courseId ? getDemoCourse(courseId) : null;
        
        // 🌟 CORRECTION : Remplacement du contenu codé en dur par les vrais modules
        const dynamicModules = courseId ? loadFormationModules(courseId) : [];
        const modulesToDisplay = dynamicModules.length > 0 ? dynamicModules : (demo ? demo.modules : []);

        return `
          <div class="card">
            <div class="card-title" style="margin-bottom:12px;">${icon("layers", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
            
            ${modulesToDisplay.map((m, i) => `
              <div class="activity-item" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="activity-dot"></span>
                  <div class="activity-content">
                    <div><strong>${escapeHTML(m.title || `Module ${i+1}`)}</strong> <span class="badge" style="font-size:10px; padding:1px 5px; text-transform:uppercase;">${m.type || 'cours'}</span></div>
                    <div class="activity-time">${escapeHTML(m.desc || "")}</div>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" style="font-size:12px; padding:4px 10px;" 
                  onclick="handleParticipantModuleClick('${courseId}', '${m.id || i}', '${m.type || 'video'}', ${i})">
                  Ouvrir
                </button>
              </div>
            `).join("") || `<p class="settings-note">Aucun module disponible pour le moment.</p>`}
            
            <button class="btn btn-secondary btn-sm" style="margin-top:14px; width:100%;" onclick="navigate('resources')">${icon("fileText", 13)} Voir les ressources</button>
          </div>
        `;
      }).join("") || trainerEmptyState("Aucun module", "Ouvrez un cours approuvé pour afficher ses modules.")}
    </div>
  `;
}

function renderParticipantResources(uid) {
  const participantCourses = getParticipantCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Ressources</span></div>
    <div class="page-header"><div><h1 class="page-title">Ressources</h1><p class="page-subtitle">Supports PDF, liens utiles et documents associés à vos cours.</p></div></div>
    <div class="grid-2">
      ${participantCourses.map(item => `
        <div class="card">
          <div class="card-title">${icon("fileText", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
          <div class="settings-note">Support de cours, fiches pratiques et documents de révision.</div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('quiz')">${icon("check", 13)} Aller au quiz</button>
        </div>
      `).join("") || trainerEmptyState("Aucune ressource", "Les ressources apparaîtront après l'inscription à un cours.")}  
    </div>
  `;
}

function renderParticipantQuiz(uid) {
  const participantCourses = getParticipantAllCourses(uid);

  // Récupérer tous les quiz des cours auxquels le participant a accès
  const allQuizBlocks = [];
  participantCourses.forEach(item => {
    if (!item.course) return;
    const courseObj = item.course;
    const demoCourse = getDemoCourse(courseObj.id);
    // Quiz du cours lui-même (import formateur) ou du démo
    const quizList = (courseObj.quiz && courseObj.quiz.length > 0)
      ? courseObj.quiz
      : (demoCourse?.quiz || []);
    // Quiz Supabase (evaluations)
    const supabaseQuiz = trainerEvaluations.filter(e => e.courseId === courseObj.id && e.kind === "quiz");
    const combined = [
      ...quizList.map(q => ({ title: q.title, questions: q.questions, source: "course" })),
      ...supabaseQuiz.map(e => ({ title: e.title, questions: null, source: "supabase" }))
    ];
    if (combined.length > 0) {
      allQuizBlocks.push({ courseTitle: courseObj.title, quizItems: combined });
    }
  });

  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Quiz</span></div>
    <div class="page-header"><div><h1 class="page-title">Quiz</h1><p class="page-subtitle">Les évaluations rapides associées à vos cours.</p></div></div>
    <div class="grid-2">
      ${allQuizBlocks.map(block => `
        <div class="card">
          <div class="card-title">${icon("check", 18)} ${escapeHTML(block.courseTitle)}</div>
          <div style="margin-top:8px; display:flex; flex-direction:column; gap:8px;">
            ${block.quizItems.map(q => `
              <div class="activity-item" style="padding:8px 0; border-bottom:1px solid var(--border,#e5e7eb);">
                <span class="activity-dot"></span>
                <div class="activity-content">
                  <div style="font-weight:600; font-size:14px;">${escapeHTML(q.title)}</div>
                  ${q.questions != null ? `<div class="activity-time">${q.questions} question${q.questions > 1 ? "s" : ""}</div>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="showToast('Quiz disponible après connexion à la plateforme.', 'info')">${icon("check", 13)} Démarrer</button>
        </div>
      `).join("") || trainerEmptyState("Aucun quiz", "Les quiz importés par le formateur apparaîtront ici dès qu'un cours est ouvert.")}
    </div>
  `;
}

function renderParticipantCatalog(uid) {
  const enrolledIds = getParticipantCourses(uid).map(item => item.course && item.course.id).filter(Boolean);
  const requestMap = {};
  enrollmentRequests.filter(req => req.userId === uid).forEach(req => { requestMap[req.courseId] = req.status; });

  // Merge Supabase courses + demo courses, dédupliqués
  const supabaseCourses = courses.filter(c => c.status === "published");
  const demoCourses = DEMO_CATALOG_COURSES.filter(dc => !supabaseCourses.some(sc => sc.id === dc.id));
  const allCatalog = [...supabaseCourses, ...demoCourses].filter(c => c.status === "published");

  const categoryFilter = appState.catalogCategoryFilter || "";
  const levelFilter = appState.catalogLevelFilter || "";
  const categories = [...new Set(DEMO_CATALOG_COURSES.map(c => c.category))];

  const filtered = allCatalog.filter(c => {
    const matchCat = !categoryFilter || c.category === categoryFilter;
    const matchLvl = !levelFilter || c.level === levelFilter;
    return matchCat && matchLvl;
  });

  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Catalogue</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Catalogue des formations</h1>
        <p class="page-subtitle">Choisissez une formation et envoyez une demande d'accès — l'administration vous répondra sous peu.</p>
      </div>
      <div class="page-actions">
        <select class="form-control" style="min-width:170px;" onchange="appState.catalogCategoryFilter=this.value; navigate('catalog');">
          <option value="">Toutes les catégories</option>
          ${categories.map(cat => `<option value="${cat}" ${categoryFilter === cat ? "selected" : ""}>${cat}</option>`).join("")}
        </select>
        <select class="form-control" style="min-width:150px;" onchange="appState.catalogLevelFilter=this.value; navigate('catalog');">
          <option value="">Tous les niveaux</option>
          <option value="Débutant" ${levelFilter === "Débutant" ? "selected" : ""}>Débutant</option>
          <option value="Intermédiaire" ${levelFilter === "Intermédiaire" ? "selected" : ""}>Intermédiaire</option>
          <option value="Avancé" ${levelFilter === "Avancé" ? "selected" : ""}>Avancé</option>
        </select>
      </div>
    </div>
    <div class="grid-2">
      ${filtered.map(course => {
        const reqStatus = requestMap[course.id];
        const isEnrolled = enrolledIds.includes(course.id);
        const isApproved = reqStatus === "approved";
        const isPending = reqStatus === "pending";
        const isRejected = reqStatus === "rejected";

        let actionBtn = "";
        if (isEnrolled || isApproved) {
          actionBtn = `<button class="btn btn-secondary btn-sm" onclick="navigate('courses')" style="opacity:.7; cursor:default;">${icon("check", 13)} Accès accordé</button>`;
        } else if (isPending) {
          actionBtn = `<button class="btn btn-secondary btn-sm" disabled style="opacity:.6;">${icon("clock", 13)} Demande en attente…</button>`;
        } else if (isRejected) {
          actionBtn = `<button class="btn btn-secondary btn-sm" onclick="requestCourseAccess('${course.id}')" style="color:var(--danger);">${icon("alertCircle", 13)} Refusé — Renvoyer ?</button>`;
        } else {
          actionBtn = `<button class="btn btn-primary btn-sm" onclick="openCourseDetail('${course.id}')">${icon("eye", 13)} Voir le programme</button>`;
        }

        const demo = getDemoCourse(course.id);
        return `
          <div class="card" style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
              <div class="card-title" style="margin:0;">${icon("book", 18)} ${escapeHTML(course.title)}</div>
              ${demo ? levelBadge(demo.level) : ""}
            </div>
            ${demo ? `<div style="display:flex; gap:6px; flex-wrap:wrap;">${categoryBadge(demo.category)} <span class="badge badge--info">${icon("clock", 12)} ${demo.duration}</span> <span class="badge badge--info">💰 ${demo.price} CAD</span></div>` : ""}
            ${demo ? `<p class="settings-note" style="margin:0; line-height:1.5;">${escapeHTML(demo.description)}</p>` : `<p class="settings-note">Formation disponible sur la plateforme.</p>`}
            <div style="margin-top:auto;">${actionBtn}</div>
          </div>
        `;
      }).join("") || trainerEmptyState("Catalogue vide", "Les cours publiés apparaîtront ici dès qu'ils sont disponibles.")}
    </div>
  `;
}

function openCourseDetail(courseId) {
  const course = getDemoCourse(courseId) || getCourse(courseId);
  if (!course) return;
  const uid = getSessionUserId();
  const existing = enrollmentRequests.find(r => r.userId === uid && r.courseId === courseId);
  const demo = getDemoCourse(courseId);

  const modulesHTML = demo ? demo.modules.map((m, i) => `
    <div class="activity-item">
      <span class="activity-dot"></span>
      <div class="activity-content">
        <div><strong>Module ${i+1} – ${escapeHTML(m.title)}</strong></div>
        <div class="activity-time">${escapeHTML(m.desc)}</div>
      </div>
    </div>
  `).join("") : "";

  const quizHTML = demo ? demo.quiz.map(q => `
    <div class="activity-item">
      <span class="activity-dot"></span>
      <div class="activity-content">
        <div><strong>${escapeHTML(q.title)}</strong></div>
        <div class="activity-time">${q.questions} questions</div>
      </div>
    </div>
  `).join("") : "";

  const body = `
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
      ${demo ? levelBadge(demo.level) : ""}
      ${demo ? categoryBadge(demo.category) : ""}
      ${demo ? `<span class="badge badge--info">${icon("clock", 12)} ${demo.duration}</span>` : ""}
      ${demo ? `<span class="badge badge--success">💰 ${demo.price} CAD</span>` : ""}
    </div>
    ${demo ? `<p style="color:var(--text-muted); margin-bottom:16px; line-height:1.6;">${escapeHTML(demo.description)}</p>` : ""}
    ${modulesHTML ? `<h4 style="margin:0 0 8px; font-size:13px; text-transform:uppercase; color:var(--text-muted); letter-spacing:.05em;">Programme</h4>${modulesHTML}` : ""}
    ${quizHTML ? `<h4 style="margin:12px 0 8px; font-size:13px; text-transform:uppercase; color:var(--text-muted); letter-spacing:.05em;">Évaluations incluses</h4>${quizHTML}` : ""}
  `;

  const alreadyRequested = existing && existing.status === "pending";
  const approved = existing && existing.status === "approved";
  const footerBtn = approved
    ? `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button><button class="btn btn-primary" onclick="navigate('courses'); closeModal();">${icon("book", 14)} Aller à Mes cours</button>`
    : alreadyRequested
      ? `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button><span style="color:var(--text-muted); font-size:13px;">${icon("clock", 13)} Demande envoyée, en attente de validation.</span>`
      : `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="requestCourseAccess('${courseId}'); closeModal();">${icon("download", 14)} Demander l'accès</button>`;

  showModal(escapeHTML(course.title), body, footerBtn);
}

function renderParticipantRequests(uid) {
  const items = enrollmentRequests.filter(req => req.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Demandes</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Mes demandes</h1>
        <p class="page-subtitle">Suivez ici vos demandes d'accès et la réponse de l'administration.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Formation</th><th>Date</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${items.map(req => {
            const course = getCourseAny(req.courseId);
            return `
              <tr>
                <td><strong>${course ? escapeHTML(course.title) : "-"}</strong></td>
                <td>${fmtDate(req.requestedAt)}</td>
                <td>${renderStatusBadge(req.status)}</td>
                <td>${req.status === "approved" ? "Cours ajouté" : req.status === "rejected" ? "Refusé" : "En attente"}</td>
              </tr>
            `;
          }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune demande", "Commencez par ouvrir le catalogue et demander une formation.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderParticipantAssignments(uid) {
  const items = submissions.filter(sub => sub.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Remises</span></div>
    <div class="page-header"><div><h1 class="page-title">Mes remises</h1><p class="page-subtitle">Vos devoirs déposés et leur statut.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Remise</th><th>Formation</th><th>Type</th><th>Statut</th></tr></thead>
        <tbody>
          ${items.map(item => {
            const course = getCourse(item.courseId);
            return `
              <tr>
                <td><strong>${escapeHTML(item.title)}</strong></td>
                <td>${course ? escapeHTML(course.title) : "-"}</td>
                <td>${item.kind === "devoir" ? "Devoir" : "Document"}</td>
                <td>${renderStatusBadge(item.status)}</td>
              </tr>
            `;
          }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune remise", "Déposez votre premier document pour voir ici son état.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderParticipantCertificates(uid) {
  const items = certificates.filter(cert => cert.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Certificats</span></div>
    <div class="page-header"><div><h1 class="page-title">Certificats</h1><p class="page-subtitle">Vos attestations et certificats obtenus.</p></div></div>
    <div class="grid-2">
      ${items.map(cert => {
        const course = getCourse(cert.courseId);
        return `
          <div class="card">
            <div class="card-title">${icon("award", 18)} ${course ? escapeHTML(course.title) : "Certificat"}</div>
            <div class="settings-note">Émis le ${fmtDate(cert.issueDate)}</div>
          </div>
        `;
      }).join("") || trainerEmptyState("Aucun certificat", "Terminez vos formations pour obtenir un certificat.")}
    </div>
  `;
}

function renderParticipantCalendar(uid) {
  const participantCourses = getParticipantAllCourses(uid);

  // Collecter toutes les sessions des cours auxquels le participant a accès
  const allEvents = [];
  participantCourses.forEach(item => {
    if (!item.course) return;
    const courseObj = item.course;
    // Sessions issues de la liste statique (démo) ou du cours lui-même
    const demoCourse = getDemoCourse(courseObj.id);
    const sessions = (courseObj.sessions && courseObj.sessions.length > 0)
      ? courseObj.sessions
      : (demoCourse ? getDemoCourseQuiz ? getDemoCoursesSessions(courseObj.id) : [] : []);
    const resolvedSessions = courseObj.sessions || (demoCourse?.sessions) || [];
    resolvedSessions.forEach(sess => {
      allEvents.push({ courseTitle: courseObj.title, session: sess });
    });
    // Également inclure les sessions Supabase
    trainerSessions.filter(s => s.courseId === courseObj.id).forEach(sess => {
      // Eviter les doublons avec les sessions déjà dans le cours
      if (!resolvedSessions.some(rs => rs.startsAt === sess.startsAt && rs.title === sess.title)) {
        allEvents.push({ courseTitle: courseObj.title, session: sess });
      }
    });
  });

  // Trier par date croissante
  allEvents.sort((a, b) => new Date(a.session.startsAt) - new Date(b.session.startsAt));

  const typeIcon = type => type === "atelier" ? "🛠️" : "🎥";

  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Calendrier</span></div>
    <div class="page-header"><div><h1 class="page-title">Calendrier</h1><p class="page-subtitle">Les dates de vos cours et séances planifiées.</p></div></div>
    <div class="card">
      ${allEvents.map(ev => `
        <div class="activity-item">
          <span class="activity-dot"></span>
          <div class="activity-content">
            <div><strong>${typeIcon(ev.session.type)} ${escapeHTML(ev.session.title || ev.courseTitle)}</strong></div>
            <div class="activity-time">${escapeHTML(ev.courseTitle)} • ${fmtDate(ev.session.startsAt)}</div>
          </div>
        </div>
      `).join("") || trainerEmptyState("Aucun événement", "Les dates de vos cours apparaîtront ici dès votre inscription à une formation.")}
    </div>
  `;
}

function renderPlaceholderPage(viewName) {
  const labels = {
    tracking: "Suivi global",
    users: "Utilisateurs",
    catalog: "Catalogue",
    requests: "Demandes",
    course_review: "Validation des cours",
    enrollments: "Inscriptions",
    groups: "Groupes et accès",
    payments: "Paiements",
    certificates: "Certificats",
    import_export: "Import / Export",
    activity: "Journal d'activité"
  };
  const label = labels[viewName] || "Section";
  return `
    <div class="breadcrumb"><span>Administration</span><span>${label}</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">${label}</h1>
        <p class="page-subtitle">Cette vue sera finalisée dans le même langage visuel que la maquette.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('dashboard')">${icon("book", 16)} Tableau de bord</button>
        <button class="btn btn-primary" onclick="navigate('settings')">${icon("settings", 16)} Paramètres</button>
      </div>
    </div>
    <div class="empty-state">
      <div class="empty-icon">${icon("clock", 28)}</div>
      <h3>Page en cours de finalisation</h3>
      <p>Nous gardons ici la même direction graphique, avec les mêmes cartes, badges et espacements que le reste de l'espace admin.</p>
    </div>
  `;
}

function renderWorkspacePage(role = getWorkspaceRole(), viewName = "dashboard") {
  // L'URL détermine le rôle authentifié réel (utilisé pour les droits),
  // mais si l'admin/formateur switche vers une vue prévisualisée (trainer/participant),
  // on respecte le rôle demandé sans le remplacer par l'URL.
  const isAdminPage = window.location.pathname.includes("admin-dashboard");
  const isTrainerPage = window.location.pathname.includes("trainer-dashboard");
  const isParticipantPage = window.location.pathname.includes("participant-dashboard");
  const authenticatedRole = isAdminPage ? "admin" : isTrainerPage ? "trainer" : isParticipantPage ? "participant" : role;
  const accessibleRoles = authenticatedRole === "admin" ? ["admin", "trainer", "participant"]
                        : authenticatedRole === "trainer" ? ["trainer", "participant"]
                        : ["participant"];
  // Si le rôle demandé n'est pas dans les rôles accessibles depuis cette page, on force le rôle de la page
  if (!accessibleRoles.includes(role)) role = authenticatedRole;

  // Synchroniser uniquement le rôle affiché (jamais le rôle authentifié)
  sessionStorage.setItem("iccaDisplayRole", role);
  // iccaCurrentUserRole est réservé au rôle réel d'authentification — ne pas l'écraser ici

  const allowedRoles = ["admin", "trainer", "participant"];
  if (!allowedRoles.includes(role)) role = "participant";
  currentWorkspaceRole = role;
  currentWorkspaceView = viewName;
  setupWorkspaceShell(role);
  const container = document.getElementById("adminDashboard");
  if (!container) return;

  const pageRenderers = role === "trainer" ? {
    dashboard: renderTrainerDashboard,
    myteaching: renderTrainerMyTeaching,
    courses: renderTrainerCourses,
    calendar: renderTrainerCalendar,
    evaluations: renderTrainerEvaluations,
    corrections: renderTrainerCorrections,
    remises: renderTrainerRemises,
    participants: renderTrainerParticipants,
    tracking: renderTrainerTracking,
    preview: renderTrainerPreview,
    submissions: renderTrainerSubmissions,
    studio: renderTrainerStudio,
    import: renderTrainerImport
  } : role === "participant" ? {
    dashboard: renderParticipantDashboard,
    catalog: renderParticipantCatalog,
    courses: renderParticipantCourses,
    modules: renderParticipantModules,
    resources: renderParticipantResources,
    quiz: renderParticipantQuiz,
    requests: renderParticipantRequests,
    assignments: renderParticipantAssignments,
    calendar: renderParticipantCalendar,
    certificates: renderParticipantCertificates
  } : {
    dashboard: renderAdminDashboard,
    tracking: renderAdminTracking,
    users: renderAdminUsers,
    roles: renderAdminRoles,
    catalog: renderAdminCatalog,
    course_review: renderAdminCourseReview,
    requests: renderAdminRequests,
    enrollments: renderAdminEnrollments,
    groups: renderAdminGroups,
    payments: renderAdminPayments,
    certificates: renderAdminCertificates,
    import_export: renderAdminImportExport,
    activity: renderAdminActivity,
    settings: renderAdminSettings
  };

  const renderer = pageRenderers[viewName];
  const uid = getSessionUserId();
  container.innerHTML = renderer ? renderer(uid) : (
    role === "trainer"
      ? trainerEmptyState("Page en cours de finalisation", "Cette vue sera complétée dans le même style que le reste de l'espace formateur.")
      : role === "participant"
        ? trainerEmptyState("Page en cours de finalisation", "Cette vue sera complétée dans le même style que le reste de l'espace apprenant.")
        : renderPlaceholderPage(viewName)
  );
  container.focus({ preventScroll: true });

  document.querySelectorAll(".nav-item").forEach(item => {
    const active = item.dataset.view === viewName;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

function renderAdminPage(viewName = "dashboard") {
  currentAdminView = viewName;
  renderWorkspacePage("admin", viewName);
}

function showModal(title, bodyHTML, footerHTML = "") {
  const modal = document.getElementById("modal");
  const backdrop = document.getElementById("modalBackdrop");
  modal.innerHTML = `
    <header class="modal-header">
      <h3 class="modal-title" id="modalTitle">${title}</h3>
      <button class="modal-close" onclick="closeModal()" aria-label="Fermer">${icon("x", 18)}</button>
    </header>
    <div class="modal-body">${bodyHTML}</div>
    ${footerHTML ? `<footer class="modal-footer">${footerHTML}</footer>` : ""}
  `;
  backdrop.classList.add("active");
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("active");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// =============================================================================
// ACTIONS
// =============================================================================

function navigate(viewName) {
  const role = currentWorkspaceRole || getWorkspaceRole();
  const adminViews = ["dashboard", "tracking", "users", "roles", "catalog", "course_review", "requests", "enrollments", "groups", "payments", "certificates", "import_export", "activity", "settings"];
  const trainerViews = ["dashboard", "myteaching", "courses", "calendar", "evaluations", "corrections", "remises", "participants", "tracking", "preview", "submissions", "studio", "import"];
  const participantViews = ["dashboard", "catalog", "courses", "modules", "resources", "quiz", "requests", "assignments", "calendar", "certificates"];
  const allowed = role === "trainer" ? trainerViews : role === "participant" ? participantViews : adminViews;
  if (!allowed.includes(viewName)) {
    showToast("Cette section est en cours de préparation.", "info");
    return;
  }
  renderWorkspacePage(role, viewName);
}

function switchWorkspaceRole(role) {
  const allowedRoles = getAccessibleWorkspaceRoles();
  if (!allowedRoles.includes(role)) {
    showToast("Accès non autorisé pour ce tableau de bord.", "danger");
    return;
  }
  renderWorkspacePage(role, "dashboard");
}

function openRequest(requestId) {
  const request = enrollmentRequests.find(r => r.id === requestId);
  const participantName = request
    ? (request.participantName || getUserDisplayName(request.userId))
    : "-";
  const c = request ? getCourseAny(request.courseId) : null;
  showModal(
    `Demande d'inscription`,
    `<p><strong>Participant :</strong> ${escapeHTML(participantName)}</p>
     <p><strong>Formation :</strong> ${c ? escapeHTML(c.title) : "-"}</p>
     <p><strong>Date :</strong> ${request ? fmtDate(request.requestedAt) : "-"}</p>`,
    `<button class="btn btn-secondary" onclick="processRequest('${requestId}', 'reject')" style="color:var(--danger, #e53e3e);">Rejeter</button>
     <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
     <button class="btn btn-primary" onclick="processRequest('${requestId}', 'approve')">${icon("check", 14)} Approuver l'accès</button>`
  );
}

function requestCourseAccess(courseId) {
  const uid = getSessionUserId();
  const existing = enrollmentRequests.find(req => req.userId === uid && req.courseId === courseId);
  if (existing && existing.status === "pending") {
    showToast("Vous avez déjà une demande en attente pour ce cours.", "info");
    return;
  }
  // Si demande rejetée précédente, on la retire pour en créer une nouvelle
  if (existing && existing.status === "rejected") {
    const idx = enrollmentRequests.indexOf(existing);
    if (idx !== -1) enrollmentRequests.splice(idx, 1);
  }
 // APRÈS — cherche d'abord dans users[] (déjà chargé), sinon fallback email
const u = getUser(uid); // utilisateur réel depuis Supabase
const participantName = (u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "")
  || sessionStorage.getItem("iccaCurrentUserFirstName") + " " + sessionStorage.getItem("iccaCurrentUserLastName")
  || sessionStorage.getItem("iccaCurrentUserEmail")
  || getUserDisplayName(uid);
  const request = {
    id: `req_${Date.now()}`,
    userId: uid,
    courseId,
    status: "pending",
    requestedAt: new Date().toISOString().split("T")[0],
    participantName,
    participantEmail: sessionStorage.getItem("iccaCurrentUserEmail") || ""
  };
  enrollmentRequests.unshift(request);
  saveRequestsToStorage();

  // Si Supabase est disponible, persiste aussi côté serveur
  if (window.supabaseInstance) {
    (async () => {
      try {
        await window.supabaseInstance.from('enrollment_requests').insert({
          user_id: uid,
          course_id: courseId,
          status: 'pending',
          requested_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("[requestCourseAccess] Supabase insert échoué, demande sauvegardée localement.", e.message);
      }
    })();
  }

  showToast("Votre demande a bien été envoyée à l'administration.", "success");
  renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), currentWorkspaceView || "dashboard");
}

function openCreateUser() {
  showModal(
    "Nouvel utilisateur",
    `<p>Création d'un compte administrateur, formateur ou participant.</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="showToast('Utilisateur créé', 'success'); closeModal();">Créer</button>`
  );
}

function processRequest(requestId, action = "approve") {
  const request = enrollmentRequests.find(item => item.id === requestId);
  if (!request) return;
  request.status = action === "reject" ? "rejected" : "approved";
  if (request.status === "approved" && !enrollments.some(enrollment => enrollment.userId === request.userId && enrollment.courseId === request.courseId)) {
    enrollments.push({
      id: `enr_${Date.now()}`,
      userId: request.userId,
      courseId: request.courseId,
      paymentStatus: "paid",
      enrollmentDate: new Date().toISOString().split("T")[0]
    });
  }
  saveRequestsToStorage();

  // Si Supabase disponible, met à jour le statut côté serveur
  if (window.supabaseInstance) {
    (async () => {
      try {
        await window.supabaseInstance.from('enrollment_requests')
          .update({ status: request.status })
          .eq('id', request.id);
        if (request.status === "approved") {
          await window.supabaseInstance.from('enrollments').insert({
            user_id: request.userId,
            course_id: request.courseId,
            payment_status: 'paid',
            enrolled_at: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("[processRequest] Supabase update échoué, mis à jour localement.", e.message);
      }
    })();
  }

  showToast(`Demande ${request.status === "approved" ? "approuvée" : "refusée"}`, request.status === "approved" ? "success" : "danger");
  closeModal();
  renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), currentWorkspaceView || "dashboard");
}

function saveSettings() {
  const read = id => document.getElementById(id);
  if (read("set_name")) adminSettings.platformName = read("set_name").value.trim() || adminSettings.platformName;
  if (read("set_language")) adminSettings.language = read("set_language").value;
  if (read("set_timezone")) adminSettings.timezone = read("set_timezone").value;
  if (read("set_currency")) adminSettings.currency = read("set_currency").value;
  if (read("set_cert_threshold")) adminSettings.certThreshold = Math.max(0, Math.min(100, parseInt(read("set_cert_threshold").value, 10) || 0));
  if (read("set_cert_auto")) adminSettings.certAutoEmit = read("set_cert_auto").value === "auto";
  if (read("set_cert_format")) adminSettings.certCodeFormat = read("set_cert_format").value.trim() || adminSettings.certCodeFormat;
  if (read("set_notif_enroll_req")) adminSettings.notifEnrollRequest = read("set_notif_enroll_req").checked;
  if (read("set_notif_enroll_dec")) adminSettings.notifEnrollDecision = read("set_notif_enroll_dec").checked;
  if (read("set_notif_course")) adminSettings.notifCourseSubmit = read("set_notif_course").checked;
  if (read("set_notif_grade")) adminSettings.notifGrade = read("set_notif_grade").checked;
  if (read("set_notif_cert")) adminSettings.notifCertificate = read("set_notif_cert").checked;
  if (read("set_pwd_policy")) adminSettings.passwordPolicy = read("set_pwd_policy").value;
  if (read("set_mfa")) adminSettings.mfa = read("set_mfa").value;
  if (read("set_session")) adminSettings.sessionDuration = read("set_session").value;
  persistAdminSettings();
  showToast("Paramètres enregistrés.", "success");
}

function resetSettings() {
  Object.assign(adminSettings, DEFAULT_ADMIN_SETTINGS);
  persistAdminSettings();
  renderAdminPage("settings");
  showToast("Paramètres réinitialisés.", "info");
}

document.addEventListener("click", event => {
  const navItem = event.target.closest(".nav-item");
  if (!navItem || !navItem.dataset.view) return;
  event.preventDefault();
  navigate(navItem.dataset.view);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
  // On laisse admin-dashboard.js et participant-dashboard.js
  // définir le rôle dans sessionStorage AVANT de rendre la page.
  // Ce script ne rend rien lui-même — le fichier spécifique au rôle s'en charge.
  syncSupabaseData();

  if (getWorkspaceRole() === "participant") {
    const uid = getSessionUserId();
    setTimeout(() => showLoginNotifications(uid), 600);
  }
});

function handleParticipantModuleClick(formationId, moduleId, type, index) {
  // 1. Initialiser toutes les variables globales d'identification
  window._activeFormationId = formationId;
  window.activeFormationId = formationId;
  window.currentFormationId = formationId;
  window._pendingVideoFormationId = formationId; 

  // 2. Trouver le module de manière ultra-sécurisée
  let activeModule = null;

  // On vérifie d'abord si la variable globale 'courses' existe et est définie
  if (typeof courses !== "undefined" && Array.isArray(courses)) {
    const foundCourse = courses.find(c => String(c.id) === String(formationId));
    if (foundCourse && foundCourse.modules) {
      activeModule = foundCourse.modules[index] || foundCourse.modules.find(m => String(m.id) === String(moduleId));
    }
  }

  // Si on ne l'a pas trouvé dans 'courses', on cherche dans le cours de démo
  if (!activeModule && typeof getDemoCourse === "function") {
    const demo = getDemoCourse(formationId);
    if (demo && demo.modules) {
      activeModule = demo.modules[index] || demo.modules.find(m => String(m.id) === String(moduleId));
    }
  }

  // 3. Lancement du lecteur approprié
  if (type === "video") {
    if (typeof previewYoutubeModule === "function") {
      if (activeModule) {
        // Extraction du youtubeId si absent
        let ytId = activeModule.youtubeId;
        if (!ytId && (activeModule.youtubeUrl || activeModule.videoUrl)) {
          const url = activeModule.youtubeUrl || activeModule.videoUrl || "";
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = url.match(regExp);
          ytId = (match && match[2].length === 11) ? match[2] : "";
        }
        
        const title = activeModule.title || "Cours Vidéo";

        // Appel propre avec l'ID YouTube et le Titre de la vidéo
        previewYoutubeModule(ytId, title);
      } else {
        // Si on ne trouve vraiment rien, on tente de passer des valeurs par défaut avec l'id s'il est valide
        if (moduleId && moduleId.length === 11) {
          previewYoutubeModule(moduleId, "Cours Vidéo");
        } else {
          showToast("Impossible de récupérer les informations de la vidéo.", "error");
        }
      }
    } else {
      showToast("Le module de visionnage vidéo n'est pas chargé.", "error");
    }
  } else {
    // Lecture des autres documents (PDF, Quiz, Texte)
    if (typeof previewGenericModule === "function") {
      previewGenericModule(formationId, moduleId);
    } else {
      showToast("Le module de lecture de documents n'est pas chargé.", "error");
    }
  }
}