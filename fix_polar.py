import re

with open("styles.css", "r") as f:
    css = f.read()

# Remove old .node-content transforms
css = css.replace("transition: opacity 0.4s ease, transform 0.4s ease;", "transition: opacity 0.4s ease;")

# Add .node-anchor
if ".node-anchor {" not in css:
    css += "\n.node-anchor { position: absolute; top: 0; left: 0; width: 0; height: 0; }\n"

# Fix node-content placement
css = re.sub(r"\.node-content \{.*?\}", """.node-content {
  position: absolute;
  top: -60px; /* center vertically around the node dot */
  right: 40px; /* 40px to the left of the dot */
  width: 380px;
  text-align: right;
  opacity: 0.3;
  transition: opacity 0.4s ease;
}""", css, flags=re.DOTALL)

with open("styles.css", "w") as f:
    f.write(css)

with open("index.html", "r") as f:
    html = f.read()

new_nodes = """<div class="wheel-node" style="transform: rotate(180deg);">
            <div class="node-anchor" style="transform: translate(700px) rotate(-180deg);">
              <div class="node-dot active"></div>
              <div class="node-content active" data-index="0">
                <span class="story-num">01 — Browse</span>
                <h3 class="story-title">A clean home designed around where you want to go.</h3>
              </div>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(155deg);">
            <div class="node-anchor" style="transform: translate(700px) rotate(-155deg);">
              <div class="node-dot"></div>
              <div class="node-content" data-index="1">
                <span class="story-num">02 — Tabs</span>
                <h3 class="story-title">Keep your browsing organized without turning tab management into work.</h3>
              </div>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(130deg);">
            <div class="node-anchor" style="transform: translate(700px) rotate(-130deg);">
              <div class="node-dot"></div>
              <div class="node-content" data-index="2">
                <span class="story-num">03 — Make it Yours</span>
                <h3 class="story-title">Light. Dark. System. Choose your accent and make the home screen yours.</h3>
              </div>
            </div>
          </div>
          
          <div class="wheel-node" style="transform: rotate(105deg);">
            <div class="node-anchor" style="transform: translate(700px) rotate(-105deg);">
              <div class="node-dot"></div>
              <div class="node-content" data-index="3">
                <span class="story-num">04 — Control</span>
                <h3 class="story-title">History, permissions, startup behavior, and search engine are accessible from a clear settings interface.</h3>
              </div>
            </div>
          </div>"""

html = re.sub(r'<div class="wheel-node".*?<div class="wheel-node".*?<div class="wheel-node".*?<div class="wheel-node".*?</div>\s*</div>\s*</div>\s*</div>', new_nodes, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)

with open("app.js", "r") as f:
    js = f.read()

# Update GSAP target
js = js.replace('const desktopNodes = gsap.utils.toArray(".desktop-orbital-layout .node-content");', 
                'const desktopNodes = gsap.utils.toArray(".desktop-orbital-layout .node-content");\n  const desktopAnchors = gsap.utils.toArray(".desktop-orbital-layout .node-anchor");')

# Update animation
js = re.sub(r'desktopNodes\.forEach\(\(node\) => \{.*?wheelTl\.to\(node, \{.*?rotation: "-=" \+ totalRotation,.*?ease: "none".*?\}, 0\);\n        \}\);', 
            """desktopAnchors.forEach((anchor) => {
          wheelTl.to(anchor, {
            rotation: "-=" + totalRotation,
            ease: "none"
          }, 0);
        });""", js, flags=re.DOTALL)

with open("app.js", "w") as f:
    f.write(js)

print("Fixed polar coordinates")
