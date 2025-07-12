import { supabase } from '../config/supabase';

export interface UserPreferences {
  researchAreas: string[];
  preferredPlatforms: string[];
  sustainabilityPriority: number;
  qualityThreshold: number;
  maxComputeHours: number;
  preferredCategories: string[];
  languagePreferences: string[];
}

export interface Recommendation {
  id: string;
  notebookId: string;
  type: 'similar_content' | 'sustainable_alternative' | 'trending' | 'personalized';
  confidenceScore: number;
  reasoning: string;
  notebook?: any;
}

export interface InteractionData {
  notebookId: string;
  interactionType: 'view' | 'save' | 'import' | 'share' | 'rate' | 'comment';
  interactionValue?: number;
  sessionId?: string;
}

export class AIRecommendationService {
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      researchAreas: data.research_areas || [],
      preferredPlatforms: data.preferred_platforms || [],
      sustainabilityPriority: data.sustainability_priority || 0.5,
      qualityThreshold: data.quality_threshold || 0.7,
      maxComputeHours: data.max_compute_hours || 10.0,
      preferredCategories: data.preferred_categories || [],
      languagePreferences: data.language_preferences || []
    };
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        research_areas: preferences.researchAreas,
        preferred_platforms: preferences.preferredPlatforms,
        sustainability_priority: preferences.sustainabilityPriority,
        quality_threshold: preferences.qualityThreshold,
        max_compute_hours: preferences.maxComputeHours,
        preferred_categories: preferences.preferredCategories,
        language_preferences: preferences.languagePreferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  }

  static async trackInteraction(userId: string, interaction: InteractionData): Promise<void> {
    const { error } = await supabase
      .from('notebook_interactions')
      .insert({
        user_id: userId,
        notebook_id: interaction.notebookId,
        interaction_type: interaction.interactionType,
        interaction_value: interaction.interactionValue,
        session_id: interaction.sessionId || crypto.randomUUID()
      });

    if (error) throw error;
  }

  static async generateRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    // Get user preferences
    const preferences = await this.getUserPreferences(userId);
    
    // Get user interaction history
    const { data: interactions } = await supabase
      .from('notebook_interactions')
      .select('notebook_id, interaction_type, interaction_value')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // Generate different types of recommendations
    const recommendations: Recommendation[] = [];

    // 1. Content-based recommendations (similar notebooks)
    const contentRecs = await this.generateContentBasedRecommendations(userId, preferences, interactions || []);
    recommendations.push(...contentRecs);

    // 2. Sustainable alternatives
    const sustainableRecs = await this.generateSustainableRecommendations(userId, preferences);
    recommendations.push(...sustainableRecs);

    // 3. Trending notebooks
    const trendingRecs = await this.generateTrendingRecommendations(userId, preferences);
    recommendations.push(...trendingRecs);

    // 4. Collaborative filtering (users with similar interests)
    const collaborativeRecs = await this.generateCollaborativeRecommendations(userId, interactions || []);
    recommendations.push(...collaborativeRecs);

    // Sort by confidence score and limit results
    const sortedRecs = recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, limit);

    // Save recommendations to database
    await this.saveRecommendations(userId, sortedRecs);

    return sortedRecs;
  }

  private static async generateContentBasedRecommendations(
    userId: string, 
    preferences: UserPreferences | null, 
    interactions: any[]
  ): Promise<Recommendation[]> {
    // Get notebooks user has interacted with positively
    const positiveInteractions = interactions.filter(i => 
      ['save', 'import', 'rate'].includes(i.interaction_type) && 
      (i.interaction_value || 0) > 0.7
    );

    if (positiveInteractions.length === 0) return [];

    const interactedNotebookIds = positiveInteractions.map(i => i.notebook_id);

    // Find similar notebooks based on tags, category, and author
    const { data: similarNotebooks } = await supabase
      .from('notebooks')
      .select('*')
      .not('id', 'in', `(${interactedNotebookIds.join(',')})`)
      .gte('quality_score', preferences?.qualityThreshold || 0.7)
      .lte('estimated_compute_hours', preferences?.maxComputeHours || 10)
      .limit(5);

    return (similarNotebooks || []).map(notebook => ({
      id: crypto.randomUUID(),
      notebookId: notebook.id,
      type: 'similar_content' as const,
      confidenceScore: this.calculateContentSimilarity(notebook, positiveInteractions),
      reasoning: `Similar to notebooks you've saved, with ${notebook.quality_score * 100}% quality score`,
      notebook
    }));
  }

  private static async generateSustainableRecommendations(
    userId: string, 
    preferences: UserPreferences | null
  ): Promise<Recommendation[]> {
    const sustainabilityWeight = preferences?.sustainabilityPriority || 0.5;
    
    if (sustainabilityWeight < 0.3) return [];

    const { data: sustainableNotebooks } = await supabase
      .from('notebooks')
      .select('*')
      .in('energy_efficiency_rating', ['A+', 'A', 'B'])
      .lte('carbon_footprint_grams', 200)
      .gte('quality_score', 0.6)
      .order('energy_efficiency_rating')
      .limit(3);

    return (sustainableNotebooks || []).map(notebook => ({
      id: crypto.randomUUID(),
      notebookId: notebook.id,
      type: 'sustainable_alternative' as const,
      confidenceScore: 0.8 + (sustainabilityWeight * 0.2),
      reasoning: `Low carbon footprint (${notebook.carbon_footprint_grams}g CO₂) with ${notebook.energy_efficiency_rating} efficiency rating`,
      notebook
    }));
  }

  private static async generateTrendingRecommendations(
    userId: string, 
    preferences: UserPreferences | null
  ): Promise<Recommendation[]> {
    // Get notebooks with high recent interaction rates
    const { data: trendingNotebooks } = await supabase
      .from('notebooks')
      .select(`
        *,
        interaction_count:notebook_interactions(count)
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    return (trendingNotebooks || []).map(notebook => ({
      id: crypto.randomUUID(),
      notebookId: notebook.id,
      type: 'trending' as const,
      confidenceScore: 0.7,
      reasoning: `Trending notebook with high community engagement`,
      notebook
    }));
  }

  private static async generateCollaborativeRecommendations(
    userId: string, 
    interactions: any[]
  ): Promise<Recommendation[]> {
    if (interactions.length === 0) return [];

    // Find users with similar interaction patterns
    const userNotebookIds = interactions.map(i => i.notebook_id);
    
    const { data: similarUsers } = await supabase
      .from('notebook_interactions')
      .select('user_id, notebook_id')
      .in('notebook_id', userNotebookIds)
      .neq('user_id', userId);

    // This is a simplified collaborative filtering
    // In production, you'd use more sophisticated algorithms
    const userSimilarity: { [key: string]: number } = {};
    
    (similarUsers || []).forEach(interaction => {
      userSimilarity[interaction.user_id] = (userSimilarity[interaction.user_id] || 0) + 1;
    });

    const topSimilarUsers = Object.entries(userSimilarity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([userId]) => userId);

    if (topSimilarUsers.length === 0) return [];

    // Get notebooks liked by similar users
    const { data: recommendedNotebooks } = await supabase
      .from('notebook_interactions')
      .select(`
        notebook_id,
        notebooks(*)
      `)
      .in('user_id', topSimilarUsers)
      .in('interaction_type', ['save', 'import'])
      .not('notebook_id', 'in', `(${userNotebookIds.join(',')})`)
      .limit(2);

    return (recommendedNotebooks || []).map(item => ({
      id: crypto.randomUUID(),
      notebookId: item.notebook_id,
      type: 'personalized' as const,
      confidenceScore: 0.75,
      reasoning: `Recommended by users with similar interests`,
      notebook: item.notebooks
    }));
  }

  private static calculateContentSimilarity(notebook: any, interactions: any[]): number {
    // Simplified similarity calculation
    // In production, you'd use vector embeddings or more sophisticated NLP
    let similarity = 0.5;
    
    // Boost score based on quality
    similarity += (notebook.quality_score || 0) * 0.3;
    
    // Boost if in preferred category
    if (notebook.category) {
      similarity += 0.1;
    }
    
    return Math.min(similarity, 1.0);
  }

  private static async saveRecommendations(userId: string, recommendations: Recommendation[]): Promise<void> {
    const recommendationData = recommendations.map(rec => ({
      user_id: userId,
      notebook_id: rec.notebookId,
      recommendation_type: rec.type,
      confidence_score: rec.confidenceScore,
      reasoning: rec.reasoning,
      model_version: 'v1.0'
    }));

    const { error } = await supabase
      .from('ai_recommendations')
      .insert(recommendationData);

    if (error) {
      console.error('Failed to save recommendations:', error);
    }
  }

  static async getRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select(`
        *,
        notebooks(*)
      `)
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('confidence_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      notebookId: item.notebook_id,
      type: item.recommendation_type,
      confidenceScore: item.confidence_score,
      reasoning: item.reasoning,
      notebook: item.notebooks
    }));
  }

  static async markRecommendationClicked(recommendationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ is_clicked: true })
      .eq('id', recommendationId);

    if (error) throw error;
  }

  static async dismissRecommendation(recommendationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ is_dismissed: true })
      .eq('id', recommendationId);

    if (error) throw error;
  }
}