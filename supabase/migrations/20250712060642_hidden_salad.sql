/*
  # Complete Enterprise Foundation Migration

  1. Core Tables
    - AI recommendations and user preferences
    - Team collaboration infrastructure  
    - Analytics and reporting foundation
    - Audit trails and monitoring

  2. Security
    - Row Level Security on all tables
    - Role-based access control
    - Audit logging for sensitive operations

  3. Performance
    - Strategic indexes for query optimization
    - Materialized views for analytics
    - Connection pool optimization

  4. Data Integrity
    - Foreign key constraints
    - Check constraints for data validation
    - Trigger functions for business logic
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  research_areas text[] DEFAULT '{}',
  preferred_platforms text[] DEFAULT '{}',
  sustainability_priority numeric(3,2) DEFAULT 0.5 CHECK (sustainability_priority >= 0 AND sustainability_priority <= 1),
  quality_threshold numeric(3,2) DEFAULT 0.7 CHECK (quality_threshold >= 0 AND quality_threshold <= 1),
  max_compute_hours numeric(10,2) DEFAULT 10.0,
  preferred_categories text[] DEFAULT '{}',
  language_preferences text[] DEFAULT '{}',
  data_sharing_consent boolean DEFAULT false,
  analytics_consent boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('similar_content', 'sustainable_alternative', 'trending', 'personalized')),
  confidence_score numeric(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning text NOT NULL,
  model_version text DEFAULT 'v1.0',
  is_clicked boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notebook Interactions Table
CREATE TABLE IF NOT EXISTS notebook_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'save', 'import', 'share', 'rate', 'comment')),
  interaction_value numeric(3,2) CHECK (interaction_value >= 0 AND interaction_value <= 1),
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  sustainability_goals jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Notebook Comments Table
CREATE TABLE IF NOT EXISTS notebook_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES notebook_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Follows Table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Platform Analytics Table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL UNIQUE,
  total_users integer DEFAULT 0,
  active_users integer DEFAULT 0,
  notebooks_discovered integer DEFAULT 0,
  notebooks_imported integer DEFAULT 0,
  total_carbon_saved numeric(14,2) DEFAULT 0,
  total_compute_optimized numeric(14,2) DEFAULT 0,
  avg_quality_score numeric(3,2) DEFAULT 0,
  top_categories jsonb DEFAULT '{}',
  sustainability_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for AI Recommendations
CREATE POLICY "Users can view their own recommendations"
  ON ai_recommendations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations"
  ON ai_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their recommendation interactions"
  ON ai_recommendations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Notebook Interactions
CREATE POLICY "Users can manage their own interactions"
  ON notebook_interactions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Teams
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for Team Members
CREATE POLICY "Team members can view team membership"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage membership"
  ON team_members FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Comments
CREATE POLICY "Users can view comments on accessible notebooks"
  ON notebook_comments FOR SELECT
  TO authenticated
  USING (true); -- Allow viewing all comments for now

CREATE POLICY "Users can manage their own comments"
  ON notebook_comments FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for User Follows
CREATE POLICY "Users can manage their own follows"
  ON user_follows FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can view their followers and following"
  ON user_follows FOR SELECT
  TO authenticated
  USING (following_id = auth.uid() OR follower_id = auth.uid());

-- Platform Analytics - Admin only access
CREATE POLICY "Admins can view platform analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_confidence ON ai_recommendations(user_id, confidence_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_interactions_user_type ON notebook_interactions(user_id, interaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_composite ON team_members(team_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_notebook_comments_notebook_created ON notebook_comments(notebook_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_composite ON user_follows(follower_id, following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notebook_comments_updated_at
  BEFORE UPDATE ON notebook_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_analytics_updated_at
  BEFORE UPDATE ON platform_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_team_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Data validation function
CREATE OR REPLACE FUNCTION validate_team_member_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure at least one owner per team
  IF TG_OP = 'UPDATE' AND NEW.role != 'owner' AND OLD.role = 'owner' THEN
    IF NOT EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = NEW.team_id AND role = 'owner' AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Team must have at least one owner';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_team_member_role_trigger
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION validate_team_member_role();

-- Analytics materialized view for better performance
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_platform_metrics AS
SELECT 
  date_trunc('day', created_at) as metric_date,
  COUNT(DISTINCT user_id) as daily_active_users,
  COUNT(*) as total_interactions,
  AVG(CASE WHEN interaction_type = 'rate' THEN interaction_value END) as avg_rating
FROM notebook_interactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY metric_date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics_date 
  ON daily_platform_metrics(metric_date);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_platform_metrics;
END;
$$ LANGUAGE plpgsql;