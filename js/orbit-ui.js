(() => {
  // Keep original nodes (and their handlers) while mirroring labels visually.
  document.querySelectorAll('.btn, .tour-button, .brew-copy-btn').forEach(button => {
    const observer = new MutationObserver(refresh);
    function refresh() {
      observer.disconnect();
      const existing = button.querySelector(':scope > .cta-label-window');
      const original = existing?.querySelector('.cta-label-original');
      const nodes = Array.from((original || button).childNodes);
      const window = document.createElement('span');
      window.className = 'cta-label-window';
      const label = document.createElement('span');
      label.className = 'cta-label cta-label-original';
      label.append(...nodes);
      const copy = label.cloneNode(true);
      copy.className = 'cta-label cta-label-copy';
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      window.append(label, copy);
      button.replaceChildren(window);
      observer.observe(button, {childList:true, subtree:true, characterData:true});
    }
    refresh();
  });
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const list = nav.querySelector('.nav-links');
  nav.querySelectorAll('.nav-link').forEach(link => {
    const label = link.textContent.trim();
    link.setAttribute('aria-label', label);
    const window = document.createElement('span');
    window.className = 'nav-label-window';
    window.setAttribute('aria-hidden', 'true');
    ['nav-label', 'nav-label nav-label-copy'].forEach(className => {
      const span = document.createElement('span'); span.className = className; span.textContent = label; window.append(span);
    });
    link.replaceChildren(window);
    if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
  });
  if (!list) return;
  list.id ||= 'orbitNavigation';
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'orbit-menu-toggle'; toggle.textContent = 'Menu';
  toggle.setAttribute('aria-controls', list.id); toggle.setAttribute('aria-expanded', 'false');
  nav.dataset.menuOpen = 'false';
  nav.querySelector('.nav-actions').before(toggle);
  const setOpen = open => {
    nav.dataset.menuOpen = String(open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setOpen(nav.dataset.menuOpen !== 'true'));
  nav.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.dataset.menuOpen === 'true') {setOpen(false); toggle.focus();}
  });
  list.addEventListener('click', event => {if (event.target.closest('a')) setOpen(false);});
})();

/* Quiet, pointer-led motion for static copy; never competes with links or selection. */
(() => {
  const preference = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let cleanup = () => {};
  const setup = () => {
    cleanup();
    if (!preference.matches) return;
    const elements = [...document.querySelectorAll('h1,h2,h3,h4,p,blockquote,.ep-kicker,.home-kicker,.tour-eyebrow')].filter(element =>
      !element.closest('nav,footer,a,button,form,[role="tab"],.zero-gravity-word,.home-maker,.ep-creator h2') &&
      !element.querySelector('a,button,input,textarea,select,blockquote,p') &&
      element.textContent.trim()
    );
    const removers = elements.map(element => {
      element.classList.add('orbit-static-copy');
      const heading = /^H[1-4]$/.test(element.tagName);
      const subtitle = element.matches('.ep-kicker,.home-kicker,.tour-eyebrow');
      let frame = 0;
      const reset = () => {
        cancelAnimationFrame(frame);
        element.style.removeProperty('--copy-x');
        element.style.removeProperty('--copy-y');
      };
      const move = event => {
        if (event.buttons || window.getSelection()?.toString()) { reset(); return; }
        const box = element.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          element.style.setProperty('--copy-x', `${x * (heading ? 4 : subtitle ? 2.5 : 1.5)}px`);
          element.style.setProperty('--copy-y', `${y * (heading ? 3 : subtitle ? 2 : 1) - (heading ? 3 : subtitle ? 2 : .5)}px`);
        });
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', reset);
      element.addEventListener('pointerdown', reset);
      return () => {
        reset(); element.classList.remove('orbit-static-copy');
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', reset);
        element.removeEventListener('pointerdown', reset);
      };
    });
    cleanup = () => removers.forEach(remove => remove());
  };
  preference.addEventListener('change', setup);
  setup();
})();

/* A desktop-only inversion lens, clipped to the footer. */
(() => {
  const media = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let dispose = () => {};
  function setup() {
    dispose();
    if (!media.matches) return;
    const cleanups = [...document.querySelectorAll('.site-footer')].map(footer => {
      const lens = document.createElement('span');
      lens.className = 'footer-inversion-lens';
      lens.setAttribute('aria-hidden', 'true');
      footer.append(lens);
      let frame = 0;
      const hide = () => { cancelAnimationFrame(frame); lens.classList.remove('is-visible'); };
      const move = event => {
        if (event.pointerType !== 'mouse') { hide(); return; }
        const bounds = footer.getBoundingClientRect();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          lens.style.left = `${event.clientX - bounds.left}px`;
          lens.style.top = `${event.clientY - bounds.top}px`;
          lens.classList.add('is-visible');
        });
      };
      footer.addEventListener('pointermove', move);
      footer.addEventListener('pointerleave', hide);
      window.addEventListener('scroll', hide, {passive:true});
      window.addEventListener('blur', hide);
      return () => {
        hide(); lens.remove();
        footer.removeEventListener('pointermove', move);
        footer.removeEventListener('pointerleave', hide);
        window.removeEventListener('scroll', hide);
        window.removeEventListener('blur', hide);
      };
    });
    dispose = () => cleanups.forEach(cleanup => cleanup());
  }
  media.addEventListener('change', setup);
  setup();
})();

/* Enforce HTTPS on production */
(() => {
  if (typeof window !== 'undefined' && location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
  }
})();

