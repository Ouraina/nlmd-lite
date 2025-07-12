import { supabase } from '../config/supabase';

export interface CheckoutSessionRequest {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  // 🚀 TEMPORARILY BYPASSING PAYMENT PROCESSING FOR LAUNCH
  // TODO: Re-enable once Edge Function is fixed
  
  // Simulate a successful checkout session creation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Add loading effect
  
  // Return a mock successful response that redirects to success page
  return {
    sessionId: 'temp_session_' + Date.now(),
    url: request.successUrl + '?temp_signup=true&plan=' + encodeURIComponent(request.priceId)
  };

  /* ORIGINAL PAYMENT CODE - WILL RE-ENABLE AFTER LAUNCH
  // Use the real Supabase Edge Function with correct parameter names
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      price_id: request.priceId,        // Convert camelCase to snake_case
      success_url: request.successUrl,  // Convert camelCase to snake_case
      cancel_url: request.cancelUrl,    // Convert camelCase to snake_case
      mode: request.mode
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('Stripe checkout error:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }

  if (!data?.url) {
    throw new Error('No checkout URL returned from payment processor');
  }

  return {
    sessionId: data.sessionId || 'unknown',
    url: data.url
  };
  */
};