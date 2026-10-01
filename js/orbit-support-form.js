/**
 * ORBIT WEBSITE — SUPPORT FORM HANDLER
 *
 * Handles the voluntary support / feedback / bug-report form at /support.
 *
 * WHAT IS SUBMITTED:
 *   The following fields are submitted to Supabase when a user clicks "Submit".
 *   Nothing is collected automatically -- every field requires deliberate user action.
 *
 *   Required:
 *     - report_type   (string) -- Selected category: "feedback", "bug", "feature", "support"
 *     - description   (string) -- Free-text message entered by the user
 *
 *   Optional (user may leave blank):
 *     - name            (string) -- Provided by the user; never inferred
 *     - email           (string) -- Provided by the user; used only if a response is needed
 *     - app_version     (string) -- Typed by the user; not automatically detected
 *     - platform        (string) -- Selected from a list by the user (Android, macOS, Web, Other)
 *     - steps           (string) -- Steps to reproduce, shown for bug reports only
 *     - attachment_path (string) -- Storage path of an uploaded screenshot/file in a private bucket
 *
 *   Automatically added by this code (not from the user):
 *     - submitted_at    (ISO timestamp) -- When the form was submitted
 *
 *   NOT collected:
 *     - IP address, device fingerprint, user-agent, or any other metadata
 *     - Browsing history, cookies, or session information
 *     - Any data beyond what the user explicitly types or selects
 *
 * ATTACHMENT RULES (if screenshot upload is enabled in the UI):
 *   - Maximum size: 5 MB
 *   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
 *   - Files are uploaded to the 'support-attachments' PRIVATE Supabase Storage bucket
 *   - The bucket is private (public = false). Files cannot be listed or read by anonymous visitors.
 *
 * SPAM PROTECTION:
 *   - Honeypot field: bots that fill a hidden field are silently ignored
 *   - Minimum fill time: submissions under 2 seconds are rejected
 *   - Rate limiting: minimum 15 seconds between submissions
 */

