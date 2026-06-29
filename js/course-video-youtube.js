// =============================================================================
// COURS VIDÉO YOUTUBE — course-video-youtube.js
// Inclure ce fichier APRÈS dashboard.js dans votre HTML :
//   <script src="js/dashboard.js"></script>
//   <script src="js/course-video-youtube.js"></script>
//
// Ce fichier ajoute :
//   1. openAddVideoModal(formationId)   — formulaire de saisie du lien YouTube
//   2. confirmAddYoutubeVideo()         — valide, parse et sauvegarde le module
//   3. previewYoutubeModule(moduleIdx)  — affiche le lecteur intégré dans un modal
//   4. deleteFormationModule(formationId, moduleIdx) — supprime un module (avec confirmation)
//   5. Remplacement de openAddCourseModal() pour brancher le bouton "Vidéo YouTube"
//   6. Remplacement de renderTrainerPreview() pour les boutons Aperçu / Supprimer actifs
// =============================================================================

// ─── Stockage local des modules ajoutés par le formateur ────────────────────
// Clé : "icca_formation_modules_<formationId>"
// Valeur : JSON array de { id, type, title, desc, youtubeUrl, youtubeId }

function getFormationModulesKey(formationId) {
  return `icca_formation_modules_${formationId}`;
}

function loadFormationModules(formationId) {
  try {
    return JSON.parse(localStorage.getItem(getFormationModulesKey(formationId)) || "[]");
  } catch {
    return [];
  }
}

function saveFormationModules(formationId, modules) {
  try {
    localStorage.setItem(getFormationModulesKey(formationId), JSON.stringify(modules));
  } catch {}
}

// ─── Parser un lien YouTube vers un videoId ──────────────────────────────────
// Supporte :
//   https://www.youtube.com/watch?v=VIDEO_ID
//   https://youtu.be/VIDEO_ID
//   https://www.youtube.com/embed/VIDEO_ID
//   https://youtube.com/shorts/VIDEO_ID

function parseYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ─── Étape 1 : modal de saisie du lien YouTube ───────────────────────────────

function openAddVideoModal(formationId) {
  // Stocke temporairement l'ID de la formation pour la confirmation
  window._pendingVideoFormationId = formationId;

  const body = `
    <div class="form-group" style="margin-bottom:16px;">
      <label for="yt_title" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Titre du cours <span style="color:var(--danger,#e53e3e);">*</span>
      </label>
      <input
        class="form-control"
        type="text"
        id="yt_title"
        placeholder="ex : Introduction au Marketing Digital"
        style="width:100%;"
        autofocus>
    </div>
    <div class="form-group" style="margin-bottom:16px;">
      <label for="yt_desc" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Description <span style="color:var(--text-muted);font-weight:400;">(optionnel)</span>
      </label>
      <input
        class="form-control"
        type="text"
        id="yt_desc"
        placeholder="Courte description affichée sous le titre"
        style="width:100%;">
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label for="yt_url" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Lien YouTube <span style="color:var(--danger,#e53e3e);">*</span>
      </label>
      <input
        class="form-control"
        type="url"
        id="yt_url"
        placeholder="https://www.youtube.com/watch?v=..."
        style="width:100%;"
        oninput="previewYoutubeThumbnail()">
    </div>
    <div id="yt_thumb_preview" style="display:none;margin-top:12px;border-radius:10px;overflow:hidden;position:relative;background:#000;aspect-ratio:16/9;max-height:180px;">
      <img id="yt_thumb_img" src="" alt="Aperçu YouTube"
        style="width:100%;height:100%;object-fit:cover;opacity:.85;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,0,0,.88);display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
    <p id="yt_error" style="display:none;color:var(--danger,#e53e3e);font-size:12px;margin-top:8px;"></p>
  `;

  showModal(
    `<span style="display:flex;align-items:center;gap:8px;">`
      + `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
      + ` Ajouter une vidéo YouTube</span>`,
    body,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="confirmAddYoutubeVideo()">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;"><polyline points="20 6 9 17 4 12"/></svg>
       Ajouter le cours
     </button>`
  );
}

