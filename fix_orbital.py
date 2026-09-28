import re

with open("styles.css", "r") as f:
    css = f.read()

# Replace wheel CSS
css = re.sub(r"\.wheel-container \{.*?\}", """.wheel-container {
  position: absolute;
  top: 50%;
  right: 200px; /* Center is exactly in the middle of .orbital-right (which is 400px wide) */
  width: 1400px;
  height: 1400px;
  margin-top: -700px;
  margin-right: -700px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.05); /* faint ring */
}""", css, flags=re.DOTALL)

with open("styles.css", "w") as f:
    f.write(css)

with open("index.html", "r") as f:
    html = f.read()

# Replace nodes in HTML
new_nodes = """<div class="wheel-node" style="transform: rotate(180deg) translate(700px);">
            <div class="node-content active" style="transform: rotate(-180deg);" data-index="0">
              <div class="node-dot"></div>
              <span class="story-num">01 — Browse</span>
              <h3 class="story-title">A clean home designed around where you want to go.</h3>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(155deg) translate(700px);">
            <div class="node-content" style="transform: rotate(-155deg);" data-index="1">
              <div class="node-dot"></div>
              <span class="story-num">02 — Tabs</span>
              <h3 class="story-title">Keep your browsing organized without turning tab management into work.</h3>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(130deg) translate(700px);">
            <div class="node-content" style="transform: rotate(-130deg);" data-index="2">
              <div class="node-dot"></div>
              <span class="story-num">03 — Make it Yours</span>
              <h3 class="story-title">Light. Dark. System. Choose your accent and make the home screen yours.</h3>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(105deg) translate(700px);">
            <div class="node-content" style="transform: rotate(-105deg);" data-index="3">
              <div class="node-dot"></div>
              <span class="story-num">04 — Control</span>
              <h3 class="story-title">History, permissions, startup behavior, and search engine are accessible from a clear settings interface.</h3>
            </div>
          </div>"""

html = re.sub(r'<div class="wheel-node" style="transform: rotate\(0deg\).*?</div>\s*</div>\s*</div>\s*</div>', new_nodes + '\n\n        </div>\n      </div>', html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)

with open("app.js", "r") as f:
    js = f.read()

# Replace JS logic
js = re.sub(r'const totalRotation = -75;.*?wheelTl\.to\(node, \{.*?ease: "none".*?\}, 0\);\n        \}\);', """const totalRotation = 75; // clockwise rotation
        
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
                if (i === activeIndex) node.classList.add("active");
                else node.classList.remove("active");
              });
              desktopImgs.forEach((img, i) => {
                if (i === activeIndex) img.classList.add("active");
                else img.classList.remove("active");
              });
            }
          }
        });
        
        wheelTl.to(wheelContainer, {
          rotation: totalRotation,
          ease: "none"
        }, 0);
        
        desktopNodes.forEach((node) => {
          wheelTl.to(node, {
            rotation: "-=" + totalRotation, // counter-rotate
            ease: "none"
          }, 0);
        });""", js, flags=re.DOTALL)

with open("app.js", "w") as f:
    f.write(js)

print("Fixed orbital geometry")
