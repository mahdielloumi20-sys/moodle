// =============================================================================
// COMPLÉMENT TYPES DE COURS — course-other-types.js
// Mode de lecture grand format "Style Gemini / Pleine Page"
// =============================================================================

// ─── Étape 1 : Interface dynamique avec zone d'importation de fichier ────────

function openAddModuleModal(formationId, type) {
  window._pendingOtherFormationId = formationId;
  window._pendingOtherModuleType = type;

  let titleText = "";
  let fileAcceptTypes = "";
  let helpText = "";

  switch (type) {
    case "document":
      titleText = "Importer un Support de Cours (PDF, Word, Slides)";
      fileAcceptTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx";
      helpText = "Formats acceptés : PDF, Word, PowerPoint, Excel";
      break;
    case "quiz":
      titleText = "Importer un Fichier d'Évaluation / Quiz";
      fileAcceptTypes = ".pdf,.doc,.docx,.txt,.json,.csv";
      helpText = "Importez votre questionnaire ou grille d'évaluation (PDF, Word, TXT...)";
      break;
    case "text":
      titleText = "Importer un Article ou Fichier Texte structuré";
      fileAcceptTypes = ".txt,.html,.md";
      helpText = "Sélectionnez un fichier texte brut (.txt), une page (.html) ou du Markdown (.md)";
      break;
  }

  const body = `
    <div class="form-group" style="margin-bottom:16px;">
      <label for="mod_title" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Titre du cours <span style="color:var(--danger,#e53e3e);">*</span>
      </label>
      <input type="text" id="mod_title" class="form-control" placeholder="ex : Chapitre 1 : Les fondamentaux" style="width:100%;" autofocus>
    </div>
    
    <div class="form-group" style="margin-bottom:16px;">
      <label for="mod_desc" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Description <span style="color:var(--text-muted);font-weight:400;">(optionnel)</span>
      </label>
      <input type="text" id="mod_desc" class="form-control" placeholder="Courte description affichée sous le titre" style="width:100%;">
    </div>
    
    <div class="form-group" style="margin-bottom: 16px;">
      <label for="mod_file" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Sélectionner le fichier à importer <span style="color:var(--danger,#e53e3e);">*</span>
      </label>
      <input type="file" id="mod_file" class="form-control" accept="${fileAcceptTypes}" style="width:100%; padding:8px;">
      <small style="display:block; color:var(--text-muted); font-size:11px; margin-top:4px;">${helpText}</small>
    </div>
    
    <p id="mod_error" style="display:none;color:var(--danger,#e53e3e);font-size:12px;margin-top:8px;"></p>
  `;

  showModal(
    `<span style="display:flex;align-items:center;gap:8px;">${courseTypeIcon(type)} ${titleText}</span>`,
    body,
    `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="confirmAddOtherModule()">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;"><polyline points="20 6 9 17 4 12"/></svg>
       Importer et créer le cours
     </button>`
  );
}

// Fonction utilitaire rapide pour vérifier si une chaîne est un vrai UUID
function isValidUUID(str) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

async function confirmAddOtherModule() {
  const formationId = window._pendingOtherFormationId; 
  const type        = window._pendingOtherModuleType;

  const title   = (document.getElementById("mod_title")?.value || "").trim();
  const desc    = (document.getElementById("mod_desc")?.value || "").trim();
  const fileInput = document.getElementById("mod_file");
  const errorEl = document.getElementById("mod_error");

  // 🛡️ SÉCURITÉ : Vérification du format de l'ID avant de requêter Supabase
  if (!formationId || !isValidUUID(formationId)) {
    console.error("[Validation Error] L'ID parent n'est pas un UUID valide :", formationId);
    if (errorEl) {
      errorEl.textContent = `Impossible d'ajouter le module : l'ID de la section ("${formationId}") est temporaire. Veuillez d'abord enregistrer ou sélectionner une vraie section.`;
      errorEl.style.display = "block";
    }
    return;
  }

  if (!title) {
    if (errorEl) { errorEl.textContent = "Le titre est obligatoire."; errorEl.style.display = "block"; }
    document.getElementById("mod_title")?.focus();
    return;
  }

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    if (errorEl) { errorEl.textContent = "Veuillez sélectionner un fichier à importer."; errorEl.style.display = "block"; }
    return;
  }

  const file = fileInput.files[0];

  try {
    showToast("Téléchargement du fichier vers Supabase Storage...", "info");

    const fileExt = file.name.split('.').pop();
    const uniquePath = `${formationId}/${crypto.randomUUID()}.${fileExt}`;

    const { data: storageData, error: storageError } = await window.supabaseInstance
      .storage
      .from('course-attachments')
      .upload(uniquePath, file, { cacheControl: '3600', upsert: true });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = window.supabaseInstance
      .storage
      .from('course-attachments')
      .getPublicUrl(uniquePath);

    showToast("Enregistrement du module dans la base de données...", "info");

    const { data: insertedRows, error: dbError } = await window.supabaseInstance
      .from("course_contents")
      .insert([
        {
          section_id: formationId, 
          title: title,
          content_type: type,     
          content: publicUrl,     
          description: desc || null 
        }
      ])
      .select();

    if (dbError) throw dbError;

    console.log("[Supabase] Nouveau module inséré avec succès :", insertedRows);

    const newModule = {
      id: insertedRows[0].id, 
      type: type,
      title,
      desc: desc || null, 
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      fileUrl: publicUrl,
      addedAt: new Date().toISOString()
    };

    if (typeof loadFormationModules === 'function' && typeof saveFormationModules === 'function') {
      const existing = loadFormationModules(formationId);
      existing.push(newModule);
      saveFormationModules(formationId, existing);
    }

    closeModal();
    showToast(`Le module "${title}" a été enregistré avec succès.`, "success");

    if (typeof renderWorkspacePage === 'function') {
      renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), "preview");
    }

  } catch (err) {
    console.error("[Supabase Error]", err.message);
    if (errorEl) {
      errorEl.textContent = `Erreur lors de l'enregistrement : ${err.message}`;
      errorEl.style.display = "block";
    }
  }
}
// ─── Étape 2 : Mode Grand Format avec Défilement de la Page Restauré ──────────

