/**
 * ORBIT BROWSER — MINIMAL SAAS INTERACTIVITY
 * Three.js + GSAP + Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  initSpotlight();
  initNavScroll();
  initOsDetection();
  initGsapAnimations();
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
  if (!window.gsap) return;

  gsap.from('.hero-pill', {
    opacity: 0,
    y: -20,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.hero-title', {
    opacity: 0,
    y: 30,
    duration: 1.2,
    delay: 0.2,
    ease: 'power3.out'
  });

  gsap.from('.hero-sub', {
    opacity: 0,
    y: 20,
    duration: 1.2,
    delay: 0.4,
    ease: 'power3.out'
  });

  gsap.from('.hero-actions', {
    opacity: 0,
    y: 20,
    duration: 1.2,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.simulator-wrapper', {
    opacity: 0,
    y: 40,
    duration: 1.4,
    delay: 0.7,
    ease: 'power3.out'
  });
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
    toast.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; background: rgba(14, 14, 22, 0.95); border: 1px solid rgba(59, 130, 246, 0.4); color: #FFFFFF; padding: 0.8rem 1.3rem; border-radius: 12px; font-size: 0.875rem; backdrop-filter: blur(12px); transform: translateY(120px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000;';
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
