const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".tilt-card");
const ambientBlobs = document.querySelectorAll(".ambient");
const heroVisual = document.querySelector(".orbital-visual");
const cursorGlow = document.querySelector(".cursor-glow");
const progressBar = document.getElementById("progressBar");
const navToggle = document.getElementById("navToggle");
const body = document.body;
const nav = document.getElementById("siteNav");
const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];
const sections = document.querySelectorAll("[data-section]");
const introLoader = document.getElementById("introLoader");

window.addEventListener("load", () => {
  setTimeout(() => {
    body.classList.add("loaded");
    if (introLoader) {
      introLoader.setAttribute("aria-hidden", "true");
    }
  }, 900);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
  }
);

reveals.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 240)}ms`;
  revealObserver.observe(item);
});

const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.45,
  }
);

counters.forEach((item) => counterObserver.observe(item));

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (window.innerWidth < 900) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    setActiveNav(visible.target.id);
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => {
  if (section.id) {
    sectionObserver.observe(section);
  }
});

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    body.classList.toggle("nav-open", !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
    });
  });
}

document.addEventListener("mousemove", (event) => {
  body.classList.add("pointer-ready");

  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  ambientBlobs.forEach((blob, index) => {
    const factor = (index + 1) * 10;
    blob.style.transform = `translate(${x * factor}px, ${y * factor * -1}px)`;
  });

  if (heroVisual && window.innerWidth >= 900) {
    heroVisual.style.transform = `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 10}deg)`;
  }

  if (cursorGlow) {
    cursorGlow.style.setProperty("--cursor-x", `${event.clientX}px`);
    cursorGlow.style.setProperty("--cursor-y", `${event.clientY}px`);
  }
});

document.addEventListener("mouseleave", () => {
  if (heroVisual) {
    heroVisual.style.transform = "";
  }

  ambientBlobs.forEach((blob) => {
    blob.style.transform = "";
  });

  body.classList.remove("pointer-ready");
});
