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
    case "excel":
      titleText = "Importer une Feuille de Calcul Excel";
      fileAcceptTypes = ".xlsx,.xls,.csv";
      helpText = "Formats acceptés : Excel (.xlsx, .xls) ou CSV (.csv)";
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
    
    <div class="form-group" style="margin-bottom:16px;">
      <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="mod_allow_download" style="width:16px;height:16px;">
        Autoriser le téléchargement de ce fichier par les participants
      </label>
      <small style="display:block;color:var(--text-muted);font-size:11px;margin-top:4px;margin-left:24px;">
        Si décoché, les participants pourront seulement visualiser le contenu en ligne, sans pouvoir le télécharger.
      </small>
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

// Récupère (ou crée) une section par défaut pour un cours donné.
// course_contents.section_id pointe vers course_sections.id, PAS vers courses.id —
// il faut donc toujours passer par une vraie ligne course_sections.
async function ensureDefaultSection(courseId) {
  // 1. On cherche si une section existe déjà pour ce cours
  const { data: existingSections, error: fetchError } = await window.supabaseInstance
    .from("course_sections")
    .select("id")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
    .limit(1);

  if (fetchError) throw fetchError;

  if (existingSections && existingSections.length > 0) {
    return existingSections[0].id;
  }

  // 2. Aucune section trouvée : on en crée une par défaut
  const { data: newSection, error: insertError } = await window.supabaseInstance
    .from("course_sections")
    .insert([{ course_id: courseId, title: "Général", position: 0 }])
    .select()
    .single();

  if (insertError) throw insertError;

  console.log("[Supabase] Section par défaut créée pour le cours :", courseId, "->", newSection.id);
  return newSection.id;
}

