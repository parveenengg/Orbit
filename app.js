/**
 * ORBIT BROWSER — INTERACTIVE APPLICATION ENGINE
 * Vanilla JS · High Performance · Zero Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initSpotlight();
  initNavScroll();
  initOsDetection();
  initInteractiveSimulator();
});

/* ==========================================================================
   1. Dynamic Cursor Spotlight (Apple / Linear Aesthetic)
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
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   3. OS Auto-Detection & Dynamic Conversion Button
   ========================================================================== */
function initOsDetection() {
  const primaryHeroCta = document.getElementById('primaryHeroCta');
  const primaryCtaText = document.getElementById('primaryCtaText');
  const navBtnLabel = document.getElementById('navBtnLabel');
  const userAgent = navigator.userAgent.toLowerCase();

  const isAndroid = /android/i.test(userAgent);
  const isMac = /macintosh|mac os x/i.test(userAgent);
  const isWindows = /windows/i.test(userAgent);

  if (isAndroid) {
    if (primaryCtaText) primaryCtaText.textContent = 'Download Orbit APK (28 MB)';
    if (primaryHeroCta) {
      primaryHeroCta.setAttribute('href', 'downloads/Orbit.apk');
      primaryHeroCta.setAttribute('download', 'Orbit.apk');
    }
    if (navBtnLabel) navBtnLabel.textContent = 'Get APK';
  } else if (isMac) {
    if (primaryCtaText) primaryCtaText.textContent = 'Download for Mac (Universal)';
    if (primaryHeroCta) {
      primaryHeroCta.setAttribute('href', '#download');
      primaryHeroCta.addEventListener('click', (e) => {
        // Smooth scroll to download platform section
      });
    }
    if (navBtnLabel) navBtnLabel.textContent = 'Get Orbit for Mac';
  } else if (isWindows) {
    if (primaryCtaText) primaryCtaText.textContent = 'Download APK or Join PC Beta';
    if (navBtnLabel) navBtnLabel.textContent = 'Get Orbit';
  }
}

/* ==========================================================================
   4. Interactive Browser Simulator Tab Switcher
   ========================================================================== */
function switchSimulatorTab(tabNumber) {
  // Update Tab Buttons
  for (let i = 1; i <= 3; i++) {
    const btn = document.getElementById(`tabBtn${i}`);
    const view = document.getElementById(`canvasView${i}`);
    if (btn) {
      if (i === tabNumber) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    }
    if (view) {
      if (i === tabNumber) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    }
  }

  // Update Simulated URL bar text
  const urlDisplay = document.getElementById('simulatorUrlText');
  if (urlDisplay) {
    if (tabNumber === 1) {
      urlDisplay.textContent = 'orbit://start';
    } else if (tabNumber === 2) {
      urlDisplay.textContent = 'orbit://telemetry-inspector';
    } else if (tabNumber === 3) {
      urlDisplay.textContent = 'orbit://hardware-benchmark';
    }
  }
}

function initInteractiveSimulator() {
  // Allow clicking on search pill inside simulator to focus
  const searchInput = document.getElementById('simSearchInput');
  if (searchInput) {
    searchInput.addEventListener('click', () => {
      searchInput.removeAttribute('readonly');
      searchInput.focus();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        showToast(`Simulating instant search in Orbit: "${searchInput.value}"`);
        searchInput.setAttribute('readonly', 'true');
      }
    });
  }
}

function selectSearchEngine(engineId, icon, name) {
  // Update Active Pill
  const pills = document.querySelectorAll('.engine-pill');
  pills.forEach((pill) => {
    if (pill.textContent.toLowerCase().includes(name.toLowerCase()) || pill.getAttribute('onclick')?.includes(engineId)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Update Icon
  const iconEl = document.getElementById('activeEngineIcon');
  if (iconEl) iconEl.textContent = icon;

  // Update Input & notify
  const searchInput = document.getElementById('simSearchInput');
  if (searchInput) {
    searchInput.placeholder = `Search with ${name} (zero dev-tracking)...`;
    searchInput.value = '';
  }

  showToast(`Default search engine set to ${name} (no dev-tracking).`);
}

/* ==========================================================================
   5. Cryptographic Checksum Copy Action
   ========================================================================== */
function copyChecksum() {
  const hashText = document.getElementById('apkSha256')?.innerText || '932e81871003b12ccda0f6c17f5816a1bcaf13482fda6273d187c08dcf748bb4';
  const copyBtn = document.getElementById('copyHashBtn');

  navigator.clipboard.writeText(hashText).then(() => {
    if (copyBtn) copyBtn.textContent = 'Copied!';
    showToast('SHA-256 Checksum copied to clipboard!');
    setTimeout(() => {
      if (copyBtn) copyBtn.textContent = 'Copy Hash';
    }, 2500);
  }).catch(() => {
    showToast('Checksum: ' + hashText.substring(0, 16) + '...');
  });
}

/* ==========================================================================
   6. FAQ Accordion Toggle
   ========================================================================== */
function toggleFaq(buttonElement) {
  const parentItem = buttonElement.closest('.faq-item');
  if (!parentItem) return;

  const isOpen = parentItem.classList.contains('open');

  // Optional: close other open items for an accordion feel
  document.querySelectorAll('.faq-item').forEach((item) => {
    if (item !== parentItem) {
      item.classList.remove('open');
    }
  });

  if (isOpen) {
    parentItem.classList.remove('open');
  } else {
    parentItem.classList.add('open');
  }
}

/* ==========================================================================
   7. Platform Notice Toast
   ========================================================================== */
function showPlatformNotice(platform) {
  if (platform === 'mac') {
    showToast('macOS Universal build package is preparing for immediate download.');
  }
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(120px)';
    toast.style.opacity = '0';
  }, 3500);
}