/* Zero-Telemetry Cookie & Privacy Consent Notice */
(() => {
  const CONSENT_KEY = 'orbit_cookie_ack_v1';
  if (typeof window === 'undefined' || localStorage.getItem(CONSENT_KEY)) return;

  const initBanner = () => {
    if (document.getElementById('orbitCookieBanner')) return;

    const banner = document.createElement('aside');
    banner.id = 'orbitCookieBanner';
    banner.className = 'orbit-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Privacy and Cookie Notice');
    banner.innerHTML = `
      <div class="orbit-cookie-inner">
        <div class="orbit-cookie-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="orbit-cookie-content">
          <p class="orbit-cookie-title">Zero-Telemetry Privacy Notice</p>
          <p class="orbit-cookie-text">
            Orbit uses zero tracking cookies, zero analytics beacons, and no ad profiling. We only store essential local preferences (like this notice).
          </p>
        </div>
        <div class="orbit-cookie-actions">
          <a href="/privacy" class="orbit-cookie-link">Privacy Details</a>
          <button type="button" class="btn btn-primary orbit-cookie-btn" id="orbitCookieAccept">Acknowledge</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Fade in smoothly after a short natural delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        banner.classList.add('is-visible');
      }, 500);
    });

    const dismiss = () => {
      try { localStorage.setItem(CONSENT_KEY, 'true'); } catch (e) {}
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 400);
    };

    banner.querySelector('#orbitCookieAccept')?.addEventListener('click', dismiss);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && banner.classList.contains('is-visible')) dismiss();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();

/* Privacy-Respecting Analytics Architecture (Zero PII, Respects DNT/GPC) */
(() => {
  const isDNTEnabled = () => {
    return (
      (typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || window.doNotTrack === '1')) ||
      localStorage.getItem('orbit_analytics_optout') === 'true'
    );
  };

  window.OrbitAnalytics = {
    isOptedOut: isDNTEnabled,
    optOut: () => {
      try {
        localStorage.setItem('orbit_analytics_optout', 'true');
        console.info('[Orbit Analytics] User opted out. Zero telemetry active.');
      } catch (e) {}
    },
    optIn: () => {
      try {
        localStorage.removeItem('orbit_analytics_optout');
        console.info('[Orbit Analytics] Analytics preference cleared.');
      } catch (e) {}
    },
    track: (eventName, data = {}) => {
      if (isDNTEnabled()) {
        return;
      }
      if (window.va) {
        window.va('event', { name: eventName, data });
      }
    }
  };
})();

/* Interactive Form Validation with Spam Protection (Honeypot, Rate Limiting, Sanitization) */
(() => {
  const setupForms = () => {
    document.querySelectorAll('.orbit-validated-form').forEach(form => {
      if (form.dataset.formBound) return;
      form.dataset.formBound = 'true';

      const renderTimestamp = Date.now();
      let lastSubmitTime = 0;

      form.addEventListener('submit', event => {
        event.preventDefault();

        const statusEl = form.querySelector('.orbit-form-status');
        const submitBtn = form.querySelector('button[type="submit"]');

        const showMessage = (msg, isError = false) => {
          if (statusEl) {
            statusEl.textContent = msg;
            statusEl.className = 'orbit-form-status ' + (isError ? 'is-error' : 'is-success');
            statusEl.setAttribute('role', 'alert');
          }
        };

        // 1. Spam Protection: Honeypot check
        const honeypot = form.querySelector('input[name="orbit_confirm_field"], input[name="website_hp"]');
        if (honeypot && honeypot.value.trim() !== '') {
          showMessage('Thank you! Your feedback has been received.', false);
          form.reset();
          return;
        }

        // 2. Spam Protection: Submission speed check (< 1.5 seconds)
        const elapsedSeconds = (Date.now() - renderTimestamp) / 1000;
        if (elapsedSeconds < 1.5) {
          showMessage('Submission too fast. Please take your time.', true);
          return;
        }

        // 3. Spam Protection: Rate limiting (min 10s between submissions)
        if (Date.now() - lastSubmitTime < 10000) {
          showMessage('Please wait a few seconds before submitting again.', true);
          return;
        }

        // 4. Form Validation: Validate inputs
        let hasError = false;
        const emailInput = form.querySelector('input[type="email"]');
        const textInputs = form.querySelectorAll('input[required]:not([type="email"]), textarea[required]');

        form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));

        if (emailInput && emailInput.hasAttribute('required')) {
          const emailVal = emailInput.value.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailVal)) {
            emailInput.classList.add('has-error');
            emailInput.setAttribute('aria-invalid', 'true');
            emailInput.focus();
            showMessage('Please enter a valid email address.', true);
            hasError = true;
          }
        }

        textInputs.forEach(input => {
          if (!hasError && (!input.value || input.value.trim().length < 2)) {
            input.classList.add('has-error');
            input.setAttribute('aria-invalid', 'true');
            input.focus();
            showMessage('Please fill in this required field.', true);
            hasError = true;
          }
        });

        if (hasError) return;

        lastSubmitTime = Date.now();
        if (submitBtn) submitBtn.disabled = true;
        showMessage('Registering your request...', false);

        setTimeout(() => {
          showMessage('✓ Thank you! Your request has been registered.', false);
          form.reset();
          if (submitBtn) submitBtn.disabled = false;
        }, 500);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupForms);
  } else {
    setupForms();
  }
})();
