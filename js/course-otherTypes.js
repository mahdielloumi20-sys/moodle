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
    case "zip":
      titleText = "Importer un Fichier ZIP";
      fileAcceptTypes = ".zip";
      helpText = "Le titre du cours sera repris du nom du fichier ZIP si vous ne le modifiez pas.";
      break;
  }

  const body = `
    <div class="form-group" style="margin-bottom:16px;">
      <label for="mod_title" style="font-weight:600;font-size:13px;display:block;margin-bottom:6px;">
        Titre du cours <span style="color:var(--danger,#e53e3e);">*</span>
      </label>
      <input type="text" id="mod_title" class="form-control" placeholder="${type === "zip" ? "Nom du fichier ZIP" : "ex : Chapitre 1 : Les fondamentaux"}" style="width:100%;" autofocus>
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
      <input type="file" id="mod_file" class="form-control" accept="${fileAcceptTypes}" style="width:100%; padding:8px;"${type === "zip" ? ` onchange="if(this.files && this.files[0]){ const inputTitle = document.getElementById('mod_title'); if (inputTitle) inputTitle.value = this.files[0].name.replace(/\\.zip$/i, ''); }"` : ""}>
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

function getZipBaseName(fileName) {
  return String(fileName || "").replace(/\.zip$/i, "");
}

function inferZipEntryKind(fileName) {
  const ext = String(fileName || "").split(".").pop().toLowerCase();
  if (["html", "htm"].includes(ext)) return "html";
  if (ext === "pdf") return "document";
  if (["md", "markdown"].includes(ext)) return "markdown";
  if (["txt", "rtf"].includes(ext)) return "text";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (["json", "xml"].includes(ext)) return "json";
  return "file";
}

function zipEntryTypeLabel(kind) {
  const labels = {
    html: "Page HTML",
    document: "PDF",
    markdown: "Markdown",
    text: "Texte",
    excel: "Excel",
    image: "Image",
    video: "Vidéo",
    json: "JSON",
    file: "Fichier"
  };
  return labels[kind] || "Fichier";
}

function zipEntryTypeIcon(kind) {
  const icons = {
    html: "zap",
    document: "fileText",
    markdown: "fileText",
    text: "fileText",
    excel: "grid",
    image: "image",
    video: "play",
    json: "settings",
    file: "fileText"
  };
  return icon(icons[kind] || "fileText", 14);
}

async function readTopLevelZipEntries(file) {
  const zip = await window.JSZip.loadAsync(file);
  const entries = [];

  for (const [path, entry] of Object.entries(zip.files || {})) {
    if (!entry || entry.dir) continue;

    const kind = inferZipEntryKind(path);
    const displayName = path.split(/[/\\]/).pop() || path;
    entries.push({
      path,
      name: displayName,
      kind,
      label: zipEntryTypeLabel(kind),
      size: entry._data?.uncompressedSize || entry._data?.compressedSize || null
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, "fr") || a.path.localeCompare(b.path, "fr"));
  return entries;
}

async function readTopLevelZipEntriesFromUrl(archiveUrl) {
  const response = await fetch(archiveUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const archiveBlob = await response.blob();
  return readTopLevelZipEntries(archiveBlob);
}

function findZipEntryFromArchive(zip, entryRef) {
  if (!entryRef) return null;
  if (zip.file(entryRef)) return zip.file(entryRef);

  const wantedName = String(entryRef).split(/[/\\]/).pop();
  for (const [path, entry] of Object.entries(zip.files || {})) {
    if (!entry || entry.dir) continue;
    const currentName = path.split(/[/\\]/).pop();
    if (currentName === wantedName) return entry;
  }
  return null;
}

async function previewZipEntryFlexible(formationId, moduleId, entryRef) {
  const modules = loadFormationModules(formationId);
  const module = modules.find(mod => mod.id === moduleId);
  if (!module || module.type !== "zip") {
    showToast("Cours ZIP introuvable.", "danger");
    return;
  }

  const archiveUrl = resolveZipArchiveUrl(module);
  if (!archiveUrl) {
    showToast("Archive ZIP introuvable.", "danger");
    return;
  }

  try {
    const response = await fetch(archiveUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const archiveBlob = await response.blob();
    const zip = await window.JSZip.loadAsync(archiveBlob);
    const entry = findZipEntryFromArchive(zip, entryRef);

    if (!entry) {
      showToast("Fichier introuvable dans l'archive ZIP.", "danger");
      return;
    }

    const entryName = entry.name || String(entryRef);
    const kind = inferZipEntryKind(entryName);
    const title = `${module.title} • ${entryName}`;
    let body = "";

    if (kind === "html") {
      const html = await entry.async("text");
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      body = `<iframe src="${url}" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:12px;background:#fff;"></iframe>`;
    } else if (kind === "document") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<iframe src="${url}" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:12px;background:#fff;"></iframe>`;
    } else if (kind === "image") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<div style="text-align:center;"><img src="${url}" alt="${escapeHTML(entryName)}" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;"></div>`;
    } else if (kind === "video") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<video controls autoplay style="width:100%;max-height:70vh;border-radius:12px;border:1px solid #e2e8f0;background:#000;"><source src="${url}"></video>`;
    } else {
      const text = await entry.async("text");
      body = `<pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;max-height:70vh;overflow:auto;margin:0;">${escapeHTML(text)}</pre>`;
    }

    showModal(
      `<span style="display:flex;align-items:center;gap:8px;">${zipEntryTypeIcon(kind)} ${escapeHTML(entryName)}</span>`,
      body,
      `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>`
    );
  } catch (err) {
    console.error("[previewZipEntryFlexible] Erreur :", err.message);
    showToast("Impossible d'ouvrir ce fichier ZIP.", "danger");
  }
}

