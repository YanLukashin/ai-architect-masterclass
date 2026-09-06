(() => {
  const GOOGLE_FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSev1ox1t_KXnsRxpOIrK9QdGg1a_bdmedF_h-hGGgwof39abw/formResponse";
  const googleEntries = {
    name: "entry.896684943",
    email: "entry.172638223",
    telegram: "entry.520978181",
    role: "entry.620721003",
    company: "entry.1432134673",
    process: "entry.178847577",
    loss: "entry.1178609925",
    authority: "entry.240061595",
    aiUsage: "entry.1284261910",
    liveCasePrimary: "entry.369213165",
    liveCaseDuplicate: "entry.334142621",
    diagnosis: "entry.1006025006",
    source: "entry.515268763",
    consent: "entry.626524812",
  };
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
  const submitButton = form?.querySelector("[type='submit']");
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
  const yesNo = (value) => (value ? "Да" : "Нет");

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
    const source = [clean(data.get("source_text")), campaignLine(data)].filter(Boolean).join("; ");
    const response = {
      [googleEntries.name]: clean(data.get("name")),
      [googleEntries.email]: clean(data.get("email")),
      [googleEntries.telegram]: clean(data.get("telegram")),
      [googleEntries.role]: clean(data.get("role")),
      [googleEntries.company]: clean(data.get("company")),
      [googleEntries.process]: clean(data.get("process")),
      [googleEntries.loss]: clean(data.get("loss")),
      [googleEntries.authority]: clean(data.get("authority")),
      [googleEntries.aiUsage]: clean(data.get("ai_usage")),
      [googleEntries.liveCasePrimary]: yesNo(data.get("live_case")),
      [googleEntries.liveCaseDuplicate]: yesNo(data.get("live_case")),
      [googleEntries.diagnosis]: yesNo(data.get("diagnosis")),
      [googleEntries.source]: source,
      [googleEntries.consent]: "Согласен",
      fvv: "1",
      pageHistory: "0",
    };

    let completed = false;
    let submissionTimeout;
    const controller = new AbortController();
    const completeSubmission = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(submissionTimeout);
      form.reset();
      campaignKeys.forEach((key) => {
        const input = form.elements.namedItem(key);
        if (input instanceof HTMLInputElement) input.value = sessionStorage.getItem(key) || "";
      });
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
      status.className = "form-status is-success";
      status.textContent =
        "Готово! Вы зарегистрированы. Ссылку на Zoom и напоминание пришлём на email или в Telegram.";
    };
    const failSubmission = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(submissionTimeout);
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
      status.className = "form-status is-error";
      status.innerHTML =
        'Не удалось подтвердить отправку. Попробуйте ещё раз или <a href="https://docs.google.com/forms/d/e/1FAIpQLSev1ox1t_KXnsRxpOIrK9QdGg1a_bdmedF_h-hGGgwof39abw/viewform" target="_blank" rel="noopener noreferrer">откройте Google Form</a>.';
    };

    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
    status.className = "form-status";
    status.textContent = "Отправляем регистрацию…";
    submissionTimeout = window.setTimeout(() => controller.abort(), 12000);

    fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(response),
      signal: controller.signal,
    })
      .then(completeSubmission)
      .catch(failSubmission);
  });
})();
