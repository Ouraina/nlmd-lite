export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_ScxZhitBzeOVmQ',
    priceId: 'price_1Rhhe1KsRdoxChUx71oFwpik',
    name: 'Standard Plan',
    description: 'Our most popular offering, the Standard Plan provides the perfect balance of features and value. Enjoy full access to our extensive notebook library, track your basic environmental impact, and upload a limited number of your own notebooks to the platform.',
    mode: 'subscription',
    price: 9.99
  },
  {
    id: 'prod_ScxYSq2CAkQYEv',
    priceId: 'price_1RhhczKsRdoxChUxzmp3FJO1',
    name: 'Explorer',
    description: 'Get started with our essential features. The Explorer plan provides basic access to the platform and allows for limited notebook viewing. Perfect for trying things out',
    mode: 'subscription',
    price: 0.00
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};