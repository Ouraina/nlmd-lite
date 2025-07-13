import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

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
    console.log(`🚀 Edge Function: ${req.method} request to stripe-checkout`);
    
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling OPTIONS request');
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    console.log('📝 Processing POST request');
    
    // Parse request body
    const requestBody = await req.json();
    console.log('📥 Request body:', requestBody);
    
    const { price_id, success_url, cancel_url, mode } = requestBody;
    
    if (!price_id || !success_url || !cancel_url) {
      console.log('❌ Missing required parameters:', { price_id, success_url, cancel_url });
      return corsResponse({ error: 'Missing required parameters' }, 400);
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('🔑 Stripe key status:', {
      exists: !!stripeSecretKey,
      prefix: stripeSecretKey?.substring(0, 10),
      length: stripeSecretKey?.length
    });
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      console.error('🌍 Available environment variables:', Object.keys(Deno.env.toObject()));
      return corsResponse({ 
        error: 'Stripe configuration missing',
        details: 'Payment system is temporarily unavailable. Please contact support.',
        timestamp: new Date().toISOString()
      }, 500);
    }

    // Prepare Stripe request
    const stripeParams = new URLSearchParams({
      'mode': mode || 'subscription',
      'line_items[0][price]': price_id,
      'line_items[0][quantity]': '1',
      'success_url': success_url,
      'cancel_url': cancel_url,
    });

    console.log('💳 Stripe request params:', stripeParams.toString());

    // Create Stripe checkout session
    console.log('🔄 Making Stripe API call...');
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeParams.toString(),
    });

    console.log('📡 Stripe API response status:', stripeResponse.status);
    console.log('📡 Stripe API response headers:', Object.fromEntries(stripeResponse.headers.entries()));

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('❌ Stripe API error:', errorData);
      return corsResponse({ 
        error: 'Failed to create checkout session',
        stripeError: errorData,
        status: stripeResponse.status
      }, 500);
    }

    const session = await stripeResponse.json();
    console.log('✅ Stripe checkout session created:', {
      id: session.id,
      url: session.url,
      mode: session.mode,
      payment_status: session.payment_status
    });
    
    const response = {
      sessionId: session.id,
      url: session.url
    };
    
    console.log('📤 Returning response:', response);
    return corsResponse(response);
    
  } catch (error: any) {
    console.error(`💥 Edge Function error: ${error.message}`);
    console.error('📚 Stack:', error.stack);
    return corsResponse({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      type: 'edge_function_error'
    }, 500);
  }
});