/**
 * ORBIT WEBSITE — SUPABASE CLIENT
 *
 * This file initialises the Supabase JS client for the Orbit website.
 * It is ONLY used for:
 *   1. Receiving voluntary support/feedback form submissions from website visitors.
 *   2. (Future) Serving signed download URLs for APK, DMG, and EXE release files
 *      stored in Supabase Storage.
 *
 * SECURITY NOTES:
 *   - Only the public ANON key is used here. This key is safe for client-side use.
 *   - The SERVICE ROLE key must NEVER appear in this file or any client-side code.
 *   - Row-Level Security (RLS) policies on the Supabase side restrict what the
 *     anon key can read or write. Submissions are write-only for anonymous users.
 *   - File uploads to Supabase Storage go to a restricted bucket with a maximum
 *     file size and allowed MIME type list enforced at the storage policy level.
 *
 * CREDENTIALS:
 *   Replace ORBIT_SUPABASE_URL and ORBIT_SUPABASE_ANON_KEY below with your
 *   real values from: Supabase Dashboard -> Project Settings -> API.
 *
 *   These values are public/non-secret by design (anon key).
 *   Do NOT paste your service_role key here.
 */

// -- Orbit Website Supabase Configuration ------------------------------------
const ORBIT_SUPABASE_URL      = 'https://eavmenxdvilivkagahuv.supabase.co';
const ORBIT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdm1lbnhkdmlsaXZrYWdhaHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4ODA5MTUsImV4cCI6MjEwNjQ1NjkxNX0.1yfJOCYgfkKUGc3ryWOwfHnWBSMu0C33GHzIQj4_z4c';
// -----------------------------------------------------------------------------

/**
 * Initialise a lightweight Supabase REST client without the full SDK bundle.
 * This avoids pulling in a heavy dependency for a simple static site.
 * It exposes only the methods the Orbit website actually uses.
 */
const OrbitSupabase = (() => {
  const configured =
    ORBIT_SUPABASE_URL !== 'REPLACE_WITH_YOUR_SUPABASE_PROJECT_URL' &&
    ORBIT_SUPABASE_ANON_KEY !== 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

  if (!configured) {
    console.warn('[Orbit] Supabase credentials not yet configured. Form submissions will not be saved.');
  }

  const headers = {
    'Content-Type':  'application/json',
    'apikey':        ORBIT_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${ORBIT_SUPABASE_ANON_KEY}`,
    'Prefer':        'return=minimal',
  };

  /**
   * insertRow -- Insert a single row into a Supabase table via the REST API.
   * @param {string} table   - The table name (e.g. 'support_submissions')
   * @param {object} payload - Plain object of column: value pairs
   * @returns {Promise<{ok: boolean, error: string|null}>}
   */
  async function insertRow(table, payload) {
    if (!configured) {
      return { ok: false, error: 'Supabase not configured' };
    }
    try {
      const res = await fetch(`${ORBIT_SUPABASE_URL}/rest/v1/${table}`, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { ok: false, error: body || `HTTP ${res.status}` };
      }
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  /**
   * uploadFile -- Upload a file to a PRIVATE Supabase Storage bucket.
   * Used for optional screenshot attachments on support submissions.
   * Attachments are stored in a private bucket so they cannot be publicly enumerated or retrieved.
   *
   * @param {string} bucket - Storage bucket name (e.g. 'support-attachments')
   * @param {string} path   - Object path within the bucket
   * @param {File}   file   - The File object to upload
   * @returns {Promise<{ok: boolean, storagePath: string|null, error: string|null}>}
   */
  async function uploadFile(bucket, path, file) {
    if (!configured) {
      return { ok: false, storagePath: null, error: 'Supabase not configured' };
    }
    try {
      const uploadHeaders = {
        'apikey':        ORBIT_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${ORBIT_SUPABASE_ANON_KEY}`,
        'Content-Type':  file.type,
        'x-upsert':      'false',
      };
      const res = await fetch(
        `${ORBIT_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
        { method: 'POST', headers: uploadHeaders, body: file }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { ok: false, storagePath: null, error: body || `HTTP ${res.status}` };
      }
      // Return internal storage path (private object reference)
      const storagePath = `${bucket}/${path}`;
      return { ok: true, storagePath, error: null };
    } catch (err) {
      return { ok: false, storagePath: null, error: err.message };
    }
  }

  return { insertRow, uploadFile, isConfigured: () => configured };
})();

// Expose globally so support-form.js can call it
window.OrbitSupabase = OrbitSupabase;
