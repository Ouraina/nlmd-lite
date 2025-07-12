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

  // Development mock - just redirect to success page
  console.log('Mock payment processing for development');
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    sessionId: 'mock_session_' + Date.now(),
    url: request.successUrl + '?session_id=mock_session_' + Date.now()
  };
};