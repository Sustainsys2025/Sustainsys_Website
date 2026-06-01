/**
 * SustainSys AI Academy — Stripe Checkout Integration
 * Handles redirecting users to Stripe Checkout for certification purchases.
 *
 * SETUP REQUIRED:
 * 1. Replace STRIPE_PUBLISHABLE_KEY with your real pk_live_... or pk_test_... key
 * 2. Replace SUPABASE_CHECKOUT_URL with your deployed Supabase Edge Function URL
 * 3. Replace the PRICE_IDS with real Stripe Price IDs from your dashboard
 *
 * Include Stripe.js BEFORE this script:
 *   <script src="https://js.stripe.com/v3/"></script>
 */

/* ── Configuration (replace with real values) ── */

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51THLW6Pq7EC8Teur7aaGbjZFuQIKQQUkHLjHFY3ewcYL1i9onhvXv9qXIc4PLbx0bb2nbvPLYM3DRX72Rd3ZX49P00Ol5lYWom';

// Supabase Edge Function that creates a Stripe Checkout session
const SUPABASE_CHECKOUT_URL = 'https://lubfkbvgrlvyjsrdzlyl.supabase.co/functions/v1/create-checkout';

// Stripe Price IDs — replace with real IDs from your Stripe Dashboard → Products
const PRICE_IDS = {
  // All-Access (one-time payment)
  'all-access': 'price_1THLeFPq7EC8TeurNvY8vvZm',

  // Individual Certifications (one-time payments)
  'ai-practitioner-associate': 'price_1THLekPq7EC8TeurVwXSBLSI',
  'ai-practitioner-advanced':  'price_1THLfFPq7EC8TeurzbofRSO0',
  'ai-solution-architect':     'price_1THLfXPq7EC8Teur0irCW2Sf',
  'ai-governance-risk-safety': 'price_1TdaKaPq7EC8TeurlKzvO0Jf',
};

// Display prices (shown on UI — keep in sync with Stripe prices)
const DISPLAY_PRICES = {
  'all-access': '£199.99',
  'ai-practitioner-associate': '£49.99',
  'ai-practitioner-advanced':  '£79.99',
  'ai-solution-architect':     '£99.99',
  'ai-governance-risk-safety': '£199',
};

// Map course IDs to product IDs (for entitlement matching)
const COURSE_TO_PRODUCT = {
  'associate':  'ai-practitioner-associate',
  'advanced':   'ai-practitioner-advanced',
  'architect':  'ai-solution-architect',
  'governance': 'ai-governance-risk-safety',
};

/* ── Stripe Checkout ── */

let _stripe = null;

function getStripe() {
  if (_stripe) return _stripe;
  if (typeof Stripe !== 'undefined') {
    _stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    return _stripe;
  }
  console.error('Stripe.js not loaded. Include <script src="https://js.stripe.com/v3/"></script>');
  return null;
}

/**
 * Redirect user to Stripe Checkout for a given product.
 * @param {string} productKey — key from PRICE_IDS (e.g. 'ai-practitioner-associate')
 */
async function startCheckout(productKey) {
  const stripe = getStripe();
  if (!stripe) {
    alert('Payment system is loading. Please try again in a moment.');
    return;
  }

  const priceId = PRICE_IDS[productKey];
  if (!priceId) {
    console.error('Unknown product key:', productKey);
    alert('This product is not configured yet. Please contact support.');
    return;
  }

  // Get the logged-in user
  const session = await supaGetSession();
  if (!session) {
    window.location.href = '../ai-learn.html#/login';
    return;
  }

  const user = session.user;

  try {
    // Call Supabase Edge Function to create a Checkout session
    const response = await fetch(SUPABASE_CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({
        priceId,
        userId: user.id,
        email: user.email,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Checkout failed: ${errText}`);
    }

    const { sessionId } = await response.json();
    await stripe.redirectToCheckout({ sessionId });

  } catch (err) {
    console.error('Checkout error:', err);
    alert('Unable to start checkout. Please try again or contact support.');
  }
}

/**
 * Start checkout for a specific course by course ID.
 * @param {string} courseId — 'associate', 'advanced', or 'architect'
 */
async function startCourseCheckout(courseId) {
  const productKey = COURSE_TO_PRODUCT[courseId];
  if (!productKey) {
    console.error('Unknown course ID:', courseId);
    return;
  }
  await startCheckout(productKey);
}

/**
 * Get the display price for a product.
 * @param {string} productKey — key from PRICE_IDS
 * @returns {string} formatted price string
 */
function getDisplayPrice(productKey) {
  return DISPLAY_PRICES[productKey] || '—';
}

/**
 * Get the display price for a course by course ID.
 * @param {string} courseId — 'associate', 'advanced', or 'architect'
 * @returns {string} formatted price string
 */
function getCoursePrice(courseId) {
  const productKey = COURSE_TO_PRODUCT[courseId];
  return productKey ? getDisplayPrice(productKey) : '—';
}
