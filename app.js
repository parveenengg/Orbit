/**
 * ORBIT BROWSER — MINIMAL SAAS INTERACTIVITY
 * Three.js + GSAP + Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.matches(".features-page, .editorial-page")) initStretchLoader();
  initSpotlight();
  initNavScroll();
  initOsDetection();
  if (document.getElementById("heroSection")) initGsapAnimations();
  initZeroGravityTitle();
  initSubpageInteractive();
});

/* ==========================================================================
   1. Dynamic Cursor Spotlight
   ========================================================================== */
function initSpotlight() {
  let ticking = false;
  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   2. Navigation Sticky & Blur On Scroll
   ========================================================================== */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   3. OS Auto-Detection
   ========================================================================== */
function initOsDetection() {
  const heroBtnLabel = document.getElementById('heroBtnLabel');
  const userAgent = navigator.userAgent.toLowerCase();

  const isAndroid = /android/i.test(userAgent);
  const isMac = /macintosh|mac os x/i.test(userAgent);

  if (heroBtnLabel) {
    if (isAndroid) {
      heroBtnLabel.textContent = 'Download Android APK (28MB)';
    } else if (isMac) {
      heroBtnLabel.textContent = 'Download for Mac';
    }
  }
}

/* ==========================================================================
   4. Search Engine Selector (Home Simulator)
   ========================================================================== */
function pickEngine(engineId, icon, name) {
  // Update Active Tags
  const tags = document.querySelectorAll('.engine-tag');
  tags.forEach((tag) => {
    if (tag.getAttribute('onclick')?.includes(engineId)) {
      tag.classList.add('active');
    } else {
      tag.classList.remove('active');
    }
  });

  // Update Icon
  const iconEl = document.getElementById('activeSearchIcon');
  if (iconEl) iconEl.textContent = icon;

  // Update Input & Address bar
  const searchInput = document.getElementById('simSearchInput');
  const addressBar = document.getElementById('simAddressBar');

  if (searchInput) {
    searchInput.placeholder = `Search with ${name}...`;
    searchInput.value = '';
  }
  if (addressBar) {
    addressBar.textContent = `orbit://${engineId}-search`;
  }

  showToast(`Default search engine set to ${name}. Zero dev tracking.`);
}

/* ==========================================================================
   5. GSAP Kinetic Text & Reveal Animations
   ========================================================================== */
function initGsapAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  // Initial load animations
  gsap.from('.hero-title:not(.zero-gravity-word)', { opacity: 0, y: 30, duration: 1.2, delay: 0.2, ease: 'power3.out' });
  gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 1.2, delay: 0.4, ease: 'power3.out' });
  gsap.from('.hero-sub-small', { opacity: 0, y: 20, duration: 1.2, delay: 0.5, ease: 'power3.out' });

  // Cinematic scroll sequence for Hero
  const heroSection = document.getElementById('heroSection');
  const webglContainer = document.getElementById('webgl-container');
  const textContent = document.querySelector('.hero-content');
  const macReveal = document.getElementById('heroVisual');

  if (heroSection && macReveal && webglContainer) {
    const heroMedia = gsap.matchMedia();
    heroMedia.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    // Hide Mac mockup initially for the scroll reveal
    gsap.set(macReveal, { opacity: 0, y: 80, scale: 0.95, pointerEvents: 'none' });

    // Scale up the webgl container slightly for a zoom effect
    gsap.set(webglContainer, { scale: 1, yPercent: 0, opacity: 1, transformOrigin: "50% 40%" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "+=150%",
        scrub: 1,
        pin: true
      }
    });

    // Zoom space, text recedes, then Mac emerges
    tl.to(webglContainer, { scale: 1.18, yPercent: -65, duration: 1.1, ease: 'power1.inOut' }, 0)
      .to(webglContainer, { opacity: 0, duration: .55, ease: 'none' }, .4)
      .to(textContent, { opacity: 0, y: -50, pointerEvents: 'none', duration: 0.8 }, 0)
      .to(macReveal, { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto', duration: 0.8 }, 0.5);
    });
    heroMedia.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => {
      gsap.set(macReveal, {opacity: 1, y: 0, scale: 1, pointerEvents: 'auto'});
      gsap.set(textContent, {opacity: 1, y: 0, pointerEvents: 'auto'});
      gsap.set(webglContainer, {scale: 1, yPercent: 0, opacity: 1});
      gsap.to(webglContainer, {opacity: 0, ease: 'none', scrollTrigger: {
        trigger: textContent, start: 'top top', end: 'bottom top', scrub: true
      }});
    });
  } else if (macReveal) {
    // Fallback if elements missing
    gsap.from(macReveal, { opacity: 0, y: 40, duration: 1.4, delay: 0.7, ease: 'power3.out' });
  }
}

