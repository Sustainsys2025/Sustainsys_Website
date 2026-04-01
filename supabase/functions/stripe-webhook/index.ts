// @ts-ignore - Supabase Edge Runtime types
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Map Stripe Price IDs to product identifiers used in the entitlements table.
 * UPDATE THESE with your real Stripe Price IDs from the dashboard.
 */
const PRICE_TO_PRODUCT: Record<string, { product_type: string; product_id: string }> = {
  // Individual certifications (one-time payments)
  "price_1THLekPq7EC8TeurVwXSBLSI": { product_type: "certification", product_id: "ai-practitioner-associate" },
  "price_1THLfFPq7EC8TeurzbofRSO0":  { product_type: "certification", product_id: "ai-practitioner-advanced" },
  "price_1THLfXPq7EC8Teur0irCW2Sf": { product_type: "certification", product_id: "ai-solution-architect" },

  // All-Access (one-time payment)
  "price_1THLeFPq7EC8TeurNvY8vvZm": { product_type: "subscription", product_id: "all-access" },
};

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new Response("No signature", { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Handle events ──
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id || session.client_reference_id;

        if (!userId) {
          console.error("No user ID in checkout session");
          break;
        }

        if (session.mode === "payment") {
          // One-time payment — grant lifetime access
          // Expand line_items to get the price ID
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items.data.price"],
          });

          for (const item of fullSession.line_items?.data || []) {
            const priceId = item.price?.id;
            const productInfo = priceId ? PRICE_TO_PRODUCT[priceId] : null;

            if (productInfo) {
              await supabase.from("entitlements").upsert(
                {
                  user_id: userId,
                  product_type: productInfo.product_type,
                  product_id: productInfo.product_id,
                  stripe_customer_id: session.customer as string,
                  stripe_payment_intent_id: session.payment_intent as string,
                  status: "active",
                  starts_at: new Date().toISOString(),
                  expires_at: null, // Lifetime access for one-time purchases
                },
                { onConflict: "user_id,product_id,status" }
              );
              console.log(`Granted ${productInfo.product_id} to user ${userId}`);
            } else {
              console.warn(`Unknown price ID: ${priceId}`);
            }
          }
        }

        if (session.mode === "subscription") {
          // Subscription — grant access with expiry
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          for (const item of subscription.items.data) {
            const priceId = item.price.id;
            const productInfo = PRICE_TO_PRODUCT[priceId];

            if (productInfo) {
              await supabase.from("entitlements").upsert(
                {
                  user_id: userId,
                  product_type: productInfo.product_type,
                  product_id: productInfo.product_id,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscriptionId,
                  status: "active",
                  starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
                  expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                },
                { onConflict: "user_id,product_id,status" }
              );
              console.log(`Granted subscription ${productInfo.product_id} to user ${userId}`);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabase_user_id;

        // Update expiry and status
        for (const item of subscription.items.data) {
          const priceId = item.price.id;
          const productInfo = PRICE_TO_PRODUCT[priceId];

          if (productInfo && supabaseUserId) {
            const newStatus = subscription.status === "active" ? "active" : "expired";
            await supabase
              .from("entitlements")
              .update({
                status: newStatus,
                expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
                cancelled_at: subscription.canceled_at
                  ? new Date(subscription.canceled_at * 1000).toISOString()
                  : null,
              })
              .eq("user_id", supabaseUserId)
              .eq("product_id", productInfo.product_id)
              .eq("stripe_subscription_id", subscription.id);

            console.log(`Updated subscription for user ${supabaseUserId}: ${newStatus}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabase_user_id;

        if (supabaseUserId) {
          await supabase
            .from("entitlements")
            .update({
              status: "expired",
              cancelled_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id)
            .eq("user_id", supabaseUserId);

          console.log(`Expired subscription for user ${supabaseUserId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
