export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  foundersSpecial?: boolean;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_S1fpVKDzS8f2d0',
    priceId: 'price_1Rk17PKsRdoxChLxhLF22XWX',
    name: "Founder's Special",
    description: 'Founders Launch Special: Get PRO features for life at this rate – no price increases, ever! Unlimited notebook discovery & search, AI-powered recommendations, Carbon impact dashboard, Priority support & early access, Exclusive Founders badge, All future PRO features included, Rate locked forever – support the vision! Join the pioneers building the "Ecosystem for Human Thought".',
    mode: 'subscription',
    price: 12.99,
    foundersSpecial: true
  },
  {
    id: 'prod_ScxYSq2CAkQYEv',
    priceId: 'price_1RhhczKsRdoxChUxzmp3FJO1',
    name: 'Explorer',
    description: 'Get started with essential features. The Explorer plan provides basic access to the platform and allows for limited notebook viewing. Perfect for trying things out.',
    mode: 'subscription',
    price: 0.00
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};