import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface NotebookMetadata {
  title: string;
  description: string;
  author: string;
  institution?: string;
  tags: string[];
  category: string;
  sourceUrl: string;
  sourcePlatform: string;
  publishedDate?: string;
  qualityScore: number;
  relevanceScore: number;
  estimatedComputeHours: number;
  carbonFootprintGrams: number;
  energyEfficiencyRating: string;
}

export interface ScrapingOperation {
  id: string;
  operationName: string;
  sourcePlatform: string;
  searchQuery: string;
  maxResults?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  itemsDiscovered: number;
  itemsProcessed: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
}

export class NotebookScraperService {
  private static readonly PLATFORMS = {
    github: 'https://api.github.com/search/repositories',
    kaggle: 'https://www.kaggle.com/api/v1/datasets/list',
    papers_with_code: 'https://paperswithcode.com/api/v1/papers',
    academic: 'https://api.semanticscholar.org/graph/v1/paper/search'
  };

  static async startScrapingOperation(
    operationName: string,
    sourcePlatform: string,
    searchQuery: string,
    maxResults: number = 50
  ): Promise<string> {
    const operation: Omit<ScrapingOperation, 'id'> = {
      operationName,
      sourcePlatform,
      searchQuery,
      maxResults,
      status: 'pending',
      itemsDiscovered: 0,
      itemsProcessed: 0,
      startTime: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('scraping_operations')
      .insert({
        id: uuidv4(),
        user_id: (await supabase.auth.getUser()).data.user?.id,
        operation_name: operation.operationName,
        source_platform: operation.sourcePlatform,
        search_query: operation.searchQuery,
        max_results: operation.maxResults,
        status: operation.status,
        items_discovered: operation.itemsDiscovered,
        items_processed: operation.itemsProcessed,
        start_time: operation.startTime
      })
      .select()
      .single();

    if (error) throw error;

    // Start the scraping process asynchronously
    this.executeScrapingOperation(data.id, operation);

    return data.id;
  }

  private static async executeScrapingOperation(
    operationId: string,
    operation: Omit<ScrapingOperation, 'id'>
  ): Promise<void> {
    try {
      await this.updateOperationStatus(operationId, 'in_progress');

      let discoveredNotebooks: NotebookMetadata[] = [];

      switch (operation.sourcePlatform) {
        case 'github':
          discoveredNotebooks = await this.scrapeGitHubNotebooks(operation.searchQuery, operation.maxResults || 50);
          break;
        case 'kaggle':
          discoveredNotebooks = await this.scrapeKaggleNotebooks(operation.searchQuery, operation.maxResults || 50);
          break;
        case 'papers_with_code':
          discoveredNotebooks = await this.scrapePapersWithCodeNotebooks(operation.searchQuery, operation.maxResults || 50);
          break;
        case 'academic':
          discoveredNotebooks = await this.scrapeAcademicNotebooks(operation.searchQuery, operation.maxResults || 50);
          break;
        case 'all':
          const [github, kaggle, papers, academic] = await Promise.all([
            this.scrapeGitHubNotebooks(operation.searchQuery, Math.floor((operation.maxResults || 50) / 4)),
            this.scrapeKaggleNotebooks(operation.searchQuery, Math.floor((operation.maxResults || 50) / 4)),
            this.scrapePapersWithCodeNotebooks(operation.searchQuery, Math.floor((operation.maxResults || 50) / 4)),
            this.scrapeAcademicNotebooks(operation.searchQuery, Math.floor((operation.maxResults || 50) / 4))
          ]);
          discoveredNotebooks = [...github, ...kaggle, ...papers, ...academic];
          break;
        default:
          throw new Error(`Unsupported platform: ${operation.sourcePlatform}`);
      }

      await this.updateOperationStatus(operationId, 'in_progress', discoveredNotebooks.length);

      // Process and save discovered notebooks
      for (const notebook of discoveredNotebooks) {
        await this.saveScrapedNotebook(operationId, notebook);
      }

      await this.updateOperationStatus(operationId, 'completed', discoveredNotebooks.length, discoveredNotebooks.length);

    } catch (error) {
      await this.updateOperationStatus(
        operationId,
        'failed',
        undefined,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private static async scrapeGitHubNotebooks(query: string, maxResults: number): Promise<NotebookMetadata[]> {
    try {
      const searchUrl = `${this.PLATFORMS.github}?q=${encodeURIComponent(query + ' jupyter notebook')}+language:jupyter-notebook&sort=stars&order=desc&per_page=${Math.min(maxResults, 100)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NotebookScraper/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items?.slice(0, maxResults).map((repo: any) => ({
        title: repo.name,
        description: repo.description || 'No description available',
        author: repo.owner.login,
        institution: repo.owner.type === 'Organization' ? repo.owner.login : undefined,
        tags: repo.topics || [],
        category: this.categorizeContent(repo.description || repo.name),
        sourceUrl: repo.html_url,
        sourcePlatform: 'github',
        publishedDate: repo.created_at,
        qualityScore: this.calculateQualityScore(repo.stargazers_count, repo.forks_count, repo.watchers_count),
        relevanceScore: this.calculateRelevanceScore(query, repo.name + ' ' + (repo.description || '')),
        estimatedComputeHours: this.estimateComputeHours(repo.size),
        carbonFootprintGrams: this.calculateCarbonFootprint(repo.size),
        energyEfficiencyRating: this.calculateEfficiencyRating(repo.size, repo.stargazers_count)
      })) || [];
    } catch (error) {
      console.error('Error scraping GitHub:', error);
      return [];
    }
  }

  private static async scrapeKaggleNotebooks(query: string, maxResults: number): Promise<NotebookMetadata[]> {
    // Simulated Kaggle scraping (would need actual API integration)
    const mockNotebooks = Array.from({ length: Math.min(maxResults, 10) }, (_, i) => ({
      title: `Kaggle Notebook ${i + 1}: ${query}`,
      description: `A comprehensive analysis notebook exploring ${query} with detailed visualizations and insights.`,
      author: `kaggle_user_${i + 1}`,
      institution: 'Kaggle Community',
      tags: [query, 'data-science', 'machine-learning', 'analysis'],
      category: 'Research',
      sourceUrl: `https://kaggle.com/notebooks/${query.toLowerCase()}-${i + 1}`,
      sourcePlatform: 'kaggle',
      publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      qualityScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
      relevanceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      estimatedComputeHours: Math.random() * 10 + 2,
      carbonFootprintGrams: Math.random() * 500 + 100,
      energyEfficiencyRating: ['A+', 'A', 'B', 'C'][Math.floor(Math.random() * 4)]
    }));

    return mockNotebooks;
  }

  private static async scrapePapersWithCodeNotebooks(query: string, maxResults: number): Promise<NotebookMetadata[]> {
    // Simulated Papers with Code scraping
    const mockNotebooks = Array.from({ length: Math.min(maxResults, 8) }, (_, i) => ({
      title: `Research Paper: ${query} Implementation`,
      description: `State-of-the-art implementation of ${query} with reproducible results and comprehensive benchmarks.`,
      author: `researcher_${i + 1}`,
      institution: ['MIT', 'Stanford', 'Google Research', 'OpenAI'][Math.floor(Math.random() * 4)],
      tags: [query, 'research', 'implementation', 'benchmarks'],
      category: 'Academic',
      sourceUrl: `https://paperswithcode.com/paper/${query.toLowerCase()}-${i + 1}`,
      sourcePlatform: 'papers_with_code',
      publishedDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      qualityScore: Math.random() * 0.2 + 0.8, // 0.8-1.0
      relevanceScore: Math.random() * 0.2 + 0.8, // 0.8-1.0
      estimatedComputeHours: Math.random() * 20 + 5,
      carbonFootprintGrams: Math.random() * 1000 + 200,
      energyEfficiencyRating: ['A+', 'A', 'B'][Math.floor(Math.random() * 3)]
    }));

    return mockNotebooks;
  }

  private static async scrapeAcademicNotebooks(query: string, maxResults: number): Promise<NotebookMetadata[]> {
    // Simulated academic paper scraping
    const mockNotebooks = Array.from({ length: Math.min(maxResults, 12) }, (_, i) => ({
      title: `Academic Study: ${query} Analysis`,
      description: `Peer-reviewed research on ${query} with statistical analysis and experimental validation.`,
      author: `academic_${i + 1}`,
      institution: ['Harvard', 'Oxford', 'Cambridge', 'ETH Zurich'][Math.floor(Math.random() * 4)],
      tags: [query, 'academic', 'peer-reviewed', 'research'],
      category: 'Academic',
      sourceUrl: `https://academic.example.com/paper/${query.toLowerCase()}-${i + 1}`,
      sourcePlatform: 'academic',
      publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      qualityScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      relevanceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      estimatedComputeHours: Math.random() * 15 + 3,
      carbonFootprintGrams: Math.random() * 800 + 150,
      energyEfficiencyRating: ['A+', 'A', 'B', 'C'][Math.floor(Math.random() * 4)]
    }));

    return mockNotebooks;
  }

  private static categorizeContent(text: string): string {
    const categories = {
      'Academic': ['research', 'paper', 'study', 'analysis', 'academic', 'university'],
      'Business': ['business', 'finance', 'marketing', 'sales', 'revenue', 'profit'],
      'Creative': ['art', 'design', 'creative', 'visualization', 'graphics', 'media'],
      'Research': ['experiment', 'hypothesis', 'methodology', 'findings', 'results'],
      'Education': ['tutorial', 'learning', 'course', 'education', 'teaching', 'guide'],
      'Personal': ['personal', 'hobby', 'individual', 'self', 'own', 'private']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'Research'; // Default category
  }

  private static calculateQualityScore(stars: number, forks: number, watchers: number): number {
    const totalEngagement = stars + forks + watchers;
    if (totalEngagement > 1000) return 1.0;
    if (totalEngagement > 500) return 0.9;
    if (totalEngagement > 100) return 0.8;
    if (totalEngagement > 50) return 0.7;
    if (totalEngagement > 10) return 0.6;
    return 0.5;
  }

  private static calculateRelevanceScore(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    const matches = queryWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    );
    
    return Math.min(matches.length / queryWords.length, 1.0);
  }

  private static estimateComputeHours(size: number): number {
    // Estimate based on repository size (in KB)
    return Math.max(0.5, (size / 1000) * 2);
  }

  private static calculateCarbonFootprint(size: number): number {
    // Estimate carbon footprint in grams based on compute requirements
    const computeHours = this.estimateComputeHours(size);
    return computeHours * 50; // ~50g CO2 per compute hour
  }

  private static calculateEfficiencyRating(size: number, engagement: number): string {
    const efficiency = engagement / Math.max(size, 1);
    
    if (efficiency > 10) return 'A+';
    if (efficiency > 5) return 'A';
    if (efficiency > 2) return 'B';
    if (efficiency > 1) return 'C';
    if (efficiency > 0.5) return 'D';
    if (efficiency > 0.1) return 'E';
    return 'F';
  }

  private static async saveScrapedNotebook(operationId: string, notebook: NotebookMetadata): Promise<void> {
    const { error } = await supabase
      .from('scraped_items')
      .insert({
        id: uuidv4(),
        operation_id: operationId,
        title: notebook.title,
        description: notebook.description,
        source_url: notebook.sourceUrl,
        source_platform: notebook.sourcePlatform,
        author: notebook.author,
        institution: notebook.institution,
        published_date: notebook.publishedDate,
        tags: notebook.tags,
        category: notebook.category,
        quality_score: notebook.qualityScore,
        relevance_score: notebook.relevanceScore,
        estimated_compute_hours: notebook.estimatedComputeHours,
        carbon_footprint_grams: notebook.carbonFootprintGrams,
        energy_efficiency_rating: notebook.energyEfficiencyRating,
        processing_status: 'discovered'
      });

    if (error) {
      console.error('Error saving scraped notebook:', error);
    }
  }

  private static async updateOperationStatus(
    operationId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    itemsDiscovered?: number,
    itemsProcessed?: number,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = { status };
    
    if (itemsDiscovered !== undefined) updates.items_discovered = itemsDiscovered;
    if (itemsProcessed !== undefined) updates.items_processed = itemsProcessed;
    if (errorMessage) updates.error_message = errorMessage;
    if (status === 'completed' || status === 'failed') {
      updates.end_time = new Date().toISOString();
    }

    const { error } = await supabase
      .from('scraping_operations')
      .update(updates)
      .eq('id', operationId);

    if (error) {
      console.error('Error updating operation status:', error);
    }
  }

  static async getScrapingOperations(): Promise<ScrapingOperation[]> {
    const { data, error } = await supabase
      .from('scraping_operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      operationName: item.operation_name,
      sourcePlatform: item.source_platform,
      searchQuery: item.search_query,
      maxResults: item.max_results,
      status: item.status,
      itemsDiscovered: item.items_discovered,
      itemsProcessed: item.items_processed,
      startTime: item.start_time,
      endTime: item.end_time,
      errorMessage: item.error_message
    })) || [];
  }