/* ==========================================================================
   6. Checksum Copy & Toasts
   ========================================================================== */
function copyChecksum() {
  const hashText = '932e81871003b12ccda0f6c17f5816a1bcaf13482fda6273d187c08dcf748bb4';
  const copyBtn = document.getElementById('copyHashBtn');

  navigator.clipboard.writeText(hashText).then(() => {
    if (copyBtn) copyBtn.textContent = 'Copied!';
    showToast('SHA-256 hash copied to clipboard!');
    setTimeout(() => {
      if (copyBtn) copyBtn.textContent = 'Copy Hash';
    }, 2500);
  }).catch(() => {
    showToast('SHA-256: ' + hashText.substring(0, 16) + '...');
  });
}

function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; background: rgba(14, 14, 22, 0.95); border: 1px solid rgba(74, 123, 191, 0.4); color: #FFFFFF; padding: 0.8rem 1.3rem; border-radius: 12px; font-size: 0.875rem; backdrop-filter: blur(12px); transform: translateY(120px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000;';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(120px)';
    toast.style.opacity = '0';
  }, 3000);
}

/* ==========================================================================
   8. Minimalist Customization Section Animation
   ========================================================================== */
function initCustomization() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.getElementById("customizationSection");
  if (!section) return;

  const textCol = section.querySelector(".customization-text-col");
  const featureRows = gsap.utils.toArray("#customizationSection .cust-feature-row");
  const phone = section.querySelector(".phone-minimal-stage .orbit-phone");
  const backdrop = section.querySelector(".phone-ambient-backdrop");

  if (textCol) {
    gsap.set(textCol.children, { opacity: 0, y: 20 });
  }
  if (phone) {
    gsap.set(phone, { opacity: 0, scale: 0.96, y: 30 });
  }
  if (backdrop) {
    gsap.set(backdrop, { opacity: 0, scale: 0.8 });
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top 70%",
    once: true,
    onEnter: () => {
      // Animate text column elements
      if (textCol) {
        gsap.to(textCol.children, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out"
        });
      }

      // Smoothly elevate the phone mockup
      if (phone) {
        gsap.to(phone, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          delay: 0.15,
          ease: "power2.out"
        });
      }

      // Soft ambient backdrop glow bloom
      if (backdrop) {
        gsap.to(backdrop, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          delay: 0.2,
          ease: "power2.out"
        });
      }
    }
  });
}

/* ==========================================================================
   9. Cross Platform Studio Showcase Animation
   ========================================================================== */
