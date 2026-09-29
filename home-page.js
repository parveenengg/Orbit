(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('[data-home-reveal]').forEach(element => {
      gsap.from(element, {autoAlpha:0,y:28,duration:.9,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 90%',once:true}});
    });
    gsap.from('.home-devices .platform-phone-showcase', {
      y:40,rotation:3,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.home-devices',start:'top 80%',once:true}
    });
  });
})();