  static async getScrapedItems(operationId?: string): Promise<NotebookMetadata[]> {
    let query = supabase
      .from('scraped_items')
      .select('*')
      .order('discovered_at', { ascending: false });

    if (operationId) {
      query = query.eq('operation_id', operationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data?.map(item => ({
      title: item.title,
      description: item.description,
      author: item.author,
      institution: item.institution,
      tags: item.tags || [],
      category: item.category,
      sourceUrl: item.source_url,
      sourcePlatform: item.source_platform,
      publishedDate: item.published_date,
      qualityScore: item.quality_score,
      relevanceScore: item.relevance_score,
      estimatedComputeHours: item.estimated_compute_hours,
      carbonFootprintGrams: item.carbon_footprint_grams,
      energyEfficiencyRating: item.energy_efficiency_rating
    })) || [];
  }

  static async importNotebookToDirectory(scrapedItemId: string): Promise<void> {
    // Get the scraped item
    const { data: scrapedItem, error: fetchError } = await supabase
      .from('scraped_items')
      .select('*')
      .eq('id', scrapedItemId)
      .single();

    if (fetchError) throw fetchError;

    // Insert into notebooks table (updated to match your schema)
    const { error: insertError } = await supabase
      .from('notebooks')
      .insert({
        title: scrapedItem.title,
        description: scrapedItem.description,
        category: scrapedItem.category,
        tags: scrapedItem.tags,
        author: scrapedItem.author,
        institution: scrapedItem.institution,
        notebook_url: scrapedItem.source_url,
        featured: scrapedItem.quality_score > 0.8,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        estimated_compute_hours: scrapedItem.estimated_compute_hours,
        carbon_footprint_grams: scrapedItem.carbon_footprint_grams,
        energy_consumed_kwh: scrapedItem.estimated_compute_hours * 0.5, // Estimate
        energy_efficiency_rating: scrapedItem.energy_efficiency_rating,
        quality_score: scrapedItem.quality_score
      });

    if (insertError) throw insertError;

    // Update scraped item status
    await supabase
      .from('scraped_items')
      .update({ 
        processing_status: 'imported',
        imported_at: new Date().toISOString()
      })
      .eq('id', scrapedItemId);

    // Track environmental impact
    const { error: impactError } = await supabase
      .from('environmental_impact')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'notebook_creation',
        compute_hours: scrapedItem.estimated_compute_hours,
        carbon_footprint_grams: scrapedItem.carbon_footprint_grams,
        energy_consumed_kwh: scrapedItem.estimated_compute_hours * 0.5,
        efficiency_score: scrapedItem.quality_score
      });

    if (impactError) {
      console.warn('Failed to track environmental impact:', impactError);
    }
  }