function initCrossPlatform() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section = document.getElementById("crossPlatformSection");
  if (!section) return;

  const badge = section.querySelector(".cross-platform-badge");
  const title = section.querySelector(".section-title");
  const sub = section.querySelector(".section-sub");
  const tags = section.querySelector(".platform-tags");
  const desktop = section.querySelector(".platform-desktop-display");
  const phone = section.querySelector(".platform-phone-showcase");
  const glow = section.querySelector(".platform-ambient-glow");
  const actions = section.querySelector(".platform-actions");
  const meta = section.querySelector(".platform-subtext");

  gsap.set([badge, title, sub, tags], { opacity: 0, y: 20 });
  if (desktop) gsap.set(desktop, { opacity: 0, y: 35, scale: 0.97 });
  if (phone) gsap.set(phone, { opacity: 0, y: 45, scale: 0.95 });
  if (glow) gsap.set(glow, { opacity: 0, scale: 0.8 });
  if (actions) gsap.set([actions, meta], { opacity: 0, y: 15 });

  ScrollTrigger.create({
    trigger: section,
    start: "top 72%",
    once: true,
    onEnter: () => {
      // Header typography
      gsap.to([badge, title, sub, tags], {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Desktop display reveal
      if (desktop) {
        gsap.to(desktop, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay: 0.15,
          ease: "power2.out"
        });
      }

      // Smartphone mockup reveal with depth pop
      if (phone) {
        gsap.to(phone, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          delay: 0.28,
          ease: "back.out(1.2)"
        });
      }

      // Ambient glow bloom
      if (glow) {
        gsap.to(glow, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          delay: 0.2,
          ease: "power2.out"
        });
      }

      // Action buttons
      if (actions) {
        gsap.to([actions, meta], {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          delay: 0.45,
          ease: "power2.out"
        });
      }
    }
  });
}

// Add these to init
document.addEventListener('DOMContentLoaded', () => {
  initCustomization();
  initCrossPlatform();
});

/* ==========================================================================
   Zero Gravity: Bouncy Words (Hero Title "ORBIT")
   ========================================================================== */
function initZeroGravityTitle() {
  const word = document.querySelector('.hero-title.zero-gravity-word');
  if (!word) return;

  const letters = Array.from(word.querySelectorAll('.gravity-letter'));
  if (!letters.length) return;

  // Zero-G resting states & drift parameters for O - R - B - I - T
  const zeroGParams = [
    { baseRot: -4.5, floatY: -8,  rotOsc: 3.5,  duration: 2.8, delay: 0 },    // O
    { baseRot: 3.8,  floatY: -11, rotOsc: -3.0, duration: 3.2, delay: 0.25 }, // R
    { baseRot: -3.2, floatY: -7,  rotOsc: 2.8,  duration: 2.6, delay: 0.5 },  // B
    { baseRot: 5.5,  floatY: -10, rotOsc: -3.5, duration: 3.4, delay: 0.15 }, // I
    { baseRot: -4.0, floatY: -8,  rotOsc: 4.0,  duration: 2.9, delay: 0.4 }   // T
  ];

  function startLetterFloat(letter, idx) {
    if (!window.gsap) return;
    const p = zeroGParams[idx % zeroGParams.length];

    gsap.killTweensOf(letter);

    gsap.to(letter, {
      y: p.floatY,
      rotation: p.baseRot + p.rotOsc,
      duration: p.duration,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: p.delay
    });
  }

  // Initial zero-gravity entrance animation
  function runZeroGEntrance() {
    if (!window.gsap) {
      letters.forEach((l, i) => {
        l.style.opacity = '1';
        startLetterFloat(l, i);
      });
      return;
    }

    gsap.set(letters, {
      opacity: 0,
      y: -65,
      scale: 0.6,
      rotation: (i) => zeroGParams[i % zeroGParams.length].baseRot * 2.8
    });

    gsap.to(letters, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: (i) => zeroGParams[i % zeroGParams.length].baseRot,
      duration: 1.25,
      stagger: 0.08,
      ease: "elastic.out(1.15, 0.45)",
      onComplete: () => {
        letters.forEach((l, i) => startLetterFloat(l, i));
      }
    });
  }

  // Attach hover & click bouncy physics
  letters.forEach((letter, idx) => {
    const p = zeroGParams[idx % zeroGParams.length];

    // Hover: impulse bounce up with elastic recoil
    letter.addEventListener('mouseenter', () => {
      if (!window.gsap) return;
      gsap.killTweensOf(letter);

      const impulseRot = p.baseRot + (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8);

      // Kinetic leap into zero gravity
      gsap.to(letter, {
        y: -34,
        rotation: impulseRot,
        scale: 1.16,
        duration: 0.32,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          // Elastic spring recoil settling back to zero-g drift
          gsap.to(letter, {
            y: 0,
            rotation: p.baseRot,
            scale: 1,
            duration: 0.95,
            ease: "elastic.out(1.3, 0.36)",
            onComplete: () => {
              startLetterFloat(letter, idx);
            }
          });
        }
      });

      // Subtle sympathy ripple to neighboring letters
      const leftNeighbor = letters[idx - 1];
      const rightNeighbor = letters[idx + 1];
      if (leftNeighbor) {
        gsap.to(leftNeighbor, {
          y: -10,
          duration: 0.28,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
      if (rightNeighbor) {
        gsap.to(rightNeighbor, {
          y: -10,
          duration: 0.28,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
    });

    // Click: Anti-gravity 360 spin & leap
    letter.addEventListener('click', () => {
      if (!window.gsap) return;
      gsap.killTweensOf(letter);

      const tl = gsap.timeline({
        onComplete: () => startLetterFloat(letter, idx)
      });

      tl.to(letter, {
        scaleX: 1.25,
        scaleY: 0.75,
        y: 8,
        duration: 0.08,
        ease: "power2.in"
      })
      .to(letter, {
        y: -56,
        rotation: p.baseRot + 360,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 0.72,
        ease: "power2.out"
      })
      .to(letter, {
        y: 0,
        rotation: p.baseRot,
        scaleX: 1,
        scaleY: 1,
        duration: 1.05,
        ease: "elastic.out(1.2, 0.38)"
      });
    });
  });

  // Expose entrance runner so the stretch loader can call it when unveiling
  window.__runZeroGEntrance = runZeroGEntrance;
  // If stretch loader is absent, run entrance directly
  if (!document.getElementById('stretchLoaderScreen')) {
    setTimeout(runZeroGEntrance, 200);
  }
}

/* ==========================================================================
   "Stretch" Loading Animation (Antinomy Template Style)
   ========================================================================== */
function initStretchLoader() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const loader = document.createElement('div');
  loader.id = 'stretchLoaderScreen';
  loader.className = 'orbit-arrival';
  loader.setAttribute('aria-hidden', 'true');
  const symbol = document.createElement('div'); symbol.className = 'orbit-arrival-symbol';
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('span'); ring.className = 'arrival-ring arrival-ring-' + i; symbol.append(ring);
  }
  loader.append(symbol); document.body.prepend(loader);
  const zoom = Math.hypot(innerWidth, innerHeight) / 32 * 1.1;
  loader.style.setProperty('--arrival-zoom', zoom);
  requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('is-zooming')));
  setTimeout(() => loader.classList.add('is-leaving'), 1150);
  setTimeout(() => {
    loader.remove();
    if (typeof window.__runZeroGEntrance === 'function') window.__runZeroGEntrance();
  }, 1550);
}

