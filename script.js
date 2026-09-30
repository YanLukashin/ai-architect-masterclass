(() => {
  const campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ];
  const sourceParams = new URLSearchParams(window.location.search);
  const clickKeys = new Set(["yclid", "gclid"]);

  document.querySelectorAll("a[data-campaign-link]").forEach((link) => {
    const destination = new URL(link.href);
    for (const key of campaignKeys) {
      const value = sourceParams.has(key)
        ? sourceParams.get(key)
        : clickKeys.has(key) ? null : sourceParams.get(`amp;${key}`);
      // Accept only known short tokens. A long number may be a phone in UTM data,
      // while numeric click IDs are normal for yclid/gclid.
      if (value && /^[a-zA-Z0-9._~-]{1,120}$/.test(value) && (clickKeys.has(key) || !/\d{7,}/.test(value))) {
        destination.searchParams.set(key, value);
      }
    }
    link.href = destination.href;
  });

  const topbar = document.querySelector("[data-topbar]");
  const syncTopbar = () => topbar?.classList.toggle("scrolled", window.scrollY > 20);
  syncTopbar();
  window.addEventListener("scroll", syncTopbar, { passive: true });

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px" },
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-youtube-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const videoId = button.getAttribute("data-youtube-id");
      const title = button.getAttribute("data-video-title") || "Видео";
      if (!videoId) return;

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
    });
  });
})();