(() => {
  // Allowed MIME types for optional attachments
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB
  const ATTACHMENT_BUCKET = 'support-attachments';
  const SUPPORT_TABLE = 'support_submissions';

  const setupSupportForm = () => {
    const form = document.getElementById('orbitSupportForm');
    if (!form) return;

    // Track render time for bot-speed detection
    const renderTimestamp = Date.now();
    let lastSubmitTime = 0;
    let isSubmitting = false;

    // Show/hide "steps to reproduce" field based on report type
    const reportTypeSelect = form.querySelector('#reportType');
    const stepsGroup = form.querySelector('#stepsGroup');
    if (reportTypeSelect && stepsGroup) {
      const toggleSteps = () => {
        const show = reportTypeSelect.value === 'bug';
        stepsGroup.style.display = show ? '' : 'none';
        if (!show) {
          const ta = stepsGroup.querySelector('textarea');
          if (ta) ta.value = '';
        }
      };
      reportTypeSelect.addEventListener('change', toggleSteps);
      toggleSteps();
    }

    // File type / size validation for optional attachment
    const attachmentInput = form.querySelector('#screenshotAttachment');
    const attachmentStatus = form.querySelector('#attachmentStatus');
    if (attachmentInput) {
      attachmentInput.addEventListener('change', () => {
        const file = attachmentInput.files[0];
        if (!file) {
          if (attachmentStatus) attachmentStatus.textContent = '';
          return;
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          if (attachmentStatus) attachmentStatus.textContent = 'Only JPEG, PNG, WebP, or GIF images are accepted.';
          attachmentInput.value = '';
          return;
        }
        if (file.size > MAX_ATTACHMENT_BYTES) {
          if (attachmentStatus) attachmentStatus.textContent = 'File is too large. Maximum size is 5 MB.';
          attachmentInput.value = '';
          return;
        }
        if (attachmentStatus) attachmentStatus.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
      });
    }

    const statusEl  = form.querySelector('.orbit-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const showMessage = (msg, isError = false) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className   = 'orbit-form-status ' + (isError ? 'is-error' : 'is-success');
      statusEl.setAttribute('role', 'alert');
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      // Clear previous error states
      form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));

      // --- Spam protection ---
      const honeypot = form.querySelector('input[name="orbit_hp"]');
      if (honeypot && honeypot.value.trim() !== '') {
        showMessage('Thank you! Your feedback has been received.', false);
        form.reset();
        return;
      }
      const elapsedSeconds = (Date.now() - renderTimestamp) / 1000;
      if (elapsedSeconds < 2) {
        showMessage('Please take a moment before submitting.', true);
        return;
      }
      if (Date.now() - lastSubmitTime < 15000) {
        showMessage('Please wait a few seconds before submitting again.', true);
        return;
      }

      // --- Validation ---
      let hasError = false;

      const reportType = form.querySelector('#reportType');
      if (reportType && !reportType.value) {
        reportType.classList.add('has-error');
        reportType.setAttribute('aria-invalid', 'true');
        showMessage('Please select a report type.', true);
        reportType.focus();
        hasError = true;
      }

      const description = form.querySelector('#description');
      if (!hasError && description && description.value.trim().length < 10) {
        description.classList.add('has-error');
        description.setAttribute('aria-invalid', 'true');
        showMessage('Please provide at least a brief description (10 characters minimum).', true);
        description.focus();
        hasError = true;
      }

      const emailInput = form.querySelector('#contactEmail');
      if (!hasError && emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          emailInput.classList.add('has-error');
          emailInput.setAttribute('aria-invalid', 'true');
          showMessage('Please enter a valid email address, or leave it blank.', true);
          emailInput.focus();
          hasError = true;
        }
      }

      if (hasError) return;

      // --- Submit ---
      isSubmitting = true;
      lastSubmitTime = Date.now();
      if (submitBtn) submitBtn.disabled = true;
      showMessage('Submitting…', false);

      // Handle optional attachment upload (stored in private bucket)
      let attachmentPath = null;
      const attachFile = attachmentInput && attachmentInput.files[0];
      if (attachFile && window.OrbitSupabase) {
        const ext  = attachFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        showMessage('Uploading attachment…', false);
        const uploadResult = await window.OrbitSupabase.uploadFile(ATTACHMENT_BUCKET, path, attachFile);
        if (uploadResult.ok) {
          attachmentPath = uploadResult.storagePath;
        } else {
          console.warn('[Orbit] Attachment upload failed:', uploadResult.error);
          // Don't block the submission -- proceed without attachment
        }
      }

      // Build the payload -- only what the user has explicitly provided
      const payload = {
        report_type:    reportType ? reportType.value : 'feedback',
        description:    description ? description.value.trim() : '',
        submitted_at:   new Date().toISOString(),
      };

      const nameInput     = form.querySelector('#contactName');
      const platformInput = form.querySelector('#platform');
      const versionInput  = form.querySelector('#appVersion');
      const stepsInput    = form.querySelector('#stepsToReproduce');

      if (nameInput && nameInput.value.trim())       payload.name            = nameInput.value.trim();
      if (emailInput && emailInput.value.trim())     payload.email           = emailInput.value.trim();
      if (platformInput && platformInput.value)      payload.platform        = platformInput.value;
      if (versionInput && versionInput.value.trim()) payload.app_version     = versionInput.value.trim();
      if (stepsInput && stepsInput.value.trim())     payload.steps           = stepsInput.value.trim();
      if (attachmentPath)                            payload.attachment_path = attachmentPath;

      // Attempt Supabase submission
      let submitted = false;
      if (window.OrbitSupabase && window.OrbitSupabase.isConfigured()) {
        const result = await window.OrbitSupabase.insertRow(SUPPORT_TABLE, payload);
        if (result.ok) {
          submitted = true;
        } else {
          console.error('[Orbit] Supabase submission error:', result.error);
        }
      }

      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;

      if (submitted) {
        showMessage('Thank you — your submission has been received. We appreciate your feedback.', false);
        form.reset();
        if (stepsGroup) stepsGroup.style.display = 'none';
        if (attachmentStatus) attachmentStatus.textContent = '';
      } else if (!window.OrbitSupabase || !window.OrbitSupabase.isConfigured()) {
        // Supabase not yet wired up -- give a clear developer-facing message
        showMessage('Support form backend is not yet configured. Please contact us via GitHub Issues.', true);
      } else {
        showMessage('There was a problem submitting your report. Please try again or use GitHub Issues.', true);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSupportForm);
  } else {
    setupSupportForm();
  }
})();