/* ==========================================================================
   8. SUBPAGE SAAS INTERACTIVITY & REVEAL ANIMATIONS
   ========================================================================== */
function initSubpageInteractive() {
  // 1. Initialize Telemetry Simulator if on Privacy page
  if (document.getElementById('simStreamContainer')) {
    setTelemetryMode('orbit');
  }

  // 2. Subpage GSAP Staggered Scroll Triggers
  if (window.gsap && window.ScrollTrigger) {
    // Stat ribbon items
    gsap.utils.toArray('.saas-stat-ribbon .stat-ribbon-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: i * 0.08,
        ease: 'power2.out'
      });
    });

    // Bento cards
    gsap.utils.toArray('.about-bento-card, .creator-dossier-card, .download-platform-card, .perm-card, .arch-layer').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: 'power2.out'
      });
    });

    // Benchmark bar fills animate on scroll into view
    gsap.utils.toArray('.benchmark-bar-fill').forEach((bar) => {
      const targetWidth = bar.style.width;
      gsap.fromTo(bar,
        { width: '0%' },
        {
          scrollTrigger: {
            trigger: bar,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          width: targetWidth,
          duration: 1.1,
          ease: 'power3.out'
        }
      );
    });
  }
}

/* --- Privacy Page Simulator Controls --- */
const telemetryData = {
  orbit: [
    { text: '[DNS-SHIELD] Outgoing diagnostic socket requests: 0', badge: 'Blocked', class: 'blocked', badgeClass: 'badge-blocked' },
    { text: '[SQLITE-LOCAL] History & session vault: ~/Library/Orbit', badge: 'On-Device', class: 'blocked', badgeClass: 'badge-verified' },
    { text: '[OMNIBOX] Keystroke search queries: Local cache lookup only', badge: 'Private', class: 'blocked', badgeClass: 'badge-verified' },
    { text: '[TELEMETRY-DAEMON] Background ping daemons compiled: 0', badge: '100% Zero Pings', class: 'blocked', badgeClass: 'badge-blocked' }
  ],
  standard: [
    { text: 'POST /v2/analytics/device-profile [IDFA: fa91-827b]', badge: 'Leaked', class: 'leaked', badgeClass: 'badge-leaked' },
    { text: 'POST /telemetry/session-dwell-time [User Action Stream]', badge: 'Leaked', class: 'leaked', badgeClass: 'badge-leaked' },
    { text: 'GET /suggest/keystroke-ping?q=personal+search [Query text]', badge: 'Transmitted', class: 'leaked', badgeClass: 'badge-leaked' },
    { text: 'POST /ad/attribution/campaign-sync [Partner tokens]', badge: 'Leaked', class: 'leaked', badgeClass: 'badge-leaked' }
  ]
};

