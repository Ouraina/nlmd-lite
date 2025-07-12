/*
  # AI-Powered Recommendations and Collaboration Features

  1. New Tables
    - `user_preferences` - Track user behavior and preferences for AI recommendations
    - `notebook_interactions` - Log user interactions for ML training data
    - `ai_recommendations` - Store generated recommendations with confidence scores
    - `teams` - Team workspaces for collaboration
    - `team_members` - Team membership with roles
    - `notebook_comments` - Collaborative discussion on notebooks
    - `user_follows` - Social following system
    - `sustainability_goals` - Enhanced environmental goal tracking
    - `platform_analytics` - Aggregate platform metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for team-based access control
    - Implement privacy controls for user data

  3. Indexes
    - Optimize for recommendation queries
    - Support real-time collaboration features
*/

-- User preferences for AI recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  research_areas text[] DEFAULT '{}',
  preferred_platforms text[] DEFAULT '{}',
  sustainability_priority numeric(3,2) DEFAULT 0.5,
  quality_threshold numeric(3,2) DEFAULT 0.7,
  max_compute_hours numeric(10,2) DEFAULT 10.0,
  preferred_categories text[] DEFAULT '{}',
  language_preferences text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Track user interactions for ML training
CREATE TABLE IF NOT EXISTS notebook_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'save', 'import', 'share', 'rate', 'comment')),
  interaction_value numeric(3,2), -- For ratings, time spent, etc.
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- AI-generated recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('similar_content', 'sustainable_alternative', 'trending', 'personalized')),
  confidence_score numeric(3,2) NOT NULL,
  reasoning text,
  model_version text DEFAULT 'v1.0',
  is_clicked boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Team workspaces
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  sustainability_goals jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team membership
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Collaborative comments
CREATE TABLE IF NOT EXISTS notebook_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES notebook_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social following system
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enhanced sustainability goals
CREATE TABLE IF NOT EXISTS sustainability_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('carbon_reduction', 'energy_efficiency', 'compute_optimization', 'offset_contribution')),
  target_value numeric(14,2) NOT NULL,
  current_value numeric(14,2) DEFAULT 0,
  target_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform-wide analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  total_users integer DEFAULT 0,
  active_users integer DEFAULT 0,
  notebooks_discovered integer DEFAULT 0,
  notebooks_imported integer DEFAULT 0,
  total_carbon_saved numeric(14,2) DEFAULT 0,
  total_compute_optimized numeric(14,2) DEFAULT 0,
  avg_quality_score numeric(3,2),
  top_categories jsonb DEFAULT '{}',
  sustainability_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_date)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

-- Notebook interactions policies
CREATE POLICY "Users can manage their own interactions"
  ON notebook_interactions
  FOR ALL
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

-- AI recommendations policies
CREATE POLICY "Users can view their own recommendations"
  ON ai_recommendations
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can update recommendation feedback"
  ON ai_recommendations
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

-- Teams policies
CREATE POLICY "Anyone can view public teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = created_by);

CREATE POLICY "Team owners can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = teams.id AND role IN ('owner', 'admin')
    )
  );

-- Team members policies
CREATE POLICY "Team members can view team membership"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    uid() = user_id OR 
    uid() IN (
      SELECT user_id FROM team_members tm 
      WHERE tm.team_id = team_members.team_id
    )
  );

CREATE POLICY "Team admins can manage membership"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = team_members.team_id AND role IN ('owner', 'admin')
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on accessible notebooks"
  ON notebook_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON notebook_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON notebook_comments
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id);

-- User follows policies
CREATE POLICY "Users can view follows"
  ON user_follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON user_follows
  FOR ALL
  TO authenticated
  USING (uid() = follower_id)
  WITH CHECK (uid() = follower_id);

-- Sustainability goals policies
CREATE POLICY "Users can manage personal goals"
  ON sustainability_goals
  FOR ALL
  TO authenticated
  USING (uid() = user_id OR uid() IN (
    SELECT user_id FROM team_members 
    WHERE team_id = sustainability_goals.team_id
  ))
  WITH CHECK (uid() = user_id OR uid() IN (
    SELECT user_id FROM team_members 
    WHERE team_id = sustainability_goals.team_id AND role IN ('owner', 'admin')
  ));

-- Platform analytics policies
CREATE POLICY "Users can view platform analytics"
  ON platform_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_notebook_interactions_user_id ON notebook_interactions(user_id);
CREATE INDEX idx_notebook_interactions_notebook_id ON notebook_interactions(notebook_id);
CREATE INDEX idx_notebook_interactions_type ON notebook_interactions(interaction_type);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_confidence ON ai_recommendations(confidence_score DESC);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_notebook_comments_notebook_id ON notebook_comments(notebook_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_sustainability_goals_user_id ON sustainability_goals(user_id);
CREATE INDEX idx_sustainability_goals_team_id ON sustainability_goals(team_id);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(metric_date DESC);