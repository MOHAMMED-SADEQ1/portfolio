/* ============================================================
   PROJECT DETAIL PAGES - MAIN SCRIPT
   Shared by all project-*.html pages
   ============================================================ */
(function () {
  "use strict";

  /* ==========================================================
     STATE & ELEMENTS
     ========================================================== */
  const html = document.documentElement;
  const langToggle = document.getElementById("lang-toggle");
  const mobileLangToggle = document.getElementById("mobile-lang-toggle");
  const langLabel = document.getElementById("lang-label");
  const mobileLangLabel = document.querySelector(".mobile-lang-label");
  const header = document.getElementById("header");
  const navToggle = document.getElementById("menu-toggle");
  const navClose = document.getElementById("menu-close");
  const navMenu = document.getElementById("mobile-menu");
  const scrollProgress = document.getElementById("scroll-progress");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxBackdrop = document.getElementById("lightbox-backdrop");
  const currentYear = document.getElementById("current-year");

  let currentLang = "ar";

  /* ==========================================================
     1. LANGUAGE SYSTEM
     ========================================================== */
  function toggleLanguage() {
    currentLang = currentLang === "en" ? "ar" : "en";
    applyLanguage(currentLang);
    localStorage.setItem("preferred-language", currentLang);
  }

  function applyLanguage(lang) {
    currentLang = lang;

    if (lang === "ar") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", "ar");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "en");
    }

    // Update all translatable elements
    document.querySelectorAll("[data-en][data-ar]").forEach((el) => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        el.textContent = text;
      }
    });

    // Update language labels
    const labelText = lang === "en" ? "العربية" : "English";
    if (langLabel) langLabel.textContent = labelText;
    if (mobileLangLabel) mobileLangLabel.textContent = labelText;
  }

  // Init language from saved preference (default Arabic)
  const savedLang = localStorage.getItem("preferred-language");
  currentLang = savedLang === "en" ? "en" : "ar";
  applyLanguage(currentLang);

  if (langToggle) langToggle.addEventListener("click", toggleLanguage);
  if (mobileLangToggle) mobileLangToggle.addEventListener("click", toggleLanguage);

  /* ==========================================================
     2. STICKY HEADER + SCROLL PROGRESS
     ========================================================== */
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (header) {
        header.classList.toggle("glass-strong", y > 50);
      }
      if (scrollProgress) {
        const max = html.scrollHeight - window.innerHeight;
        scrollProgress.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
      }
    },
    { passive: true },
  );

  /* ==========================================================
     3. MOBILE MENU
     ========================================================== */
  function closeMenu() {
    if (navMenu) navMenu.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }
  if (navClose) navClose.addEventListener("click", closeMenu);
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* ==========================================================
     4. LIGHTBOX
     ========================================================== */
  let lastFocused = null;

  function openLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = img.currentSrc || img.src;
    if (lightboxCaption) {
      const figure = img.closest("figure");
      const captionEl = figure ? figure.querySelector("figcaption") : null;
      if (captionEl) {
        const text = captionEl.getAttribute(`data-${currentLang}`);
        lightboxCaption.textContent = text || captionEl.textContent;
      } else {
        lightboxCaption.textContent = "";
      }
    }
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
    lastFocused = null;
  }

  document.querySelectorAll(".gallery-img").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img));
  });

  /* ==========================================================
     4b. SMART IMAGE PRESENTATION
     Detect portrait screenshots (mobile apps) and present them
     as a phone mockup instead of cropping them with object-cover.
     ========================================================== */
  function setupPortraitImages() {
    document.querySelectorAll(".gallery-media img").forEach((img) => {
      const media = img.closest(".gallery-media");
      if (!media) return;

      const apply = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;
        if (h > w) {
          media.classList.add("is-portrait");
        } else {
          media.classList.remove("is-portrait");
        }
      };

      if (img.complete && img.naturalWidth) {
        apply();
      } else {
        img.addEventListener("load", apply);
      }
    });
  }
  setupPortraitImages();
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);

  // Close lightbox + menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeLightbox();
    }
  });

  /* ==========================================================
     5. MISC
     ========================================================== */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
})();