function resolveZipArchiveUrl(module) {
  if (!module) return "";
  if (module.zipArchiveUrl) return module.zipArchiveUrl;
  if (module.fileData && typeof module.fileData === "string") {
    try {
      const parsed = JSON.parse(module.fileData);
      if (parsed && typeof parsed === "object" && parsed.archiveUrl) return parsed.archiveUrl;
    } catch {}
    return module.fileData;
  }
  return "";
}

async function previewZipEntry(formationId, moduleId, entryName) {
  const modules = loadFormationModules(formationId);
  let module = modules.find(mod => mod.id === moduleId);
  if (!module || module.type !== "zip") {
    showToast("Cours ZIP introuvable.", "danger");
    return;
  }

  const archiveUrl = resolveZipArchiveUrl(module);
  if (!archiveUrl) {
    showToast("Archive ZIP introuvable.", "danger");
    return;
  }

  try {
    const response = await fetch(archiveUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const archiveBlob = await response.blob();
    const zip = await window.JSZip.loadAsync(archiveBlob);
    const entry = zip.file(entryName);

    if (!entry) {
      showToast("Fichier introuvable dans l'archive ZIP.", "danger");
      return;
    }

    const kind = inferZipEntryKind(entryName);
    const ext = entryName.split(".").pop().toLowerCase();
    const title = `${module.title} • ${entryName}`;
    let body = "";

    if (kind === "html") {
      const html = await entry.async("text");
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      body = `<iframe src="${url}" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:12px;background:#fff;"></iframe>`;
    } else if (kind === "document") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<iframe src="${url}" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:12px;background:#fff;"></iframe>`;
    } else if (kind === "image") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<div style="text-align:center;"><img src="${url}" alt="${escapeHTML(entryName)}" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;"></div>`;
    } else if (kind === "video") {
      const blob = await entry.async("blob");
      const url = URL.createObjectURL(blob);
      body = `<video controls autoplay style="width:100%;max-height:70vh;border-radius:12px;border:1px solid #e2e8f0;background:#000;"><source src="${url}"></video>`;
    } else {
      const text = await entry.async("text");
      body = `<pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;max-height:70vh;overflow:auto;margin:0;">${escapeHTML(text)}</pre>`;
    }

    showModal(
      `<span style="display:flex;align-items:center;gap:8px;">${zipEntryTypeIcon(kind)} ${escapeHTML(entryName)}</span>`,
      body,
      `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>`
    );
  } catch (err) {
    console.error("[previewZipEntry] Erreur :", err.message);
    showToast("Impossible d'ouvrir ce fichier ZIP.", "danger");
  }
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
  const selectedSeanceId = getTrainerSelectedSeanceId(getCourseAny(formationId));

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
  const finalTitle = title || (type === "zip" ? getZipBaseName(file.name) : "");

  if (!finalTitle) {
    if (errorEl) { errorEl.textContent = "Le titre est obligatoire."; errorEl.style.display = "block"; }
    document.getElementById("mod_title")?.focus();
    return;
  }

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

    let zipFiles = [];
    let storedContent = "";
    if (type === "zip") {
      if (!window.JSZip) {
        throw new Error("La librairie JSZip n'est pas disponible.");
      }
      zipFiles = await readTopLevelZipEntries(file);
      if (zipFiles.length === 0) {
        throw new Error("Le ZIP ne contient aucun fichier exploitable à la racine. Les dossiers imbriqués sont ignorés pour le moment.");
      }
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

    storedContent = publicUrl;
    if (type === "zip") {
      storedContent = JSON.stringify({
        archiveUrl: publicUrl,
        files: zipFiles
      });
    }

    showToast("Enregistrement du module dans la base de données...", "info");

    const { data: insertedRows, error: dbError } = await window.supabaseInstance
      .from("course_contents")
      .insert([
        {
          section_id: sectionId, 
          title: finalTitle,
          content_type: type,     
          content: storedContent,     
          description: desc || null,
          allow_download: allowDownload,
          seance_id: selectedSeanceId
        }
      ])
      .select();

    if (dbError) throw dbError;

    console.log("[Supabase] Nouveau module inséré avec succès :", insertedRows);

    const newModule = {
      id: insertedRows[0].id, 
      type: type,
      title: finalTitle,
      desc: desc || null, 
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      fileData: type === "zip" ? storedContent : publicUrl,
      zipArchiveUrl: type === "zip" ? publicUrl : undefined,
      zipFiles: type === "zip" ? zipFiles : undefined,
      allowDownload: allowDownload,
      seanceId: selectedSeanceId,
      addedAt: new Date().toISOString()
    };

    if (typeof loadFormationModules === 'function' && typeof saveFormationModules === 'function') {
      const existing = loadFormationModules(formationId);
      existing.push(newModule);
      saveFormationModules(formationId, existing);
    }
    await syncCourseModulesToSupabase(formationId, newModule);

    closeModal();
    showToast(`Le module "${finalTitle}" a été enregistré avec succès.`, "success");

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

    const guessedFileName = row.content_type === "zip"
      ? (staleModule?.fileName || `${row.title || "archive"}.zip`)
      : (row.content
        ? decodeURIComponent(row.content.split('/').pop().split('?')[0])
        : (staleModule?.fileName || row.title || "fichier"));

    let fileData = row.content;
    let zipArchiveUrl = staleModule?.zipArchiveUrl || "";
    let zipFiles = Array.isArray(staleModule?.zipFiles) ? staleModule.zipFiles : [];

    if (row.content_type === "zip" && row.content) {
      try {
        const parsed = JSON.parse(row.content);
        if (parsed && typeof parsed === "object") {
          zipArchiveUrl = parsed.archiveUrl || zipArchiveUrl || "";
          zipFiles = Array.isArray(parsed.files) ? parsed.files : zipFiles;
          fileData = JSON.stringify({
            archiveUrl: zipArchiveUrl,
            files: zipFiles
          });
        }
      } catch {}
    }

    const repaired = {
      id: row.id,
      type: row.content_type,
      title: row.title,
      desc: row.description || null,
      fileName: guessedFileName,
      fileSize: staleModule?.fileSize || null,
      fileData,
      zipArchiveUrl: row.content_type === "zip" ? zipArchiveUrl : undefined,
      zipFiles: row.content_type === "zip" ? zipFiles : undefined,
      allowDownload: !!row.allow_download,
      seanceId: row.seance_id || staleModule?.seanceId || "s1",
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
  const isZip = m.type === "zip";
  let zipFiles = Array.isArray(m.zipFiles) ? m.zipFiles : [];
  if (isZip && zipFiles.length === 0 && typeof m.fileData === "string") {
    try {
      const parsed = JSON.parse(m.fileData);
      if (parsed && Array.isArray(parsed.files)) zipFiles = parsed.files;
    } catch {}
  }
  const zipArchiveUrl = resolveZipArchiveUrl(m);
  if (isZip && zipFiles.length === 0 && zipArchiveUrl) {
    try {
      zipFiles = await readTopLevelZipEntriesFromUrl(zipArchiveUrl);
    } catch (err) {
      console.warn("[previewGenericModule] ZIP metadata reload failed:", err.message);
    }
  }

  // Force l'activation du scrollbar sur le conteneur principal de l'application
  mainContainer.style.overflow = "auto";

  if (isZip) {
    dynamicContentZone = `
      <div style="width: 100%; margin-top: 20px; margin-bottom: 40px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
          <div>
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0284c7;margin-bottom:4px;">Archive ZIP</div>
            <div style="font-size:14px;color:#475569;">${zipFiles.length} fichier(s) détecté(s) dans le ZIP. Les fichiers dans des dossiers sont maintenant affichés à plat.</div>
          </div>
          ${zipArchiveUrl ? `<a class="btn btn-secondary btn-sm" href="${zipArchiveUrl}" download="${safeFileName}" style="text-decoration:none;">${icon("download", 13)} Télécharger l’archive</a>` : ""}
        </div>
        ${zipFiles.length ? `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${zipFiles.map(zipFile => {
              const kind = zipFile.kind || inferZipEntryKind(zipFile.name);
              return `
                <div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 16px;box-shadow:none;">
                  <div style="flex-shrink:0;width:36px;height:36px;border-radius:10px;background:#e0f2fe;color:#0369a1;display:flex;align-items:center;justify-content:center;">
                    ${zipEntryTypeIcon(kind)}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:14px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(zipFile.name)}</div>
                    <div style="font-size:11px;color:#64748b;">${zipFile.label || zipEntryTypeLabel(kind)}${zipFile.size ? ` • ${(Number(zipFile.size) / 1024).toFixed(1)} KB` : ""}</div>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="previewZipEntryFlexible('${formationId}', '${moduleId}', '${escapeHTML(zipFile.path || zipFile.name).replace(/'/g, "&#39;")}')">${icon("eye", 13)} Ouvrir</button>
                </div>
              `;
            }).join("")}
          </div>
        ` : `
          <div style="text-align:center;color:#64748b;padding:30px 10px;background:#fff;border:1px dashed #cbd5e1;border-radius:12px;">
            Aucun fichier exploitable n’a été trouvé à la racine du ZIP.
          </div>
        `}
      </div>
    `;
  } else if (isPDF) {
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