window.setTelemetryMode = function(mode) {
  const container = document.getElementById('simStreamContainer');
  const btnStandard = document.getElementById('simModeStandard');
  const btnOrbit = document.getElementById('simModeOrbit');
  const badgeText = document.getElementById('simStatusText');
  const badge = document.getElementById('simStatusBadge');

  if (!container) return;

  if (mode === 'orbit') {
    if (btnOrbit) btnOrbit.classList.add('active');
    if (btnStandard) btnStandard.classList.remove('active');
    if (badgeText) badgeText.textContent = '0 Outbound Telemetry Packets Detected';
    if (badge) {
      const dot = badge.querySelector('span');
      if (dot) dot.style.background = '#10B981';
    }
  } else {
    if (btnStandard) btnStandard.classList.add('active');
    if (btnOrbit) btnOrbit.classList.remove('active');
    if (badgeText) badgeText.textContent = '14 Outbound Diagnostic Packets Detected';
    if (badge) {
      const dot = badge.querySelector('span');
      if (dot) dot.style.background = '#EF4444';
    }
  }

  container.innerHTML = '';
  const items = telemetryData[mode] || telemetryData.orbit;
  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = `stream-item ${item.class}`;
    row.style.opacity = '0';
    row.style.transform = 'translateY(8px)';
    row.innerHTML = `
      <span>${item.text}</span>
      <span class="stream-badge ${item.badgeClass}">${item.badge}</span>
    `;
    container.appendChild(row);

    setTimeout(() => {
      row.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
    }, idx * 60);
  });
};

/* --- Open Source Developer Terminal Controls --- */
const terminalTabsData = {
  clone: {
    cmd: 'git clone https://github.com/parveenengg/Orbit.git',
    output: `Cloning into 'Orbit'...<br>remote: Enumerating objects: 1248, done.<br>remote: Counting objects: 100% (1248/1248), done.<br>remote: Compressing objects: 100% (612/612), done.<br>Receiving objects: 100% (1248/1248), 18.42 MiB | 14.20 MiB/s, done.<br>Resolving deltas: 100% (714/714), completed with 42 local branches.`
  },
  deps: {
    cmd: 'cd Orbit && flutter pub get',
    output: `Resolving dependencies in Orbit...<br>Downloading packages...<br>+ flutter_custom_tabs 2.1.0<br>+ sqflite 2.3.0<br>+ path_provider 2.1.1<br>Changed 18 dependencies!<br>All 18 packages are up to date. Zero telemetry dependencies found.`
  },
  mac: {
    cmd: 'flutter run -d macos --release',
    output: `Building macOS application...<br>Xcode build done. (4.2s)<br>Syncing files to device macOS...<br>Orbit (PID: 49201) launched.<br>[Engine] Native Impeller/Metal compositor bound at 120 FPS.<br>[Security] Zero outbound telemetry sockets initialized.`
  },
  android: {
    cmd: 'flutter build apk --split-per-abi',
    output: `Running Gradle task 'assembleRelease'...<br>Building with Sound Null Safety...<br>✓ Built build/app/outputs/flutter-apk/app-arm64-v8a-release.apk (27.8MB).<br>Zero proprietary Google tracking SDKs linked.`
  }
};

