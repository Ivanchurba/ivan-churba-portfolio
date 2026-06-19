const DATA = window.PORTFOLIO_DATA;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let galleryState = { project: null, index: 0, mode: "grid" };
let drawerState = { project: null, piece: null, galleryIndex: 0, galleryMode: "grid" };
let activeFilter = "all";
let showAllProjects = false;
let reelState = { active: 0, paused: false, timer: null };

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "edicion-generacion-ia", label: "Edición + Generación" },
  { id: "generacion-video-ia", label: "Video IA" },
  { id: "generacion-imagenes-ia", label: "Imagen IA" },
  { id: "producciones", label: "Producciones", hidden: true },
];

const PROJECT_DETAILS = {
  "Alfajor GOAT": {
    role: "Edición, generación visual y postproducción",
    brief: "Pieza de producto pensada como impacto rápido: ritmo directo, construcción visual de marca y cierre claro para campaña.",
  },
  "Animatic Santa Fe": {
    role: "Animatic, edición y desarrollo narrativo",
    brief: "Animatics de guion para visualizar tono, timing y estructura antes de avanzar a una pieza final.",
  },
  "Arcor Halloween": {
    role: "Edición, generación y adaptación de piezas",
    brief: "Contenido de temporada con foco en producto, clima visual y variantes de comunicación para campaña.",
  },
  "Arcor Navidad": {
    role: "Edición, generación visual y sistema de adaptaciones",
    brief: "Sistema de piezas navideñas para distintas marcas, manteniendo coherencia visual entre productos y formatos.",
  },
  "Arcor Pascuas": {
    role: "Edición, generación y postproducción",
    brief: "Piezas para campaña de Pascuas con foco en producto, energía visual y versiones para distintas necesidades de comunicación.",
  },
  "Cofler Cups": {
    role: "Edición, generación visual y terminación",
    brief: "Contenido de producto con tratamiento dinámico y acabado visual orientado a performance digital.",
  },
  "Animatic Imperial": {
    role: "Animatic, edición y armado audiovisual",
    brief: "Pieza de presentacion para bajar una idea a ritmo, imagen y estructura audiovisual.",
  },
  "Animatic Seguros": {
    role: "Animatic, edición narrativa y sonido",
    brief: "Animatic construido para ordenar relato, tono y progresión de una pieza de comunicación.",
  },
  "Semana de la Dulzura": {
    role: "Edición, contenido audiovisual y postproducción",
    brief: "Pieza de campaña con lenguaje simple, visual directo y foco en recordación de marca.",
  },
  "Pizza Para Ocho": {
    role: "Edición, generación visual y composición",
    brief: "Contenido audiovisual donde la edición y la generación se integran para construir una pieza de tono propio.",
  },
  "Coppel Mexico": {
    role: "Generación de imagen, dirección visual y selección final",
    brief: "Galería de imágenes finales para campaña gráfica, curada para mostrar variedad, consistencia y potencial visual.",
  },
  "Storyboard Prosegur": {
    role: "Storyboard, generación visual y orden narrativo",
    brief: "Secuencia visual organizada para contar la acción plano a plano y facilitar la lectura de la pieza.",
  },
  "BNA Mundial": {
    role: "Generación de video, edición y adaptación",
    brief: "Promos y PNTs para verticales de comunicación del banco, con foco en claridad, tono de campaña y formato.",
  },
  "Colecciones La Nacion": {
    role: "Generación de video, edición y sistema de piezas",
    brief: "Serie audiovisual para colecciones culturales, trabajada como sistema de piezas con identidad compartida.",
  },
  "Hamlet": {
    role: "Generación de video, edición y variantes creativas",
    brief: "Serie de versiones para producto, explorando tono, movimiento y resolución visual para entorno digital.",
  },
  "Arcor Cofler Obleas Max": {
    role: "Generación de video y postproducción",
    brief: "Pieza de producto con foco en presencia visual, textura y lectura rápida de marca.",
  },
  "Cofler Dulce de Leche": {
    role: "Generación de video y edición",
    brief: "Contenido de producto orientado a construir apetito visual y una comunicación directa.",
  },
  "T-Mobile / Bad Bunny": {
    role: "Generación visual, edición y pieza digital",
    brief: "Pieza para entorno digital con lenguaje de marca, ritmo visual y foco en impacto inmediato.",
  },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function allProjects() {
  return DATA.sections.flatMap((section) => section.projects.map((project) => ({ ...project, section })));
}

function findProject(title) {
  return allProjects().find((project) => project.title === title);
}

function findProjectById(id) {
  return allProjects().find((project) => projectId(project) === id);
}

function findPiece(id) {
  for (const project of allProjects()) {
    const piece = project.pieces.find((item) => item.id === id);
    if (piece) return { piece, project };
  }
  return null;
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function projectId(project) {
  return slug(`${project.section.slug}-${project.title}`);
}

function imageMarkup(item, className = "media") {
  if (item?.preview) {
    return `<img class="${className}" src="${escapeHtml(item.preview)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
  }
  return `<div class="${className} media-placeholder"><span>${escapeHtml(item?.extension || "Media")}</span></div>`;
}

function imageFullMarkup(item, className = "media") {
  const source = item?.full || item?.original || item?.preview;
  if (source) {
    return `<img class="${className}" src="${escapeHtml(source)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
  }
  return imageMarkup(item, className);
}

function videoPosterMarkup(item, className = "video-poster") {
  return `
    <button class="${className}" data-load-video="${escapeHtml(item.id)}">
      ${imageMarkup(item, "video-poster-image")}
      <span class="inline-play">Play</span>
    </button>
  `;
}

function youtubeEmbedSrc(piece) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (window.location.origin && window.location.origin !== "null") {
    params.set("origin", window.location.origin);
    params.set("widget_referrer", window.location.href);
  }
  return `${piece.embedUrl}?${params.toString()}`;
}

function youtubeEmbedMarkup(piece) {
  const wrapper = document.createElement("div");
  wrapper.className = "youtube-embed";

  const iframe = document.createElement("iframe");
  iframe.className = "youtube-frame";
  iframe.title = piece.title;
  iframe.loading = "eager";
  iframe.referrerPolicy = "origin";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.src = youtubeEmbedSrc(piece);

  const fallback = document.createElement("a");
  fallback.className = "youtube-fallback";
  fallback.href = piece.youtubeUrl;
  fallback.target = "_blank";
  fallback.rel = "noopener";
  fallback.textContent = "Abrir en YouTube";

  wrapper.append(iframe, fallback);
  return wrapper;
}

function mediaMarkup(item, className = "media") {
  return item.type === "video" ? videoPosterMarkup(item, className) : imageMarkup(item, className);
}

function projectType(project) {
  if (project.kind === "gallery") return project.title.toLowerCase().includes("storyboard") ? "Storyboard" : "Galería";
  if (project.pieces.length > 1) return `${project.pieces.length} videos`;
  return project.main.type === "video" ? "Video" : "Imagen";
}

function projectFilterIds(project) {
  return [project.section.slug];
}

function projectSectionLabel(section) {
  if (section.slug === "edicion-generacion-ia") return "Edición + Generación";
  return section.kicker;
}

function projectRole(project) {
  return PROJECT_DETAILS[project.title]?.role || "Contenido audiovisual, edición y postproducción";
}

function projectBrief(project) {
  return PROJECT_DETAILS[project.title]?.brief || project.description;
}

function pieceCountLabel(project) {
  if (project.kind === "gallery") return `${project.pieces.length} imágenes`;
  return project.pieces.length > 1 ? `${project.pieces.length} piezas` : "Pieza única";
}

function filteredProjects() {
  return allProjects().filter((project) => activeFilter === "all" || projectFilterIds(project).includes(activeFilter));
}

function renderHome() {
  renderHeroMontage();
  renderWorkFilters();
  renderWorkGrid();
  renderLegacyHomeSections();
  if ($("#heroMontage")) startReelAutoplay();
}

function renderHeroMontage() {
  const montage = $("#heroMontage");
  if (!montage) return;
  const projects = allProjects().filter((project) => project.main.preview).slice(0, 9);
  if (!projects.length) return;
  reelState.active = ((reelState.active % projects.length) + projects.length) % projects.length;
  montage.innerHTML = projects.map((project, index) => {
    const offset = index - reelState.active;
    const wrapped = offset > projects.length / 2 ? offset - projects.length : offset < -projects.length / 2 ? offset + projects.length : offset;
    const stateClass = wrapped === 0 ? "is-active" : wrapped === -1 ? "is-prev" : wrapped === 1 ? "is-next" : "is-hidden";
    return `
    <button class="montage-item ${stateClass}" data-open-project="${escapeHtml(projectId(project))}" style="--slot:${wrapped}">
      ${imageMarkup(project.main, "montage-image")}
      <span>${escapeHtml(project.title)}</span>
    </button>
  `;
  }).join("");
  const toggle = $('[data-reel-action="toggle"]');
  if (toggle) toggle.textContent = reelState.paused ? "Reanudar" : "Pausar";
}

function moveReel(direction) {
  const total = allProjects().filter((project) => project.main.preview).slice(0, 9).length;
  if (!total) return;
  reelState.active = (reelState.active + direction + total) % total;
  renderHeroMontage();
}

function startReelAutoplay() {
  if (reelState.timer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  reelState.timer = window.setInterval(() => {
    if (!reelState.paused) moveReel(1);
  }, 3600);
}

function renderWorkFilters() {
  const root = $("#workFilters");
  if (!root) return;
  root.innerHTML = FILTERS.filter((filter) => !filter.hidden).map((filter) => `
    <button class="filter-chip${filter.id === activeFilter ? " is-active" : ""}" data-filter="${filter.id}">
      ${escapeHtml(filter.label)}
    </button>
  `).join("");
}

function renderWorkGrid() {
  const grid = $("#workGrid");
  if (!grid) return;
  const projects = filteredProjects();
  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);
  grid.innerHTML = visibleProjects.map((project, index) => `
    <button class="work-card reveal is-visible" data-open-project="${escapeHtml(projectId(project))}" style="--delay:${index * 24}ms">
      <span class="work-thumb">
        ${imageMarkup(project.main, "work-image")}
        <span class="work-hover-label">Ver detalle</span>
      </span>
      <span class="work-card-copy">
        <span class="work-meta">${escapeHtml(projectSectionLabel(project.section))} · ${escapeHtml(projectType(project))}</span>
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(pieceCountLabel(project))}</span>
      </span>
    </button>
  `).join("");
  $("#workToggle")?.remove();
  if (projects.length > 6) {
    grid.insertAdjacentHTML("afterend", `
      <div class="work-toggle" id="workToggle">
        <button class="button secondary" data-toggle-work>
          ${showAllProjects ? "Ver menos" : `Ver todos los proyectos (${projects.length})`}
        </button>
      </div>
    `);
  }
}

function renderLegacyHomeSections() {
  const sectionsNode = $("#homeSections");
  if (!sectionsNode) return;
  sectionsNode.innerHTML = DATA.sections.map((section) => {
    const visualProject = section.projects.find((project) => project.main.preview) || section.projects[0];
    return `
      <a class="section-card reveal" href="${escapeHtml(section.href)}" style="--accent:${section.accent}">
        <div class="section-thumb">${imageMarkup(visualProject.main, "section-media")}</div>
        <div class="section-card-copy">
          <p class="eyebrow">${escapeHtml(projectSectionLabel(section))}</p>
          <h3>${escapeHtml(section.title)}</h3>
          <span>${section.projects.length} proyectos</span>
        </div>
      </a>
    `;
  }).join("");
}

function galleryProjectCard(project, section) {
  return `
    <article class="project-card gallery-project reveal" style="--accent:${section.accent}">
      <a class="project-cover" href="${escapeHtml(project.galleryHref)}">
        ${imageMarkup(project.main, "project-media")}
        <span class="play-badge">Abrir galeria</span>
      </a>
      <div class="project-content">
        <p class="eyebrow">${escapeHtml(projectType(project))}</p>
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-actions">
          <a class="text-button" href="${escapeHtml(project.galleryHref)}">Ver grilla</a>
          <span class="micro-meta">${project.pieces.length} imágenes</span>
        </div>
      </div>
    </article>
  `;
}

function videoProjectCard(project, section) {
  const hasMany = project.pieces.length > 1;
  const pieces = project.pieces.map((piece) => `
    <li class="piece-row video-piece">
      <div class="piece-video-wrap">${videoPosterMarkup(piece, "piece-video-poster")}</div>
      <div class="piece-copy">
        <strong>${escapeHtml(piece.title)}</strong>
        <span>${piece.provider === "youtube" ? "YouTube" : `${escapeHtml(piece.extension)} · ${piece.sizeMb} MB`}</span>
      </div>
    </li>
  `).join("");

  return `
    <article class="project-card reveal" style="--accent:${section.accent}">
      <div class="project-cover video-cover">${videoPosterMarkup(project.main, "project-video-poster")}</div>
      <div class="project-content">
        <p class="eyebrow">${escapeHtml(projectType(project))}</p>
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-actions">
          ${hasMany ? `<button class="text-button muted" data-toggle-project>Ver ${project.pieces.length} piezas</button>` : `<span class="micro-meta">Pieza principal</span>`}
        </div>
      </div>
      ${hasMany ? `<div class="pieces-panel" hidden><ul>${pieces}</ul></div>` : ""}
    </article>
  `;
}

function projectCard(project, section) {
  return project.kind === "gallery" ? galleryProjectCard(project, section) : videoProjectCard(project, section);
}

function renderSectionPage() {
  const slugValue = document.body.dataset.section;
  const section = DATA.sections.find((item) => item.slug === slugValue);
  if (!section) return;

  document.documentElement.style.setProperty("--page-accent", section.accent);
  $("#sectionHero").innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(section.kicker)}</p>
      <h1>${escapeHtml(section.title)}</h1>
    </div>
    <p>${escapeHtml(section.description)}</p>
  `;
  $("#projectCount").textContent = `${section.projects.length} proyectos`;
  $("#projectsGrid").innerHTML = section.projects.map((project) => projectCard(project, section)).join("");
}

function renderGalleryPage() {
  const projectTitle = document.body.dataset.project;
  const project = findProject(projectTitle);
  if (!project) return;

  galleryState = { project, index: 0, mode: "grid" };
  $("#galleryHero").innerHTML = `
    <div>
      <p class="eyebrow">Galería</p>
      <h1>${escapeHtml(project.title)}</h1>
    </div>
    <p>${escapeHtml(project.description)} ${project.pieces.length} imágenes.</p>
  `;
  renderGallery();
}

function renderGallery() {
  const root = $("#galleryRoot");
  const { project, index, mode } = galleryState;
  if (!root || !project) return;

  $("[data-gallery-mode='grid']")?.classList.toggle("muted", mode !== "grid");
  $("[data-gallery-mode='carousel']")?.classList.toggle("muted", mode !== "carousel");

  if (mode === "carousel") {
    const piece = project.pieces[index];
    root.innerHTML = carouselMarkup(project, piece, index, "");
    return;
  }

  root.innerHTML = galleryGridMarkup(project, "data-gallery-index");
}

function galleryGridMarkup(project, indexAttribute) {
  return `
    <div class="gallery-grid">
      ${project.pieces.map((piece, pieceIndex) => `
        <button class="gallery-tile reveal is-visible" ${indexAttribute}="${pieceIndex}">
          ${imageMarkup(piece, "gallery-image")}
          <span>${escapeHtml(piece.title)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function carouselMarkup(project, piece, index, prefix = "") {
  return `
    <div class="carousel-view">
      <button class="carousel-nav" data-${prefix}carousel-prev>Anterior</button>
      <figure class="carousel-frame">
        ${imageFullMarkup(piece, "carousel-image")}
        <figcaption>
          <span>${escapeHtml(piece.title)}</span>
          <span>${index + 1} / ${project.pieces.length}</span>
        </figcaption>
      </figure>
      <button class="carousel-nav" data-${prefix}carousel-next>Siguiente</button>
      <button class="carousel-fullscreen" data-carousel-fullscreen>Pantalla completa</button>
    </div>
  `;
}

function closeCarouselFullscreen() {
  $(".carousel-view.is-fallback-fullscreen")?.classList.remove("is-fallback-fullscreen");
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

function openProject(project) {
  drawerState = {
    project,
    piece: project.main,
    galleryIndex: 0,
    galleryMode: project.kind === "gallery" ? "grid" : "video",
  };
  renderProjectDrawer();
  $("#projectDrawer")?.classList.add("is-open");
  $("#projectDrawer")?.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeProjectDrawer() {
  const drawer = $("#projectDrawer");
  if (!drawer) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  const body = $("#drawerBody");
  if (body) body.innerHTML = "";
}

function renderProjectDrawer() {
  const body = $("#drawerBody");
  const { project } = drawerState;
  if (!body || !project) return;
  const isGallery = project.kind === "gallery";
  body.innerHTML = `
    <div class="drawer-heading">
      <p class="eyebrow">${escapeHtml(projectSectionLabel(project.section))} · ${escapeHtml(projectType(project))}</p>
      <h2 id="drawerTitle">${escapeHtml(project.title)}</h2>
      <div class="drawer-role">
        <span>Participación</span>
        <strong>${escapeHtml(projectRole(project))}</strong>
      </div>
      <p>${escapeHtml(projectBrief(project))}</p>
    </div>
    <div class="drawer-media" id="drawerMedia">
      ${isGallery ? drawerGalleryMarkup() : drawerVideoMarkup(project, drawerState.piece)}
    </div>
    ${project.pieces.length > 1 && !isGallery ? drawerPieceListMarkup(project) : ""}
  `;
}

function drawerVideoMarkup(project, piece) {
  return `
    <div class="drawer-video-frame">
      ${videoPosterMarkup(piece, "drawer-video-poster")}
    </div>
    <div class="drawer-piece-meta">
      <strong>${escapeHtml(piece.title)}</strong>
      <span>${escapeHtml(pieceCountLabel(project))}</span>
    </div>
  `;
}

function drawerPieceListMarkup(project) {
  return `
    <div class="drawer-pieces" aria-label="Piezas del proyecto">
      ${project.pieces.map((piece) => `
        <button class="drawer-piece${piece.id === drawerState.piece.id ? " is-active" : ""}" data-select-piece="${escapeHtml(piece.id)}">
          ${imageMarkup(piece, "drawer-piece-image")}
          <span>${escapeHtml(piece.title)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function drawerGalleryMarkup() {
  const { project, galleryIndex, galleryMode } = drawerState;
  if (galleryMode === "carousel") {
    return carouselMarkup(project, project.pieces[galleryIndex], galleryIndex, "drawer-");
  }
  return `
    <div class="drawer-gallery-tools">
      <button class="filter-chip is-active" data-drawer-gallery-mode="grid">Grilla</button>
      <button class="filter-chip" data-drawer-gallery-mode="carousel">Carrusel</button>
    </div>
    ${galleryGridMarkup(project, "data-drawer-gallery-index")}
  `;
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const reelAction = event.target.closest("[data-reel-action]");
    if (reelAction) {
      const action = reelAction.dataset.reelAction;
      if (action === "prev") {
        reelState.paused = true;
        moveReel(-1);
      }
      if (action === "next") {
        reelState.paused = true;
        moveReel(1);
      }
      if (action === "toggle") {
        reelState.paused = !reelState.paused;
        renderHeroMontage();
      }
      return;
    }

    const openButton = event.target.closest("[data-open-project]");
    if (openButton) {
      const project = findProjectById(openButton.dataset.openProject);
      if (project) openProject(project);
      return;
    }

    const closeButton = event.target.closest("[data-close-project]");
    if (closeButton) {
      closeProjectDrawer();
      return;
    }

    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      activeFilter = filterButton.dataset.filter;
      showAllProjects = false;
      renderWorkFilters();
      renderWorkGrid();
      return;
    }

    const workToggle = event.target.closest("[data-toggle-work]");
    if (workToggle) {
      showAllProjects = !showAllProjects;
      renderWorkGrid();
      if (!showAllProjects) $("#work")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const selectPiece = event.target.closest("[data-select-piece]");
    if (selectPiece) {
      const found = findPiece(selectPiece.dataset.selectPiece);
      if (!found || !drawerState.project) return;
      drawerState.piece = found.piece;
      renderProjectDrawer();
      return;
    }

    const drawerGalleryMode = event.target.closest("[data-drawer-gallery-mode]");
    if (drawerGalleryMode) {
      drawerState.galleryMode = drawerGalleryMode.dataset.drawerGalleryMode;
      renderProjectDrawer();
      return;
    }

    const drawerTile = event.target.closest("[data-drawer-gallery-index]");
    if (drawerTile) {
      drawerState.galleryIndex = Number(drawerTile.dataset.drawerGalleryIndex);
      drawerState.galleryMode = "carousel";
      renderProjectDrawer();
      return;
    }

    if (event.target.closest("[data-drawer-carousel-prev]")) {
      drawerState.galleryIndex = (drawerState.galleryIndex - 1 + drawerState.project.pieces.length) % drawerState.project.pieces.length;
      renderProjectDrawer();
      return;
    }

    if (event.target.closest("[data-drawer-carousel-next]")) {
      drawerState.galleryIndex = (drawerState.galleryIndex + 1) % drawerState.project.pieces.length;
      renderProjectDrawer();
      return;
    }

    const videoButton = event.target.closest("[data-load-video]");
    if (videoButton) {
      const found = findPiece(videoButton.dataset.loadVideo);
      if (!found) return;
      const { piece } = found;
      if (piece.provider === "youtube") {
        videoButton.replaceWith(youtubeEmbedMarkup(piece));
      } else {
        const video = document.createElement("video");
        video.className = "loaded-video";
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.poster = piece.preview || "";
        video.src = piece.original;
        videoButton.replaceWith(video);
        video.play().catch(() => {});
      }
      return;
    }

    const toggle = event.target.closest("[data-toggle-project]");
    if (toggle) {
      const card = toggle.closest(".project-card");
      const panel = $(".pieces-panel", card);
      const isHidden = panel.hasAttribute("hidden");
      panel.toggleAttribute("hidden", !isHidden);
      card.classList.toggle("is-open", isHidden);
      toggle.textContent = isHidden ? "Ocultar piezas" : `Ver ${$$(".piece-row", panel).length} piezas`;
      return;
    }

    const modeButton = event.target.closest("[data-gallery-mode]");
    if (modeButton) {
      galleryState.mode = modeButton.dataset.galleryMode;
      renderGallery();
      return;
    }

    const tile = event.target.closest("[data-gallery-index]");
    if (tile) {
      galleryState.index = Number(tile.dataset.galleryIndex);
      galleryState.mode = "carousel";
      renderGallery();
      return;
    }

    if (event.target.closest("[data-carousel-prev]")) {
      galleryState.index = (galleryState.index - 1 + galleryState.project.pieces.length) % galleryState.project.pieces.length;
      renderGallery();
      return;
    }

    if (event.target.closest("[data-carousel-next]")) {
      galleryState.index = (galleryState.index + 1) % galleryState.project.pieces.length;
      renderGallery();
      return;
    }

    if (event.target.closest("[data-carousel-fullscreen]")) {
      const frame = $(".carousel-frame");
      const view = $(".carousel-view");
      if (document.fullscreenElement || document.webkitFullscreenElement || view?.classList.contains("is-fallback-fullscreen")) {
        closeCarouselFullscreen();
        return;
      }
      if (document.fullscreenEnabled === true && frame?.requestFullscreen) {
        frame.requestFullscreen().catch(() => view?.classList.add("is-fallback-fullscreen"));
      } else if (document.webkitFullscreenEnabled === true && frame?.webkitRequestFullscreen) {
        frame.webkitRequestFullscreen();
      } else {
        view?.classList.add("is-fallback-fullscreen");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#projectDrawer")?.classList.contains("is-open")) {
      closeProjectDrawer();
      return;
    }
    if (drawerState.project?.kind === "gallery" && drawerState.galleryMode === "carousel") {
      if (event.key === "ArrowLeft") {
        drawerState.galleryIndex = (drawerState.galleryIndex - 1 + drawerState.project.pieces.length) % drawerState.project.pieces.length;
        renderProjectDrawer();
      }
      if (event.key === "ArrowRight") {
        drawerState.galleryIndex = (drawerState.galleryIndex + 1) % drawerState.project.pieces.length;
        renderProjectDrawer();
      }
      return;
    }
    if (!galleryState.project || galleryState.mode !== "carousel") return;
    if (event.key === "ArrowLeft") {
      galleryState.index = (galleryState.index - 1 + galleryState.project.pieces.length) % galleryState.project.pieces.length;
      renderGallery();
    }
    if (event.key === "ArrowRight") {
      galleryState.index = (galleryState.index + 1) % galleryState.project.pieces.length;
      renderGallery();
    }
    if (event.key === "Escape") {
      if (document.fullscreenElement || document.webkitFullscreenElement || $(".carousel-view.is-fallback-fullscreen")) {
        closeCarouselFullscreen();
      } else {
        galleryState.mode = "grid";
        renderGallery();
      }
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.16 });
  $$(".reveal").forEach((node) => observer.observe(node));
}

function init() {
  if (!DATA) return;
  renderHome();
  renderSectionPage();
  renderGalleryPage();
  bindInteractions();
}

init();
