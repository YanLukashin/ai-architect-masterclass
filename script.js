(() => {
  const TELEGRAM_USERNAME = "yan_lukashin";
  const campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "yclid",
    "gclid",
  ];

  const topbar = document.querySelector("[data-topbar]");
  const form = document.querySelector("#application-form");
  const status = document.querySelector("#form-status");
  const mobileCta = document.querySelector(".mobile-cta");
  const registerSection = document.querySelector("#register");

  const syncTopbar = () => {
    topbar?.classList.toggle("scrolled", window.scrollY > 20);
  };

  syncTopbar();
  window.addEventListener("scroll", syncTopbar, { passive: true });

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

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

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

  if (mobileCta && registerSection) {
    const syncMobileCta = () => {
      const bounds = registerSection.getBoundingClientRect();
      const registrationIsVisible = bounds.top < window.innerHeight - 20 && bounds.bottom > 0;
      mobileCta.classList.toggle("is-hidden", registrationIsVisible);
    };

    syncMobileCta();
    window.addEventListener("scroll", syncMobileCta, { passive: true });
    window.addEventListener("resize", syncMobileCta);
  }

  const query = new URLSearchParams(window.location.search);
  campaignKeys.forEach((key) => {
    const queryValue = query.get(key);
    if (queryValue) sessionStorage.setItem(key, queryValue);

    const input = form?.elements.namedItem(key);
    if (input instanceof HTMLInputElement) {
      input.value = queryValue || sessionStorage.getItem(key) || "";
    }
  });

  const clean = (value) => String(value || "").trim();
  const yesNo = (value) => (value ? "да" : "нет");

  const campaignLine = (data) => {
    const values = campaignKeys
      .map((key) => [key, clean(data.get(key))])
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`);
    return values.length ? values.join("; ") : "direct";
  };

  form?.addEventListener("input", (event) => {
    if (event.target instanceof HTMLElement) event.target.removeAttribute("aria-invalid");
    status.className = "form-status";
    status.textContent = "";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalid = [...form.elements].filter(
      (element) => element instanceof HTMLElement && "checkValidity" in element && !element.checkValidity(),
    );

    if (invalid.length) {
      invalid.forEach((element) => element.setAttribute("aria-invalid", "true"));
      invalid[0].focus();
      status.className = "form-status is-error";
      status.textContent = "Заполните поля, отмеченные звёздочкой.";
      return;
    }

    const data = new FormData(form);
    const message = [
      "Регистрация на мастер-класс AI Architect · 24.09.2026",
      "",
      `Имя: ${clean(data.get("name"))}`,
      `Telegram: ${clean(data.get("telegram"))}`,
      `Роль: ${clean(data.get("role"))}`,
      `Компания/сфера: ${clean(data.get("company")) || "—"}`,
      "",
      `Что хочу упростить: ${clean(data.get("process"))}`,
      `Главная проблема: ${clean(data.get("loss"))}`,
      `Могу повлиять на изменения: ${clean(data.get("authority"))}`,
      `Как сейчас использую ИИ: ${clean(data.get("ai_usage")) || "—"}`,
      `Можно предложить для разбора: ${yesNo(data.get("live_case"))}`,
      `Хочу лично обсудить задачу после встречи: ${yesNo(data.get("diagnosis"))}`,
      "",
      `Источник: ${campaignLine(data)}`,
    ].join("\n");

    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
    const popup = window.open(telegramUrl, "_blank", "noopener,noreferrer");

    status.className = "form-status is-success";
    status.innerHTML = popup
      ? "Telegram открыт. Проверьте текст и нажмите «Отправить»."
      : `Браузер заблокировал новое окно. <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer">Открыть Telegram вручную</a>.`;
  });
})();
