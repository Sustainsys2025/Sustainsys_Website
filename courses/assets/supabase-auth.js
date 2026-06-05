/**
 * SustainSys AI Academy — Supabase Auth & Enrollment
 * Shared across website pages, synced with mobile app.
 * Uses same Supabase project as the React Native mobile app.
 */

const SUPABASE_URL = 'https://lubfkbvgrlvyjsrdzlyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_us_GrBiHO7DwNTFVE3zMPw_VSVgr1QS';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return _supabase;
  }
  console.error('Supabase SDK not loaded');
  return null;
}

/* ── Auth helpers ─────────────────────────────────────── */

async function supaSignUp({ email, password, firstName, lastName }) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
      },
    },
  });

  if (error) throw error;
  return data;
}

async function supaSignIn({ email, password }) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign in (or sign up) with Google OAuth via Supabase.
 * Requires the Google provider to be enabled in Supabase dashboard
 * (Authentication → Providers → Google).
 *
 * @param {string} [redirectTo] - URL to land on after successful auth.
 *                                Defaults to /courses/index.html on the current origin.
 */
async function supaSignInWithGoogle(redirectTo) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const defaultRedirect = `${window.location.origin}/courses/index.html`;
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || defaultRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

async function supaSignOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

async function supaGetSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function supaGetUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function supaGetProfile(userId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function supaForgotPassword(email) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/* ── Enrollment helpers ──────────────────────────────── */

async function supaGetEnrollments() {
  const sb = getSupabase();
  if (!sb) return [];
  const user = await supaGetUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false });

  if (error) { console.warn('Enrollments fetch failed:', error.message); return []; }
  return data || [];
}

async function supaGetEnrollmentsByType(itemType) {
  const sb = getSupabase();
  if (!sb) return [];
  const user = await supaGetUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_type', itemType)
    .order('enrolled_at', { ascending: false });

  if (error) { console.warn('Enrollments fetch failed:', error.message); return []; }
  return data || [];
}

async function supaIsEnrolled(itemId, itemType) {
  const sb = getSupabase();
  if (!sb) return null;
  const user = await supaGetUser();
  if (!user) return null;

  const { data, error } = await sb
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .maybeSingle();

  if (error) { console.warn('Enrollment check failed:', error.message); return null; }
  return data;
}

async function supaEnroll(itemId, itemType) {
  const sb = getSupabase();
  if (!sb) return null;
  const user = await supaGetUser();
  if (!user) return null;

  const existing = await supaIsEnrolled(itemId, itemType);
  if (existing) return existing;

  const { data, error } = await sb
    .from('enrollments')
    .insert({ user_id: user.id, item_id: itemId, item_type: itemType, status: 'active', progress: 0 })
    .select()
    .single();

  if (error) { console.warn('Enroll failed:', error.message); return null; }
  return data;
}

async function supaUnenroll(enrollmentId) {
  const sb = getSupabase();
  if (!sb) return false;
  await sb.from('lesson_progress').delete().eq('enrollment_id', enrollmentId);
  const { error } = await sb.from('enrollments').delete().eq('id', enrollmentId);
  if (error) { console.warn('Unenroll failed:', error.message); return false; }
  return true;
}

/* ── Entitlement helpers (Stripe-backed) ────────────── */

/**
 * Get all active entitlements for the current user.
 * Entitlements are created by the Stripe webhook — read-only from the client.
 */
async function supaGetEntitlements() {
  const sb = getSupabase();
  if (!sb) return [];
  const user = await supaGetUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('entitlements')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) { console.warn('Entitlements fetch failed:', error.message); return []; }

  // Filter out expired entitlements client-side
  const now = new Date().toISOString();
  return (data || []).filter(e => !e.expires_at || e.expires_at > now);
}

/**
 * Check if the user has an active all-access subscription.
 */
async function supaHasAllAccess() {
  const entitlements = await supaGetEntitlements();
  return entitlements.some(
    e => e.product_type === 'subscription' && e.product_id === 'all-access'
  );
}

/**
 * Check if the user has access to a specific certification.
 * Access is granted via all-access subscription OR individual certification purchase.
 */
async function supaHasEntitlement(certificationId) {
  const entitlements = await supaGetEntitlements();

  // All-access subscription grants everything
  const hasSub = entitlements.some(
    e => e.product_type === 'subscription' && e.product_id === 'all-access'
  );
  if (hasSub) return true;

  // Check for specific certification purchase
  return entitlements.some(
    e => e.product_type === 'certification' && e.product_id === certificationId
  );
}

/**
 * Check if user has any premium access at all.
 */
async function supaHasAnyEntitlement() {
  const entitlements = await supaGetEntitlements();
  return entitlements.length > 0;
}

/**
 * Get a map of certification IDs the user has paid access to.
 * Returns { hasAllAccess: boolean, certifications: Set<string> }
 */
async function supaGetAccessMap() {
  const entitlements = await supaGetEntitlements();
  const result = { hasAllAccess: false, certifications: new Set() };

  for (const e of entitlements) {
    if (e.product_type === 'subscription' && e.product_id === 'all-access') {
      result.hasAllAccess = true;
    }
    if (e.product_type === 'certification') {
      result.certifications.add(e.product_id);
    }
  }

  return result;
}

/* ── Auth state listener ─────────────────────────────── */

function onAuthStateChange(callback) {
  const sb = getSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