// Aperçu miniature en temps réel pendant la saisie
function previewYoutubeThumbnail() {
  const url = (document.getElementById("yt_url")?.value || "").trim();
  const preview = document.getElementById("yt_thumb_preview");
  const img = document.getElementById("yt_thumb_img");
  const error = document.getElementById("yt_error");
  if (!preview || !img) return;
  const id = parseYoutubeId(url);
  if (id) {
    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    preview.style.display = "block";
    if (error) error.style.display = "none";
  } else {
    preview.style.display = "none";
  }
}

// ─── Étape 2 : validation et sauvegarde ─────────────────────────────────────

function confirmAddYoutubeVideo() {
  const formationId = window._pendingVideoFormationId;
  const title   = (document.getElementById("yt_title")?.value || "").trim();
  const desc    = (document.getElementById("yt_desc")?.value  || "").trim();
  const url     = (document.getElementById("yt_url")?.value   || "").trim();
  const errorEl = document.getElementById("yt_error");

  // Validation titre
  if (!title) {
    if (errorEl) { errorEl.textContent = "Le titre est obligatoire."; errorEl.style.display = "block"; }
    document.getElementById("yt_title")?.focus();
    return;
  }

  // Validation URL YouTube
  const youtubeId = parseYoutubeId(url);
  if (!youtubeId) {
    if (errorEl) { errorEl.textContent = "Lien YouTube invalide. Copiez l'URL depuis la barre d'adresse ou le bouton « Partager » de YouTube."; errorEl.style.display = "block"; }
    document.getElementById("yt_url")?.focus();
    return;
  }

  // Construction du module
  const newModule = {
    id: `mod_yt_${Date.now()}`,
    type: "video",
    title,
    desc,
    youtubeUrl: url,
    youtubeId,
    addedAt: new Date().toISOString()
  };

  // Sauvegarde locale
  const existing = loadFormationModules(formationId);
  existing.push(newModule);
  saveFormationModules(formationId, existing);

  // Si Supabase est disponible, on peut persister côté serveur
  if (window.supabaseInstance) {
    (async () => {
      try {
        await window.supabaseInstance.from("formation_modules").insert({
          formation_id: formationId,
          type: "video",
          title,
          description: desc,
          youtube_url: url,
          youtube_id: youtubeId,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("[addYoutubeVideo] Supabase insert échoué, module sauvegardé localement.", e.message);
      }
    })();
  }

  closeModal();
  showToast(`Cours vidéo « ${title} » ajouté avec succès.`, "success");

  // Re-rend la page preview
  renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), "preview");
}

// ─── Aperçu inline : lecteur YouTube dans un modal ──────────────────────────