function previewGenericModule(formationId, moduleId) {
  const modules = loadFormationModules(formationId);
  const m = modules.find(mod => mod.id === moduleId);
  if (!m) return;

  const mainContainer = document.getElementById("adminDashboard");
  if (!mainContainer) return;

  const safeTitle = escapeHTML(m.title);
  const safeDesc = m.desc ? escapeHTML(m.desc) : "";
  const safeFileName = escapeHTML(m.fileName);

  let dynamicContentZone = "";
  const fileExt = m.fileName.split('.').pop().toLowerCase();
  const isPDF = fileExt === "pdf";

  // Force l'activation du scrollbar sur le conteneur principal de l'application
  mainContainer.style.overflow = "auto";

  if (isPDF) {
    // Le PDF est agrandi à 1100px de hauteur pour un affichage immersif et large
    dynamicContentZone = `
      <div style="width: 100%; height: 1100px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: #f8fafc; margin-top: 15px; margin-bottom: 40px;">
        <iframe src="${m.fileData}" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
      </div>
    `;
  } else if (m.type === "text") {
    dynamicContentZone = `
      <div style="font-size: 16px; line-height: 1.8; color: #334155; white-space: pre-wrap; font-family: inherit; width: 100%; margin-top: 20px; padding-bottom: 60px;">
        ${m.fileData}
      </div>
    `;
  } else {
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(fileExt);
    if (isImage) {
      dynamicContentZone = `
        <div style="text-align: center; width: 100%; margin-top: 20px; margin-bottom: 40px;">
          <img src="${m.fileData}" alt="${safeFileName}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        </div>
      `;
    } else {
      dynamicContentZone = `
        <div style="width: 100%; margin: 40px auto; text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 40px 20px; border-radius: 12px; color: #64748b;">
          <div style="font-size: 44px; margin-bottom: 12px;">📂</div>
          <h3 style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Fichier .${fileExt.toUpperCase()} importé</h3>
          <p style="font-size: 14px;">Utilisez le bouton ci-dessus pour télécharger le support.</p>
        </div>
      `;
    }
  }

  // Rendu de la structure globale — Changement de 'height: 100%' à 'min-height: 100%; height: auto' 
  // pour permettre à la page de s'allonger naturellement selon la taille du PDF.
  mainContainer.innerHTML = `
    <div style="background: #ffffff; min-height: 100%; height: auto; width: 100%; padding: 15px 10px; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column;">
      
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; gap: 15px; flex-shrink: 0;">
        
        <button class="btn btn-secondary" onclick="renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), 'preview')" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour à la formation
        </button>

        <a href="${m.fileData}" download="${m.fileName}" class="btn btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 8px 18px; border-radius: 8px; background: #0284c7; border-color: #0284c7;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Télécharger (${m.fileSize})
        </a>
      </div>

      <div style="width: 100%; max-width: 1100px; margin: 0 auto; flex-grow: 1; display: flex; flex-direction: column;">
        <div style="margin-bottom: 15px; flex-shrink: 0;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0284c7; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
            ${m.type === "quiz" ? "🎯 ÉVALUATION" : "📝 SUPPORT DE COURS"}
          </span>
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.01em;">
            ${safeTitle}
          </h1>
          ${safeDesc ? `<p style="font-size: 14px; color: #64748b; margin: 0; font-style: italic;">${safeDesc}</p>` : ""}
        </div>

        ${dynamicContentZone}
      </div>

    </div>
  `;

  // Remonter le scroll au sommet proprement lors du chargement
  const scrollContainer = mainContainer.parentElement || window;
  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
}