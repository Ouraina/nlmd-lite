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

  // Use the real Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: request,
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
};