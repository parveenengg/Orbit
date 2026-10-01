(() => {
  if (!document.body.classList.contains('editorial-page') || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.ep-hero .ep-kicker, .ep-hero h1 span, .ep-hero .ep-lead, .ep-hero .ep-actions', {
      autoAlpha: 0, y: 25, duration: 1, stagger: .1, ease: 'power3.out'
    });
    gsap.from('.ep-orbital, .ep-source-visual', {autoAlpha: 0, y: 35, duration: 1.2, delay: .2, ease: 'power3.out'});
    document.querySelectorAll('[data-reveal]').forEach(element => {
      gsap.from(element, {autoAlpha: 0, y: 30, duration: .9, ease: 'power3.out', scrollTrigger: {trigger: element, start: 'top 90%', once: true}});
    });
    document.querySelectorAll('.ep-orbital').forEach(element => {
      gsap.to(element.querySelectorAll('.ep-orbital-ring'), {rotation: '+=45', stagger: .05, ease: 'none', scrollTrigger:{trigger:element, start:'top bottom',end:'bottom top',scrub:1}});
    });
  });
})();
