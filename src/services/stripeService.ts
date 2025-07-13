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

  console.log('🔄 Creating checkout session with:', {
    priceId: request.priceId,
    mode: request.mode,
    successUrl: request.successUrl,
    cancelUrl: request.cancelUrl
  });

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
    console.error('❌ Stripe checkout error:', error);
    console.error('📊 Full error details:', JSON.stringify(error, null, 2));
    throw new Error(`Payment processing failed: ${error.message}`);
  }

  console.log('📥 Edge Function response:', data);

  if (!data?.url) {
    console.error('🔍 No checkout URL in response:', data);
    throw new Error('No checkout URL returned from payment processor');
  }

  console.log('✅ Checkout session created successfully:', {
    sessionId: data.sessionId,
    url: data.url
  });

  return {
    sessionId: data.sessionId || 'unknown',
    url: data.url
  };
};