window.switchTerminalTab = function(tabId) {
  const tabs = document.querySelectorAll('.terminal-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  const activeTab = document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activeTab) activeTab.classList.add('active');

  const data = terminalTabsData[tabId] || terminalTabsData.clone;
  const cmdEl = document.getElementById('terminalCmdText');
  const outEl = document.getElementById('terminalOutput');

  if (cmdEl) cmdEl.textContent = data.cmd;
  if (outEl) {
    outEl.style.opacity = '0';
    setTimeout(() => {
      outEl.innerHTML = data.output;
      outEl.style.transition = 'opacity 0.25s ease';
      outEl.style.opacity = '1';
    }, 100);
  }
};

window.copyTerminalCommand = function() {
  const cmdEl = document.getElementById('terminalCmdText');
  const btn = document.getElementById('terminalCopyBtn');
  if (!cmdEl) return;

  navigator.clipboard.writeText(cmdEl.textContent).then(() => {
    if (btn) btn.textContent = 'Copied!';
    showToast('Command copied to clipboard!');
    setTimeout(() => {
      if (btn) btn.textContent = 'Copy';
    }, 2500);
  });
};

/* --- Download Hub Controls --- */
window.switchMacArch = function(arch) {
  const btnSilicon = document.getElementById('archSiliconBtn');
  const btnIntel = document.getElementById('archIntelBtn');
  const hashText = document.getElementById('macHashText');
  const dlBtn = document.getElementById('macDownloadBtn');

  if (arch === 'silicon') {
    if (btnSilicon) btnSilicon.classList.add('active');
    if (btnIntel) btnIntel.classList.remove('active');
    if (hashText) hashText.textContent = '932e81871003b12ccda0f6c17f5816a1bcaf13482fda6273d187c08dcf748bb4';
    if (dlBtn) dlBtn.textContent = 'Download Orbit for Apple Silicon (.dmg)';
  } else {
    if (btnIntel) btnIntel.classList.add('active');
    if (btnSilicon) btnSilicon.classList.remove('active');
    if (hashText) hashText.textContent = 'c8230b42f618a8b191c01e564d2847cf94837b0188ef77a284c01d9f8481be10';
    if (dlBtn) dlBtn.textContent = 'Download Orbit for Intel Mac (.dmg)';
  }
};

window.copyBrewCommand = function() {
  const btn = document.getElementById('brewCopyBtn');
  navigator.clipboard.writeText('brew install --cask orbit').then(() => {
    if (btn) btn.textContent = 'Copied!';
    showToast('Homebrew command copied!');
    setTimeout(() => {
      if (btn) btn.textContent = 'Copy Command';
    }, 2500);
  });
};

window.toggleQrHandoff = function() {
  const container = document.getElementById('qrCodeContainer');
  const btn = document.getElementById('toggleQrBtn');
  if (!container) return;

  if (container.style.display === 'none' || container.style.display === '') {
    container.style.display = 'block';
    if (btn) btn.textContent = '✕ Hide QR Code';
  } else {
    container.style.display = 'none';
    if (btn) btn.textContent = '📱 Scan QR to Install on Mobile';
  }
};

window.handleNotifySubmit = function(e) {
  e.preventDefault();
  const input = document.getElementById('notifyEmailInput');
  const btn = document.getElementById('notifySubmitBtn');
  const msg = document.getElementById('notifySuccessMsg');

  if (input && input.value) {
    if (btn) btn.textContent = 'Saved!';
    if (msg) msg.style.display = 'block';
    showToast(`Subscribed ${input.value} for launch notification!`);
    input.disabled = true;
    if (btn) btn.disabled = true;
  }
};
