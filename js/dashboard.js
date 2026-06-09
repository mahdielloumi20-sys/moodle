// =============================================================================
// TOPBAR
// =============================================================================

function injectTopbar() {
  if (document.querySelector('.topbar')) return;
  const header = document.createElement('header');
  header.className = 'topbar';
  header.innerHTML = `
    <div class="topbar-left">
      <button class="menu-toggle"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <a href="#" class="brand">
        <div class="brand-mark"><img src="../assets/ic_logo.png"></div>
        <div class="brand-text" style="margin-top:25px;">
          <span class="brand-text-1">IC Canada Academy</span>
          <span class="brand-text-2">Learning Platform</span>
        </div>
      </a>
    </div>
    <div class="topbar-center">
      <div class="switcher">
        <button class="active" data-role="participant">Participant</button>
        <button data-role="trainer">Formateur</button>
        <button data-role="admin">Admin</button>
      </div>
      <div class="topbar-search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Rechercher une formation...">
      </div>
    </div>
    <div class="topbar-right">
      <button class="icon-btn"><span class="dot"></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
      <div class="user-chip">
        <div class="avatar">--</div>
        <span class="user-name">Chargement...</span>
      </div>
    </div>
  `;
  document.body.prepend(header);
  initSwitcherLogic();
}

function initSwitcherLogic() {
  const buttons = document.querySelectorAll('.switcher button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.getAttribute('data-role');
      renderWorkspacePage(role, 'dashboard');
      setupWorkspaceShell(role);
    });
  });
}

// =============================================================================
// DONNÉES STATIQUES DE DÉMO (fallback quand Supabase ne répond pas encore)
// Ces données s'affichent immédiatement, puis sont remplacées par les vraies
// données Supabase dès qu'elles arrivent via syncSupabaseData().
// =============================================================================

let users = [
  { id: "admin_1", firstName: "Mohamed", lastName: "Admin", role: "admin", avatar: "MA" },
  { id: "trainer_1", firstName: "Ahmed", lastName: "Formateur", role: "trainer", avatar: "AF" },
  { id: "trainer_2", firstName: "Marc", lastName: "Tremblay", role: "trainer", avatar: "MT" },
  { id: "user_1", firstName: "Ahmed", lastName: "Belkadi", role: "participant", avatar: "AB" },
  { id: "user_2", firstName: "Ali", lastName: "Utilisateur", role: "participant", avatar: "AU" },
  { id: "user_3", firstName: "Mohamed", lastName: "Cherni", role: "participant", avatar: "MC" },
  { id: "user_4", firstName: "Julie", lastName: "Lavoie", role: "participant", avatar: "JL" },
  { id: "user_5", firstName: "Yasmine", lastName: "Khalfallah", role: "participant", avatar: "YK" },
  { id: "user_6", firstName: "Pierre", lastName: "Gagnon", role: "participant", avatar: "PG" }
];

let courses = [
  { id: "course_admin_digitale", title: "Consultant - Administration digitale", status: "published" },
  { id: "course_bi_data", title: "Consultant - BI & Data Analytics", status: "published" },
  { id: "course_gp_transfo", title: "Consultant - Gestion de projet et Transformation numérique", status: "published" },
  { id: "course_employabilite", title: "Consultant - Employabilité & carrière digitale", status: "published" },
  { id: "course_ia_productivite", title: "Consultant - IA & productivité digitale", status: "published" },
  { id: "course_nocode", title: "Consultant - Digitalisation & no-code", status: "published" },
  { id: "course_freelance", title: "Consultant - Freelance digital", status: "published" },
  { id: "course_video", title: "Consultant - Création vidéo & contenu digital", status: "published" },
  { id: "course_cyber", title: "Consultant - Cybersécurité", status: "published" },
  { id: "course_marketing", title: "Consultant - Marketing digital", status: "published" },
  { id: "course_ecommerce", title: "Consultant - E-commerce", status: "published" }
];

let enrollments = [
  { id: "enr_1", userId: "user_2", courseId: "course_admin_digitale", paymentStatus: "paid", enrollmentDate: "2026-06-15" },
  { id: "enr_2", userId: "user_2", courseId: "course_bi_data", paymentStatus: "paid", enrollmentDate: "2026-06-15" },
  { id: "enr_3", userId: "user_2", courseId: "course_gp_transfo", paymentStatus: "paid", enrollmentDate: "2026-06-15" },
  { id: "enr_4", userId: "user_2", courseId: "course_employabilite", paymentStatus: "paid", enrollmentDate: "2026-06-15" },
  { id: "enr_5", userId: "user_4", courseId: "course_video", paymentStatus: "paid", enrollmentDate: "2026-06-20" },
  { id: "enr_6", userId: "user_4", courseId: "course_freelance", paymentStatus: "paid", enrollmentDate: "2026-06-20" },
  { id: "enr_7", userId: "user_6", courseId: "course_bi_data", paymentStatus: "paid", enrollmentDate: "2026-06-20" },
  { id: "enr_8", userId: "user_6", courseId: "course_gp_transfo", paymentStatus: "paid", enrollmentDate: "2026-06-20" },
  { id: "enr_9", userId: "user_6", courseId: "course_cyber", paymentStatus: "paid", enrollmentDate: "2026-06-20" }
];

let enrollmentRequests = [
  { id: "req_1", userId: "user_1", courseId: "course_ia_productivite", requestedAt: "2026-06-18", status: "pending" },
  { id: "req_2", userId: "user_3", courseId: "course_nocode", requestedAt: "2026-06-19", status: "pending" },
  { id: "req_3", userId: "user_6", courseId: "course_freelance", requestedAt: "2026-06-15", status: "approved" }
];

let payments = [
  ...Array.from({ length: 19 }, (_, i) => ({ id: `pay_${i + 1}`, amount: i === 18 ? 500 : 300, status: "paid" })),
  { id: "pay_pending_1", amount: 300, status: "pending" },
  { id: "pay_pending_2", amount: 300, status: "pending" },
  { id: "pay_pending_3", amount: 300, status: "pending" }
];

let certificates = [
  { id: "cert_1", userId: "user_2", courseId: "course_admin_digitale", issueDate: "2026-08-12" }
];

let activityLog = [
  { id: "log_1", at: "2026-06-01T09:00:00", actorId: "admin_1", details: "Publication des 11 formations du Programme Jeunes Talents dans le LMS." },
  { id: "log_2", at: "2026-06-15T14:30:00", actorId: "admin_1", details: "Participant inscrit au parcours complet Jeunes Talents." },
  { id: "log_3", at: "2026-08-12T10:00:00", actorId: "trainer_1", details: "Certificat Administration digitale émis." }
];

let groups = [
  { id: "grp_admin_1", name: "Cohorte Administration A", courseId: "course_admin_digitale", members: ["user_2", "user_4"] },
  { id: "grp_bi_1", name: "Cohorte Data A", courseId: "course_bi_data", members: ["user_2", "user_6"] },
  { id: "grp_transfo_1", name: "Cohorte Projet A", courseId: "course_gp_transfo", members: ["user_6"] }
];

const accessRules = [
  { groupId: "grp_admin_1", module: "Module 1", open: true },
  { groupId: "grp_admin_1", module: "Module 2", open: true },
  { groupId: "grp_bi_1", module: "Module 1", open: true },
  { groupId: "grp_bi_1", module: "Module 2", open: false },
  { groupId: "grp_transfo_1", module: "Module 1", open: true }
];

