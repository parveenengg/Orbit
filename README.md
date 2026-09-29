# Orbit — The Zero-Telemetry Web Browser

> **Browse without the noise.**  
> A minimal, privacy-focused open-source web browser engineered for pure focus, native speed, zero developer-side tracking, and distraction-free clarity.

---

## ⚡ Core Philosophy & Pillars

1. **100% Open Source & Zero Dev-Side Tracking**:
   - No telemetry engines, no analytics beacons, and no tracking code from our side.
   - What you browse stays strictly between you and your device.
2. **Search Engine Freedom**:
   - Choose which search engine you want to use (DuckDuckGo, Google, Brave Search, Startpage, Bing, or custom) with zero forced bias or corporate lock-in.
3. **Fast Form Filling**:
   - Instant, intelligent autofill designed for convenience while keeping your data under your control.
4. **Bookmarks Save & Restore**:
   - Cloud convenience kept strictly practical: effortlessly save and cleanly restore your bookmarks across sessions without ad profiling.
5. **Ultra-Minimalist Architecture**:
   - A lean 28MB native Android package, sub-millisecond responsiveness, and silent battery conservation.
   - No crypto wallets. No sponsored wallpapers. No unsolicited AI sidebars.

---

## 📦 Downloads & Verification

| Platform | Format | Status | Details |
| :--- | :--- | :--- | :--- |
| **Android** | `.apk` | **Available Now** | Direct High-Speed Download (v1.0.1 • 28MB) |
| **Android (Google Play)**| Play Store Link | *In Progress* | Store policy review currently underway |
| **macOS** | `.dmg` | **Universal** | Apple Silicon & Intel support |
| **Windows & Linux** | Native | *Beta* | Active development |

### 🔐 Cryptographic Checksum
To verify the integrity of the downloaded `Orbit.apk`:
```bash
shasum -a 256 downloads/Orbit.apk
```
**Expected SHA-256:**
```
932e81871003b12ccda0f6c17f5816a1bcaf13482fda6273d187c08dcf748bb4
```

---

## 🚀 Running the Landing Page Locally

```bash
# Start local dev server (with clean route rewrites matching Vercel)
python3 scripts/serve.py

# Open in your browser
http://localhost:8000
```

---

## 👤 Author
**Parveen Kumar**  
Engineered with the *Obvious Choice* philosophy.
