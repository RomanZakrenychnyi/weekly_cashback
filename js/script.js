// -------------------------------------------------------------------
// --- ЛОГИКА 3: AККОРДИОН (ГЛОБАЛЬНА ФУНКЦІЯ) ---
// Ця функція має бути глобально доступною для обробників подій (наприклад, onclick)
// -------------------------------------------------------------------
function toggleAccordion(button) {
  const content = button.nextElementSibling;
  const img = button.querySelector(".accordion__svg");
  const isOpened = content.classList.contains("accordion__panel--opened");

  if (isOpened) {
    // --- ЗАКРИТТЯ ---
    button.classList.remove("is-active");

    content.style.maxHeight = content.scrollHeight + "px";
    setTimeout(() => {
      content.style.maxHeight = "0px";
      content.style.opacity = "0";
    }, 10);

    const onClose = function (e) {
      if (e.propertyName === "max-height") {
        content.classList.remove("accordion__panel--opened");
        content.style.maxHeight = null;
        content.removeEventListener("transitionend", onClose);
      }
    };
    content.addEventListener("transitionend", onClose);

    img.classList.add("is-hidden");

    setTimeout(() => {
      img.src = "./img/desktop/plus.webp";
      img.classList.remove("is-hidden");
    }, 100);
  } else {
    // --- ВІДКРИТТЯ ---
    button.classList.add("is-active");

    content.classList.add("accordion__panel--opened");
    content.style.maxHeight = content.scrollHeight + "px";
    content.style.opacity = "1";

    const onOpen = function (e) {
      if (e.propertyName === "max-height") {
        content.style.maxHeight = "none";
        content.removeEventListener("transitionend", onOpen);
      }
    };
    content.addEventListener("transitionend", onOpen);

    img.classList.add("is-hidden");

    setTimeout(() => {
      img.src = "./img/desktop/minus.webp";
      img.classList.remove("is-hidden");
    }, 100);
  }
}

// -------------------------------------------------------------------
// --- ЛОГИКА 1: АНИМАЦИЯ ПРОГРЕСС-БАРА (CASHBACK LEVELS) ---
// -------------------------------------------------------------------

