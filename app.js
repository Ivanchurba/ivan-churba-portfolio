const DATA = window.PORTFOLIO_DATA;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let galleryState = { project: null, index: 0, mode: "grid" };
let drawerState = { project: null, piece: null, galleryIndex: 0, galleryMode: "carousel" };
let activeFilter = "all";
let showAllProjects = false;
let reelState = { active: 0, paused: false, manualPaused: false, hoverPaused: false, timer: null, resumeTimer: null, loopWidth: 0, loopReady: false };
let reelPointerStart = null;
let heroSliderTween = null;
let carouselPointerStart = null;

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "edicion-generacion-ia", label: "Edición + Generación" },
  { id: "generacion-imagen-video-ia", label: "Imagen + Video IA" },
  { id: "producciones", label: "Producciones" },
];

const HOME_GRID_PROJECTS = [
  "BNA Mundial",
  "Cofler Cups",
  "Colecciones La Nacion",
  "Coppel Mexico",
  "Alfajor GOAT",
  "UNICEF",
];

const HOME_REEL_PROJECTS = [
  "BNA Mundial",
  "Cofler Cups",
  "Colecciones La Nacion",
  "Coppel Mexico",
  "Alfajor GOAT",
  "UNICEF",
  "Poxipol",
  "Cofler Gold",
  "Arcor Navidad",
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
  "Hogareñas": {
    role: "Generación visual, edición y desarrollo audiovisual",
    brief: "Pieza de producto trabajada desde generación visual, composición y ritmo para comunicación digital.",
  },
  "Zurich Hogar Gamer": {
    role: "Generación visual, edición y desarrollo audiovisual",
    brief: "Contenido para campaña de Zurich Hogar, con tratamiento visual orientado a una lectura rápida y clara.",
  },
  "Toddler Cambias": {
    role: "Generación visual, edición y desarrollo audiovisual",
    brief: "Pieza audiovisual generada para marca, con foco en imagen, timing y resolución visual.",
  },
  "Cofler Gold": {
    role: "Generación visual, edición y desarrollo audiovisual",
    brief: "Contenido de producto centrado en presencia de marca, textura visual y acabado para entorno digital.",
  },
  "Poxipol": {
    role: "Generación visual, edición y desarrollo audiovisual",
    brief: "Serie de versiones curadas por locación para mostrar distintas resoluciones visuales de campaña.",
  },
  "UNICEF": {
    role: "Asistencia de producción y sonido directo",
    brief: "Producciones filmadas en rodaje real, con asistencia integral en set y registro de sonido directo.",
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

function projectsByTitle(titles) {
  const projects = allProjects();
  return titles
    .map((title) => projects.find((project) => project.title === title))
    .filter(Boolean);
}

function homeOrderedProjects(projects) {
  const featured = HOME_GRID_PROJECTS
    .map((title) => projects.find((project) => project.title === title))
    .filter(Boolean);
  const featuredTitles = new Set(featured.map((project) => project.title));
  return [
    ...featured,
    ...projects.filter((project) => !featuredTitles.has(project.title)),
  ];
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
  const isPending = item.provider === "pending-youtube";
  return `
    <button class="${className}${isPending ? " is-pending" : ""}" ${isPending ? "disabled aria-disabled=\"true\"" : `data-load-video="${escapeHtml(item.id)}"`}>
      ${imageMarkup(item, "video-poster-image")}
      <span class="inline-play">${isPending ? "YouTube pendiente" : "Play"}</span>
    </button>
  `;
}

function youtubeEmbedSrc(piece) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
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
  if (section.slug === "generacion-imagen-video-ia") return "Imagen + Video IA";
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

function pieceStatusLabel(piece) {
  if (piece.provider === "youtube") return "YouTube";
  if (piece.provider === "pending-youtube") return "YouTube pendiente";
  return `${escapeHtml(piece.extension)} · ${piece.sizeMb} MB`;
}

function filteredProjects() {
  const projects = allProjects().filter((project) => activeFilter === "all" || projectFilterIds(project).includes(activeFilter));
  return activeFilter === "all" ? homeOrderedProjects(projects) : projects;
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
  if ($(".montage-item", montage)) return;
  const featured = projectsByTitle(HOME_REEL_PROJECTS).filter((project) => project.main.preview);
  const fallbackProjects = allProjects().filter((project) => project.main.preview && !featured.some((item) => item.title === project.title));
  const projects = [...featured, ...fallbackProjects].slice(0, 12);
  if (!projects.length) return;
  const cards = projects.map((project, index) => `
    <button class="montage-item" data-open-project="${escapeHtml(projectId(project))}" style="--card-index:${index}">
      ${imageMarkup(project.main, "montage-image")}
      <strong>${escapeHtml(project.title)}</strong>
    </button>
  `).join("");
  montage.innerHTML = `
    <div class="montage-viewport" aria-label="Proyectos destacados">
      <div class="montage-strip">
        <div class="montage-set">${cards}</div>
        <div class="montage-set" aria-hidden="true">${cards}</div>
      </div>
    </div>
  `;
  const toggle = $('[data-reel-action="toggle"]');
  if (toggle) toggle.textContent = reelState.paused ? "Reanudar" : "Pausar";
}

function moveReel(direction) {
  const viewport = $(".montage-viewport");
  const card = $(".montage-item", viewport);
  const set = $(".montage-set", viewport);
  if (!viewport || !card || !set) return;
  pauseHeroSlider("temporary");
  const gap = parseFloat(getComputedStyle(set).gap || "0");
  const distance = card.getBoundingClientRect().width + gap;
  viewport.scrollBy({ left: direction * distance, behavior: "smooth" });
  scheduleReelResume();
}

function startReelAutoplay() {
  setupInfiniteReel();
  if (reelState.timer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  reelState.timer = window.setInterval(() => {
    if (isReelPaused() || document.hidden) return;
    const viewport = $(".montage-viewport");
    if (!viewport) return;
    viewport.scrollLeft += 1.35;
    normalizeHeroSliderScroll();
  }, 24);
}

function initHeroSlider() {
  startReelAutoplay();
}

function pauseHeroSlider(reason = "temporary") {
  if (reason === "manual") reelState.manualPaused = true;
  else if (reason === "hover") reelState.hoverPaused = true;
  else reelState.paused = true;
  $(".hero-montage")?.classList.add("is-paused");
  if (heroSliderTween) heroSliderTween.pause();
}

function resumeHeroSlider(reason = "temporary") {
  if (reason === "manual") reelState.manualPaused = false;
  else if (reason === "hover") reelState.hoverPaused = false;
  reelState.paused = false;
  if (!isReelPaused()) $(".hero-montage")?.classList.remove("is-paused");
  if (heroSliderTween) heroSliderTween.resume();
}

function isReelPaused() {
  return reelState.paused || reelState.manualPaused || reelState.hoverPaused;
}

function normalizeHeroSliderScroll() {
  const viewport = $(".montage-viewport");
  if (!viewport || !reelState.loopWidth) return;
  const loopWidth = reelState.loopWidth;
  if (viewport.scrollLeft >= loopWidth * 2) {
    viewport.scrollLeft -= loopWidth;
  } else if (viewport.scrollLeft <= 1) {
    viewport.scrollLeft += loopWidth;
  }
}

function scheduleReelResume() {
  window.clearTimeout(reelState.resumeTimer);
  reelState.resumeTimer = window.setTimeout(() => {
    if (!document.hidden && !reelState.manualPaused && !reelState.hoverPaused) resumeHeroSlider();
  }, 2600);
}

function setupInfiniteReel() {
  const viewport = $(".montage-viewport");
  const strip = $(".montage-strip", viewport);
  const sets = $$(".montage-set", strip);
  if (!viewport || !strip || !sets.length) return;

  if (sets.length < 3) {
    const clone = sets[0].cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    strip.append(clone);
  }

  reelState.loopWidth = sets[0].scrollWidth;
  if (!reelState.loopWidth) return;

  if (!reelState.loopReady) {
    viewport.scrollLeft = reelState.loopWidth;
    reelState.loopReady = true;
    let ticking = false;
    viewport.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        normalizeHeroSliderScroll();
        ticking = false;
      });
    }, { passive: true });
  }
}

