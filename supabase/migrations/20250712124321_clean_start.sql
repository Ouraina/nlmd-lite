-- User preferences policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notebook interactions policies
DROP POLICY IF EXISTS "Users can manage their own notebook interactions" ON notebook_interactions;
CREATE POLICY "Users can manage their own notebook interactions"
  ON notebook_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI recommendations policies
DROP POLICY IF EXISTS "Users can view their own recommendations" ON ai_recommendations;
CREATE POLICY "Users can view their own recommendations"
  ON ai_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update recommendation feedback" ON ai_recommendations;
CREATE POLICY "Users can update recommendation feedback"
  ON ai_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teams policies
DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team owners can update teams" ON teams;
CREATE POLICY "Team owners can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = teams.id AND role IN ('owner', 'admin')
    )
  );

-- Team members policies
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
CREATE POLICY "Team members can view team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM team_members tm 
      WHERE tm.team_id = team_members.team_id
    )
  );

DROP POLICY IF EXISTS "Team owners can update team members" ON team_members;
CREATE POLICY "Team owners can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = team_members.team_id AND role IN ('owner', 'admin')
    )
  );

-- Notebook comments policies
DROP POLICY IF EXISTS "Users can insert their own comments" ON notebook_comments;
CREATE POLICY "Users can insert their own comments"
  ON notebook_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON notebook_comments;
CREATE POLICY "Users can update their own comments"
  ON notebook_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User follows policies
DROP POLICY IF EXISTS "Users can manage their own follows" ON user_follows;
CREATE POLICY "Users can manage their own follows"
  ON user_follows
  FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Sustainability goals policies
DROP POLICY IF EXISTS "Users can manage their own sustainability goals" ON sustainability_goals;
CREATE POLICY "Users can manage their own sustainability goals"
  ON sustainability_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM team_members 
    WHERE team_id = sustainability_goals.team_id
  ))
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM team_members 
    WHERE team_id = sustainability_goals.team_id AND role IN ('owner', 'admin')
  ));

-- Indexes for performance
DROP INDEX IF EXISTS idx_user_preferences_user_id;
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

DROP INDEX IF EXISTS idx_notebook_interactions_user_id;
CREATE INDEX idx_notebook_interactions_user_id ON notebook_interactions(user_id);

DROP INDEX IF EXISTS idx_notebook_interactions_notebook_id;
CREATE INDEX idx_notebook_interactions_notebook_id ON notebook_interactions(notebook_id);

DROP INDEX IF EXISTS idx_notebook_interactions_type;
CREATE INDEX idx_notebook_interactions_type ON notebook_interactions(interaction_type);

DROP INDEX IF EXISTS idx_ai_recommendations_user_id;
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);