// Fonction utilitaire rapide pour vérifier si une chaîne est un vrai UUID
function isValidUUID(str) {
  // Accepte tout UUID au format 8-4-4-4-12, sans imposer la version/variante RFC,
  // car des UUID "faits main" (seed data) ou générés par Postgres peuvent ne pas
  // respecter strictement la version (1-5) / variante (8,9,a,b).
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

async function confirmAddOtherModule() {
  const formationId = window._pendingOtherFormationId; 
  const type        = window._pendingOtherModuleType;

  const title   = (document.getElementById("mod_title")?.value || "").trim();
  const desc    = (document.getElementById("mod_desc")?.value || "").trim();
  const fileInput = document.getElementById("mod_file");
  const allowDownload = !!document.getElementById("mod_allow_download")?.checked;
  const errorEl = document.getElementById("mod_error");

  // 🛡️ SÉCURITÉ : Vérification du format de l'ID avant de requêter Supabase
  if (!formationId || !isValidUUID(formationId)) {
    console.error("[Validation Error] L'ID parent n'est pas un UUID valide :", formationId);
    if (errorEl) {
      errorEl.textContent = formationId && formationId.startsWith("course_import_")
        ? `Cette formation n'a pas pu être synchronisée avec le serveur lors de sa création (elle n'existe que dans ce navigateur). Retournez dans l'espace Formateur, ouvrez "Mes formations" et réessayez l'import — vous devriez voir un message d'erreur précisant la cause.`
        : `Impossible d'ajouter le module : l'ID de la section ("${formationId}") est temporaire. Veuillez d'abord enregistrer ou sélectionner une vraie section.`;
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
    showToast("Vérification de la section...", "info");

    // formationId est en réalité l'ID du COURS (table courses), pas d'une section.
    // On résout (ou crée) la vraie section avant d'insérer le contenu.
    let sectionId;
    try {
      sectionId = await ensureDefaultSection(formationId);
    } catch (sectionErr) {
      console.error("[Supabase Error - section]", sectionErr.message);
      if (errorEl) {
        errorEl.textContent = `Impossible de préparer la section du cours : ${sectionErr.message}`;
        errorEl.style.display = "block";
      }
      return;
    }

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
          section_id: sectionId, 
          title: title,
          content_type: type,     
          content: publicUrl,     
          description: desc || null,
          allow_download: allowDownload
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
      fileData: publicUrl,
      allowDownload: allowDownload,
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

// Va chercher la version officielle d'un module dans Supabase (course_contents)
// et répare au passage le cache localStorage si l'entrée était incomplète/obsolète.
async function repairModuleFromSupabase(formationId, moduleId, staleModule) {
  try {
    const { data: row, error } = await window.supabaseInstance
      .from("course_contents")
      .select("*")
      .eq("id", moduleId)
      .single();

    if (error) throw error;
    if (!row) return null;

    const guessedFileName = row.content
      ? decodeURIComponent(row.content.split('/').pop().split('?')[0])
      : (staleModule?.fileName || row.title || "fichier");

    const repaired = {
      id: row.id,
      type: row.content_type,
      title: row.title,
      desc: row.description || null,
      fileName: guessedFileName,
      fileSize: staleModule?.fileSize || null,
      fileData: row.content,
      allowDownload: !!row.allow_download,
      addedAt: staleModule?.addedAt || row.created_at || new Date().toISOString()
    };

    // On répare le cache local pour que les prochaines ouvertures soient instantanées
    if (typeof loadFormationModules === 'function' && typeof saveFormationModules === 'function') {
      const cached = loadFormationModules(formationId);
      const idx = cached.findIndex(mod => mod.id === moduleId);
      if (idx >= 0) {
        cached[idx] = { ...cached[idx], ...repaired };
      } else {
        cached.push(repaired);
      }
      saveFormationModules(formationId, cached);
    }

    return repaired;
  } catch (err) {
    console.error("[repairModuleFromSupabase] Échec de la récupération depuis Supabase :", err.message);
    return null;
  }
}

async function previewGenericModule(formationId, moduleId) {
  const modules = loadFormationModules(formationId);
  let m = modules.find(mod => mod.id === moduleId);

  // Si le module est introuvable en local OU s'il lui manque l'URL du fichier
  // (cache localStorage obsolète/incomplet), on va chercher la version à jour
  // directement dans Supabase, qui reste la source de vérité.
  if (!m || !m.fileData) {
    const repaired = await repairModuleFromSupabase(formationId, moduleId, m);
    if (repaired) {
      m = repaired;
    } else if (!m) {
      showToast("Impossible de charger ce module : introuvable.", "error");
      return;
    } else if (!m.fileData) {
      showToast("Impossible de charger le fichier de ce module (URL manquante). Essayez de le réimporter.", "error");
      return;
    }
  }

  const mainContainer = document.getElementById("adminDashboard");
  if (!mainContainer) return;

  // Le téléchargement est un réglage propre à chaque cours (module), choisi par
  // le formateur à la création — pas un réglage global à toute la formation.
  const canDownload = !!m.allowDownload;

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
      <div id="genericTextContent" style="font-size: 16px; line-height: 1.8; color: #334155; white-space: pre-wrap; font-family: inherit; width: 100%; margin-top: 20px; padding-bottom: 60px;">
        Chargement du contenu…
      </div>
    `;
  } else if (m.type === "excel" || ["xlsx", "xls", "csv"].includes(fileExt)) {
    dynamicContentZone = `
      <div id="genericExcelContent" style="width: 100%; margin-top: 20px; padding-bottom: 60px;">
        <div style="text-align:center; color:#64748b; padding: 40px 0;">Chargement du tableau…</div>
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
        
        <button class="btn btn-secondary" onclick="renderWorkspacePage(currentWorkspaceRole || getWorkspaceRole(), currentWorkspaceView || 'preview')" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour à la formation
        </button>

        ${canDownload ? `
        <a href="${m.fileData}" download="${m.fileName}" class="btn btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 8px 18px; border-radius: 8px; background: #0284c7; border-color: #0284c7;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Télécharger${m.fileSize ? ` (${m.fileSize})` : ""}
        </a>
        ` : `
        <span style="display:inline-flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8;font-style:italic;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Téléchargement non autorisé par le formateur
        </span>
        `}
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

  // Pour les modules de type "texte", on va chercher le vrai contenu du fichier
  // (m.fileData est l'URL Supabase Storage, pas le texte lui-même).
  if (m.type === "text" && m.fileData) {
    fetch(m.fileData)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const target = document.getElementById("genericTextContent");
        if (target) target.textContent = text;
      })
      .catch(err => {
        console.error("[previewGenericModule] Impossible de charger le fichier texte :", err.message);
        const target = document.getElementById("genericTextContent");
        if (target) {
          target.textContent = "";
          target.innerHTML = `<span style="color:var(--danger,#e53e3e);">Impossible de charger le contenu du fichier. <a href="${m.fileData}" target="_blank" rel="noopener">Ouvrir directement</a>.</span>`;
        }
      });
  }

  // Pour les modules de type "excel"/csv, on va chercher le fichier puis on le parse
  // en tableau HTML lisible directement dans la page (au lieu d'un simple lien de téléchargement).
  const isExcelType = m.type === "excel" || ["xlsx", "xls", "csv"].includes(fileExt);
  if (isExcelType && m.fileData) {
    renderExcelPreview(m.fileData, fileExt);
  }
}

// Charge (si besoin) la librairie SheetJS depuis le CDN, une seule fois.
function ensureSheetJSLoaded() {
  if (window.XLSX) return Promise.resolve();
  if (window._sheetJSLoadingPromise) return window._sheetJSLoadingPromise;

  window._sheetJSLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger la librairie de lecture Excel."));
    document.head.appendChild(script);
  });

  return window._sheetJSLoadingPromise;
}