const trainerCoursesByUser = {
  trainer_1: ["course_admin_digitale", "course_gp_transfo", "course_employabilite", "course_ia_productivite"],
  trainer_2: ["course_bi_data", "course_nocode", "course_marketing", "course_video", "course_cyber", "course_freelance"]
};

let trainerSessions = [
  { id: "ses_1", courseId: "course_admin_digitale", title: "Session 1 - Prise en main", startsAt: "2026-06-08T19:00:00", type: "zoom" },
  { id: "ses_2", courseId: "course_gp_transfo", title: "Session 2 - Roadmap projet", startsAt: "2026-06-15T19:00:00", type: "zoom" },
  { id: "ses_3", courseId: "course_ia_productivite", title: "Atelier - IA et productivité", startsAt: "2026-06-22T19:00:00", type: "event" },
  { id: "ses_4", courseId: "course_bi_data", title: "Deadline - Devoir Power BI", startsAt: "2026-06-24T23:59:00", type: "deadline" }
];

let trainerEvaluations = [
  { id: "eval_1", courseId: "course_admin_digitale", title: "Quiz - Administration digitale", kind: "quiz", status: "draft" },
  { id: "eval_2", courseId: "course_gp_transfo", title: "Devoir - Roadmap numérique", kind: "devoir", status: "published" },
  { id: "eval_3", courseId: "course_ia_productivite", title: "Exercice - Automatisation", kind: "autre", status: "published" }
];

let trainerSubmissions = [
  { id: "sub_1", userId: "user_2", courseId: "course_admin_digitale", title: "Livrable 1 - Tableau de suivi", kind: "devoir", status: "submitted", submittedAt: "2026-06-20T10:15:00" },
  { id: "sub_2", userId: "user_4", courseId: "course_video", title: "Document de travail", kind: "autre", status: "submitted", submittedAt: "2026-06-21T14:30:00" },
  { id: "sub_3", userId: "user_6", courseId: "course_bi_data", title: "Dashboard Power BI - V1", kind: "devoir", status: "submitted", submittedAt: "2026-06-22T09:00:00" }
];

const submissions = trainerSubmissions;

// =============================================================================
// COUCHE SUPABASE DYNAMIQUE
// Charge les vraies données depuis Supabase et met à jour les variables ci-dessus,
// puis re-rend la page courante pour afficher les données réelles.
// =============================================================================