function initGsapMotion() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.gsap.from(".hero-copy > *", {
    y: 18,
    opacity: 0,
    duration: 0.75,
    ease: "power3.out",
    stagger: 0.08,
  });
  window.gsap.from(".hero-montage", {
    y: 18,
    opacity: 0,
    scale: 0.985,
    duration: 0.85,
    ease: "power3.out",
    delay: 0.12,
  });
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

function transitionWorkGrid(renderFn) {
  const grid = $("#workGrid");
  if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    renderFn();
    return;
  }
  grid.classList.add("is-filtering");
  window.setTimeout(() => {
    renderFn();
    window.requestAnimationFrame(() => {
      grid.classList.remove("is-filtering");
    });
  }, 150);
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
        <span>${pieceStatusLabel(piece)}</span>
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
    <div class="carousel-view" data-carousel-scope="${prefix ? "drawer" : "page"}">
      <button class="carousel-nav carousel-nav-prev" data-${prefix}carousel-prev aria-label="Imagen anterior">‹</button>
      <figure class="carousel-frame">
        ${imageFullMarkup(piece, "carousel-image")}
        <figcaption>
          <span>${escapeHtml(piece.title)}</span>
          <span>${index + 1} / ${project.pieces.length}</span>
        </figcaption>
      </figure>
      <button class="carousel-nav carousel-nav-next" data-${prefix}carousel-next aria-label="Imagen siguiente">›</button>
      <button class="carousel-fullscreen" data-carousel-fullscreen>Pantalla completa</button>
    </div>
  `;
}

function closeCarouselFullscreen() {
  $(".carousel-view.is-fallback-fullscreen")?.classList.remove("is-fallback-fullscreen");
  $("#projectDrawer")?.classList.remove("is-gallery-fullscreen");
  const drawerFullscreen = $("#projectDrawer [data-carousel-fullscreen]");
  if (drawerFullscreen) drawerFullscreen.textContent = "Pantalla completa";
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
    galleryMode: project.kind === "gallery" ? "carousel" : "video",
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
  drawer.classList.remove("is-gallery-fullscreen");
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
  body.className = `drawer-body${isGallery ? " is-gallery-drawer" : ""}${project.pieces.length > 1 ? " has-related" : " is-single"}`;
  body.innerHTML = `
    <div class="drawer-feature">
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
        ${isGallery ? drawerGalleryFeaturedMarkup() : drawerVideoMarkup(project, drawerState.piece)}
      </div>
    </div>
    <div class="drawer-related">
      ${isGallery ? drawerGalleryMarkup() : project.pieces.length > 1 ? drawerPieceListMarkup(project) : ""}
    </div>
  `;
}

function drawerVideoMarkup(project, piece) {
  return `
    <div class="drawer-video-frame">
      ${videoPosterMarkup(piece, "drawer-video-poster")}
    </div>
    <div class="drawer-piece-meta">
      <strong>${escapeHtml(piece.title)}</strong>
      <span>${piece.provider === "pending-youtube" ? "Video pendiente de link de YouTube" : escapeHtml(pieceCountLabel(project))}</span>
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

