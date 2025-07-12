-- 1. NOTEBOOKS TABLE
CREATE TABLE IF NOT EXISTS notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  notebook_url TEXT,
  tags TEXT[],
  category TEXT,
  author TEXT,
  institution TEXT,
  quality_score FLOAT,
  carbon_footprint_grams INT,
  energy_efficiency_rating TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notebooks" ON notebooks;
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. SCRAPED ITEMS
CREATE TABLE IF NOT EXISTS scraped_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid,
  title TEXT,
  description TEXT,
  source_url TEXT,
  source_platform TEXT,
  author TEXT,
  institution TEXT,
  published_date TEXT,
  tags TEXT[],
  category TEXT,
  quality_score FLOAT,
  relevance_score FLOAT,
  estimated_compute_hours FLOAT,
  carbon_footprint_grams INT,
  energy_efficiency_rating TEXT,
  processing_status TEXT,
  discovered_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  imported_at TIMESTAMPTZ
);

ALTER TABLE scraped_items ENABLE ROW LEVEL SECURITY;

-- 3. SCRAPING OPERATIONS
CREATE TABLE IF NOT EXISTS scraping_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  operation_name TEXT,
  source_platform TEXT,
  search_query TEXT,
  max_results INT,
  status TEXT,
  items_discovered INT,
  items_processed INT,
  start_time TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE scraping_operations ENABLE ROW LEVEL SECURITY;

-- 4. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  research_areas TEXT[],
  preferred_platforms TEXT[],
  sustainability_priority FLOAT,
  quality_threshold FLOAT,
  max_compute_hours FLOAT,
  preferred_categories TEXT[],
  language_preferences TEXT[],
  data_sharing_consent BOOLEAN,
  analytics_consent BOOLEAN
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. NOTEBOOK INTERACTIONS
CREATE TABLE IF NOT EXISTS notebook_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  interaction_type TEXT,
  interaction_value FLOAT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE notebook_interactions ENABLE ROW LEVEL SECURITY;

-- 6. AI RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  confidence_score FLOAT,
  reasoning TEXT,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- 7. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  sustainability_goals JSONB,
  settings JSONB,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 8. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 9. NOTEBOOK COMMENTS
CREATE TABLE IF NOT EXISTS notebook_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE notebook_comments ENABLE ROW LEVEL SECURITY;

-- 10. USER FOLLOWS
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 11. ENVIRONMENTAL IMPACT
CREATE TABLE IF NOT EXISTS environmental_impact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT,
  compute_hours FLOAT,
  carbon_footprint_grams INT,
  energy_consumed_kwh FLOAT,
  efficiency_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE environmental_impact ENABLE ROW LEVEL SECURITY;

-- 12. PLATFORM ANALYTICS
CREATE TABLE IF NOT EXISTS platform_analytics (
  metric_date DATE PRIMARY KEY,
  total_users INT,
  active_users INT,
  notebooks_discovered INT,
  notebooks_imported INT,
  total_carbon_saved INT,
  total_compute_optimized INT,
  avg_quality_score FLOAT,
  top_categories JSONB,
  sustainability_metrics JSONB
);

-- 13. INDEXES (add more as needed)
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_scraped_items_operation_id ON scraped_items(operation_id);
CREATE INDEX IF NOT EXISTS idx_scraping_operations_user_id ON scraping_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_interactions_user_id ON notebook_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_comments_notebook_id ON notebook_comments(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_comments_user_id ON notebook_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_id ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_environmental_impact_user_id ON environmental_impact(user_id);

-- 14. BASIC RLS POLICIES (add more as needed)
-- Example: Only allow users to see their own data
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Repeat similar policies for other tables as needed...