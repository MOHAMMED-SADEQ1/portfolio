/* ============================================================
   PROFESSIONAL PORTFOLIO - ENHANCED JAVASCRIPT
   Advanced Animations, Particles, Typing Effect, 3D Tilt
   Magnetic Buttons, Custom Cursor, Parallax, Language Toggle
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
       DOM REFERENCES
       ========================================================== */
  const header = document.getElementById("header");
  const navToggle = document.getElementById("menu-toggle");
  const navClose = document.getElementById("menu-close");
  const navMenu = document.getElementById("mobile-menu");
  const langToggle = document.getElementById("lang-toggle");
  const mobileLangToggle = document.getElementById("mobile-lang-toggle");
  const langLabel = document.getElementById("lang-label");
  const mobileLangLabel = document.querySelector(".mobile-lang-label");
  const contactForm = document.getElementById("contact-form");
  const formMessage = document.getElementById("form-message");
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");
  const scrollProgress = document.getElementById("scroll-progress");
  const particlesCanvas = document.getElementById("particles-canvas");
  const typingText = document.getElementById("typing-text");
  const profileModal = document.getElementById("profile-modal");
  const profileTrigger = document.getElementById("profile-trigger");
  const mobileProfileTrigger = document.getElementById(
    "mobile-profile-trigger",
  );
  const modalClose = document.getElementById("modal-close");
  const modalBackdrop = document.getElementById("modal-backdrop");

  /* ==========================================================
       STATE
       ========================================================== */
  let currentLang = "en";
  let isMenuOpen = false;
  let mouseX = 0,
    mouseY = 0;
  let ringX = 0,
    ringY = 0;
  let reducedMotion = false;

  /* ==========================================================
       1. INITIALIZE ALL COMPONENTS
       ========================================================== */
  function init() {
    // Initialize AOS
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
      });
    }

    initLanguage();
    initParticles();
    initTypingEffect();
    initNavigation();
    initSkillBars();
    initContactForm();
    initCustomCursor();
    initScrollProgress();
    initTiltCards();
    initMagneticButtons();
    initParallaxOrbs();
    initSmoothScroll();
    setCurrentYear();
    checkReducedMotion();
    initProfileModal();
  }

  /* ==========================================================
       2. LANGUAGE SYSTEM
       ========================================================== */
  function initLanguage() {
    const savedLang = localStorage.getItem("preferred-language");
    if (savedLang) {
      currentLang = savedLang;
    } else {
      // Default to Arabic on first load
      currentLang = "ar";
    }

    applyLanguage(currentLang);

    if (langToggle) {
      langToggle.addEventListener("click", toggleLanguage);
    }

    if (mobileLangToggle) {
      mobileLangToggle.addEventListener("click", toggleLanguage);
    }
  }

  function toggleLanguage() {
    currentLang = currentLang === "en" ? "ar" : "en";
    applyLanguage(currentLang);
    localStorage.setItem("preferred-language", currentLang);
  }

  function applyLanguage(lang) {
    currentLang = lang;
    const html = document.documentElement;

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

    // Update placeholders
    document
      .querySelectorAll("[data-placeholder-en][data-placeholder-ar]")
      .forEach((el) => {
        const placeholder = el.getAttribute(`data-placeholder-${lang}`);
        if (placeholder) {
          el.setAttribute("placeholder", placeholder);
        }
      });

    // Update language labels
    const labelText = lang === "en" ? "العربية" : "English";
    if (langLabel) langLabel.textContent = labelText;
    if (mobileLangLabel) mobileLangLabel.textContent = labelText;

    // Restart typing effect with new language
    initTypingEffect();
  }

  /* ==========================================================
       3. PARTICLE BACKGROUND (Advanced)
       ========================================================== */
  function initParticles() {
    if (!particlesCanvas) return;

    const ctx = particlesCanvas.getContext("2d");
    let particles = [];
    let animationId;

    // Connection & interaction parameters (visual output unchanged)
    const maxDistance = 150;
    const mouseMaxDistance = 120;
    const cellSize = maxDistance;

    // CSS-pixel viewport size; the canvas backing store is scaled by
    // devicePixelRatio so particles stay crisp on high-DPI screens.
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    // Spatial grid for fast neighbor lookups (avoids the O(n²) scan)
    let grid = [];
    let gridCols = 0;
    let gridRows = 0;

    // Resize handler (devicePixelRatio-aware, debounced)
    function resize() {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Math.round (not floor) so the backing store matches the transform
      // extent on fractional DPRs and no edge strip is left stale
      particlesCanvas.width = Math.max(1, Math.round(cssWidth * dpr));
      particlesCanvas.height = Math.max(1, Math.round(cssHeight * dpr));
      // Draw in CSS pixels; the transform applies the device-pixel scale
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep particles inside the new bounds
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = Math.min(p.x, cssWidth);
        p.y = Math.min(p.y, cssHeight);
        p.baseX = Math.min(p.baseX, cssWidth);
        p.baseY = Math.min(p.baseY, cssHeight);
      }
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }

    resize();
    window.addEventListener("resize", onResize);

    // Mouse tracking
    let mouseActive = false;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    });

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * cssWidth;
        this.y = Math.random() * cssHeight;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.density = Math.random() * 30 + 1;
      }

      update() {
        // Natural movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction (squared distance avoids sqrt for far particles)
        if (mouseActive && mouseX > 0 && mouseY > 0) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseMaxDistance * mouseMaxDistance) {
            if (distSq > 0) {
              const distance = Math.sqrt(distSq);
              const force = (mouseMaxDistance - distance) / mouseMaxDistance;
              const directionX = (dx / distance) * force * this.density * 0.6;
              const directionY = (dy / distance) * force * this.density * 0.6;
              this.x -= directionX;
              this.y -= directionY;
            }
          } else if (this.x !== this.baseX || this.y !== this.baseY) {
            // Return to base position
            this.x -= (this.x - this.baseX) / 20;
            this.y -= (this.y - this.baseY) / 20;
          }
        }

        // Wrap around edges
        if (this.x < 0) this.x = cssWidth;
        if (this.x > cssWidth) this.x = 0;
        if (this.y < 0) this.y = cssHeight;
        if (this.y > cssHeight) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(100, 255, 218, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Particle count based on the CSS-pixel area (same density as before)
    const particleCount = Math.min(
      Math.floor((cssWidth * cssHeight) / 15000),
      100,
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Rebuild the spatial grid each frame (bucket arrays are reused)
    function rebuildGrid() {
      gridCols = Math.max(1, Math.ceil(cssWidth / cellSize));
      gridRows = Math.max(1, Math.ceil(cssHeight / cellSize));

      if (grid.length !== gridCols * gridRows) {
        grid = [];
        for (let i = 0; i < gridCols * gridRows; i++) grid.push([]);
      } else {
        for (let i = 0; i < grid.length; i++) grid[i].length = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.min(
          gridCols - 1,
          Math.max(0, Math.floor(p.x / cellSize)),
        );
        const cy = Math.min(
          gridRows - 1,
          Math.max(0, Math.floor(p.y / cellSize)),
        );
        grid[cx + cy * gridCols].push(p);
      }
    }

    // Draw one connection with the same opacity gradient as before
    function drawLine(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.3;
        ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Connect nearby particles using the grid: only neighboring cells are
    // compared, which is identical to the full O(n²) scan but far faster.
    function connectParticles() {
      const maxCol = gridCols - 1;
      const maxRow = gridRows - 1;

      for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
          const cell = grid[x + y * gridCols];
          if (cell.length === 0) continue;

          // Pairs inside the same cell (i < j avoids duplicates)
          for (let i = 0; i < cell.length; i++) {
            for (let j = i + 1; j < cell.length; j++) {
              drawLine(cell[i], cell[j]);
            }
          }

          // Pairs with neighboring cells — only the "forward half" of the
          // 3x3 neighborhood is used, so every pair is drawn exactly once.
          for (
            let cy = Math.max(0, y - 1);
            cy <= Math.min(maxRow, y + 1);
            cy++
          ) {
            for (
              let cx = Math.max(0, x - 1);
              cx <= Math.min(maxCol, x + 1);
              cx++
            ) {
              if (cx < x || (cx === x && cy <= y)) continue;
              const neighbor = grid[cx + cy * gridCols];
              if (neighbor.length === 0) continue;

              for (let i = 0; i < cell.length; i++) {
                const a = cell[i];
                for (let j = 0; j < neighbor.length; j++) {
                  drawLine(a, neighbor[j]);
                }
              }
            }
          }
        }
      }
    }

    // Animation loop
    function animate() {
      // Pauses the loop entirely when prefers-reduced-motion is enabled
      if (reducedMotion) return;

      // +1 covers any sub-pixel rounding remainder on fractional DPRs
      ctx.clearRect(0, 0, cssWidth + 1, cssHeight + 1);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      rebuildGrid();
      connectParticles();
      animationId = requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================
       4. TYPING EFFECT
       ========================================================== */
  let typingTimeout;

  function initTypingEffect() {
    if (!typingText) return;

    const texts = {
      en: [
        "Senior Full-Stack Developer",
        "Cloud Solutions Architect",
        "Laravel & Next.js Expert",
        "Mobile App Developer",
        "Complex Systems Designer",
      ],
      ar: [
        "مطور Full-Stack محترف",
        "مهندس حلول سحابية",
        "خبير Laravel و Next.js",
        "مطور تطبيقات الجوال",
        "مصمم الأنظمة المعقدة",
      ],
    };

    const currentTexts = texts[currentLang] || texts.en;
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    function type() {
      const currentText = currentTexts[textIndex];

      if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      // Word complete
      if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % currentTexts.length;
        typingSpeed = 500;
      }

      typingTimeout = setTimeout(type, typingSpeed);
    }

    // Reset and start
    typingText.textContent = "";
    charIndex = 0;
    isDeleting = false;
    textIndex = 0;
    type();
  }

  /* ==========================================================
       5. NAVIGATION (Sticky + Mobile Menu)
       ========================================================== */
  function initNavigation() {
    // Sticky header
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 50) {
          header.classList.add("glass-strong", "shadow-lg");
        } else {
          header.classList.remove("glass-strong", "shadow-lg");
        }

        updateActiveLink();
      },
      { passive: true },
    );

    // Mobile menu toggle
    if (navToggle) {
      navToggle.addEventListener("click", () => {
        isMenuOpen = true;
        navMenu.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    }

    if (navClose) {
      navClose.addEventListener("click", closeMenu);
    }

    // Close on mobile link click
    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    });

    function closeMenu() {
      isMenuOpen = false;
      navMenu.classList.remove("open");
      document.body.style.overflow = "";
    }

    // Active link highlighting
    function updateActiveLink() {
      const sections = document.querySelectorAll("section[id]");
      const navLinks = document.querySelectorAll(".nav-link");
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          navLinks.forEach((link) => {
            link.classList.remove("active", "text-neon-cyan");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active", "text-neon-cyan");
            }
          });
        }
      });
    }
  }

  /* ==========================================================
       6. SKILL BARS ANIMATION
       ========================================================== */
  function initSkillBars() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const skillBars = entry.target.querySelectorAll(".skill-bar");
            skillBars.forEach((bar, index) => {
              setTimeout(() => {
                bar.classList.add("animated");
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.3 },
    );

    const skillsSection = document.getElementById("skills");
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  }

  /* ==========================================================
       7. CONTACT FORM
       ========================================================== */
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Validation
      if (!data.name || !data.email || !data.message) {
        showFormMessage(
          currentLang === "ar"
            ? "يرجى ملء جميع الحقول المطلوبة"
            : "Please fill in all required fields",
          "error",
        );
        return;
      }

      if (!isValidEmail(data.email)) {
        showFormMessage(
          currentLang === "ar"
            ? "بريد إلكتروني غير صالح"
            : "Invalid email address",
          "error",
        );
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalContent = submitBtn.innerHTML;
      const loadingText =
        currentLang === "ar" ? "جاري الإرسال..." : "Sending...";

      // Loading state
      submitBtn.innerHTML = `<span class="flex items-center justify-center gap-2"><i class="fas fa-spinner fa-spin"></i> ${loadingText}</span>`;
      submitBtn.disabled = true;

      // Simulate API call
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const successMsg =
          currentLang === "ar"
            ? "تم إرسال الرسالة بنجاح! سأعود إليك قريباً."
            : "Message sent successfully! I'll get back to you soon.";

        showFormMessage(successMsg, "success");
        contactForm.reset();
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      } catch (error) {
        const errorMsg =
          currentLang === "ar"
            ? "حدث خطأ. يرجى المحاولة مرة أخرى."
            : "Something went wrong. Please try again.";

        showFormMessage(errorMsg, "error");
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      }
    });

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    let formMessageTimer;

    function showFormMessage(message, type) {
      if (!formMessage) return;

      // Cancel any pending hide timer from a previous message
      if (formMessageTimer) {
        clearTimeout(formMessageTimer);
        formMessageTimer = null;
      }

      formMessage.textContent = message;
      formMessage.className = `mt-4 p-4 rounded-lg ${
        type === "success"
          ? "bg-green-500/20 border border-green-500/30 text-green-400"
          : "bg-red-500/20 border border-red-500/30 text-red-400"
      }`;
      formMessage.style.opacity = "1";
      formMessage.style.transition = "opacity 0.4s ease";
      formMessage.style.animation = "fadeInMessage 0.4s ease";

      formMessageTimer = setTimeout(() => {
        formMessage.style.opacity = "0";
        // Reuse the same timer id so a rapid resubmission clears this too
        formMessageTimer = setTimeout(() => {
          formMessage.textContent = "";
          formMessage.className = "mt-4 hidden";
        }, 400);
      }, 5000);
    }
  }

  /* ==========================================================
       8. CUSTOM CURSOR
       ========================================================== */
  function initCustomCursor() {
    if (!cursorDot || !cursorRing) return;

    // Hide on mobile
    if (window.innerWidth < 1024) return;

    // Dot follows mouse immediately
    document.addEventListener("mousemove", (e) => {
      cursorDot.style.left = `${e.clientX - 4}px`;
      cursorDot.style.top = `${e.clientY - 4}px`;

      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Ring follows with delay (smooth animation)
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      cursorRing.style.left = `${ringX - 20}px`;
      cursorRing.style.top = `${ringY - 20}px`;

      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverElements = document.querySelectorAll(
      "a, button, .tilt-card, .neon-glow, .neon-glow-purple, .social-icon, input, textarea",
    );

    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorRing.classList.add("hover");
        cursorDot.style.transform = "scale(1.5)";
      });

      el.addEventListener("mouseleave", () => {
        cursorRing.classList.remove("hover");
        cursorDot.style.transform = "scale(1)";
      });
    });
  }

  /* ==========================================================
       9. SCROLL PROGRESS BAR
       ========================================================== */
  function initScrollProgress() {
    if (!scrollProgress) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        scrollProgress.style.width = `${scrollPercent}%`;
      },
      { passive: true },
    );
  }

  /* ==========================================================
       10. 3D TILT CARDS
       ========================================================== */
  function initTiltCards() {
    const tiltCards = document.querySelectorAll(".tilt-card");

    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    function handleMouseMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transition = "transform 0.1s ease-out";
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    }

    function handleMouseLeave(e) {
      const card = e.currentTarget;

      card.style.transition =
        "transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
    }
  }

  /* ==========================================================
       11. MAGNETIC BUTTONS
       ========================================================== */
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll(".magnetic-btn");

    magneticBtns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ==========================================================
       12. PARALLAX GRADIENT ORBS
       ========================================================== */
  function initParallaxOrbs() {
    const orbs = document.querySelectorAll(".gradient-orb");

    if (orbs.length === 0) return;

    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;

        orbs.forEach((orb, index) => {
          const speed = 0.1 + index * 0.05;
          // Use the separate `translate` property so it composes with the
          // float/pulse animations instead of being overridden by them
          orb.style.translate = `0 ${scrollY * speed}px`;
        });
      },
      { passive: true },
    );
  }

  /* ==========================================================
       13. SMOOTH SCROLL
       ========================================================== */
  function initSmoothScroll() {
    // Only handle real in-page anchors (ignore empty "#" placeholders)
    document
      .querySelectorAll('a[href^="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();

          const href = this.getAttribute("href");
          if (!href || href === "#") return;

          const target = document.querySelector(href);
          if (target) {
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });
          }
        });
      });
  }

  /* ==========================================================
       14. DYNAMIC YEAR
       ========================================================== */
  function setCurrentYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  /* ==========================================================
       15. REDUCED MOTION CHECK
       ========================================================== */
  function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      reducedMotion = true;

      // Disable complex animations
      if (particlesCanvas) {
        particlesCanvas.style.display = "none";
      }

      document.querySelectorAll(".gradient-orb").forEach((orb) => {
        orb.style.animation = "none";
      });

      document.querySelectorAll(".typing-cursor").forEach((cursor) => {
        cursor.style.animation = "none";
      });
    }
  }

  /* ==========================================================
       16. PROFILE IMAGE MODAL
       ========================================================== */
  function initProfileModal() {
    if (!profileModal) return;

    function openModal() {
      profileModal.classList.remove("hidden");
      // Trigger reflow for animation
      void profileModal.offsetWidth;
      profileModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      profileModal.classList.remove("active");
      setTimeout(() => {
        profileModal.classList.add("hidden");
        document.body.style.overflow = "";
      }, 300);
    }

    // Open modal triggers
    if (profileTrigger) {
      profileTrigger.addEventListener("click", openModal);
    }

    if (mobileProfileTrigger) {
      mobileProfileTrigger.addEventListener("click", openModal);
    }

    // Close modal
    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closeModal);
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !profileModal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }

  /* ==========================================================
       RUN INITIALIZATION
       ========================================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