async function syncSupabaseData() {
  if (!window.supabaseInstance) return;
  try {
    const { data: { session } } = await window.supabaseInstance.auth.getSession();
    if (!session?.user) return;

    const token = session.access_token;
    const headers = window.getSupabaseHeaders(token);

    // --- Profils (utilisateurs) ---
    const { data: profilesData } = await window.supabaseInstance
      .from('profiles')
      .select('id, email, first_name, last_name, role');
    if (profilesData && profilesData.length > 0) {
      users = profilesData.map(p => ({
        id: p.id,
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        role: p.role || "participant",
        email: p.email || "",
        avatar: ((p.first_name?.[0] || "") + (p.last_name?.[0] || "")).toUpperCase() || "??"
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
      enrollmentRequests = requestsData.map(r => ({
        id: r.id,
        userId: r.user_id,
        courseId: r.course_id,
        status: r.status || "pending",
        requestedAt: r.requested_at ? r.requested_at.split("T")[0] : ""
      }));
    }

    // Synchronise le chip utilisateur dans la topbar
    syncUserChip();

    // ✅ Correction : on force l'userId de session avec le vrai UUID Supabase
    // pour que getParticipantCourses() filtre bien les cours de cet utilisateur
    sessionStorage.setItem("iccaCurrentUserId", session.user.id);

    // ✅ Synchronise aussi le rôle réel depuis Supabase
    const currentProfile = profilesData?.find(p => p.id === session.user.id);
    if (currentProfile?.role && !sessionStorage.getItem("iccaCurrentUserRole")) {
      sessionStorage.setItem("iccaCurrentUserRole", currentProfile.role);
    }

    // Re-rendu de la page courante avec les vraies données
    const role = getWorkspaceRole();
    renderWorkspacePage(role, currentWorkspaceView || "dashboard");

  } catch (err) {
    // Supabase indisponible → les données statiques restent affichées
    console.warn("[syncSupabaseData] Supabase non disponible, données démo affichées :", err.message);
  }
}

// =============================================================================
// APP STATE
// =============================================================================

const appState = {
  trackingCourseFilter: "",
  trackingGroupFilter: "",
  usersRoleFilter: "all",
  trainerEvalTab: "quiz",
  trainerSelectedCourseId: ""
};

// =============================================================================
// SESSION & HELPERS
// =============================================================================

function getSessionUserId() {
  return sessionStorage.getItem("iccaCurrentUserId") || "admin_1";
}

function getSessionUser() {
  return getUser(getSessionUserId()) || users[0];
}

function getWorkspaceRole() {
  return sessionStorage.getItem("iccaCurrentUserRole") || getSessionUser()?.role || "admin";
}

function getUser(id) {
  return users.find(u => u.id === id);
}

function getCourse(id) {
  return courses.find(c => c.id === id);
}

function getRequestsByStatus(status) {
  return enrollmentRequests.filter(r => r.status === status);
}

function getCoursesByStatus(status) {
  return courses.filter(c => c.status === status);
}

function getTrainerCourseIds(uid) {
  // D'abord on cherche dans la map statique (démo)
  if (trainerCoursesByUser[uid]) return trainerCoursesByUser[uid];
  // Sinon on filtre les cours dont le trainerId correspond
  return courses.filter(c => c.trainerId === uid).map(c => c.id);
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
  return normalizePaymentStatus(enrollment?.paymentStatus);
}

function paymentStatusLabel(status) {
  const n = normalizePaymentStatus(status);
  if (n === "paid") return '<span class="badge badge--success">Payé</span>';
  if (n === "free") return '<span class="badge badge--info">Offert</span>';
  if (n === "failed") return '<span class="badge badge--danger">Échoué</span>';
  if (n === "cancelled") return '<span class="badge badge--danger">Annulé</span>';
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
        <div class="section-title"><h2>Inscriptions récentes</h2><a href="#" onclick="event.preventDefault(); navigate('enrollments')">Voir tout →</a></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th>Paiement</th></tr></thead>
            <tbody>
              ${enrollments.slice(-5).reverse().map(e => {
    const u = getUser(e.userId);
    const c = getCourse(e.courseId);
    return `<tr>
                <td><div class="person-cell"><span class="avatar">${u ? u.avatar : "?"}</span><strong>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</strong></div></td>
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
    const u = getUser(r.userId);
    const c = getCourse(r.courseId);
    return `<tr>
                    <td>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</td>
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
    return `<div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-content">
                <div style="font-size:13px;">${escapeHTML(log.details)}</div>
                <div class="activity-time">${actor ? escapeHTML(actor.firstName) : ""} • ${fmtDate(log.at)}</div>
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

function renderAdminTracking() {
  const courseFilter = appState.trackingCourseFilter || "";
  const groupFilter = appState.trackingGroupFilter || "";
  const filteredEnrollments = enrollments.filter(e => {
    const matchesCourse = !courseFilter || e.courseId === courseFilter;
    const matchesGroup = !groupFilter || groups.some(g => g.id === groupFilter && g.members.includes(e.userId) && g.courseId === e.courseId);
    return matchesCourse && matchesGroup;
  });
  const avgProgress = filteredEnrollments.length
    ? Math.round(filteredEnrollments.reduce((s, e) => s + getCourseProgress(e.userId, e.courseId), 0) / filteredEnrollments.length)
    : 0;

  return `
    <div class="breadcrumb"><span>Administration</span><span>Suivi global</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Suivi global LMS</h1><p class="page-subtitle">Performance des formations, progression des cohortes et occupation des groupes.</p></div>
      <div class="page-actions">
        <select class="form-control" style="min-width:240px;" onchange="appState.trackingCourseFilter = this.value; renderAdminPage('tracking');">
          <option value="">Toutes les formations</option>
          ${courses.map(c => `<option value="${c.id}" ${courseFilter === c.id ? "selected" : ""}>${escapeHTML(c.title)}</option>`).join("")}
        </select>
        <select class="form-control" style="min-width:220px;" onchange="appState.trackingGroupFilter = this.value; renderAdminPage('tracking');">
          <option value="">Tous les groupes</option>
          ${groups.map(g => `<option value="${g.id}" ${groupFilter === g.id ? "selected" : ""}>${escapeHTML(g.name)}</option>`).join("")}
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
        ${courses.filter(c => c.status === "published").map(c => {
    const participants = getCourseParticipants(c.id);
    if (courseFilter && c.id !== courseFilter) return "";
    const avg = participants.length ? Math.round(participants.reduce((s, i) => s + i.progress, 0) / participants.length) : 0;
    return `<div class="card" style="margin-bottom:16px;">
            <div class="card-title">${icon("book", 18)} ${escapeHTML(c.title)}</div>
            <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:12px;">
              <div><strong>${participants.length}</strong><div style="color:var(--text-muted); font-size:12px;">Inscrits</div></div>
              <div><strong>${avg}%</strong><div style="color:var(--text-muted); font-size:12px;">Progression moyenne</div></div>
              <div><strong>${certificates.filter(cert => cert.courseId === c.id).length}</strong><div style="color:var(--text-muted); font-size:12px;">Certificats</div></div>
            </div>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Participant</th><th>Progression</th><th>Paiement</th></tr></thead>
                <tbody>
                  ${participants.slice(0, 4).map(item => `<tr>
                    <td><div class="person-cell"><span class="avatar">${item.user ? item.user.avatar : "?"}</span><strong>${item.user ? escapeHTML(`${item.user.firstName} ${item.user.lastName}`) : "-"}</strong></div></td>
                    <td>${item.progress}%</td>
                    <td>${paymentStatusLabel(effectivePaymentStatus(item.enrollment))}</td>
                  </tr>`).join("")}
                </tbody>
              </table>
            </div>
          </div>`;
  }).join("") || '<div class="empty-state"><h3>Aucune donnée pour ce filtre</h3></div>'}
      </div>
      <div>
        <div class="card">
          <h3 class="card-title">${icon("layers", 18)} Cohortes</h3>
          ${groups.map(g => {
    const c = getCourse(g.courseId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${escapeHTML(g.name)}</strong></div><div class="activity-time">${c ? escapeHTML(c.title) : "-"} • ${g.members.length} membres</div></div></div>`;
  }).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderAdminUsers() {
  const roleFilter = appState.usersRoleFilter || "all";
  const filteredUsers = users.filter(u => roleFilter === "all" || u.role === roleFilter);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Utilisateurs</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Utilisateurs</h1><p class="page-subtitle">${users.length} comptes actifs sur la plateforme.</p></div>
      <div class="page-actions">
        <select class="form-control" style="min-width:220px;" onchange="appState.usersRoleFilter = this.value; renderAdminPage('users');">
          <option value="all" ${roleFilter === "all" ? "selected" : ""}>Tous les rôles</option>
          <option value="admin" ${roleFilter === "admin" ? "selected" : ""}>Administrateurs</option>
          <option value="trainer" ${roleFilter === "trainer" ? "selected" : ""}>Formateurs</option>
          <option value="participant" ${roleFilter === "participant" ? "selected" : ""}>Participants</option>
        </select>
        <button class="btn btn-secondary" onclick="showToast('Import CSV utilisateurs', 'info')">${icon("upload", 14)} Import CSV</button>
        <button class="btn btn-primary" onclick="openCreateUser()">${icon("plus", 14)} Nouvel utilisateur</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Formation(s)</th><th>Email</th><th></th></tr></thead>
        <tbody>
          ${filteredUsers.map(u => {
    const enrollCount = enrollments.filter(e => e.userId === u.id).length;
    const roleClass = u.role === "admin" ? "badge badge--danger" : u.role === "trainer" ? "badge badge--info" : "badge badge--success";
    const roleLabel = u.role === "admin" ? "Admin" : u.role === "trainer" ? "Formateur" : "Participant";
    return `<tr>
              <td><div class="person-cell"><span class="avatar">${u.avatar}</span><strong>${escapeHTML(`${u.firstName} ${u.lastName}`)}</strong></div></td>
              <td><span class="${roleClass}">${roleLabel}</span></td>
              <td>${enrollCount}</td>
              <td style="font-size:13px; color:var(--text-muted);">${escapeHTML(u.email || "")}</td>
              <td class="td-actions"><button class="btn btn-sm btn-secondary" onclick="showToast('Prévisualisation de ${escapeHTML(u.firstName)}', 'info')">${icon("eye", 13)} Voir</button></td>
            </tr>`;
  }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCatalog() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Catalogue</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Catalogue des formations</h1><p class="page-subtitle">${courses.length} formations dans le LMS.</p></div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Formation</th><th>Inscriptions</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${courses.map(c => `<tr>
            <td><strong>${escapeHTML(c.title)}</strong></td>
            <td>${enrollments.filter(e => e.courseId === c.id).length}</td>
            <td>${renderStatusBadge(c.status)}</td>
            <td class="td-actions"><button class="btn btn-sm btn-secondary" onclick="showToast('Aperçu de ${escapeHTML(c.title)}', 'info')">${icon("eye", 13)} Voir</button></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCourseReview() {
  const pending = getCoursesByStatus("submitted_for_review");
  return `
    <div class="breadcrumb"><span>Administration</span><span>Validation des cours</span></div>
    <div class="page-header"><div><h1 class="page-title">Validation des cours</h1></div></div>
    ${pending.length
    ? `<div class="grid-2">${pending.map(c => `<div class="card"><h3 class="card-title">${escapeHTML(c.title)}</h3><p class="card-subtitle">Cours soumis pour examen.</p></div>`).join("")}</div>`
    : '<div class="empty-state"><h3>Aucun cours à examiner</h3><p>Tous les cours publiés sont déjà validés.</p></div>'}
  `;
}

function renderAdminRequests() {
  const pending = getRequestsByStatus("pending");
  return `
    <div class="breadcrumb"><span>Administration</span><span>Demandes</span></div>
    <div class="page-header"><div><h1 class="page-title">Demandes d'inscription</h1><p class="page-subtitle">${pending.length} demande(s) en attente.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${pending.map(r => {
    const u = getUser(r.userId);
    const c = getCourse(r.courseId);
    return `<tr>
              <td>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${fmtDate(r.requestedAt)}</td>
              <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="openRequest('${r.id}')">${icon("eye", 13)} Examiner</button></td>
            </tr>`;
  }).join("") || '<tr><td colspan="4"><div class="empty-state"><h3>Aucune demande</h3><p>Tout est à jour.</p></div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminEnrollments() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Inscriptions</span></div>
    <div class="page-header"><div><h1 class="page-title">Inscriptions</h1><p class="page-subtitle">${enrollments.length} inscriptions actives.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Date</th><th>Paiement</th></tr></thead>
        <tbody>
          ${enrollments.map(e => {
    const u = getUser(e.userId);
    const c = getCourse(e.courseId);
    return `<tr>
              <td><div class="person-cell"><span class="avatar">${u ? u.avatar : "?"}</span><strong>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</strong></div></td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${fmtDate(e.enrollmentDate)}</td>
              <td>${paymentStatusLabel(effectivePaymentStatus(e))}</td>
            </tr>`;
  }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminGroups() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Groupes & accès</span></div>
    <div class="page-header"><div><h1 class="page-title">Groupes & accès</h1><p class="page-subtitle">${groups.length} cohortes configurées.</p></div></div>
    <div class="grid-2">
      ${groups.map(g => {
    const c = getCourse(g.courseId);
    const members = g.members.map(id => getUser(id)).filter(Boolean);
    return `<div class="card">
          <div class="card-title">${icon("layers", 18)} ${escapeHTML(g.name)}</div>
          <p class="card-subtitle">${c ? escapeHTML(c.title) : "-"}</p>
          <div style="margin-top:10px;">
            ${members.map(m => `<div class="person-cell" style="margin-bottom:6px;"><span class="avatar">${m.avatar}</span><span>${escapeHTML(`${m.firstName} ${m.lastName}`)}</span></div>`).join("")}
          </div>
        </div>`;
  }).join("")}
    </div>
  `;
}

function renderAdminPayments() {
  const total = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Paiements</span></div>
    <div class="page-header"><div><h1 class="page-title">Paiements</h1><p class="page-subtitle">Total encaissé : <strong>${fmtMoney(total)}</strong></p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Référence</th><th>Montant</th><th>Statut</th></tr></thead>
        <tbody>
          ${payments.map(p => `<tr><td>${escapeHTML(p.id)}</td><td>${fmtMoney(p.amount)}</td><td>${paymentStatusLabel(p.status)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminCertificates() {
  const eligible = enrollments.filter(e => getCourseProgress(e.userId, e.courseId) >= 80);
  return `
    <div class="breadcrumb"><span>Administration</span><span>Certificats</span></div>
    <div class="page-header"><div><h1 class="page-title">Certificats</h1><p class="page-subtitle">${certificates.length} émis · ${eligible.length} éligibles</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formation</th><th>Éligibilité</th></tr></thead>
        <tbody>
          ${eligible.map(e => {
    const u = getUser(e.userId);
    const c = getCourse(e.courseId);
    return `<tr>
              <td>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${renderStatusBadge("approved")}</td>
            </tr>`;
  }).join("") || '<tr><td colspan="3"><div class="empty-state"><h3>Aucun participant éligible</h3></div></td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminImportExport() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Import / Export</span></div>
    <div class="page-header"><div><h1 class="page-title">Import / Export</h1><p class="page-subtitle">Sauvegarde et synchronisation des données.</p></div></div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Export</div>
        <p class="settings-note">Exporte les utilisateurs, formations, inscriptions et paiements.</p>
        <button class="btn btn-primary" onclick="showToast('Export généré', 'success')">${icon("download", 14)} Export complet</button>
      </div>
      <div class="settings-card">
        <div class="card-head">Import</div>
        <p class="settings-note">Charge un fichier pour restaurer les données de la plateforme.</p>
        <button class="btn btn-secondary" onclick="showToast('Import en cours...', 'info')">${icon("upload", 14)} Importer</button>
      </div>
    </div>
  `;
}

function renderAdminActivity() {
  return `
    <div class="breadcrumb"><span>Administration</span><span>Journal d'activité</span></div>
    <div class="page-header"><div><h1 class="page-title">Journal d'activité</h1><p class="page-subtitle">Historique récent des actions sur la plateforme.</p></div></div>
    <div class="card">
      ${activityLog.map(entry => {
    const actor = getUser(entry.actorId);
    return `<div class="activity-item">
          <span class="activity-dot"></span>
          <div class="activity-content">
            <div><strong>${escapeHTML(entry.details)}</strong></div>
            <div class="activity-time">${actor ? escapeHTML(`${actor.firstName} ${actor.lastName}`) : "-"} • ${fmtDate(entry.at)}</div>
          </div>
        </div>`;
  }).join("")}
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
    <div class="page-header"><div><h1 class="page-title">Rôles & permissions</h1></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Permission</th><th>Admin</th><th>Formateur</th><th>Participant</th></tr></thead>
        <tbody>
          ${permissions.map(p => `<tr><td><strong>${p[0]}</strong></td><td>${p[1] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td><td>${p[2] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td><td>${p[3] ? renderStatusBadge("approved") : renderStatusBadge("needs_correction")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminSettings() {
  const s = adminSettings;
  return `
    <div class="breadcrumb"><span>Administration</span><span>Paramètres</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Paramètres LMS</h1><p class="page-subtitle">Ajustez les règles de la plateforme, les notifications et la sécurité.</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="resetSettings()">${icon("x", 16)} Réinitialiser</button>
        <button class="btn btn-primary" onclick="saveSettings()">${icon("check", 16)} Enregistrer</button>
      </div>
    </div>
    <div class="settings-grid">
      <section class="settings-card">
        <div class="card-head">Plateforme</div>
        <div class="form-group"><label for="set_name">Nom de la plateforme</label><input class="form-control" type="text" id="set_name" value="${escapeHTML(s.platformName)}"></div>
        <div class="form-group"><label for="set_language">Langue</label><select class="form-control" id="set_language"><option value="fr" ${s.language === "fr" ? "selected" : ""}>Français (Canada)</option><option value="en" ${s.language === "en" ? "selected" : ""}>English</option><option value="ar" ${s.language === "ar" ? "selected" : ""}>العربية</option></select></div>
        <div class="form-group"><label for="set_timezone">Fuseau horaire</label><select class="form-control" id="set_timezone"><option value="America/Montreal" ${s.timezone === "America/Montreal" ? "selected" : ""}>America/Montreal (UTC-5)</option><option value="Africa/Tunis" ${s.timezone === "Africa/Tunis" ? "selected" : ""}>Africa/Tunis (UTC+1)</option><option value="Europe/Paris" ${s.timezone === "Europe/Paris" ? "selected" : ""}>Europe/Paris (UTC+1)</option></select></div>
        <div class="form-group"><label for="set_currency">Devise</label><select class="form-control" id="set_currency"><option value="CAD" ${s.currency === "CAD" ? "selected" : ""}>CAD</option><option value="USD" ${s.currency === "USD" ? "selected" : ""}>USD</option><option value="EUR" ${s.currency === "EUR" ? "selected" : ""}>EUR</option><option value="TND" ${s.currency === "TND" ? "selected" : ""}>TND</option></select></div>
      </section>
      <section class="settings-card">
        <div class="card-head">Certificats</div>
        <div class="form-group"><label for="set_cert_threshold">Seuil de progression (%)</label><input class="form-control" type="number" id="set_cert_threshold" min="0" max="100" value="${s.certThreshold}"></div>
        <div class="form-group"><label for="set_cert_auto">Émission</label><select class="form-control" id="set_cert_auto"><option value="manual" ${!s.certAutoEmit ? "selected" : ""}>Manuelle (admin)</option><option value="auto" ${s.certAutoEmit ? "selected" : ""}>Automatique</option></select></div>
        <div class="form-group"><label for="set_cert_format">Format de code</label><input class="form-control" type="text" id="set_cert_format" value="${escapeHTML(s.certCodeFormat)}"></div>
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
        <div class="form-group"><label for="set_pwd_policy">Politique de mot de passe</label><select class="form-control" id="set_pwd_policy"><option value="standard" ${s.passwordPolicy === "standard" ? "selected" : ""}>Standard (8 caractères min.)</option><option value="strong" ${s.passwordPolicy === "strong" ? "selected" : ""}>Renforcée (12 + spéciaux)</option></select></div>
        <div class="form-group"><label for="set_mfa">Double authentification</label><select class="form-control" id="set_mfa"><option value="optional" ${s.mfa === "optional" ? "selected" : ""}>Optionnelle</option><option value="admins" ${s.mfa === "admins" ? "selected" : ""}>Requise pour les admins</option><option value="all" ${s.mfa === "all" ? "selected" : ""}>Requise pour tous</option></select></div>
        <div class="form-group"><label for="set_session">Durée de session</label><select class="form-control" id="set_session"><option value="2h" ${s.sessionDuration === "2h" ? "selected" : ""}>2 heures</option><option value="8h" ${s.sessionDuration === "8h" ? "selected" : ""}>8 heures</option><option value="24h" ${s.sessionDuration === "24h" ? "selected" : ""}>24 heures</option></select></div>
      </section>
    </div>
    <section class="danger-card">
      <div class="card-head danger">Zone de danger</div>
      <p>Cette action supprime toutes les données locales sauvegardées. Elle est irréversible.</p>
      <button class="btn btn-danger" onclick="if(confirm('Vider tout le cache LMS ?')) { clearLMSStorage(); location.reload(); }">${icon("x", 16)} Vider le cache LMS</button>
    </section>
  `;
}

// =============================================================================
// RENDER — FORMATEUR
// =============================================================================

function trainerEmptyState(title, message) {
  return `<div class="empty-state"><div class="empty-icon">${icon("clock", 26)}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p></div>`;
}

function trainerCourseCard(course, uid) {
  const participants = enrollments.filter(e => e.courseId === course.id);
  const pending = trainerSubmissions.filter(s => s.courseId === course.id && s.status === "submitted").length;
  const completed = participants.filter(e => getCourseProgress(e.userId, e.courseId) >= 70).length;
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

function renderTrainerDashboard(uid) {
  const { trainerCourses, participants, submissions: subs, pendingCorrections, upcomingSessions } = getTrainerStats(uid);
  const readyToGrade = subs.filter(s => s.status === "submitted").length;
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Pilote d'enseignement</h1><p class="page-subtitle">Suivez vos cours, vos remises et vos prochaines sessions.</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('preview')">${icon("eye", 16)} Prévisualiser</button>
        <button class="btn btn-primary" onclick="navigate('corrections')">${icon("edit", 16)} Corriger</button>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">Mes formations</span><div class="kpi-icon">${icon("book", 18)}</div></div><div class="kpi-value">${trainerCourses.length}</div></div>
      <div class="kpi kpi--accent"><div class="kpi-head"><span class="kpi-label">Participants</span><div class="kpi-icon">${icon("users", 18)}</div></div><div class="kpi-value">${participants.length}</div></div>
      <div class="kpi kpi--success"><div class="kpi-head"><span class="kpi-label">Devoirs à corriger</span><div class="kpi-icon">${icon("upload", 18)}</div></div><div class="kpi-value">${pendingCorrections}</div><div class="kpi-delta positive">${readyToGrade} remises à traiter</div></div>
      <div class="kpi kpi--gold"><div class="kpi-head"><span class="kpi-label">Séances à venir</span><div class="kpi-icon">${icon("calendar", 18)}</div></div><div class="kpi-value">${upcomingSessions}</div></div>
    </div>
    <div class="grid-main">
      <div>
        <div class="section-title"><h2>Mes cours</h2><a href="#" onclick="event.preventDefault(); navigate('myteaching')">Voir tout →</a></div>
        <div class="grid-2">
          ${trainerCourses.slice(0, 4).map(c => trainerCourseCard(c, uid)).join("") || trainerEmptyState("Aucun cours assigné", "Aucune formation n'est liée à votre compte.")}
        </div>
      </div>
      <div>
        <div class="card">
          <h3 class="card-title">${icon("clock", 18)} Agenda proche</h3>
          ${trainerSessions.map(s => {
    const c = getCourse(s.courseId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${escapeHTML(s.title)}</strong></div><div class="activity-time">${c ? escapeHTML(c.title) : "-"} • ${fmtDate(s.startsAt)}</div></div></div>`;
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
      <div><h1 class="page-title">Mes formations</h1><p class="page-subtitle">Les cours sous votre responsabilité.</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('courses')">${icon("book", 16)} Liste des cours</button>
        <button class="btn btn-primary" onclick="navigate('import')">${icon("upload", 16)} Importer un cours</button>
      </div>
    </div>
    <div class="grid-2">
      ${trainerCourses.map(c => trainerCourseCard(c, uid)).join("") || trainerEmptyState("Aucune formation", "Votre compte n'est lié à aucune formation.")}
    </div>
  `;
}

function renderTrainerCourses(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Mes cours</span></div>
    <div class="page-header"><div><h1 class="page-title">Mes cours</h1><p class="page-subtitle">${trainerCourses.length} cours dans votre périmètre.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Cours</th><th>Participants</th><th>Remises</th><th></th></tr></thead>
        <tbody>
          ${trainerCourses.map(c => {
    const pCount = enrollments.filter(e => e.courseId === c.id).length;
    const pending = trainerSubmissions.filter(s => s.courseId === c.id && s.status === "submitted").length;
    return `<tr>
              <td><strong>${escapeHTML(c.title)}</strong></td>
              <td>${pCount}</td>
              <td>${pending}</td>
              <td class="td-actions"><button class="btn btn-sm btn-secondary" onclick="navigate('myteaching')">${icon("eye", 13)} Ouvrir</button></td>
            </tr>`;
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
    <div class="page-header"><div><h1 class="page-title">Calendrier</h1><p class="page-subtitle">Séances et échéances de vos cours.</p></div></div>
    <div class="card">
      ${trainerSessions.filter(s => trainerCourses.some(c => c.id === s.courseId)).map(s => {
    const c = getCourse(s.courseId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${escapeHTML(s.title)}</strong></div><div class="activity-time">${c ? escapeHTML(c.title) : "-"} • ${fmtDate(s.startsAt)}</div></div></div>`;
  }).join("") || trainerEmptyState("Aucun événement", "Aucune séance planifiée.")}
    </div>
  `;
}

function renderTrainerEvaluations(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const tab = appState.trainerEvalTab || "quiz";
  const filtered = trainerEvaluations.filter(item => trainerCourses.some(c => c.id === item.courseId));
  const visible = filtered.filter(item => tab === "quiz" ? item.kind === "quiz" : tab === "devoirs" ? item.kind === "devoir" : item.kind === "autre");
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Quiz & devoirs</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Quiz & devoirs</h1></div>
      <div class="page-actions">
        <button class="btn btn-secondary${tab === "quiz" ? " active" : ""}" onclick="appState.trainerEvalTab='quiz'; renderWorkspacePage('trainer','evaluations');">${icon("book", 14)} Quiz</button>
        <button class="btn btn-secondary${tab === "devoirs" ? " active" : ""}" onclick="appState.trainerEvalTab='devoirs'; renderWorkspacePage('trainer','evaluations');">${icon("upload", 14)} Devoirs</button>
        <button class="btn btn-secondary${tab === "autres" ? " active" : ""}" onclick="appState.trainerEvalTab='autres'; renderWorkspacePage('trainer','evaluations');">${icon("fileText", 14)} Autres</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Évaluation</th><th>Cours</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${visible.map(item => {
    const c = getCourse(item.courseId);
    return `<tr>
              <td><strong>${escapeHTML(item.title)}</strong></td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${renderStatusBadge(item.status)}</td>
              <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="showToast('Ouverture de ${escapeHTML(item.title)}', 'info')">${icon("eye", 13)} Voir</button></td>
            </tr>`;
  }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune évaluation", "Aucun élément pour cet onglet.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerCorrections(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const pending = trainerSubmissions.filter(s => trainerCourses.some(c => c.id === s.courseId) && s.kind === "devoir" && s.status === "submitted");
  const graded = trainerSubmissions.filter(s => trainerCourses.some(c => c.id === s.courseId) && s.kind === "devoir" && s.status === "graded");
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Corrections</span></div>
    <div class="page-header"><div><h1 class="page-title">Corrections</h1><p class="page-subtitle">${pending.length} en attente · ${graded.length} corrigés</p></div></div>
    <div class="grid-2">
      <div class="card">
        <h3 class="card-title">${icon("upload", 18)} À corriger</h3>
        ${pending.map(s => {
    const u = getUser(s.userId);
    const c = getCourse(s.courseId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${escapeHTML(s.title)}</strong></div><div class="activity-time">${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"} • ${c ? escapeHTML(c.title) : "-"}</div></div></div>`;
  }).join("") || trainerEmptyState("Aucun devoir en attente", "Toutes les remises ont été traitées.")}
      </div>
      <div class="card">
        <h3 class="card-title">${icon("check", 18)} Récemment corrigés</h3>
        ${graded.map(s => {
    const u = getUser(s.userId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${escapeHTML(s.title)}</strong></div><div class="activity-time">${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"} • Noté</div></div></div>`;
  }).join("") || trainerEmptyState("Aucune correction récente", "")}
      </div>
    </div>
  `;
}

function renderTrainerRemises(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const items = trainerSubmissions.filter(s => trainerCourses.some(c => c.id === s.courseId));
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Remises</span></div>
    <div class="page-header"><div><h1 class="page-title">Remises</h1><p class="page-subtitle">${items.length} remise(s) au total.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Élément</th><th>Formation</th><th>Statut</th></tr></thead>
        <tbody>
          ${items.map(item => {
    const u = getUser(item.userId);
    const c = getCourse(item.courseId);
    return `<tr>
              <td>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</td>
              <td>${escapeHTML(item.title)}</td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${renderStatusBadge(item.status)}</td>
            </tr>`;
  }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune remise", "")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerParticipants(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const enrolledIds = [...new Set(enrollments.filter(e => trainerCourses.some(c => c.id === e.courseId)).map(e => e.userId))];
  const trainerParticipants = enrolledIds.map(id => getUser(id)).filter(Boolean);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Participants</span></div>
    <div class="page-header"><div><h1 class="page-title">Participants</h1><p class="page-subtitle">${trainerParticipants.length} apprenants dans vos cours.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Formations</th><th>Progression</th></tr></thead>
        <tbody>
          ${trainerParticipants.map(u => {
    const pCourses = getParticipantCourses(u.id).filter(item => trainerCourses.some(c => c.id === item.enrollment.courseId));
    const avg = pCourses.length ? Math.round(pCourses.reduce((s, i) => s + i.progress, 0) / pCourses.length) : 0;
    return `<tr>
              <td><div class="person-cell"><span class="avatar">${u.avatar}</span><strong>${escapeHTML(`${u.firstName} ${u.lastName}`)}</strong></div></td>
              <td>${pCourses.length}</td>
              <td>${avg}%</td>
            </tr>`;
  }).join("") || `<tr><td colspan="3">${trainerEmptyState("Aucun participant", "")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerTracking(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Suivi</span></div>
    <div class="page-header"><div><h1 class="page-title">Suivi de mes cours</h1></div></div>
    <div class="grid-2">
      ${trainerCourses.map(c => {
    const participants = getCourseParticipants(c.id);
    const avg = participants.length ? Math.round(participants.reduce((s, i) => s + i.progress, 0) / participants.length) : 0;
    return `<div class="card">
          <div class="card-title">${icon("book", 18)} ${escapeHTML(c.title)}</div>
          <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr); margin-top:12px;">
            <div class="kpi" style="padding:12px;"><div class="kpi-label">Inscrits</div><div class="kpi-value" style="font-size:22px;">${participants.length}</div></div>
            <div class="kpi kpi--success" style="padding:12px;"><div class="kpi-label">Progression</div><div class="kpi-value" style="font-size:22px;">${avg}%</div></div>
          </div>
        </div>`;
  }).join("") || trainerEmptyState("Aucun cours", "")}
    </div>
  `;
}

function renderTrainerPreview(uid) {
  const trainerCourses = getTrainerCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Prévisualisation</span></div>
    <div class="page-header"><div><h1 class="page-title">Prévisualisation</h1><p class="page-subtitle">Visualisez vos cours comme les verrait un apprenant.</p></div></div>
    <div class="grid-2">
      ${trainerCourses.map(c => `
        <div class="card">
          <div class="card-title">${icon("eye", 18)} ${escapeHTML(c.title)}</div>
          <p class="card-subtitle">Aperçu du contenu, modules et ressources.</p>
          <button class="btn btn-primary btn-sm" onclick="showToast('Prévisualisation de ${escapeHTML(c.title)}', 'success')">${icon("eye", 13)} Ouvrir l'aperçu</button>
        </div>
      `).join("") || trainerEmptyState("Aucun cours", "")}
    </div>
  `;
}

function renderTrainerSubmissions(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const items = trainerSubmissions.filter(s => trainerCourses.some(c => c.id === s.courseId));
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Demandes de validation</span></div>
    <div class="page-header"><div><h1 class="page-title">Demandes de validation</h1></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Participant</th><th>Élément</th><th>Type</th><th>Statut</th></tr></thead>
        <tbody>
          ${items.map(item => {
    const u = getUser(item.userId);
    return `<tr>
              <td>${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</td>
              <td>${escapeHTML(item.title)}</td>
              <td>${item.kind === "devoir" ? "Devoir" : "Document"}</td>
              <td>${renderStatusBadge(item.status)}</td>
            </tr>`;
  }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerStudio(uid) {
  const trainerCourses = getTrainerCourses(uid);
  const selected = trainerCourses.find(c => c.id === appState.trainerSelectedCourseId) || trainerCourses[0];
  appState.trainerSelectedCourseId = selected ? selected.id : "";
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Studio</span></div>
    <div class="page-header"><div><h1 class="page-title">Studio pédagogique</h1></div></div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Sélection du cours</div>
        <select class="form-control" onchange="appState.trainerSelectedCourseId = this.value; renderWorkspacePage('trainer','studio');">
          ${trainerCourses.map(c => `<option value="${c.id}" ${selected && selected.id === c.id ? "selected" : ""}>${escapeHTML(c.title)}</option>`).join("")}
        </select>
        ${selected ? `<div class="settings-note" style="margin-top:12px;">${escapeHTML(selected.title)} est le cours actuellement édité.</div>` : ""}
      </div>
      <div class="settings-card">
        <div class="card-head">Outils rapides</div>
        <button class="btn btn-secondary" onclick="showToast('Nouveau module', 'info')" style="width:100%; margin-bottom:8px;">${icon("plus", 14)} Ajouter un module</button>
        <button class="btn btn-secondary" onclick="showToast('Nouvelle ressource', 'info')" style="width:100%; margin-bottom:8px;">${icon("upload", 14)} Ajouter une ressource</button>
        <button class="btn btn-secondary" onclick="navigate('evaluations')" style="width:100%; margin-bottom:8px;">${icon("fileText", 14)} Gérer les évaluations</button>
        <button class="btn btn-secondary" onclick="navigate('preview')" style="width:100%;">${icon("eye", 14)} Prévisualiser</button>
      </div>
    </div>
  `;
}

function renderTrainerImport() {
  return `
    <div class="breadcrumb"><span>Espace Formateur</span><span>Import</span></div>
    <div class="page-header"><div><h1 class="page-title">Import d'une formation</h1></div></div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="card-head">Démarrer un import</div>
        <p class="settings-note">Utilisez un paquet ZIP pour créer rapidement une nouvelle formation.</p>
        <button class="btn btn-primary" onclick="showToast('Import en cours', 'success')">${icon("upload", 14)} Choisir un ZIP</button>
      </div>
      <div class="settings-card">
        <div class="card-head">Structure attendue</div>
        <div class="settings-note">Incluez les dossiers <strong>content</strong>, <strong>evaluation</strong> et <strong>resources</strong>.</div>
      </div>
    </div>
  `;
}

// =============================================================================
// RENDER — PARTICIPANT
// =============================================================================

function renderParticipantDashboard(uid) {
  const participantCourses = getParticipantCourses(uid);
  const nextCourse = participantCourses[0];
  const completedCount = participantCourses.filter(i => i.progress >= 100).length;
  const pendingAssignments = submissions.filter(s => s.userId === uid && s.status !== "graded").length;
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div><h1 class="page-title">Mon parcours</h1><p class="page-subtitle">Vos cours, votre progression et vos certificats.</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigate('courses')">${icon("book", 16)} Mes cours</button>
        <button class="btn btn-primary" onclick="navigate('certificates')">${icon("award", 16)} Certificats</button>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">Cours suivis</span><div class="kpi-icon">${icon("book", 18)}</div></div><div class="kpi-value">${participantCourses.length}</div></div>
      <div class="kpi kpi--success"><div class="kpi-head"><span class="kpi-label">Terminés</span><div class="kpi-icon">${icon("check", 18)}</div></div><div class="kpi-value">${completedCount}</div></div>
      <div class="kpi kpi--accent"><div class="kpi-head"><span class="kpi-label">Progression moyenne</span><div class="kpi-icon">${icon("chart", 18)}</div></div><div class="kpi-value">${participantCourses.length ? Math.round(participantCourses.reduce((s, i) => s + i.progress, 0) / participantCourses.length) : 0}%</div></div>
      <div class="kpi kpi--gold"><div class="kpi-head"><span class="kpi-label">Remises à suivre</span><div class="kpi-icon">${icon("upload", 18)}</div></div><div class="kpi-value">${pendingAssignments}</div></div>
    </div>
    <div class="grid-main">
      <div>
        <div class="section-title"><h2>Mes cours</h2><a href="#" onclick="event.preventDefault(); navigate('courses')">Voir tout →</a></div>
        <div class="grid-2">
          ${participantCourses.map(item => `
            <div class="card">
              <div class="card-title">${icon("book", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
              <div class="settings-note">Progression : <strong>${item.progress}%</strong></div>
              <div class="progress-bar" style="height:10px; background:#e9eef5; border-radius:999px; overflow:hidden; margin:12px 0 14px;"><div style="width:${item.progress}%; height:100%; background:linear-gradient(135deg, var(--accent), var(--primary));"></div></div>
              <button class="btn btn-secondary btn-sm" onclick="navigate('assignments')">${icon("upload", 13)} Mes remises</button>
            </div>
          `).join("") || trainerEmptyState("Aucun cours", "Aucune formation liée à votre compte.")}
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
                <div class="activity-time">${fmtDate(nextCourse.enrollment.enrollmentDate)} • Démarrer par le premier module</div>
              </div>
            </div>
          ` : trainerEmptyState("Rien à afficher", "Votre tableau se remplira dès votre première inscription.")}
        </div>
        <div class="card" style="margin-top:16px;">
          <h3 class="card-title">${icon("award", 18)} Certificats</h3>
          ${certificates.filter(cert => cert.userId === uid).map(cert => {
    const c = getCourse(cert.courseId);
    return `<div class="activity-item"><span class="activity-dot"></span><div class="activity-content"><div><strong>${c ? escapeHTML(c.title) : "Certificat"}</strong></div><div class="activity-time">${fmtDate(cert.issueDate)}</div></div></div>`;
  }).join("") || trainerEmptyState("Aucun certificat", "Vos certificats apparaîtront ici.")}
        </div>
      </div>
    </div>
  `;
}

function renderParticipantCourses(uid) {
  const participantCourses = getParticipantCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Mes cours</span></div>
    <div class="page-header"><div><h1 class="page-title">Mes cours</h1><p class="page-subtitle">Vos formations actives et votre progression.</p></div></div>
    <div class="grid-2">
      ${participantCourses.map(item => `
        <div class="card">
          <div class="card-title">${icon("book", 18)} ${item.course ? escapeHTML(item.course.title) : "-"}</div>
          <div class="settings-note">Inscrit le ${fmtDate(item.enrollment.enrollmentDate)} • Paiement ${item.enrollment.paymentStatus === "paid" ? "validé" : "en attente"}</div>
          <div class="progress-bar" style="height:10px; background:#e9eef5; border-radius:999px; overflow:hidden; margin:12px 0 14px;"><div style="width:${item.progress}%; height:100%; background:linear-gradient(135deg, var(--accent), var(--primary));"></div></div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('calendar')">${icon("calendar", 13)} Calendrier</button>
        </div>
      `).join("") || trainerEmptyState("Aucun cours", "Aucune formation active.")}
    </div>
  `;
}

function renderParticipantAssignments(uid) {
  const items = submissions.filter(s => s.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Remises</span></div>
    <div class="page-header"><div><h1 class="page-title">Mes remises</h1><p class="page-subtitle">Vos devoirs déposés et leur statut.</p></div></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Remise</th><th>Formation</th><th>Type</th><th>Statut</th></tr></thead>
        <tbody>
          ${items.map(item => {
    const c = getCourse(item.courseId);
    return `<tr>
              <td><strong>${escapeHTML(item.title)}</strong></td>
              <td>${c ? escapeHTML(c.title) : "-"}</td>
              <td>${item.kind === "devoir" ? "Devoir" : "Document"}</td>
              <td>${renderStatusBadge(item.status)}</td>
            </tr>`;
  }).join("") || `<tr><td colspan="4">${trainerEmptyState("Aucune remise", "Déposez votre premier document ici.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderParticipantCertificates(uid) {
  const items = certificates.filter(cert => cert.userId === uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Certificats</span></div>
    <div class="page-header"><div><h1 class="page-title">Certificats</h1><p class="page-subtitle">Vos attestations obtenues.</p></div></div>
    <div class="grid-2">
      ${items.map(cert => {
    const c = getCourse(cert.courseId);
    return `<div class="card"><div class="card-title">${icon("award", 18)} ${c ? escapeHTML(c.title) : "Certificat"}</div><div class="settings-note">Émis le ${fmtDate(cert.issueDate)}</div></div>`;
  }).join("") || trainerEmptyState("Aucun certificat", "Terminez vos formations pour obtenir un certificat.")}
    </div>
  `;
}

function renderParticipantCalendar(uid) {
  const participantCourses = getParticipantCourses(uid);
  return `
    <div class="breadcrumb"><span>Espace Apprenant</span><span>Calendrier</span></div>
    <div class="page-header"><div><h1 class="page-title">Calendrier</h1><p class="page-subtitle">Vos prochaines étapes et échéances.</p></div></div>
    <div class="card">
      ${participantCourses.map(item => `
        <div class="activity-item">
          <span class="activity-dot"></span>
          <div class="activity-content">
            <div><strong>${item.course ? escapeHTML(item.course.title) : "-"}</strong></div>
            <div class="activity-time">Inscrit le ${fmtDate(item.enrollment.enrollmentDate)}</div>
          </div>
        </div>
      `).join("") || trainerEmptyState("Aucun événement", "Votre calendrier apparaîtra une fois vos cours ouverts.")}
    </div>
  `;
}

// =============================================================================
// SHELL & NAVIGATION
// =============================================================================

function setupWorkspaceShell(role) {
  const sidebar = document.querySelector(".sidebar");
  const topbar = document.querySelector(".topbar");
  if (!sidebar || !topbar) return;

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
    ["preview", "Prévisualisation"],
    ["submissions", "Demandes"],
    ["studio", "Studio"],
    ["import", "Import"]
  ] : role === "participant" ? [
    ["dashboard", "Tableau de bord"],
    ["courses", "Mes cours"],
    ["assignments", "Remises"],
    ["calendar", "Calendrier"],
    ["certificates", "Certificats"]
  ] : [
    ["dashboard", "Tableau de bord"],
    ["tracking", "Suivi global"],
    ["users", "Utilisateurs"],
    ["catalog", "Catalogue"],
    ["requests", "Demandes"],
    ["settings", "Paramètres"]
  ];

  sidebar.innerHTML = `
    <div class="sidebar-section-title" style="margin-top: 35px;">${role === "trainer" ? "Formateur" : role === "participant" ? "Apprenant" : "Administration"}</div>
    <nav class="nav-list">
      ${navItems.map(([view, label], i) => `<a class="nav-item${i === 0 ? " active" : ""}" href="#" data-view="${view}" ${i === 0 ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
  `;

  const titleEl = topbar.querySelector(".topbar-title");
  if (titleEl) titleEl.textContent = role === "trainer" ? "Programme Jeunes Talents - Formateur" : role === "participant" ? "Programme Jeunes Talents - Apprenant" : "Programme Jeunes Talents";

  syncUserChip();
}

function renderPlaceholderPage(viewName) {
  const labels = { tracking: "Suivi global", users: "Utilisateurs", catalog: "Catalogue", requests: "Demandes", course_review: "Validation des cours", enrollments: "Inscriptions", groups: "Groupes et accès", payments: "Paiements", certificates: "Certificats", import_export: "Import / Export", activity: "Journal d'activité" };
  const label = labels[viewName] || "Section";
  return `
    <div class="breadcrumb"><span>Administration</span><span>${label}</span></div>
    <div class="page-header">
      <div><h1 class="page-title">${label}</h1><p class="page-subtitle">Page en cours de finalisation.</p></div>
    </div>
    <div class="empty-state"><div class="empty-icon">${icon("clock", 28)}</div><h3>Bientôt disponible</h3></div>
  `;
}

function renderWorkspacePage(role = getWorkspaceRole(), viewName = "dashboard") {
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
    courses: renderParticipantCourses,
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
      ? trainerEmptyState("Page en cours de finalisation", "Cette vue sera complétée prochainement.")
      : role === "participant"
        ? trainerEmptyState("Page en cours de finalisation", "Cette vue sera complétée prochainement.")
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

// =============================================================================
// MODALS & TOASTS
// =============================================================================

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
  const role = getWorkspaceRole();
  renderWorkspacePage(role, viewName);
}

function openRequest(requestId) {
  console.log("requestId =", requestId);
  console.log("enrollmentRequests =", enrollmentRequests);

  const request = enrollmentRequests.find(r => r.id === requestId);
  const u = request ? getUser(request.userId) : null;
  const c = request ? getCourse(request.courseId) : null;
  showModal(
    `Demande d'inscription`,
    `<p><strong>Participant :</strong> ${u ? escapeHTML(`${u.firstName} ${u.lastName}`) : "-"}</p>
     <p><strong>Formation :</strong> ${c ? escapeHTML(c.title) : "-"}</p>
     <p><strong>Date :</strong> ${request ? fmtDate(request.requestedAt) : "-"}</p>`,
    `<button class="btn btn-secondary" onclick="processRequest('${requestId}', 'reject')" style="color:var(--danger, #e53e3e);">Rejeter</button>
     <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
     <button class="btn btn-primary" onclick="processRequest('${requestId}', 'approve')">${icon("check", 14)} Approuver l'accès</button>`
  );
}

function openCreateUser() {
  showModal(
    "Nouvel utilisateur",
    `<p>Création d'un compte administrateur, formateur ou participant.</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="showToast('Utilisateur créé', 'success'); closeModal();">Créer</button>`
  );
}

async function processRequest(requestId, action = "approve") {
  const request = enrollmentRequests.find(r => r.id === requestId);
  if (!request) { showToast("Demande introuvable", "error"); return; }

  const newStatus = action === "approve" ? "approved" : "rejected";

  try {
    // 1. Mettre à jour le statut de la demande dans Supabase
    const { error: reqError } = await window.supabaseInstance
      .from('enrollment_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (reqError) throw reqError;

    // 2. Si approuvé → créer l'inscription dans enrollments
    if (action === "approve") {
      const { error: enrError } = await window.supabaseInstance
        .from('enrollments')
        .insert({ user_id: request.userId, course_id: request.courseId, payment_status: "paid" });

      // on ignore le conflit si l'inscription existe déjà
      if (enrError && !enrError.message.includes("duplicate")) throw enrError;

      // Mise à jour locale immédiate
      request.status = "approved";
      if (!enrollments.find(e => e.userId === request.userId && e.courseId === request.courseId)) {
        enrollments.push({
          id: `enr_live_${Date.now()}`,
          userId: request.userId,
          courseId: request.courseId,
          paymentStatus: "paid",
          enrollmentDate: new Date().toISOString().split("T")[0]
        });
      }

      showToast("Demande approuvée — participant inscrit ✓", "success");
    } else {
      request.status = "rejected";
      showToast("Demande rejetée.", "info");
    }

    closeModal();

    // Re-rendu pour refléter les changements
    const role = getWorkspaceRole();
    renderWorkspacePage(role, currentWorkspaceView || "requests");

  } catch (err) {
    console.error("processRequest:", err);
    showToast("Erreur lors du traitement : " + err.message, "error");
  }
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

function clearLMSStorage() {
  localStorage.removeItem(ADMIN_SETTINGS_STORAGE_KEY);
}

// =============================================================================
// SYNC TOPBAR (Supabase → nom réel)
// =============================================================================

async function syncUserChip() {
  try {
    if (!window.supabaseInstance) return;
    const { data: { session } } = await window.supabaseInstance.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await window.supabaseInstance
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .single();

    const fName = profile?.first_name || session.user.user_metadata?.first_name || "";
    const lName = profile?.last_name || session.user.user_metadata?.last_name || "";
    const fullName = `${fName} ${lName}`.trim();

    const nameEl = document.querySelector(".user-chip .user-name");
    const avatarEl = document.querySelector(".user-chip .avatar");
    if (nameEl && fullName) nameEl.textContent = fullName;
    if (avatarEl && fName && lName) avatarEl.textContent = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase();
  } catch (err) {
    console.warn("syncUserChip:", err.message);
  }
}

// =============================================================================
// INIT
// =============================================================================

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
  injectTopbar();
  // 1. Rendu immédiat avec données statiques (0ms)
  renderWorkspacePage(getWorkspaceRole(), "dashboard");
  // 2. Synchronisation Supabase en arrière-plan (met à jour avec les vraies données)
  syncSupabaseData();
});