function drawerGalleryFeaturedMarkup() {
  const { project, galleryIndex } = drawerState;
  const piece = project.pieces[galleryIndex] || project.main;
  return `
    <div class="drawer-carousel" data-carousel-scope="drawer">
      <button class="carousel-nav carousel-nav-prev" data-drawer-carousel-prev aria-label="Imagen anterior">‹</button>
      <figure class="carousel-frame">
        ${imageFullMarkup(piece, "carousel-image")}
        <figcaption>
          <span>${escapeHtml(piece.title)}</span>
          <span>${galleryIndex + 1} / ${project.pieces.length}</span>
        </figcaption>
      </figure>
      <button class="carousel-nav carousel-nav-next" data-drawer-carousel-next aria-label="Imagen siguiente">›</button>
      <button class="carousel-fullscreen" data-carousel-fullscreen>Pantalla completa</button>
    </div>
  `;
}

function drawerGalleryMarkup() {
  const { project, galleryIndex } = drawerState;
  return `
    <div class="drawer-thumb-strip" aria-label="Miniaturas de la galeria">
      ${project.pieces.map((piece, pieceIndex) => `
        <button class="drawer-thumb${pieceIndex === galleryIndex ? " is-active" : ""}" data-drawer-gallery-index="${pieceIndex}" aria-label="Ver ${escapeHtml(piece.title)}">
          ${imageMarkup(piece, "drawer-thumb-image")}
          <span>${escapeHtml(piece.title)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function setDrawerGalleryIndex(index) {
  const project = drawerState.project;
  if (!project?.pieces?.length) return;
  drawerState.galleryIndex = (index + project.pieces.length) % project.pieces.length;
  const piece = project.pieces[drawerState.galleryIndex];
  const image = $("#drawerMedia .carousel-image");
  const title = $("#drawerMedia .carousel-frame figcaption span:first-child");
  const count = $("#drawerMedia .carousel-frame figcaption span:last-child");
  const fullscreen = $("#drawerMedia [data-carousel-fullscreen]");
  if (!image || !title || !count) {
    renderProjectDrawer();
    return;
  }
  image.src = piece.full || piece.original || piece.preview || "";
  image.alt = piece.title;
  title.textContent = piece.title;
  count.textContent = `${drawerState.galleryIndex + 1} / ${project.pieces.length}`;
  if (fullscreen && $("#projectDrawer")?.classList.contains("is-gallery-fullscreen")) {
    fullscreen.textContent = "Salir de pantalla completa";
  }
  $$(".drawer-thumb").forEach((thumb) => {
    thumb.classList.toggle("is-active", Number(thumb.dataset.drawerGalleryIndex) === drawerState.galleryIndex);
  });
  $(`.drawer-thumb[data-drawer-gallery-index="${drawerState.galleryIndex}"]`)?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}

function setPageGalleryIndex(index) {
  const project = galleryState.project;
  if (!project?.pieces?.length) return;
  galleryState.index = (index + project.pieces.length) % project.pieces.length;
  renderGallery();
}

function bindInteractions() {
  const heroMontage = $("#heroMontage")?.closest(".hero-montage");
  if (heroMontage) {
    heroMontage.addEventListener("mouseenter", () => pauseHeroSlider("hover"));
    heroMontage.addEventListener("mouseleave", () => {
      resumeHeroSlider("hover");
    });
    heroMontage.addEventListener("pointerdown", (event) => {
      reelPointerStart = { x: event.clientX, y: event.clientY };
      pauseHeroSlider("temporary");
    });
    heroMontage.addEventListener("pointerup", (event) => {
      if (!reelPointerStart) return;
      const deltaX = event.clientX - reelPointerStart.x;
      const deltaY = event.clientY - reelPointerStart.y;
      reelPointerStart = null;
      if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) {
        scheduleReelResume();
        return;
      }
      moveReel(deltaX < 0 ? 1 : -1);
    });
    heroMontage.addEventListener("pointercancel", () => {
      reelPointerStart = null;
      scheduleReelResume();
    });
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      reelState.loopReady = false;
      setupInfiniteReel();
      initHeroSlider();
    }, 180);
  });

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
        window.clearTimeout(reelState.resumeTimer);
        if (reelState.manualPaused) resumeHeroSlider("manual");
        else pauseHeroSlider("manual");
        const toggle = $('[data-reel-action="toggle"]');
        if (toggle) toggle.textContent = reelState.manualPaused ? "Reanudar" : "Pausar";
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
      transitionWorkGrid(renderWorkGrid);
      return;
    }

    const workToggle = event.target.closest("[data-toggle-work]");
    if (workToggle) {
      showAllProjects = !showAllProjects;
      transitionWorkGrid(renderWorkGrid);
      if (!showAllProjects) $("#work")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const selectPiece = event.target.closest("[data-select-piece]");
    if (selectPiece) {
      const found = findPiece(selectPiece.dataset.selectPiece);
      if (!found || !drawerState.project) return;
      drawerState.piece = found.piece;
      const media = $("#drawerMedia");
      if (media && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        media.classList.add("is-switching");
        window.setTimeout(renderProjectDrawer, 130);
      } else {
        renderProjectDrawer();
      }
      return;
    }

    const drawerGalleryMode = event.target.closest("[data-drawer-gallery-mode]");
    if (drawerGalleryMode) {
      drawerState.galleryMode = "carousel";
      return;
    }

    const drawerTile = event.target.closest("[data-drawer-gallery-index]");
    if (drawerTile) {
      setDrawerGalleryIndex(Number(drawerTile.dataset.drawerGalleryIndex));
      return;
    }

    if (event.target.closest("[data-drawer-carousel-prev]")) {
      setDrawerGalleryIndex(drawerState.galleryIndex - 1);
      return;
    }

    if (event.target.closest("[data-drawer-carousel-next]")) {
      setDrawerGalleryIndex(drawerState.galleryIndex + 1);
      return;
    }

    const videoButton = event.target.closest("[data-load-video]");
    if (videoButton) {
      const found = findPiece(videoButton.dataset.loadVideo);
      if (!found) return;
      const { piece } = found;
      if (piece.provider === "pending-youtube") return;
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
      setPageGalleryIndex(galleryState.index - 1);
      return;
    }

    if (event.target.closest("[data-carousel-next]")) {
      setPageGalleryIndex(galleryState.index + 1);
      return;
    }

    if (event.target.closest("[data-carousel-fullscreen]")) {
      const drawer = $("#projectDrawer");
      if (drawer?.classList.contains("is-open") && drawerState.project?.kind === "gallery") {
        const isFullscreen = drawer.classList.toggle("is-gallery-fullscreen");
        event.target.textContent = isFullscreen ? "Salir de pantalla completa" : "Pantalla completa";
        return;
      }
      const view = event.target.closest(".carousel-view") || $(".carousel-view");
      if (document.fullscreenElement || document.webkitFullscreenElement || view?.classList.contains("is-fallback-fullscreen")) {
        closeCarouselFullscreen();
        return;
      }
      if (document.fullscreenEnabled === true && view?.requestFullscreen) {
        view.requestFullscreen().catch(() => view?.classList.add("is-fallback-fullscreen"));
      } else if (document.webkitFullscreenEnabled === true && view?.webkitRequestFullscreen) {
        view.webkitRequestFullscreen();
      } else {
        view?.classList.add("is-fallback-fullscreen");
      }
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const view = event.target.closest(".carousel-view, .drawer-carousel");
    if (!view) return;
    carouselPointerStart = { x: event.clientX, y: event.clientY, scope: view.dataset.carouselScope };
  });

  document.addEventListener("pointerup", (event) => {
    if (!carouselPointerStart) return;
    const deltaX = event.clientX - carouselPointerStart.x;
    const deltaY = event.clientY - carouselPointerStart.y;
    const scope = carouselPointerStart.scope;
    carouselPointerStart = null;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (scope === "drawer" && drawerState.project?.kind === "gallery") {
      setDrawerGalleryIndex(drawerState.galleryIndex + (deltaX < 0 ? 1 : -1));
      return;
    }
    if (galleryState.project && galleryState.mode === "carousel") {
      setPageGalleryIndex(galleryState.index + (deltaX < 0 ? 1 : -1));
    }
  });

  document.addEventListener("pointercancel", () => {
    carouselPointerStart = null;
  });

  document.addEventListener("keydown", (event) => {
    if ($("#heroMontage") && !$("#projectDrawer")?.classList.contains("is-open")) {
      if (event.key === "ArrowLeft") {
        reelState.paused = true;
        moveReel(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        reelState.paused = true;
        moveReel(1);
        return;
      }
    }
    if (event.key === "Escape" && $("#projectDrawer")?.classList.contains("is-open")) {
      if ($("#projectDrawer")?.classList.contains("is-gallery-fullscreen")) {
        closeCarouselFullscreen();
        return;
      }
      closeProjectDrawer();
      return;
    }
    if (drawerState.project?.kind === "gallery") {
      if (event.key === "ArrowLeft") {
        setDrawerGalleryIndex(drawerState.galleryIndex - 1);
      }
      if (event.key === "ArrowRight") {
        setDrawerGalleryIndex(drawerState.galleryIndex + 1);
      }
      return;
    }
    if (!galleryState.project || galleryState.mode !== "carousel") return;
    if (event.key === "ArrowLeft") {
      setPageGalleryIndex(galleryState.index - 1);
    }
    if (event.key === "ArrowRight") {
      setPageGalleryIndex(galleryState.index + 1);
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
  initGsapMotion();
  window.addEventListener("load", () => {
    initHeroSlider();
    initGsapMotion();
  }, { once: true });
}

init();