(function () {

  const segments = document.querySelectorAll(".cashback-levels__segment");
  const singleFillDuration = 0.25;
  const waitTime = 0.2;

  let currentTimeout;
  let isRunning = false;

  const topItems = document.querySelectorAll(".cashback-levels__item-top");
  const bottomItems = document.querySelectorAll(
    ".cashback-levels__item-bottom"
  );
  const triggers = document.querySelectorAll(".cashback-levels__svg-trigger");

  function getVisibleSegmentCount() {
    let visibleCount = 0;
    segments.forEach((segment) => {
      if (window.getComputedStyle(segment).display !== "none") {
        visibleCount++;
      }
    });
    return visibleCount;
  }

  function activateLevelByIndex(index) {
    if (topItems[index]) topItems[index].classList.add("is-active");
    if (bottomItems[index]) bottomItems[index].classList.add("is-active");
    if (triggers[index]) triggers[index].classList.add("is-active");
  }

  function activateStepsByTime(actualDurationMs) {
    activateLevelByIndex(0);

    const delayStep2 = actualDurationMs * 0.35;
    setTimeout(() => activateLevelByIndex(1), delayStep2);

    const delayStep3 = actualDurationMs * 0.7;
    setTimeout(() => activateLevelByIndex(2), delayStep3);
  }

  function startFullCycle(totalSegments) {
    if (isRunning) return;
    isRunning = true;

    const totalFillDuration = totalSegments * singleFillDuration;
    const cycleDuration = totalFillDuration + waitTime;

    segments.forEach((segment) => {
      segment.classList.add("is-active");
    });

    activateStepsByTime(totalFillDuration * 1000);

    currentTimeout = setTimeout(() => {
      // Одноразове виконання
      isRunning = false;
    }, cycleDuration * 1000);
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        isRunning = false;
      }
      segments.forEach((segment) => segment.classList.remove("is-active"));
      startFullCycle(getVisibleSegmentCount());
    }, 150);
  });

  startFullCycle(getVisibleSegmentCount());

  // -------------------------------------------------------------------
  // --- ЛОГІКА 2: ПОСЛІДОВНИЙ STICKY ЕФЕКТ (З ТРАНСФОРМАМИ) ---
  // -------------------------------------------------------------------

  const stickyItems = document.querySelectorAll(".how-it-works__item");
  const stepsWrapper = document.querySelector(".steps-wrapper");
  const spacer = document.querySelector(".steps-wrapper--spacer");
  const howItWorksWrapper = document.querySelector(".how-it-works__wrapper");
  const accordionSection = document.querySelector(".accordion");
  // ✅ ФИКС: Добавляем контейнер для управления transform: translateZ(0)
  const howItWorksContainer = document.querySelector(
    ".how-it-works__container"
  );

  if (
    stickyItems.length === 0 ||
    !stepsWrapper ||
    !howItWorksWrapper ||
    !accordionSection ||
    !spacer ||
    !howItWorksContainer // ✅ ФИКС: Проверяем наличие контейнера
  )
    return;

  // Параметри
  const STICKY_TOP = window.innerHeight * 0.1;
  const STICKY_CARD_OFFSET = 150;
  const CARD_HEIGHT = 450;
  const GAP = 30;
  const SCROLL_PER_ITEM = 400;
  const BLOCK_SCROLL_THRESHOLD = 150;

  const CARD_SHIFT = CARD_HEIGHT - GAP - STICKY_CARD_OFFSET;

  const CUSTOM_LIMITS = [
    0,
    -CARD_SHIFT, // -270px (Фіксація Картки 2)
    -(CARD_SHIFT * 2), // -540px (Фіксація Картки 3)
  ];

  const totalOverlapSpace = BLOCK_SCROLL_THRESHOLD + SCROLL_PER_ITEM;

  // ✅ ФИКС: Зона начала плавного наезда аккордеона
  const ACCORDION_START_SCROLL = BLOCK_SCROLL_THRESHOLD; // 150px
  const ACCORDION_SCROLL_DISTANCE = totalOverlapSpace - ACCORDION_START_SCROLL; // 250px

  const getInitialTop = () =>
    stepsWrapper.getBoundingClientRect().top + window.scrollY;
  let initialTop = getInitialTop();

  // 1. НАЛАШТУВАННЯ ВИСОТИ КОНТЕЙНЕРА
  stepsWrapper.style.paddingBottom = `${totalOverlapSpace}px`;

  // 2. ФУНКЦІЯ ОНОВЛЕННЯ ТРАНСФОРМУВАННЯ
  function updateTransforms() {
    if (window.innerWidth <= 676) {
      // --- МОБІЛЬНИЙ БЛОК ---
      stepsWrapper.classList.remove("is-fixed", "is-ended");
      stepsWrapper.style.paddingBottom = "";
      stepsWrapper.style.top = "";
      stepsWrapper.style.right = "";

      if (spacer) spacer.style.display = "none";

      stickyItems.forEach((item) => (item.style.transform = "translateY(0)"));

      if (howItWorksWrapper) {
        howItWorksWrapper.style.position = "static";
        howItWorksWrapper.style.top = "";
        howItWorksWrapper.style.zIndex = "";
      }

      if (accordionSection) {
        accordionSection.style.zIndex = "";
        accordionSection.style.marginTop = "";
      }

      // ✅ ФИКС: Сброс класса reset-transform
      if (howItWorksContainer) {
        howItWorksContainer.classList.remove("reset-transform");
      }
      return;
    }

    const currentScrollY = window.scrollY;
    const isSticking = currentScrollY >= initialTop - STICKY_TOP;
    const isEnded =
      currentScrollY >= initialTop - STICKY_TOP + totalOverlapSpace;

    if (isSticking && !isEnded) {
      // --- 1. АКТИВОВАНО (STICKY) ---

      stepsWrapper.classList.add("is-fixed");
      stepsWrapper.classList.remove("is-ended");

      if (spacer) spacer.style.display = "block";

      stepsWrapper.style.top = "";
      stepsWrapper.style.right = "";

      if (howItWorksWrapper) {
        howItWorksWrapper.style.zIndex = "10";
      }

      // ✅ ФИКС: Transform активен, Sticky для левого блока может быть нарушен,
      if (howItWorksContainer) {
        howItWorksContainer.classList.remove("reset-transform");
      }

      // --- ЛОГІКА ТРАНСФОРМАЦІЇ КАРТОК ---
      const scrollInsideZone = currentScrollY - (initialTop - STICKY_TOP);

      stickyItems.forEach((item, index) => {
        const scrollProgress = scrollInsideZone;
        let transformValue;
        // ... (Ваша логика трансформации карточек) ...

        if (index === 0) {
          transformValue = 0;
        } else if (scrollProgress <= BLOCK_SCROLL_THRESHOLD) {
          const speedMultiplier = 2;

          transformValue = -(scrollProgress * speedMultiplier);

          if (index === 1) {
            transformValue = Math.max(CUSTOM_LIMITS[1], transformValue);
          } else if (index === 2) {
            transformValue = Math.max(CUSTOM_LIMITS[1], transformValue);
          }
        } else {
          if (index === 1) {
            transformValue = CUSTOM_LIMITS[1];
          } else if (index === 2) {
            const remainingScroll = scrollProgress - BLOCK_SCROLL_THRESHOLD;

            transformValue = CUSTOM_LIMITS[1];

            const speedMultiplier = 400 / SCROLL_PER_ITEM;

            transformValue += -(remainingScroll * speedMultiplier);

            transformValue = Math.max(CUSTOM_LIMITS[2], transformValue);
          }
        }

        item.style.transform = `translateY(${transformValue}px)`;
      });

      // ✅ ФИКС: ПЛАВНЫЙ НАЕЗД АККОРДЕОНА, СИНХРОНИЗИРОВАННЫЙ СО СКРОЛЛОМ
      if (accordionSection) {
        let progress = 0;
        if (scrollInsideZone > ACCORDION_START_SCROLL) {
          progress =
            (scrollInsideZone - ACCORDION_START_SCROLL) /
            ACCORDION_SCROLL_DISTANCE;
          progress = Math.min(1, progress); // Ограничиваем до 100%
        }

        const finalMarginTop = -(CARD_HEIGHT * progress);

        accordionSection.style.marginTop = `${finalMarginTop}px`;
        accordionSection.style.zIndex = "10";
      }
    } else if (isEnded) {
      // --- 2. ЗАВЕРШЕНО (НАКЛАДАННЯ) ---

      const stepsWrapperCurrentTop =
        stepsWrapper.getBoundingClientRect().top + window.scrollY;

      const containerTop =
        howItWorksContainer.getBoundingClientRect().top + window.scrollY;

      const absoluteTopValue = stepsWrapperCurrentTop - containerTop;

      stepsWrapper.style.top = `${absoluteTopValue}px`; // ⬅️ Сохраняем текущее положение
      stepsWrapper.style.right = "0"; // ⬅️ Сохраняем горизонтальную позицию
      stepsWrapper.style.bottom = ""; // ⬅️ Сбрасываем bottom для работы с top

      stepsWrapper.classList.remove("is-fixed");
      stepsWrapper.classList.add("is-ended"); // Здесь position: absolute;

      if (spacer) spacer.style.display = "block";

      stickyItems.forEach((item, index) => {
        let finalTransform = CUSTOM_LIMITS[index];
        if (index === 0) finalTransform = 0;
        item.style.transform = `translateY(${CUSTOM_LIMITS[index]}px)`;
      });

      // ✅ ФИКС: Отключаем transform на родителе, чтобы left-блок sticky сработал
      if (howItWorksContainer) {
        howItWorksContainer.classList.add("reset-transform");
      }

      if (accordionSection) {
        // ✅ ФИКС: Фиксируем финальное значение наезда
        accordionSection.style.zIndex = "10";
        accordionSection.style.marginTop = `-${CARD_HEIGHT}px`;
      }
    } else {
      // --- 3. ПОЧАТКОВИЙ СТАН ---

      stepsWrapper.classList.remove("is-fixed");
      stepsWrapper.classList.remove("is-ended");

      if (spacer) spacer.style.display = "none";

      stepsWrapper.style.top = "";
      stepsWrapper.style.right = "";

      // ✅ ФИКС: Сброс класса reset-transform
      if (howItWorksContainer) {
        howItWorksContainer.classList.remove("reset-transform");
      }

      if (accordionSection) {
        accordionSection.style.zIndex = "";
        accordionSection.style.marginTop = "";
      }

      stickyItems.forEach((item) => {
        item.style.transform = "translateY(0)";
      });
    }
  }

  // 3. ДОДАВАННЯ ПРОСЛУХОВУВАЧА СКРОЛУ
  window.addEventListener("scroll", updateTransforms);
  window.addEventListener("resize", () => {
    initialTop = getInitialTop();
    updateTransforms();
  });

  window.addEventListener("load", () => {
    initialTop = getInitialTop();
    updateTransforms();
  });
})(); 

