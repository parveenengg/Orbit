/**
 * ORBIT 3D WEBGL SCENE
 * Powered by Three.js & GSAP
 * Creates a responsive, interactive 3D Orbital particle system & celestial ring
 */

(function initOrbit3D() {
  const canvasContainer = document.getElementById('webgl-container');
  if (!canvasContainer) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  // Group containing all 3D orbit objects
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  // 1. Core Luminous Wireframe Sphere / Icosahedron
  const coreGeometry = new THREE.IcosahedronGeometry(4.5, 2);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x3B82F6,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  orbitGroup.add(coreMesh);

  // 2. Primary Outer Orbital Ring (Tilted ellipse)
  const ringPoints = [];
  const ringSegments = 160;
  const radiusX = 11.5;
  const radiusY = 7.5;
  for (let i = 0; i <= ringSegments; i++) {
    const theta = (i / ringSegments) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0));
  }
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0x60A5FA,
    transparent: true,
    opacity: 0.45
  });
  const ringLine = new THREE.Line(ringGeometry, ringMaterial);
  ringLine.rotation.x = Math.PI / 3.2;
  ringLine.rotation.y = Math.PI / 6;
  orbitGroup.add(ringLine);

  // 3. Secondary Counter-Orbital Ring
  const ring2Points = [];
  for (let i = 0; i <= ringSegments; i++) {
    const theta = (i / ringSegments) * Math.PI * 2;
    ring2Points.push(new THREE.Vector3(Math.cos(theta) * 9.5, 0, Math.sin(theta) * 9.5));
  }
  const ring2Geometry = new THREE.BufferGeometry().setFromPoints(ring2Points);
  const ring2Material = new THREE.LineBasicMaterial({
    color: 0x8B5CF6,
    transparent: true,
    opacity: 0.3
  });
  const ring2Line = new THREE.Line(ring2Geometry, ring2Material);
  ring2Line.rotation.z = Math.PI / 5;
  orbitGroup.add(ring2Line);

  // 4. Floating Celestial Particles Field
  const particleCount = 220;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x3B82F6);
  const color2 = new THREE.Color(0x8B5CF6);
  const color3 = new THREE.Color(0x06B6D4);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 6 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi);

    // Varied cosmic colors
    const chosenColor = Math.random() > 0.6 ? color1 : (Math.random() > 0.5 ? color2 : color3);
    particleColors[i3] = chosenColor.r;
    particleColors[i3 + 1] = chosenColor.g;
    particleColors[i3 + 2] = chosenColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  orbitGroup.add(particleSystem);

  // Position the 3D group behind the hero heading
  orbitGroup.position.set(0, 4, 0);

  // Interactive Mouse Physics
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - windowHalfX) * 0.0006;
    mouseY = (e.clientY - windowHalfY) * 0.0006;
  }, { passive: true });

  // Scroll-driven fade out so 3D elements never interfere with text below hero
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    orbitGroup.position.y = 4 + scrollY * 0.015;
    const fade = Math.max(0, 1 - (scrollY / 500));
    renderer.domElement.style.opacity = (fade * 0.7).toString();
  }, { passive: true });

  // Responsive Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Constant smooth rotation
    coreMesh.rotation.y += 0.004;
    coreMesh.rotation.x += 0.002;
    ringLine.rotation.z += 0.003;
    ring2Line.rotation.y -= 0.002;
    particleSystem.rotation.y += 0.001;

    // Smooth mouse interpolation
    targetRotationY += (mouseX - targetRotationY) * 0.04;
    targetRotationX += (mouseY - targetRotationX) * 0.04;

    orbitGroup.rotation.y = targetRotationY;
    orbitGroup.rotation.x = targetRotationX;

    renderer.render(scene, camera);
  }

  animate();

  // GSAP Entry Animations if available
  if (window.gsap) {
    gsap.from(orbitGroup.scale, {
      x: 0.4,
      y: 0.4,
      z: 0.4,
      duration: 2.2,
      ease: "power3.out"
    });
    gsap.from(coreMaterial, {
      opacity: 0,
      duration: 2.5,
      ease: "power2.out"
    });
  }
})();
