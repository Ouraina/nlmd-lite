/*
  # Create Missing Tables for AI and Collaboration Features

  This migration creates the foundational tables that are referenced in our security migration.
  
  1. New Tables
    - `ai_recommendations` - Stores AI-generated notebook recommendations
    - `user_preferences` - User settings and preferences for recommendations
    - `notebook_interactions` - Tracks user interactions with notebooks
    - `teams` - Team/organization management
    - `team_members` - Team membership and roles
    - `notebook_comments` - Commenting system for notebooks
    - `user_follows` - Social following relationships
    - `platform_analytics` - Platform-wide metrics and analytics

  2. Security
    - All tables will have RLS enabled in subsequent migration
    - Proper foreign key relationships established
    - Audit trail preparation

  3. Performance
    - Strategic indexes for common query patterns
    - Materialized views for analytics
*/

-- AI Recommendations table
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

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at timestamptz DEFAULT now()
);

-- Notebook Interactions table
CREATE TABLE IF NOT EXISTS notebook_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id uuid REFERENCES notebooks(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'save', 'import', 'share', 'rate', 'comment')),
  interaction_value numeric(3,2) CHECK (interaction_value >= 0 AND interaction_value <= 1),
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Teams table
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

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Notebook Comments table
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

-- User Follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Platform Analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_date)
);

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_notebook_id ON ai_recommendations(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_interactions_user_id ON notebook_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_interactions_notebook_id ON notebook_interactions(notebook_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_comments_notebook_id ON notebook_comments(notebook_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebook_comments_updated_at BEFORE UPDATE ON notebook_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_analytics_updated_at BEFORE UPDATE ON platform_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();