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
