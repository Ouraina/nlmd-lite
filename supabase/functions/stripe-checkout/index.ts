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
    
    // For now, just return a test response
    return corsResponse({ 
      message: 'Edge Function is working!', 
      timestamp: new Date().toISOString() 
    });
    
  } catch (error: any) {
    console.error(`Edge Function error: ${error.message}`);
    console.error('Stack:', error.stack);
    return corsResponse({ error: error.message }, 500);
  }
});