  static async saveUserInteraction(userId: string, notebookId: string, interactionType: string, value?: number): Promise<void> {
    const { error } = await supabase
      .from('notebook_interactions')
      .insert({
        user_id: userId,
        notebook_id: notebookId,
        interaction_type: interactionType,
        interaction_value: value || 1
      });

    if (error) {
      console.error('Error saving user interaction:', error);
      throw error;
    }
  }

  static async getUserBookmarks(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('notebook_interactions')
      .select('notebook_id')
      .eq('user_id', userId)
      .eq('interaction_type', 'bookmark');

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }

    return data?.map(item => item.notebook_id) || [];
  }

  static async toggleBookmark(userId: string, notebookId: string): Promise<boolean> {
    // Check if bookmark exists
    const { data: existing } = await supabase
      .from('notebook_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('notebook_id', notebookId)
      .eq('interaction_type', 'bookmark')
      .single();

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from('notebook_interactions')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return false; // Removed
    } else {
      // Add bookmark
      await this.saveUserInteraction(userId, notebookId, 'bookmark');
      return true; // Added
    }
  }

  static async getUserPreferences(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data;
  }

  static async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      });

    if (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static async getFilteredNotebooks(filters: {
    categories?: string[];
    qualityRange?: [number, number];
    computeRange?: [number, number];
    carbonRange?: [number, number];
    efficiencyRatings?: string[];
    searchQuery?: string;
  }): Promise<NotebookMetadata[]> {
    let query = supabase
      .from('scraped_items')
      .select('*')
      .order('discovered_at', { ascending: false });

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters.qualityRange) {
      query = query
        .gte('quality_score', filters.qualityRange[0] / 100)
        .lte('quality_score', filters.qualityRange[1] / 100);
    }

    if (filters.computeRange) {
      query = query
        .gte('estimated_compute_hours', filters.computeRange[0])
        .lte('estimated_compute_hours', filters.computeRange[1]);
    }

    if (filters.carbonRange) {
      query = query
        .gte('carbon_footprint_grams', filters.carbonRange[0])
        .lte('carbon_footprint_grams', filters.carbonRange[1]);
    }

    if (filters.efficiencyRatings && filters.efficiencyRatings.length > 0) {
      query = query.in('energy_efficiency_rating', filters.efficiencyRatings);
    }

    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,author.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filtered notebooks:', error);
      throw error;
    }

    return data?.map(item => ({
      title: item.title,
      description: item.description,
      author: item.author,
      institution: item.institution,
      tags: item.tags || [],
      category: item.category,
      sourceUrl: item.source_url,
      sourcePlatform: item.source_platform,
      publishedDate: item.published_date,
      qualityScore: item.quality_score,
      relevanceScore: item.relevance_score,
      estimatedComputeHours: item.estimated_compute_hours,
      carbonFootprintGrams: item.carbon_footprint_grams,
      energyEfficiencyRating: item.energy_efficiency_rating
    })) || [];
  }
}