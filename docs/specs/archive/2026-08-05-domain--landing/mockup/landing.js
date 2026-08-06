/* Landing-only interactions (i18n lives in i18n.js) */
(function () {
  AMDi18n.initChrome();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Side nav scroll-spy + contrast vs light/dark sections */
  const sideLinks = Array.from(document.querySelectorAll(".sidenav a"));
  const sections = sideLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function sectionAtY(y) {
    let hit = null;
    sections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) hit = sec;
    });
    return hit;
  }

  function updateSideNav() {
    let current = sections[0];
    const y = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec;
    });
    sideLinks.forEach((a) => {
      a.setAttribute("aria-current", String(a.getAttribute("href") === `#${current.id}`));
      const midY = a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2;
      const under = sectionAtY(midY);
      const onLight = !!(under && under.classList.contains("section--light"));
      a.classList.toggle("is-on-light", onLight);
    });
  }

  /* Road accordion */
  const roadItems = Array.from(document.querySelectorAll(".road__item"));

  function setItemOpen(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelectorAll("[aria-expanded]").forEach((el) => {
      el.setAttribute("aria-expanded", String(open));
    });
  }

  function toggleRoadItem(item) {
    const willOpen = !item.classList.contains("is-open");
    roadItems.forEach((other) => setItemOpen(other, other === item && willOpen));
    if (willOpen) {
      const select = document.getElementById("service");
      const key = item.getAttribute("data-service");
      if (select && key) select.value = key;
    }
  }

  roadItems.forEach((item) => {
    item.querySelectorAll(".road__node, .road__pill, .road__card").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        e.preventDefault();
        toggleRoadItem(item);
      });
      if (el.classList.contains("road__card")) {
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleRoadItem(item);
          }
        });
      }
    });
  });

  document.querySelectorAll("a[href^='servicios.html']").forEach((link) => {
    link.addEventListener("click", (e) => e.stopPropagation());
  });

  /* Form */
  const form = document.getElementById("contact-form");
  const toast = document.getElementById("toast");

  function buildWaUrl(f) {
    const d = AMDi18n.dict(AMDi18n.getLocale());
    const data = new FormData(f);
    const parts = [
      d.waPrefill,
      data.get("fullName") && `Name: ${data.get("fullName")}`,
      data.get("email") && `Email: ${data.get("email")}`,
      data.get("service") && `Service: ${data.get("service")}`,
      data.get("message") && `Message: ${data.get("message")}`,
    ].filter(Boolean);
    return `https://wa.me/573248805290?text=${encodeURIComponent(parts.join("\n"))}`;
  }

  function validate(f) {
    let ok = true;
    f.querySelectorAll(".field").forEach((field) => field.classList.remove("is-invalid"));
    if (!f.fullName.value.trim()) {
      f.fullName.closest(".field").classList.add("is-invalid");
      ok = false;
    }
    if (!f.email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value)) {
      f.email.closest(".field").classList.add("is-invalid");
      ok = false;
    }
    if (!f.message.value.trim()) {
      f.message.closest(".field").classList.add("is-invalid");
      ok = false;
    }
    return ok;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      toast.classList.add("is-visible");
      window.open(buildWaUrl(form), "_blank", "noopener,noreferrer");
    });
    document.getElementById("wa-btn")?.addEventListener("click", () => {
      window.open(buildWaUrl(form), "_blank", "noopener,noreferrer");
    });
  }

  /* Reveal + road progress */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          if (entry.target.classList.contains("road__item")) {
            entry.target.classList.add("is-active");
          }
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );
  document.querySelectorAll(".reveal, .road__item").forEach((el) => io.observe(el));

  const road = document.getElementById("services-road");
  const progress = document.getElementById("road-progress");
  const deco = document.querySelectorAll("[data-road-parallax]");
  const heroLayer = document.querySelector("[data-parallax]");

  function updateRoadScroll() {
    if (!road || !progress) return;
    const rect = road.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const total = rect.height + view * 0.35;
    const traveled = Math.min(Math.max(view * 0.35 - rect.top, 0), total);
    progress.style.height = `${Math.min(100, Math.max(0, (traveled / total) * 100))}%`;
    if (!reduce) {
      deco.forEach((el) => {
        const factor = Number(el.getAttribute("data-road-parallax") || 0.1);
        el.style.transform = `translate3d(0, ${rect.top * -factor}px, 0)`;
      });
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      updateRoadScroll();
      updateSideNav();
      if (heroLayer && !reduce) {
        heroLayer.style.transform = `translate3d(0, ${window.scrollY * 0.22}px, 0)`;
      }
    },
    { passive: true }
  );
  updateRoadScroll();
  updateSideNav();

  /* Testimonials: long pause, then crossfade */
  const quotes = Array.from(document.querySelectorAll(".quote"));
  const dotsWrap = document.getElementById("testimonial-dots");
  let quoteIndex = 0;
  const PAUSE_MS = 9000;

  function showQuote(i) {
    quoteIndex = i;
    quotes.forEach((q, idx) => q.classList.toggle("is-active", idx === i));
    if (dotsWrap) {
      dotsWrap.querySelectorAll("button").forEach((b, idx) => {
        b.setAttribute("aria-current", String(idx === i));
      });
    }
  }

  if (dotsWrap && quotes.length) {
    quotes.forEach((_, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Testimonio ${idx + 1}`);
      b.addEventListener("click", () => {
        showQuote(idx);
        restartTestimonials();
      });
      dotsWrap.appendChild(b);
    });
    showQuote(0);
  }

  let testimonialTimer;
  function restartTestimonials() {
    clearInterval(testimonialTimer);
    if (reduce || quotes.length < 2) return;
    testimonialTimer = setInterval(() => {
      showQuote((quoteIndex + 1) % quotes.length);
    }, PAUSE_MS);
  }
  restartTestimonials();
})();
