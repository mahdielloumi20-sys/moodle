const users = [
  { id: "admin_1", firstName: "Karim", lastName: "Karray", role: "admin", avatar: "KK" },
  { id: "trainer_1", firstName: "Leïla", lastName: "Bensaïd", role: "trainer", avatar: "LB" },
  { id: "trainer_2", firstName: "Marc", lastName: "Tremblay", role: "trainer", avatar: "MT" },
  { id: "user_1", firstName: "Ahmed", lastName: "Belkadi", role: "participant", avatar: "AB" },
  { id: "user_2", firstName: "Sarah", lastName: "Trabelsi", role: "participant", avatar: "ST" },
  { id: "user_3", firstName: "Mohamed", lastName: "Cherni", role: "participant", avatar: "MC" },
  { id: "user_4", firstName: "Julie", lastName: "Lavoie", role: "participant", avatar: "JL" },
  { id: "user_5", firstName: "Yasmine", lastName: "Khalfallah", role: "participant", avatar: "YK" },
  { id: "user_6", firstName: "Pierre", lastName: "Gagnon", role: "participant", avatar: "PG" }
];

const courses = [
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

const enrollments = [
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

const enrollmentRequests = [
  { id: "req_1", userId: "user_1", courseId: "course_ia_productivite", requestedAt: "2026-06-18", status: "pending" },
  { id: "req_2", userId: "user_3", courseId: "course_nocode", requestedAt: "2026-06-19", status: "pending" },
  { id: "req_3", userId: "user_6", courseId: "course_freelance", requestedAt: "2026-06-15", status: "approved" }
];

const payments = [
  ...Array.from({ length: 19 }, (_, index) => ({
    id: `pay_${index + 1}`,
    amount: index === 18 ? 500 : 300,
    status: "paid"
  })),
  { id: "pay_pending_1", amount: 300, status: "pending" },
  { id: "pay_pending_2", amount: 300, status: "pending" },
  { id: "pay_pending_3", amount: 300, status: "pending" }
];

const certificates = [
  { id: "cert_1", userId: "user_2", courseId: "course_admin_digitale", issueDate: "2026-08-12" }
];

const activityLog = [
  { id: "log_1", at: "2026-06-01T09:00:00", actorId: "admin_1", details: "Publication des 11 formations du Programme Jeunes Talents dans le LMS." },
  { id: "log_2", at: "2026-06-15T14:30:00", actorId: "admin_1", details: "Sarah inscrite au parcours complet Jeunes Talents." },
  { id: "log_3", at: "2026-08-12T10:00:00", actorId: "trainer_1", details: "Certificat Administration digitale émis pour Sarah." }
];

const ICONS = {
  alertCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
};

function icon(name, size = 18) {
  const svg = ICONS[name] || ICONS.alertCircle;
  return `<span class="nav-icon" style="display:inline-grid;place-items:center;width:${size}px;height:${size}px">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</span>`;
}

function getUser(id) {
  return users.find(user => user.id === id);
}

function getCourse(id) {
  return courses.find(course => course.id === id);
}

function getRequestsByStatus(status) {
  return enrollmentRequests.filter(request => request.status === status);
}

function getCoursesByStatus(status) {
  return courses.filter(course => course.status === status);
}

function normalizePaymentStatus(status) {
  return ["paid", "free", "failed", "cancelled", "pending"].includes(status) ? status : "pending";
}

function effectivePaymentStatus(enrollment) {
  return normalizePaymentStatus(enrollment?.paymentStatus);
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

function fmtMoney(amount, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

function escapeHTML(value) {
  if (value == null) return "";
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderAdminDashboard(uid = "admin_1") {
  const totalUsers = users.length;
  const totalParticipants = users.filter(user => user.role === "participant").length;
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(course => course.status === "published").length;
  const pendingRequests = getRequestsByStatus("pending").length;
  const pendingCourses = getCoursesByStatus("submitted_for_review").length;
  const totalRevenue = payments.filter(payment => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(payment => payment.status === "pending").length;
  const totalCertificates = certificates.length;

  return `
    <div class="breadcrumb"><span>Administration</span><span>Tableau de bord</span></div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pilotage global</h1>
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
              ${enrollments.slice(-5).reverse().map(enrollment => {
                const user = getUser(enrollment.userId);
                const course = getCourse(enrollment.courseId);
                return `
                  <tr>
                    <td><div class="person-cell"><span class="avatar">${user ? user.avatar : "?"}</span><strong>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</strong></div></td>
                    <td>${course ? escapeHTML(course.title) : "-"}</td>
                    <td>${fmtDate(enrollment.enrollmentDate)}</td>
                    <td>${paymentStatusLabel(effectivePaymentStatus(enrollment))}</td>
                  </tr>
                `;
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
                ${getRequestsByStatus("pending").slice(0, 5).map(request => {
                  const user = getUser(request.userId);
                  const course = getCourse(request.courseId);
                  return `
                    <tr>
                      <td>${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</td>
                      <td>${course ? escapeHTML(course.title) : "-"}</td>
                      <td>${fmtDate(request.requestedAt)}</td>
                      <td class="td-actions"><button class="btn btn-sm btn-primary" onclick="openRequest('${request.id}')">${icon("eye", 13)} Examiner</button></td>
                    </tr>
                  `;
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
            `;
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

function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function navigate(viewName) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === viewName);
    item.toggleAttribute("aria-current", item.dataset.view === viewName);
  });
  showToast(`Navigation demandée : ${viewName}`);
}

function openRequest(requestId) {
  const request = enrollmentRequests.find(item => item.id === requestId);
  const user = request ? getUser(request.userId) : null;
  const course = request ? getCourse(request.courseId) : null;
  showModal(
    `Demande ${escapeHTML(requestId)}`,
    `
      <p><strong>Participant :</strong> ${user ? escapeHTML(`${user.firstName} ${user.lastName}`) : "-"}</p>
      <p><strong>Formation :</strong> ${course ? escapeHTML(course.title) : "-"}</p>
      <p><strong>Date :</strong> ${request ? fmtDate(request.requestedAt) : "-"}</p>
    `,
    `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button><button class="btn btn-primary" onclick="processRequest('${requestId}')">Approuver l'accès</button>`
  );
}

function openCreateUser() {
  showModal(
    "Nouvel utilisateur",
    '<p>Interface de création d’un compte utilisateur administrateur, formateur ou participant.</p>',
    '<button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="showToast(\'Utilisateur prêt à créer\'); closeModal();">Créer</button>'
  );
}

function processRequest(requestId) {
  showToast(`Demande ${requestId} approuvée`);
  closeModal();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("adminDashboard");
  if (container) {
    container.innerHTML = renderAdminDashboard("admin_1");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});
