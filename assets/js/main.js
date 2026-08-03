document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Year in footer
  var yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  // ---------------------------------------------------------------
  // Navbar shadow on scroll
  // ---------------------------------------------------------------
  var nav = document.querySelector(".navbar");
  var toggleNavShadow = function () {
    if (!nav) return;
    if (window.scrollY > 18) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };
  toggleNavShadow();
  window.addEventListener("scroll", toggleNavShadow, { passive: true });

  // ---------------------------------------------------------------
  // Reveal-on-scroll with stagger for grid children
  // ---------------------------------------------------------------
  var revealTargets = document.querySelectorAll(
    ".section, .service-card, .client-box, .hero .col-lg-7, .hero .col-lg-5"
  );

  // Apply staggered transition-delay to siblings inside the same row
  document.querySelectorAll("#services .row").forEach(function (row) {
    var children = row.querySelectorAll(".service-card");
    children.forEach(function (el, i) {
      el.style.transitionDelay = i * 90 + "ms";
    });
  });

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------------
  // Active nav link based on section in viewport
  // ---------------------------------------------------------------
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".navbar .nav-link[href^='#']")
  );
  var sectionMap = navLinks
    .map(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.length < 2) return null;
      var section = document.querySelector(href);
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  if (sectionMap.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sectionMap.find(function (item) {
            return item.section === entry.target;
          });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("active");
            });
            match.link.classList.add("active");
          }
        });
      },
      { threshold: 0.35, rootMargin: "-80px 0px -45% 0px" }
    );

    sectionMap.forEach(function (item) {
      navObserver.observe(item.section);
    });
  }

  // ---------------------------------------------------------------
  // Scroll-to-top button
  // ---------------------------------------------------------------
  var scrollTopBtn = document.getElementById("scrollTop");
  if (scrollTopBtn) {
    var toggleScrollBtn = function () {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add("is-visible");
      } else {
        scrollTopBtn.classList.remove("is-visible");
      }
    };
    toggleScrollBtn();
    window.addEventListener("scroll", toggleScrollBtn, { passive: true });
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  // ---------------------------------------------------------------
  // Hero CTAs: preset inquiry + scroll to contact form
  // ---------------------------------------------------------------
  function scrollToContactFormAnchor(smooth) {
    var el = document.getElementById("contact-form");
    if (!el) return;
    el.scrollIntoView({
      behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
      block: "start",
    });
    try {
      el.focus({ preventScroll: true });
    } catch (err) {
      /* ignore */
    }
  }

  function applyInquiryPreset(value) {
    var sel = document.getElementById("contact-inquiry");
    if (!sel || !value) return;
    if (sel.querySelector('option[value="' + value + '"]')) {
      sel.value = value;
    }
  }

  document.querySelectorAll('a[data-inquiry][href="#contact-form"]').forEach(
    function (link) {
      link.addEventListener("click", function (e) {
        var v = link.getAttribute("data-inquiry");
        applyInquiryPreset(v);
        e.preventDefault();
        scrollToContactFormAnchor(true);
        if (window.location.hash !== "#contact-form") {
          history.replaceState(null, "", "#contact-form");
        }
      });
    }
  );

  if (window.location.hash === "#contact-form") {
    window.requestAnimationFrame(function () {
      scrollToContactFormAnchor(false);
    });
  }

  // ---------------------------------------------------------------
  // Contact form: validation + EmailJS
  // ---------------------------------------------------------------
  var EMAILJS_PUBLIC_KEY = "PQneWuQKX0ESAM3MS";
  var EMAILJS_SERVICE_ID = "service_a4t80bs";
  var EMAILJS_TEMPLATE_ID = "template_qhbowde";

  var contactForm = document.getElementById("oryx-contact-form");
  if (contactForm) {
    if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    var lang = (
      document.documentElement.getAttribute("lang") || "en"
    ).toLowerCase();
    var isAr = lang.indexOf("ar") === 0;
    var notProvided = isAr ? "غير مذكور" : "Not provided";
    var msgEmailOrPhone = isAr
      ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف (أحدهما على الأقل)."
      : "Please enter at least one of email or phone.";
    var msgEmailInvalid = isAr
      ? "صيغة البريد الإلكتروني غير صحيحة."
      : "Please enter a valid email address.";
    var msgSuccess = isAr
      ? "تم الإرسال بنجاح. سنتواصل معك قريبًا."
      : "Message sent successfully. We will get back to you soon.";
    var msgSendFailed = isAr
      ? "تعذر إرسال الرسالة. حاول لاحقًا."
      : "Failed to send message. Please try again later.";
    var msgNotConfigured = isAr
      ? "إعدادات البريد غير مكتملة. تواصل مع مسؤول الموقع."
      : "Email service is not configured yet. Please contact the site administrator.";

    var nameInput = document.getElementById("contact-name");
    var emailInput = document.getElementById("contact-email");
    var phoneInput = document.getElementById("contact-phone");
    var inquirySel = document.getElementById("contact-inquiry");
    var feedbackEl = document.getElementById("contact-email-phone-feedback");
    var successEl = document.getElementById("contact-form-success");
    var errorEl = document.getElementById("contact-form-error");
    var submitBtn = document.getElementById("contact-submit");
    var submitSpinner =
      submitBtn && submitBtn.querySelector(".contact-submit-spinner");
    var honeypot = contactForm.querySelector('[name="botcheck"]');

    var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function hideAlerts() {
      if (successEl) {
        successEl.hidden = true;
        successEl.textContent = "";
      }
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }
    }

    function showSuccess(text) {
      hideAlerts();
      if (successEl) {
        successEl.textContent = text;
        successEl.hidden = false;
      }
    }

    function showError(text) {
      hideAlerts();
      if (errorEl) {
        errorEl.textContent = text;
        errorEl.hidden = false;
      }
    }

    function clearFieldErrors() {
      contactForm.querySelectorAll(".is-invalid").forEach(function (n) {
        n.classList.remove("is-invalid");
      });
      if (feedbackEl) {
        feedbackEl.hidden = true;
        feedbackEl.textContent = "";
        feedbackEl.classList.remove("d-block");
      }
    }

    function setSubmitting(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      if (submitSpinner) submitSpinner.hidden = !loading;
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlerts();
      clearFieldErrors();

      if (honeypot && honeypot.value && honeypot.value.trim() !== "") {
        return;
      }

      var nameVal = nameInput ? nameInput.value.trim() : "";
      var emailVal = emailInput ? emailInput.value.trim() : "";
      var phoneVal = phoneInput ? phoneInput.value.trim() : "";
      var inquiryVal = inquirySel ? inquirySel.value : "";
      var hasEmail = emailVal.length > 0;
      var hasPhone = phoneVal.length > 0;
      var ok = true;

      if (!nameVal) {
        ok = false;
        if (nameInput) nameInput.classList.add("is-invalid");
      }

      if (!inquiryVal) {
        ok = false;
        if (inquirySel) inquirySel.classList.add("is-invalid");
      }

      if (!hasEmail && !hasPhone) {
        ok = false;
        if (feedbackEl) {
          feedbackEl.textContent = msgEmailOrPhone;
          feedbackEl.hidden = false;
          feedbackEl.classList.add("d-block");
        }
      }

      if (hasEmail && !emailRx.test(emailVal)) {
        ok = false;
        if (emailInput) emailInput.classList.add("is-invalid");
        if (feedbackEl) {
          feedbackEl.textContent = msgEmailInvalid;
          feedbackEl.hidden = false;
          feedbackEl.classList.add("d-block");
        }
      }

      if (!ok) {
        var missing = [];
        if (!nameVal) {
          missing.push(isAr ? "الاسم" : "name");
        }
        if (!inquiryVal) {
          missing.push(isAr ? "الموضوع" : "topic");
        }
        if (!hasEmail && !hasPhone) {
          missing.push(isAr ? "البريد أو الهاتف" : "email or phone");
        }
        if (hasEmail && !emailRx.test(emailVal)) {
          missing.push(isAr ? "بريد إلكتروني صالح" : "valid email");
        }
        if (missing.length) {
          showError(
            isAr
              ? "يرجى إكمال: " + missing.join("، ")
              : "Please complete: " + missing.join(", ")
          );
        }
        return;
      }

      if (
        typeof emailjs === "undefined" ||
        EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
        EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
        EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
      ) {
        showError(msgNotConfigured);
        return;
      }

      setSubmitting(true);

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name: nameVal,
          email: emailVal || notProvided,
          phone: phoneVal || notProvided,
          inquiry: inquiryVal,
        })
        .then(function () {
          contactForm.reset();
          showSuccess(msgSuccess);
        })
        .catch(function (err) {
          console.error(err);
          showError(msgSendFailed);
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }

  // ---------------------------------------------------------------
  // Clients carousel
  // ---------------------------------------------------------------
  var carousels = document.querySelectorAll("[data-clients-carousel]");
  carousels.forEach(function (carousel) {
    var track =
      carousel.querySelector("[data-clients-track]") ||
      carousel.querySelector(".clients-track");
    if (!track) return;

    var originals = Array.from(track.querySelectorAll(".client-card"));
    var total = originals.length;
    if (total < 3) return;

    var prevBtn = carousel.querySelector("[data-clients-prev]");
    var nextBtn = carousel.querySelector("[data-clients-next]");
    var dotsContainer =
      (carousel.parentElement &&
        carousel.parentElement.querySelector("[data-clients-dots]")) ||
      document.querySelector("[data-clients-dots]");
    var dots = [];
    var timer = null;

    var fragBefore = document.createDocumentFragment();
    var fragAfter = document.createDocumentFragment();
    originals.forEach(function (card) {
      var before = card.cloneNode(true);
      before.setAttribute("aria-hidden", "true");
      before.classList.add("is-clone");
      fragBefore.appendChild(before);

      var after = card.cloneNode(true);
      after.setAttribute("aria-hidden", "true");
      after.classList.add("is-clone");
      fragAfter.appendChild(after);
    });
    track.insertBefore(fragBefore, track.firstChild);
    track.appendChild(fragAfter);

    var allCards = Array.from(track.querySelectorAll(".client-card"));
    var index = total - 1;

    allCards.forEach(function (card) {
      var img = card.querySelector(".client-logo-image");
      if (!img) return;
      var swap = function () {
        var fallback = document.createElement("span");
        fallback.className = "client-logo-fallback";
        fallback.textContent =
          (img.alt || "").replace(/\s*logo\s*/i, "").trim() ||
          (img.alt || "").replace(/\s*شعار\s*/i, "").trim() ||
          "•";
        if (img.parentNode) img.parentNode.replaceChild(fallback, img);
      };
      img.addEventListener("error", swap, { once: true });
      if (img.complete && img.naturalWidth === 0) swap();
    });

    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      originals.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "clients-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Go to client " + (i + 1));
        dot.addEventListener("click", function () {
          index = total + i - 1;
          applyTransform(true);
          updateCenter();
          startAuto();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    function getStepWidth() {
      if (allCards.length < 2) return 0;
      var r1 = allCards[0].getBoundingClientRect();
      var r2 = allCards[1].getBoundingClientRect();
      return Math.abs(r2.left - r1.left);
    }

    function applyTransform(useTransition) {
      var sw = getStepWidth();
      if (!useTransition) track.classList.add("is-no-transition");
      track.style.transform = "translateX(" + -index * sw + "px)";
      if (!useTransition) {
        void track.offsetHeight;
        track.classList.remove("is-no-transition");
      }
    }

    function updateCenter() {
      var centerIdx = index + 1;
      allCards.forEach(function (c, i) {
        c.classList.toggle("is-center", i === centerIdx);
      });
      var originalIdx =
        (((centerIdx - total) % total) + total) % total;
      dots.forEach(function (dot, i) {
        var active = i === originalIdx;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function step(delta) {
      if (delta < 0 && index <= 0) {
        index += total;
        applyTransform(false);
      } else if (delta > 0 && index >= 2 * total - 1) {
        index -= total;
        applyTransform(false);
      }
      index += delta;
      applyTransform(true);
      updateCenter();
    }

    function startAuto() {
      stopAuto();
      if (prefersReducedMotion) return;
      timer = window.setInterval(function () {
        step(1);
      }, 3500);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        step(1);
        startAuto();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        step(-1);
        startAuto();
      });
    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        applyTransform(false);
      }, 120);
    });

    applyTransform(false);
    updateCenter();
    startAuto();
  });
});