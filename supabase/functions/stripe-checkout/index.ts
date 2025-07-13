import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(
    body ? JSON.stringify(body) : null,
    {
      status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
}

Deno.serve(async (req) => {
  try {
    console.log(`Received ${req.method} request to stripe-checkout`);
    
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    console.log('Processing POST request');
    
    // Parse request body
    const { price_id, success_url, cancel_url, mode } = await req.json();
    
    if (!price_id || !success_url || !cancel_url) {
      return corsResponse({ error: 'Missing required parameters' }, 400);
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found in environment');
      return corsResponse({ error: 'Stripe configuration missing' }, 500);
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': mode || 'subscription',
        'line_items[0][price]': price_id,
        'line_items[0][quantity]': '1',
        'success_url': success_url,
        'cancel_url': cancel_url,
      }).toString(),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', errorData);
      return corsResponse({ error: 'Failed to create checkout session' }, 500);
    }

    const session = await stripeResponse.json();
    
    console.log('Stripe checkout session created:', session.id);
    
    return corsResponse({
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error: any) {
    console.error(`Edge Function error: ${error.message}`);
    console.error('Stack:', error.stack);
    return corsResponse({ error: error.message }, 500);
  }
});