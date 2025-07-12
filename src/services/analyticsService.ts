import { supabase } from '../config/supabase';

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  notebooksDiscovered: number;
  notebooksImported: number;
  totalCarbonSaved: number;
  totalComputeOptimized: number;
  avgQualityScore: number;
  topCategories: { [key: string]: number };
  sustainabilityMetrics: {
    totalCarbonFootprint: number;
    averageEfficiencyRating: string;
    energySaved: number;
    offsetContributions: number;
  };
}

export interface UserAnalytics {
  notebooksImported: number;
  carbonFootprintReduced: number;
  computeHoursOptimized: number;
  qualityScoreAverage: number;
  sustainabilityRank: number;
  monthlyProgress: {
    month: string;
    notebooks: number;
    carbonSaved: number;
    qualityScore: number;
  }[];
}

export interface TeamAnalytics {
  teamId: string;
  memberCount: number;
  totalNotebooks: number;
  carbonImpactReduction: number;
  collaborationScore: number;
  goalProgress: {
    goalType: string;
    progress: number;
    target: number;
  }[];
}

export class AnalyticsService {
  // Platform-wide analytics
  static async getPlatformMetrics(dateRange?: { start: Date; end: Date }): Promise<PlatformMetrics> {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get latest platform analytics record
    const { data: latestMetrics } = await supabase
      .from('platform_analytics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestMetrics) {
      return {
        totalUsers: latestMetrics.total_users,
        activeUsers: latestMetrics.active_users,
        notebooksDiscovered: latestMetrics.notebooks_discovered,
        notebooksImported: latestMetrics.notebooks_imported,
        totalCarbonSaved: latestMetrics.total_carbon_saved,
        totalComputeOptimized: latestMetrics.total_compute_optimized,
        avgQualityScore: latestMetrics.avg_quality_score,
        topCategories: latestMetrics.top_categories || {},
        sustainabilityMetrics: latestMetrics.sustainability_metrics || {
          totalCarbonFootprint: 0,
          averageEfficiencyRating: 'B',
          energySaved: 0,
          offsetContributions: 0
        }
      };
    }

    // If no cached metrics, calculate from raw data
    return await this.calculatePlatformMetrics(startDate, endDate);
  }

  private static async calculatePlatformMetrics(startDate: Date, endDate: Date): Promise<PlatformMetrics> {
    // Get user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users who have interacted in the date range)
    const { count: activeUsers } = await supabase
      .from('notebook_interactions')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get notebook statistics
    const { count: notebooksDiscovered } = await supabase
      .from('scraped_items')
      .select('*', { count: 'exact', head: true })
      .gte('discovered_at', startDate.toISOString())
      .lte('discovered_at', endDate.toISOString());

    const { count: notebooksImported } = await supabase
      .from('notebooks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get environmental impact data
    const { data: environmentalData } = await supabase
      .from('environmental_impact')
      .select('carbon_footprint_grams, compute_hours, efficiency_score')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const totalCarbonSaved = (environmentalData || [])
      .reduce((sum, item) => sum + (item.carbon_footprint_grams || 0), 0);

    const totalComputeOptimized = (environmentalData || [])
      .reduce((sum, item) => sum + (item.compute_hours || 0), 0);

    // Get quality scores
    const { data: qualityData } = await supabase
      .from('notebooks')
      .select('quality_score')
      .not('quality_score', 'is', null);

    const avgQualityScore = qualityData && qualityData.length > 0
      ? qualityData.reduce((sum, item) => sum + item.quality_score, 0) / qualityData.length
      : 0;

    // Get category distribution
    const { data: categoryData } = await supabase
      .from('notebooks')
      .select('category')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const topCategories = (categoryData || []).reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      notebooksDiscovered: notebooksDiscovered || 0,
      notebooksImported: notebooksImported || 0,
      totalCarbonSaved,
      totalComputeOptimized,
      avgQualityScore,
      topCategories,
      sustainabilityMetrics: {
        totalCarbonFootprint: totalCarbonSaved,
        averageEfficiencyRating: 'B', // Would calculate from actual data
        energySaved: totalComputeOptimized * 0.5, // Estimate
        offsetContributions: 0 // Would track actual offset purchases
      }
    };
  }

