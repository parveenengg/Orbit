import re

with open("index.html", "r") as f:
    html = f.read()

# Move <div class="node-dot"></div> outside of node-content
html = re.sub(r'(<div class="node-content.*?>)\s*<div class="node-dot"></div>', r'<div class="node-dot"></div>\n            \1', html)

with open("index.html", "w") as f:
    f.write(html)

with open("styles.css", "r") as f:
    css = f.read()

# Fix node-dot CSS
css = re.sub(r"\.node-dot \{.*?\}", """.node-dot {
  position: absolute;
  top: -6px; /* center on the orbital path */
  left: -6px;
  width: 12px;
  height: 12px;
  background: var(--orbit-text-secondary);
  border-radius: 50%;
  transition: all 0.4s ease;
  z-index: 2;
}""", css, flags=re.DOTALL)

# Fix node-content active dot CSS
css = css.replace(".node-content.active .node-dot {", ".wheel-node.active .node-dot {")
# But wait, in JS I add .active to .node-content, not .wheel-node!
# Let's add .active to .wheel-node in JS, OR just change CSS to use a sibling selector: .node-content.active ~ .node-dot ?
# Since node-dot is now BEFORE node-content in HTML:
css = css.replace(".node-content.active .node-dot {", ".node-dot.active {")

with open("styles.css", "w") as f:
    f.write(css)

with open("app.js", "r") as f:
    js = f.read()

js = js.replace("node.classList.add(\"active\");", 'node.classList.add("active"); node.previousElementSibling.classList.add("active");')
js = js.replace("node.classList.remove(\"active\");", 'node.classList.remove("active"); node.previousElementSibling.classList.remove("active");')

with open("app.js", "w") as f:
    f.write(js)

print("Fixed dot positioning")
