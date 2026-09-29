/**
 * ORBIT 3D WEBGL GALAXY SCENE
 * Powered by Three.js & GSAP
 * Creates a celestial galaxy orbit system inspired by the Orbit logo
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
  camera.position.set(0, 0, window.innerWidth < 900 ? 42 : 25);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  // Group containing all 3D orbit objects, elevated slightly to hover in the upper sky
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, 1.8, 0);
  scene.add(orbitGroup);

  // Helper: Create circular soft glowing particle texture using 2D canvas (Dark&PreimumBlue palette)
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Specular starlight white
    gradient.addColorStop(0.2, 'rgba(240, 246, 253, 0.95)'); // Silvery starlight touch
    gradient.addColorStop(0.5, 'rgba(230, 230, 240, 0.55)'); // #6799DD
    gradient.addColorStop(0.8, 'rgba(190, 185, 210, 0.2)'); // #4E77AD
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  // Helper: Create large soft radial nebula bloom texture (Dark&PreimumBlue palette)
  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Pure white starlight
    gradient.addColorStop(0.16, 'rgba(240, 246, 253, 0.9)'); // Silvery ring touch
    gradient.addColorStop(0.42, 'rgba(230, 230, 240, 0.6)'); // Vibrant metallic cobalt
    gradient.addColorStop(0.72, 'rgba(190, 185, 210, 0.25)'); // Orbit slate cobalt
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }

  const particleTexture = createParticleTexture();
  const glowTexture = createGlowTexture();

  // =========================================================================
  // 1. GALAXY CORE (NUCLEUS) - Inspired by the Orbit Logo's glowing center
  // =========================================================================
  const coreGroup = new THREE.Group();
  orbitGroup.add(coreGroup);

  // Smooth luminous core sphere (NO wireframe, pure smooth emissive sphere)
  const coreSphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const coreSphereMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.95
  });
  const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
  coreGroup.add(coreSphere);

  // Inner core glow sprite (High intensity white starlight bloom with silvery touch)
  const innerCoreSpriteMat = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xFFE2B7,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const innerCoreSprite = new THREE.Sprite(innerCoreSpriteMat);
  innerCoreSprite.scale.set(6, 6, 1);
  coreGroup.add(innerCoreSprite);

  // Radiant mid-halo sprite (Orbit Iconic Cobalt Blue: #5080C0 / #4E77AD)
  const midHaloSpriteMat = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xA78AD4,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const midHaloSprite = new THREE.Sprite(midHaloSpriteMat);
  midHaloSprite.scale.set(18, 18, 1);
  coreGroup.add(midHaloSprite);

  // Deep galactic atmosphere sprite (Deep Cobalt Sapphire ambient nebula)
  const outerAtmosphereSpriteMat = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x635193,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outerAtmosphereSprite = new THREE.Sprite(outerAtmosphereSpriteMat);
  outerAtmosphereSprite.scale.set(38, 38, 1);
  coreGroup.add(outerAtmosphereSprite);

  // =========================================================================
  // 2. CONCENTRIC GALAXY ORBITS (Matches Orbit Logo concentric rings: Dark&PreimumBlue)
  // =========================================================================
  const galaxyDisc = new THREE.Group();
  orbitGroup.add(galaxyDisc);

  // Tilt the galaxy disc in 3D space to showcase perspective & depth
  galaxyDisc.rotation.x = THREE.MathUtils.degToRad(72); // View from 18 degrees above the disc plane
  galaxyDisc.rotation.y = 0;

  // =========================================================================
  // 3. SPIRAL GALAXY ARMS & COSMIC STARDUST (Dynamic Galaxy feel)
  // =========================================================================
  const galaxyStarCount = window.innerWidth < 768 ? 3500 : 7000;
  const galaxyStarGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(galaxyStarCount * 3);
  const starColors = new Float32Array(galaxyStarCount * 3);

  const numArms = 3;
  const armColors = [
    new THREE.Color(0xFFE6C4), // Warm central stars
    new THREE.Color(0xCAB5E5), // Soft violet transition
    new THREE.Color(0x789DDF), // Cool outer arms
    new THREE.Color(0x77569E)  // Muted outer violet
  ];
  const pinkHighlight = new THREE.Color(0xD98BAF);

  for (let i = 0; i < galaxyStarCount; i++) {
    const i3 = i * 3;
    // Logarithmic distance distribution from core outward
    const r = 1.8 + Math.pow(Math.random(), 1.6) * 13.0;
    // Determine spiral arm
    const armIndex = i % numArms;
    const armAngle = (armIndex * (Math.PI * 2)) / numArms;
    // Logarithmic curve
    const spiralAngle = armAngle + Math.log(r + 0.1) * 2.2 + (Math.random() + Math.random() - 1) * .48;
    // Radial and vertical scatter (thicker near center, thin at edge)
    const scatterR = (Math.random() - 0.5) * (1.8 + r * 0.30);
    const scatterZ = (Math.random() - 0.5) * (1.6 * Math.max(0.2, 1 - r / 18));

    starPositions[i3] = Math.cos(spiralAngle) * (r + scatterR);
    starPositions[i3 + 1] = Math.sin(spiralAngle) * (r + scatterR);
    starPositions[i3 + 2] = scatterZ;

    // Color gradient based on radius
    const normR = Math.min(1, r / 14);
    const gradientPosition = Math.max(0, Math.min(2.999, normR * 3));
    const band = Math.floor(gradientPosition);
    const col = armColors[band].clone().lerp(armColors[band + 1], gradientPosition - band);
    if (normR > .35 && i % 11 === 0) col.lerp(pinkHighlight, .65);

    starColors[i3] = col.r;
    starColors[i3 + 1] = col.g;
    starColors[i3 + 2] = col.b;
  }

  galaxyStarGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  galaxyStarGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const galaxyStarMat = new THREE.PointsMaterial({
    size: 0.22,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const galaxyStarField = new THREE.Points(galaxyStarGeo, galaxyStarMat);
  galaxyDisc.add(galaxyStarField);
  // A soft layer shares the star positions so dust follows the same spiral motion.
  const dustMaterial = new THREE.PointsMaterial({size: .8, map: particleTexture,
    vertexColors: true, transparent: true, opacity: .065,
    blending: THREE.AdditiveBlending, depthWrite: false});
  galaxyDisc.add(new THREE.Points(galaxyStarGeo, dustMaterial));

  // =========================================================================
  // 4. DEEP SPACE AMBIENT PARTICLES
  // =========================================================================
  const ambientCount = 350;
  const ambientGeo = new THREE.BufferGeometry();
  const ambientPositions = new Float32Array(ambientCount * 3);
  const ambientColors = new Float32Array(ambientCount * 3);

  for (let i = 0; i < ambientCount; i++) {
    const i3 = i * 3;
    const r = 12 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    ambientPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
    ambientPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    ambientPositions[i3 + 2] = r * Math.cos(phi);

    const c = Math.random() > 0.5 ? new THREE.Color(0x6799DD) : new THREE.Color(0xF0F6FD);
    ambientColors[i3] = c.r;
    ambientColors[i3 + 1] = c.g;
    ambientColors[i3 + 2] = c.b;
  }

  ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
  ambientGeo.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));

  const ambientMat = new THREE.PointsMaterial({
    size: 0.16,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ambientSystem = new THREE.Points(ambientGeo, ambientMat);
  orbitGroup.add(ambientSystem);

  // Mouse Parallax Physics
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  const proximityEnabled = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const pointer = {x: 0, y: 0, active: false};
  const projectedCenter = new THREE.Vector3();
  let rotationMultiplier = 1;
  const clearPointer = () => { pointer.active = false; mouseX = 0; mouseY = 0; };
  window.addEventListener('pointermove', event => {
    if (!proximityEnabled.matches || event.pointerType !== 'mouse' ||
        event.target.closest?.('nav,a,button,input,.galaxy-view-controls')) { clearPointer(); return; }
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
    mouseX = (event.clientX / innerWidth - .5) * .10;
    mouseY = (event.clientY / innerHeight - .5) * .08;
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  proximityEnabled.addEventListener('change', clearPointer);

  // Optional local preview controls; the normal landing page stays clean.
  if (new URLSearchParams(location.search).has('galaxy-edit')) {
    const panel = document.createElement('aside');
    panel.className = 'galaxy-view-controls';
    panel.setAttribute('aria-label', 'Galaxy view controls');
    panel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:200;width:min(290px,calc(100vw - 40px));padding:20px;background:#101620f2;border:1px solid #52637b;border-radius:18px;color:white;font:14px system-ui;box-shadow:0 8px 30px #0005';
    const title = document.createElement('strong'); title.textContent = 'Adjust your galaxy'; panel.append(title);
    const inputs = [];
    const add = (name, min, max, value, change) => {
      const label = document.createElement('label');
      label.style.cssText = 'display:block;margin-top:16px';
      const text = document.createElement('span');
      const input = document.createElement('input');
      input.type = 'range'; input.min = min; input.max = max; input.value = value;
      input.style.cssText = 'display:block;width:100%;margin-top:8px;accent-color:#accbf2';
      const update = () => {text.textContent = `${name}: ${input.value}`;change(Number(input.value));};
      input.addEventListener('input', update); label.append(text,input);panel.append(label);update();
      inputs.push({input,value,update});
    };
    add('Viewing elevation', 5, 90, 18, value => galaxyDisc.rotation.x = THREE.MathUtils.degToRad(90 - value));
    add('Side angle', -45, 45, 0, value => galaxyDisc.rotation.y = THREE.MathUtils.degToRad(value));
    add('Distance', 20, 40, 25, value => camera.position.z = value);
    const reset = document.createElement('button'); reset.textContent = 'Reset view'; reset.type = 'button';
    reset.style.cssText = 'margin-top:16px;padding:8px 14px;border-radius:20px;border:0;cursor:pointer';
    reset.addEventListener('click', () => inputs.forEach(({input,value,update}) => {input.value=value;update();}));
    panel.append(reset); document.body.append(panel);
  }

  // Responsive Resize
  window.addEventListener('resize', () => {
    if (!new URLSearchParams(location.search).has('galaxy-edit')) camera.position.z = window.innerWidth < 900 ? 42 : 25;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), .05);
    const elapsedTime = clock.elapsedTime;
    let desiredMultiplier = 1;
    if (pointer.active && proximityEnabled.matches) {
      orbitGroup.updateWorldMatrix(true, false);
      coreGroup.getWorldPosition(projectedCenter).project(camera);
      const bounds = renderer.domElement.getBoundingClientRect();
      const centerX = bounds.left + (projectedCenter.x + 1) * bounds.width / 2;
      const centerY = bounds.top + (1 - projectedCenter.y) * bounds.height / 2;
      const radius = Math.min(innerWidth, innerHeight) * .38;
      const proximity = Math.max(0, 1 - Math.hypot(pointer.x - centerX, pointer.y - centerY) / radius);
      const easedProximity = proximity * proximity * (3 - 2 * proximity);
      desiredMultiplier = 1 + 9 * easedProximity;
    }
    rotationMultiplier += (desiredMultiplier - rotationMultiplier) * (1 - Math.exp(-3 * delta));
    // Preserve the former 60 Hz baseline, independent of display refresh rate.
    galaxyDisc.rotation.z -= .108 * delta * rotationMultiplier;

    // Gentle breathing pulse of the central nucleus
    const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.06;
    coreSphere.scale.set(pulse, pulse, pulse);
    innerCoreSprite.scale.set(6 * pulse, 6 * pulse, 1);
    midHaloSprite.scale.set(18 * pulse, 18 * pulse, 1);

    // Deep space particles slow drift
    ambientSystem.rotation.y += 0.0004;
    ambientSystem.rotation.x += 0.0002;

    // Smooth mouse tilt parallax
    targetRotationY += (mouseX - targetRotationY) * 0.05;
    targetRotationX += (mouseY - targetRotationX) * 0.05;

    orbitGroup.rotation.y = targetRotationY;
    orbitGroup.rotation.x = targetRotationX;

    renderer.render(scene, camera);
  }

  animate();

  // GSAP Smooth Entry Scale if available
  if (window.gsap) {
    gsap.from(orbitGroup.scale, {
      x: 0.2,
      y: 0.2,
      z: 0.2,
      duration: 2.0,
      ease: "power3.out"
    });
  }
})();
