-- Add Stripe tables for payment processing

-- 1. STRIPE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- 2. STRIPE SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  subscription_id TEXT UNIQUE,
  price_id TEXT,
  status TEXT,
  subscription_status TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  founders BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. STRIPE ORDERS TABLE (for one-time payments)
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id TEXT UNIQUE NOT NULL,
  payment_intent_id TEXT,
  customer_id TEXT REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  amount_subtotal BIGINT,
  amount_total BIGINT,
  currency TEXT,
  payment_status TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_checkout_session_id ON stripe_orders(checkout_session_id);

-- 5. RLS POLICIES
-- Users can only see their own stripe data
DROP POLICY IF EXISTS "Users can view their own stripe customers" ON stripe_customers;
CREATE POLICY "Users can view their own stripe customers"
  ON stripe_customers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own stripe customers" ON stripe_customers;
CREATE POLICY "Users can manage their own stripe customers"
  ON stripe_customers FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Subscriptions can be viewed by the customer's user
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON stripe_subscriptions FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
  ));

-- Orders can be viewed by the customer's user
DROP POLICY IF EXISTS "Users can view their own orders" ON stripe_orders;
CREATE POLICY "Users can view their own orders"
  ON stripe_orders FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
  ));

-- Service role can manage all stripe data (for Edge Functions)
DROP POLICY IF EXISTS "Service role can manage stripe customers" ON stripe_customers;
CREATE POLICY "Service role can manage stripe customers"
  ON stripe_customers FOR ALL TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can manage stripe subscriptions" ON stripe_subscriptions;
CREATE POLICY "Service role can manage stripe subscriptions"
  ON stripe_subscriptions FOR ALL TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can manage stripe orders" ON stripe_orders;
CREATE POLICY "Service role can manage stripe orders"
  ON stripe_orders FOR ALL TO service_role
  USING (true); 