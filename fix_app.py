import re

with open("app.js", "r") as f:
    js = f.read()

# Replace the B. Scroll-Driven Feature Story section completely
js = re.sub(r"// B\. Scroll-Driven Feature Story.*?\}\n\}", """// B. Orbital Wheel Feature Story
  const featureStory = document.getElementById("featureStory");
  const wheelContainer = document.getElementById("wheelContainer");
  const desktopNodes = gsap.utils.toArray(".desktop-orbital-layout .node-content");
  const desktopAnchors = gsap.utils.toArray(".desktop-orbital-layout .node-anchor");
  const desktopDots = gsap.utils.toArray(".desktop-orbital-layout .node-dot");
  const desktopImgs = gsap.utils.toArray(".desktop-orbital-layout .story-img");
  
  if (featureStory && wheelContainer && desktopNodes.length > 0) {
    ScrollTrigger.matchMedia({
      "(min-width: 769px)": function() {
        const totalRotation = 75; // clockwise rotation
        
        const wheelTl = gsap.timeline({
          scrollTrigger: {
            trigger: featureStory,
            start: "top top",
            end: "+=300%",
            scrub: 1,
            pin: true,
            onUpdate: self => {
              const activeIndex = Math.min(3, Math.max(0, Math.round(self.progress * 3)));
              desktopNodes.forEach((node, i) => {
                if (i === activeIndex) {
                  node.classList.add("active");
                  if(desktopDots[i]) desktopDots[i].classList.add("active");
                  if(desktopImgs[i]) desktopImgs[i].classList.add("active");
                } else {
                  node.classList.remove("active");
                  if(desktopDots[i]) desktopDots[i].classList.remove("active");
                  if(desktopImgs[i]) desktopImgs[i].classList.remove("active");
                }
              });
            }
          }
        });
        
        wheelTl.to(wheelContainer, {
          rotation: totalRotation,
          ease: "none"
        }, 0);
        
        desktopAnchors.forEach((anchor) => {
          wheelTl.to(anchor, {
            rotation: "-=" + totalRotation, // counter-rotate
            ease: "none"
          }, 0);
        });
      },
      
      "(max-width: 768px)": function() {
        const mobNodes = gsap.utils.toArray(".mobile-orbital-layout .story-item-mob");
        const mobImgs = gsap.utils.toArray(".mobile-orbital-layout .story-img");
        
        mobNodes.forEach((node, i) => {
          ScrollTrigger.create({
            trigger: node,
            start: "top 60%",
            end: "bottom 60%",
            onEnter: () => setMobActive(i),
            onEnterBack: () => setMobActive(i),
          });
        });
        
        function setMobActive(index) {
          mobNodes.forEach((node, i) => {
            if (i === index) node.classList.add("active");
            else node.classList.remove("active");
          });
          mobImgs.forEach((img, i) => {
            if (i === index) img.classList.add("active");
            else img.classList.remove("active");
          });
        }
      }
    });
  }""", js, flags=re.DOTALL)

with open("app.js", "w") as f:
    f.write(js)

print("Updated app.js")