// -------------------------------------------------------------------
// --- ЛОГИКА 4: Intersection Observer - В ОКРЕМІЙ IIFE ---
// -------------------------------------------------------------------

(function () {
  // --- КОНФІГУРАЦІЯ ---
  const TARGET_SELECTOR = ".how-it-works__container";
  const MARKER_SELECTOR = ".sentinel-end-marker";
  const HIDDEN_CLASS = "is-hidden";

  // ❗ КЛЮЧОВИЙ ФІКС: КОМПЕНСАЦІЯ (максимальний негативний margin-top аккордеона)
  // Встановіть це значення на CARD_HEIGHT (450px) з вашої sticky-логіки.
  const COMPENSATION_PIXELS = 0;

  // --- ЕЛЕМЕНТИ ---
  const targetElement = document.querySelector(TARGET_SELECTOR);
  const endMarker = document.querySelector(MARKER_SELECTOR);

  if (!targetElement || !endMarker) return;

  // --- НАЛАШТУВАННЯ OBSERVER ---
  const observerOptions = {
    root: null,
    // Observer спрацює, коли маркер досягне точки, на 0px.
    rootMargin: `-${COMPENSATION_PIXELS}px 0px 0px 0px`,
    threshold: 0,
  };

  const markerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // isIntersecting = True, коли маркер знаходиться вище порогу rootMargin
      const isPastTopCompensated = entry.isIntersecting;

      if (isPastTopCompensated) {
        // Маркер досяг компенсованого top: 0 (тобто візуального завершення липкої зони)
        targetElement.classList.add(HIDDEN_CLASS);
      } else {
        // Маркер нижче компенсованого top: 0
        targetElement.classList.remove(HIDDEN_CLASS);

      }
    });
  }, observerOptions);

  // --- ЗАПУСК СПОСТЕРЕЖЕННЯ ---
  markerObserver.observe(endMarker);
})();