// Construit un tableau HTML scrollable à partir d'un tableau de tableaux (lignes/colonnes)
function buildExcelTableHTML(rows) {
  if (!rows || rows.length === 0) {
    return `<p style="text-align:center;color:#64748b;padding:40px 0;">Ce fichier ne contient aucune donnée à afficher.</p>`;
  }

  const header = rows[0];
  const body = rows.slice(1);

  const theadHTML = `
    <tr>
      ${header.map(cell => `<th style="position:sticky;top:0;background:#f1f5f9;color:#0f172a;font-weight:700;font-size:12.5px;text-align:left;padding:10px 14px;border-bottom:2px solid #e2e8f0;white-space:nowrap;">${escapeHTML(String(cell ?? ""))}</th>`).join("")}
    </tr>
  `;

  const tbodyHTML = body.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      ${header.map((_, colIdx) => `<td style="padding:9px 14px;font-size:13px;color:#334155;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${escapeHTML(String(row[colIdx] ?? ""))}</td>`).join("")}
    </tr>
  `).join("");

  return `
    <div style="width:100%; overflow:auto; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
      <table style="border-collapse:collapse; width:100%; min-width:600px;">
        <thead>${theadHTML}</thead>
        <tbody>${tbodyHTML}</tbody>
      </table>
    </div>
    <p style="font-size:12px;color:#94a3b8;margin-top:10px;">${body.length} ligne${body.length > 1 ? "s" : ""} affichée${body.length > 1 ? "s" : ""}.</p>
  `;
}

// Simple parseur CSV (gère les guillemets et les virgules échappées de base)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { cell += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { row.push(cell); cell = ""; }
      else if (char === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (char === "\r") { /* ignore */ }
      else { cell += char; }
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c !== ""));
}

async function renderExcelPreview(fileUrl, fileExt) {
  const target = document.getElementById("genericExcelContent");
  if (!target) return;

  try {
    if (fileExt === "csv") {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      target.innerHTML = buildExcelTableHTML(rows);
    } else {
      // .xlsx / .xls -> on utilise SheetJS pour parser le binaire
      await ensureSheetJSLoaded();
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      target.innerHTML = buildExcelTableHTML(rows);
    }
  } catch (err) {
    console.error("[renderExcelPreview] Impossible de charger/parser le fichier :", err.message);
    target.innerHTML = `
      <div style="text-align:center; color:var(--danger,#e53e3e); padding: 40px 20px; background:#fef2f2; border:1px dashed #fecaca; border-radius:12px;">
        Impossible d'afficher l'aperçu de ce tableau (${escapeHTML(err.message)}).
        Vous pouvez toujours le télécharger via le bouton ci-dessus.
      </div>
    `;
  }
}