function previewYoutubeModule(youtubeId, title) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  const body = `
    <div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#000;">
      <iframe
        src="${embedUrl}"
        title="${escapeHTML(title)}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        style="position:absolute;inset:0;width:100%;height:100%;border:0;">
      </iframe>
    </div>
    <p style="margin-top:12px;font-size:13px;color:var(--text-muted);text-align:center;">
      La vidéo est lue directement dans la plateforme — aucune redirection vers YouTube.
    </p>
  `;

  showModal(
    `<span style="display:flex;align-items:center;gap:8px;">`
      + `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
      + ` ${escapeHTML(title)}</span>`,
    body,
    `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>`
  );
}

// ─── Suppression d'un module ─────────────────────────────────────────────────

function deleteFormationModule(formationId, moduleId) {
  if (!confirm("Supprimer ce cours de la formation ? Cette action est irréversible.")) return;

  const existing = loadFormationModules(formationId);
  const updated  = existing.filter(m => m.id !== moduleId);
  saveFormationModules(formationId, updated);

  if (window.supabaseInstance) {
    (async () => {
      try {
        await window.supabaseInstance.from("formation_modules").delete().eq("id", moduleId);
      } catch (e) {
        console.warn("[deleteFormationModule] Supabase delete échoué.", e.message);
      }
    })();
  }

  showToast("Cours supprimé.", "info");
  renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), "preview");
}

// =============================================================================
// REMPLACEMENT DE openAddCourseModal — branche le clic "Vidéo YouTube"
// Tous les autres types affichent "fonctionnalité à venir" sauf la vidéo.
// =============================================================================

function openAddCourseModal(formationId) {
  // Liste mise à jour des types de cours avec tes nouveaux modules disponibles
  const types = [
    { key: "video",      label: "Vidéo YouTube",     desc: "Lien YouTube intégré en lecteur dans la page.", disponible: true },
    { key: "document",   label: "Document (PDF)",    desc: "Lien ou support de cours téléchargeable.", disponible: true },
    { key: "quiz",       label: "Quiz / Évaluation", desc: "Questionnaire ou évaluation externe.", disponible: true },
    { key: "text",       label: "Texte / Article",   desc: "Contenu textuel rédigé directement.", disponible: true },
    { key: "html",       label: "Page HTML",         desc: "Un fichier .html structuré comme module.", disponible: false },
    { key: "markdown",   label: "Fichier Markdown",  desc: "Document .md rendu en page de cours.", disponible: false }
  ];

  function typeOnclick(t, fId) {
    if (t.key === "video") {
      return `closeModal(); openAddVideoModal('${fId}');`;
    }
    // SI c'est un de tes nouveaux types, on appelle la fonction générique de ton autre fichier
    if (t.key === "document" || t.key === "quiz" || t.key === "text") {
      return `closeModal(); openAddModuleModal('${fId}', '${t.key}');`;
    }
    return `closeModal(); showToast('Ajout d\\'un cours «\u202f${t.label}\u202f» — fonctionnalité à venir.', 'info');`;
  }

  const body = `
    <p style="color:var(--text-muted);font-size:13px;margin:0 0 18px;">
      Choisissez le type de contenu à ajouter à cette formation.
    </p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
      ${types.map(t => {
        return `
          <button
            class="btn btn-secondary"
            style="display:flex;align-items:center;gap:10px;text-align:left;padding:12px 14px;height:auto;line-height:1.3;${t.disponible ? "border:2px solid #1a3e5c;" : ""}"
            onclick="${typeOnclick(t, formationId)}">
            <span style="flex-shrink:0;opacity:.8;">${courseTypeIcon(t.key)}</span>
            <span>
              <strong style="font-size:13px;font-weight:700;display:block;">${t.label}</strong>
              <span style="font-size:11px;color:var(--text-muted);font-weight:400;">${t.desc}</span>
            </span>
            ${t.disponible ? `<span class="badge badge--success" style="margin-left:auto;flex-shrink:0;font-size:10px;background:#28a745;color:#fff;padding:2px 6px;border-radius:4px;">Disponible</span>` : ""}
          </button>
        `;
      }).join("")}
    </div>
  `;

  showModal(
    `${icon("plus", 16)} Ajouter un cours`,
    body,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>`
  );
}

// =============================================================================
// REMPLACEMENT DE renderTrainerPreview — affiche les modules locaux + demo
// avec les boutons Aperçu et Supprimer pleinement fonctionnels pour les vidéos.
// =============================================================================

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

  if (!appState.trainerSelectedCourseId || !trainerFormations.find(f => f.id === appState.trainerSelectedCourseId)) {
    appState.trainerSelectedCourseId = trainerFormations[0].id;
  }

  const selectedFormation = trainerFormations.find(f => f.id === appState.trainerSelectedCourseId);

  // ── Modules originaux de la formation (demo/Supabase)
  const DEMO_TYPES = ["html", "video", "markdown", "powerpoint", "excel", "json", "dragdrop"];
  const baseModules = (Array.isArray(selectedFormation?.modules) ? selectedFormation.modules : [])
    .map((m, i) => ({
      ...m,
      id: m.id || `base_${i}`,
      type: m.type || DEMO_TYPES[i % DEMO_TYPES.length],
      _isBase: true  // module original → suppression désactivée
    }));

  // ── Modules ajoutés par le formateur (stockés en localStorage)
  const addedModules = loadFormationModules(selectedFormation.id);

  // ── Fusion : base d'abord, ajoutés ensuite
  const allModules = [...baseModules, ...addedModules];

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
            <option value="${f.id}" ${f.id === appState.trainerSelectedCourseId ? "selected" : ""}>
              ${escapeHTML(f.title)}
            </option>
          `).join("")}
        </select>
        <button class="btn btn-primary" onclick="openAddCourseModal('${selectedFormation.id}')">
          ${icon("plus", 15)} Ajouter un cours
        </button>
      </div>
    </div>

    ${allModules.length === 0 ? `
      <div style="margin-top:8px;">
        ${trainerEmptyState("Aucun cours", "Cette formation ne contient pas encore de cours. Ajoutez-en un avec le bouton ci-dessus.")}
      </div>
    ` : `
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
        ${allModules.map((m) => {
          const isVideo  = m.type === "video";
          const isAdded  = !m._isBase;

          // Bouton Aperçu
          // Code à remplacer à l'intérieur du allModules.map() de renderTrainerPreview :
          
          // GESTION DYNAMIQUE DU BOUTON APERÇU
          let previewBtn = "";
          if (m.type === "video" && m.youtubeId) {
            previewBtn = `<button class="btn btn-sm btn-secondary"
                           onclick="previewYoutubeModule('${m.youtubeId}', '${escapeHTML(m.title).replace(/'/g, "&#39;")}')">
                           ${icon("eye", 13)} Aperçu
                         </button>`;
          } else if (["document", "quiz", "text"].includes(m.type)) {
            // Appelle la fonction de prévisualisation de ton nouveau fichier en lui passant l'ID unique du module
            previewBtn = `<button class="btn btn-sm btn-secondary"
                           onclick="previewGenericModule('${selectedFormation.id}', '${m.id}')">
                           ${icon("eye", 13)} Aperçu
                         </button>`;
          } else {
            previewBtn = `<button class="btn btn-sm btn-secondary"
                           onclick="showToast('Aperçu non disponible pour ce type de cours.', 'info')">
                           ${icon("eye", 13)} Aperçu
                         </button>`;
          }

          // Bouton Supprimer — actif seulement pour les modules ajoutés par le formateur
          const deleteBtn = isAdded
            ? `<button class="btn btn-sm btn-secondary" style="color:var(--danger,#e53e3e);"
                 onclick="deleteFormationModule('${selectedFormation.id}', '${m.id}')">
                 ${icon("trash", 13)}
               </button>`
            : `<button class="btn btn-sm btn-secondary" style="opacity:.4;cursor:not-allowed;"
                 title="Impossible de supprimer un cours de démonstration."
                 disabled>
                 ${icon("trash", 13)}
               </button>`;

          // Vignette YouTube intégrée si c'est une vidéo avec ID
          const ytThumb = (isVideo && m.youtubeId) ? `
            <div style="flex-shrink:0;width:80px;height:46px;border-radius:6px;overflow:hidden;position:relative;background:#000;cursor:pointer;"
                 onclick="previewYoutubeModule('${m.youtubeId}', '${escapeHTML(m.title).replace(/'/g, "&#39;")}')">
              <img src="https://img.youtube.com/vi/${m.youtubeId}/mqdefault.jpg"
                   alt="" style="width:100%;height:100%;object-fit:cover;opacity:.85;">
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                <div style="width:22px;height:22px;border-radius:50%;background:rgba(255,0,0,.85);display:flex;align-items:center;justify-content:center;">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
          ` : `
            <div style="flex-shrink:0;width:38px;height:38px;border-radius:10px;background:var(--surface-2,#f1f3f7);display:flex;align-items:center;justify-content:center;color:var(--primary);">
              ${courseTypeIcon(m.type)}
            </div>
          `;

          return `
            <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
              ${ytThumb}
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:3px;">
                  ${escapeHTML(m.title)}
                </div>
                ${m.desc ? `<div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(m.desc)}</div>` : ""}
                ${(isVideo && m.youtubeUrl) ? `
                  <div style="font-size:11px;color:var(--text-muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    ${escapeHTML(m.youtubeUrl)}
                  </div>
                ` : ""}
              </div>
              <span class="badge ${courseTypeBadgeClass(m.type)}" style="flex-shrink:0;">
                ${courseTypeIcon(m.type)} ${courseTypeLabel(m.type)}
              </span>
              <div style="flex-shrink:0;display:flex;gap:8px;">
                ${previewBtn}
                <button class="btn btn-secondary btn-sm"
                  onclick="showToast('Modification — fonctionnalité à venir.', 'info')">
                  ${icon("edit", 13)}
                </button>
                ${deleteBtn}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `}

    ${addedModules.length > 0 ? `
      <p style="margin-top:16px;font-size:12px;color:var(--text-muted);text-align:right;">
        ${addedModules.length} cours ajouté${addedModules.length > 1 ? "s" : ""} par vous — sauvegardé${addedModules.length > 1 ? "s" : ""} localement.
      </p>
    ` : ""}
  `;
}
