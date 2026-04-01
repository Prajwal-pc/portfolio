const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".tilt-card");
const ambientBlobs = document.querySelectorAll(".ambient");
const heroVisual = document.querySelector(".orbital-visual");

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

document.addEventListener("mousemove", (event) => {
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  ambientBlobs.forEach((blob, index) => {
    const factor = (index + 1) * 10;
    blob.style.transform = `translate(${x * factor}px, ${y * factor * -1}px)`;
  });

  if (heroVisual && window.innerWidth >= 900) {
    heroVisual.style.transform = `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 10}deg)`;
  }
});

document.addEventListener("mouseleave", () => {
  if (heroVisual) {
    heroVisual.style.transform = "";
  }

  ambientBlobs.forEach((blob) => {
    blob.style.transform = "";
  });
});