  // User-specific analytics
  static async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    // Get user's imported notebooks
    const { count: notebooksImported } = await supabase
      .from('notebooks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's environmental impact
    const { data: environmentalData } = await supabase
      .from('environmental_impact')
      .select('*')
      .eq('user_id', userId);

    const carbonFootprintReduced = (environmentalData || [])
      .reduce((sum, item) => sum + (item.carbon_footprint_grams || 0), 0);

    const computeHoursOptimized = (environmentalData || [])
      .reduce((sum, item) => sum + (item.compute_hours || 0), 0);

    const qualityScoreAverage = (environmentalData || [])
      .filter(item => item.efficiency_score)
      .reduce((sum, item, _, arr) => sum + (item.efficiency_score || 0) / arr.length, 0);

    // Calculate sustainability rank (simplified)
    const { data: allUsers } = await supabase
      .from('environmental_impact')
      .select('user_id, carbon_footprint_grams')
      .not('user_id', 'is', null);

    const userRankings = (allUsers || [])
      .reduce((acc, item) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + item.carbon_footprint_grams;
        return acc;
      }, {} as { [key: string]: number });

    const sortedUsers = Object.entries(userRankings)
      .sort(([,a], [,b]) => b - a);

    const sustainabilityRank = sortedUsers.findIndex(([id]) => id === userId) + 1;

    // Get monthly progress
    const monthlyProgress = await this.getUserMonthlyProgress(userId);

    return {
      notebooksImported: notebooksImported || 0,
      carbonFootprintReduced,
      computeHoursOptimized,
      qualityScoreAverage,
      sustainabilityRank,
      monthlyProgress
    };
  }

  private static async getUserMonthlyProgress(userId: string): Promise<UserAnalytics['monthlyProgress']> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyData } = await supabase
      .from('environmental_impact')
      .select('created_at, carbon_footprint_grams, efficiency_score')
      .eq('user_id', userId)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at');

    const { data: notebookData } = await supabase
      .from('notebooks')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at');

    // Group by month
    const monthlyStats: { [key: string]: { notebooks: number; carbonSaved: number; qualityScores: number[] } } = {};

    (notebookData || []).forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { notebooks: 0, carbonSaved: 0, qualityScores: [] };
      }
      monthlyStats[month].notebooks++;
    });

    (monthlyData || []).forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { notebooks: 0, carbonSaved: 0, qualityScores: [] };
      }
      monthlyStats[month].carbonSaved += item.carbon_footprint_grams || 0;
      if (item.efficiency_score) {
        monthlyStats[month].qualityScores.push(item.efficiency_score);
      }
    });

    return Object.entries(monthlyStats).map(([month, stats]) => ({
      month,
      notebooks: stats.notebooks,
      carbonSaved: stats.carbonSaved,
      qualityScore: stats.qualityScores.length > 0
        ? stats.qualityScores.reduce((sum, score) => sum + score, 0) / stats.qualityScores.length
        : 0
    }));
  }

  // Team analytics
  static async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
    // Get team member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    // Get team goals progress
    const { data: goals } = await supabase
      .from('sustainability_goals')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active');

    const goalProgress = (goals || []).map(goal => ({
      goalType: goal.goal_type,
      progress: goal.current_value,
      target: goal.target_value
    }));

    // Calculate team metrics (simplified)
    const totalNotebooks = 0; // Would calculate from team members' notebooks
    const carbonImpactReduction = 0; // Would calculate from team members' impact
    const collaborationScore = 0.8; // Would calculate based on team activity

    return {
      teamId,
      memberCount: memberCount || 0,
      totalNotebooks,
      carbonImpactReduction,
      collaborationScore,
      goalProgress
    };
  }

  // Update platform analytics (would be called by a scheduled function)
  static async updatePlatformAnalytics(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metrics = await this.calculatePlatformMetrics(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()
    );

    const { error } = await supabase
      .from('platform_analytics')
      .upsert({
        metric_date: today,
        total_users: metrics.totalUsers,
        active_users: metrics.activeUsers,
        notebooks_discovered: metrics.notebooksDiscovered,
        notebooks_imported: metrics.notebooksImported,
        total_carbon_saved: metrics.totalCarbonSaved,
        total_compute_optimized: metrics.totalComputeOptimized,
        avg_quality_score: metrics.avgQualityScore,
        top_categories: metrics.topCategories,
        sustainability_metrics: metrics.sustainabilityMetrics
      }, {
        onConflict: 'metric_date'
      });

    if (error) {
      console.error('Failed to update platform analytics:', error);
    }
  }

  // Export analytics data
  static async exportAnalytics(type: 'platform' | 'user' | 'team', id?: string): Promise<Blob> {
    let data: any;

    switch (type) {
      case 'platform':
        data = await this.getPlatformMetrics();
        break;
      case 'user':
        if (!id) throw new Error('User ID required for user analytics');
        data = await this.getUserAnalytics(id);
        break;
      case 'team':
        if (!id) throw new Error('Team ID required for team analytics');
        data = await this.getTeamAnalytics(id);
        break;
    }

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
}