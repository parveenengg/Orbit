/* A readable document first; the pinned tour is an optional desktop enhancement. */
(() => {
  const tabs = [...document.querySelectorAll('[data-platform]')];
  let updateTour = () => {};
  function choose(tab) {
    updateTour(false);
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('is-current', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    updateTour(tab.dataset.platform === 'mobile');
    window.ScrollTrigger?.refresh();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => choose(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); choose(tabs[next]); tabs[next].focus(); }
    });
  });
  const tour = document.querySelector('.mobile-tour');
  if (!tour || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const steps = [...tour.querySelectorAll('.tour-step')];
  const links = [...tour.querySelectorAll('.tour-progress-link')];
  const media = gsap.matchMedia();
  function enableTour() {
  media.add('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    tour.classList.add('is-enhanced');
    const stage = tour.querySelector('.tour-stage');
    let active = -1;
    const select = (index) => {
      if (index === active) return;
      active = index;
      steps.forEach((step, i) => {
        step.setAttribute('aria-hidden', String(i !== index));
        if (i === index) links[i].setAttribute('aria-current', 'step');
        else links[i].removeAttribute('aria-current');
      });
    };
    gsap.set(steps, { autoAlpha: 0 });
    gsap.set(steps[0], { autoAlpha: 1 });
    select(0);
    const timeline = gsap.timeline({scrollTrigger: {
      trigger: stage, start: 'top top', end: () => '+=' + window.innerHeight * 3.2,
      pin: true, scrub: .55, invalidateOnRefresh: true,
      onUpdate: self => select(Math.min(3, Math.floor(self.progress * 4)))
    }});
    steps.slice(1).forEach((step, index) => {
      const at = index + .75;
      timeline.to(steps[index], {autoAlpha: 0, duration: .25}, at)
        .fromTo(step, {autoAlpha: 0}, {autoAlpha: 1, duration: .25}, at)
        .fromTo(step.querySelector('.tour-copy'), {y: 22}, {y: 0, duration: .35, ease: 'power2.out'}, at);
    });
    timeline.to({}, {duration: .9});
    const handlers = links.map((link, index) => {
      const handler = event => {
        event.preventDefault();
        const trigger = timeline.scrollTrigger;
        window.scrollTo({top: trigger.start + (trigger.end - trigger.start) * (index + .12) / 4, behavior: 'smooth'});
      };
      link.addEventListener('click', handler);
      return handler;
    });
    return () => {
      links.forEach((link, i) => { link.removeEventListener('click', handlers[i]); link.removeAttribute('aria-current'); });
      steps.forEach(step => step.removeAttribute('aria-hidden'));
      tour.classList.remove('is-enhanced');
    };
  });
  }
  enableTour();
  updateTour = enabled => { media.revert(); if (enabled) enableTour(); };
  const reveals = gsap.matchMedia();
  reveals.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.features-hero-eyebrow, .features-hero-title, .features-hero-sub', {
      y: 20, autoAlpha: 0, duration: .85, stagger: .12, ease: 'power3.out'
    });
    gsap.utils.toArray('.tour-principle-grid article, .tour-future > div, .tour-download .container').forEach(element => {
      gsap.from(element, {y: 24, autoAlpha: 0, duration: .8, ease: 'power2.out', scrollTrigger: {trigger: element, start: 'top 90%', once: true}});
    });
  });
})();
