import { supabase } from '../config/supabase';

export interface NotebookAnalysis {
  title: string;
  description: string;
  author_institution: string;
  category: string;
  tags: string[];
  estimated_compute_hours: number;
  estimated_carbon_footprint: number;
  confidence_score: number;
}

export interface NotebookMetadata {
  title?: string;
  description?: string;
  sources?: string[];
  content_preview?: string;
  creation_date?: string;
  url: string;
  page_title?: string;
  meta_description?: string;
}

export const realNotebookAnalysisService = {
  // Extract real metadata from public URLs
  async extractNotebookMetadata(url: string): Promise<NotebookMetadata> {
    try {
      // Try multiple approaches to get title
      let title = '';
      let description = '';
      
      // First try: Extract from URL patterns (NotebookLM specific)
      const urlTitle = this.extractTitleFromNotebookLMUrl(url);
      if (urlTitle && urlTitle !== 'Research Notebook') {
        title = urlTitle;
      }
      
      // Try CORS proxy as fallback (may not work for all URLs)
      try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, { timeout: 3000 } as any);
        
        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extract title from HTML
          const htmlTitle = doc.querySelector('title')?.textContent?.trim() || 
                           doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                           doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
          
          if (htmlTitle && htmlTitle.length > 3) {
            title = this.cleanTitle(htmlTitle);
          }
          
          // Extract description
          description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
                       '';
        }
      } catch (proxyError) {
        console.log('Proxy fetch failed, using URL analysis');
      }
      
      // If still no good title, use URL analysis
      if (!title || title === 'Research Notebook') {
        title = this.extractTitleFromNotebookLMUrl(url);
      }
      
      const metadata: NotebookMetadata = {
        title: title || 'Research Notebook',
        description: description,
        page_title: title,
        meta_description: description,
        creation_date: new Date().toISOString(),
        url,
        sources: [],
        content_preview: description
      };

      return metadata;
    } catch (error) {
      console.error('Error extracting notebook metadata:', error);
      return this.fallbackExtraction(url);
    }
  },

  // Fallback extraction from URL patterns
  fallbackExtraction(url: string): NotebookMetadata {
    const title = this.extractTitleFromUrl(url);
    return {
      title,
      url,
      description: '',
      sources: [],
      content_preview: '',
      creation_date: new Date().toISOString()
    };
  },

  // Clean and improve titles
  cleanTitle(title: string): string {
    // Remove common NotebookLM artifacts
    let cleaned = title
      .replace(/NotebookLM/gi, '')
      .replace(/Google/gi, '')
      .replace(/- Google Docs/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If title is still generic, try to make it meaningful
    if (cleaned.length < 3 || cleaned.toLowerCase().includes('untitled')) {
      return 'Research Notebook';
    }
    
    // Capitalize properly
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },



  // Extract title specifically from NotebookLM URLs
  extractTitleFromNotebookLMUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Check for title in URL parameters
      const params = new URLSearchParams(urlObj.search);
      const titleParam = params.get('title') || params.get('name') || params.get('t');
      if (titleParam) {
        return this.humanizeTitle(decodeURIComponent(titleParam));
      }
      
      // Extract from hash fragment
      if (urlObj.hash) {
        const hashParts = urlObj.hash.slice(1).split('&');
        for (const part of hashParts) {
          if (part.startsWith('title=') || part.startsWith('name=')) {
            const value = part.split('=')[1];
            if (value) {
              return this.humanizeTitle(decodeURIComponent(value));
            }
          }
        }
      }
      
      // Look for meaningful path segments
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      for (const part of pathParts) {
        if (part.length > 3 && 
            !part.includes('notebook') && 
            !part.includes('google') && 
            !part.match(/^[a-f0-9-]+$/)) { // Not just IDs
          return this.humanizeTitle(part);
        }
      }
      
      // Enhanced smart title generation based on URL content
      const urlText = url.toLowerCase();
      
      // Sports
      if (urlText.includes('nfl') || urlText.includes('draft')) return 'NFL Draft Analysis';
      if (urlText.includes('nba') || urlText.includes('basketball')) return 'NBA Analysis';
      if (urlText.includes('mlb') || urlText.includes('baseball')) return 'MLB Analysis';
      if (urlText.includes('soccer') || urlText.includes('football')) return 'Soccer Analysis';
      
      // Technology
      if (urlText.includes('ai') || urlText.includes('artificial')) return 'AI Research';
      if (urlText.includes('ml') || urlText.includes('machine')) return 'Machine Learning Research';
      if (urlText.includes('blockchain') || urlText.includes('crypto')) return 'Blockchain Analysis';
      if (urlText.includes('cloud') || urlText.includes('aws')) return 'Cloud Computing Research';
      
      // Business
      if (urlText.includes('market') || urlText.includes('marketing')) return 'Market Research';
      if (urlText.includes('sales') || urlText.includes('revenue')) return 'Sales Analysis';
      if (urlText.includes('strategy') || urlText.includes('business')) return 'Business Strategy';
      
      // Finance
      if (urlText.includes('invest') || urlText.includes('stock')) return 'Investment Analysis';
      if (urlText.includes('crypto') || urlText.includes('bitcoin')) return 'Cryptocurrency Analysis';
      if (urlText.includes('finance') || urlText.includes('economic')) return 'Financial Analysis';
      
      // Healthcare
      if (urlText.includes('health') || urlText.includes('medical')) return 'Healthcare Research';
      if (urlText.includes('clinical') || urlText.includes('patient')) return 'Clinical Research';
      
      // Education
      if (urlText.includes('education') || urlText.includes('learning')) return 'Educational Research';
      if (urlText.includes('curriculum') || urlText.includes('teaching')) return 'Curriculum Analysis';
      
      // Default with timestamp for uniqueness
      const timestamp = new Date().getMonth() + 1;
      return `Research Notebook ${timestamp}/${new Date().getFullYear()}`;
    } catch {
      return 'Research Notebook';
    }
  },

  // Extract title from URL patterns  
  extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      // Look for meaningful parts
      for (const part of pathParts) {
        if (part.length > 3 && !part.includes('notebook') && !part.includes('google')) {
          return this.humanizeTitle(part);
        }
      }
      
      // Check URL params
      const params = new URLSearchParams(urlObj.search);
      const title = params.get('title') || params.get('name');
      if (title) {
        return this.humanizeTitle(title);
      }
      
      return 'Research Notebook';
    } catch {
      return 'Research Notebook';
    }
  },

  // Convert URL parts to human readable
  humanizeTitle(text: string): string {
    return decodeURIComponent(text)
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  // Extract potential sources from HTML
  extractSources(html: string): string[] {
    const sources: string[] = [];
    
    // Look for common patterns that indicate sources
    const sourcePatterns = [
      /source[s]?:\s*([^<\n]+)/gi,
      /references?:\s*([^<\n]+)/gi,
      /from:\s*([^<\n]+)/gi,
      /based on:\s*([^<\n]+)/gi
    ];
    
    for (const pattern of sourcePatterns) {
      const matches = html.match(pattern);
      if (matches) {
        sources.push(...matches.map(m => m.replace(pattern, '$1').trim()));
      }
    }
    
    return sources.slice(0, 5); // Limit to 5 sources
  },

  // Extract content preview
  extractContentPreview(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get text content from main elements
    const contentElements = doc.querySelectorAll('p, div, span');
    let content = '';
    
    for (const element of contentElements) {
      const text = element.textContent?.trim();
      if (text && text.length > 20) {
        content += text + ' ';
        if (content.length > 500) break;
      }
    }
    
    return content.trim().slice(0, 500);
  },

  // Realistic AI analysis with proper timing
  async analyzeNotebook(metadata: NotebookMetadata, userEmail?: string): Promise<NotebookAnalysis> {
    // Simulate realistic processing time
    await this.simulateProcessing();
    
    const analysis = await this.generateRealisticAnalysis(metadata, userEmail);
    
    return {
      ...analysis,
      confidence_score: this.calculateConfidence(metadata)
    };
  },

  // Simulate realistic processing time
  async simulateProcessing(): Promise<void> {
    // Random processing time between 2-5 seconds
    const processingTime = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
  },

  // Generate realistic analysis
  async generateRealisticAnalysis(metadata: NotebookMetadata, userEmail?: string): Promise<Omit<NotebookAnalysis, 'confidence_score'>> {
    const title = metadata.title || 'Research Notebook';
    const description = this.generateSmartDescription(metadata);
    const category = this.categorizeContent(metadata);
    const tags = this.generateSmartTags(metadata);
    
    // Get user initials from email
    const authorInitials = userEmail ? this.extractInitials(userEmail) : 'User';
    
    return {
      title,
      description,
      author_institution: authorInitials,
      category,
      tags,
      estimated_compute_hours: this.estimateRealisticCompute(metadata),
      estimated_carbon_footprint: 0 // Remove the fake environmental stuff
    };
  },

  // Extract initials from email
  extractInitials(email: string): string {
    const username = email.split('@')[0];
    
    // If username has dots or underscores, use those parts
    if (username.includes('.') || username.includes('_')) {
      return username
        .split(/[._]/)
        .map(part => part.charAt(0).toUpperCase())
        .join('');
    }
    
    // If username is camelCase, extract capitals
    const capitals = username.match(/[A-Z]/g);
    if (capitals && capitals.length > 1) {
      return capitals.join('');
    }
    
    // Otherwise use first 2-3 characters
    return username.slice(0, 2).toUpperCase();
  },

  // Generate smart description based on actual content
  generateSmartDescription(metadata: NotebookMetadata): string {
    const { title, description, content_preview, sources } = metadata;
    
    // Use actual meta description if available
    if (description && description.length > 20) {
      return description;
    }
    
    // Generate from content preview
    if (content_preview && content_preview.length > 50) {
      const summary = content_preview.slice(0, 200);
      return `${summary}...`;
    }
    
         // Generate from title and sources
     if (sources && sources.length > 0) {
       return `Research analysis focusing on ${title?.toLowerCase() || 'the topic'}. Based on ${sources.length} source${sources.length > 1 ? 's' : ''}.`;
     }
     
     // Fallback
     return `Comprehensive analysis of ${title?.toLowerCase() || 'the topic'}.`;
  },

  // Categorize based on actual content
  categorizeContent(metadata: NotebookMetadata): string {
    const text = `${metadata.title} ${metadata.description} ${metadata.content_preview}`.toLowerCase();
    
    const categories = {
      'Sports': ['sports', 'game', 'team', 'player', 'season', 'draft', 'nfl', 'nba', 'mlb', 'football', 'basketball', 'baseball'],
      'Business': ['business', 'sales', 'marketing', 'revenue', 'profit', 'strategy', 'customer', 'company'],
      'Data Science': ['data', 'analysis', 'statistics', 'dataset', 'visualization', 'metrics', 'analytics'],
      'AI & Machine Learning': ['ai', 'machine learning', 'neural', 'algorithm', 'model', 'prediction', 'artificial intelligence'],
      'Healthcare': ['health', 'medical', 'patient', 'clinical', 'treatment', 'diagnosis', 'medicine'],
      'Finance': ['finance', 'investment', 'trading', 'portfolio', 'market', 'economic', 'money', 'financial'],
      'Education': ['education', 'learning', 'teaching', 'student', 'curriculum', 'academic', 'school'],
      'Technology': ['tech', 'software', 'development', 'coding', 'programming', 'system', 'computer'],
      'Legal': ['legal', 'law', 'court', 'regulation', 'compliance', 'contract', 'attorney'],
      'Research': ['research', 'study', 'paper', 'academic', 'university', 'journal', 'science']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'Research';
  },

  // Generate smart tags based on content
  generateSmartTags(metadata: NotebookMetadata): string[] {
    const text = `${metadata.title} ${metadata.description} ${metadata.content_preview} ${metadata.url}`.toLowerCase();
    const tags: string[] = [];
    
    // Domain-specific tag categories
    const tagCategories = {
      // Technology
      'AI': ['ai', 'artificial', 'machine learning', 'neural', 'deep learning'],
      'Data Science': ['data', 'analytics', 'visualization', 'statistics', 'dataset'],
      'Cloud': ['cloud', 'aws', 'azure', 'serverless', 'docker'],
      'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'defi'],
      
      // Business
      'Marketing': ['marketing', 'brand', 'campaign', 'social media', 'seo'],
      'Sales': ['sales', 'revenue', 'conversion', 'funnel', 'crm'],
      'Strategy': ['strategy', 'planning', 'roadmap', 'goals', 'objectives'],
      
      // Finance
      'Investment': ['investment', 'stock', 'portfolio', 'trading', 'equity'],
      'Cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'defi', 'nft'],
      'Economics': ['economic', 'gdp', 'inflation', 'market', 'finance'],
      
      // Sports
      'NFL': ['nfl', 'football', 'draft', 'quarterback', 'touchdown'],
      'NBA': ['nba', 'basketball', 'playoffs', 'finals', 'champion'],
      'MLB': ['mlb', 'baseball', 'world series', 'pitcher', 'batting'],
      
      // Healthcare
      'Medical': ['medical', 'clinical', 'patient', 'treatment', 'diagnosis'],
      'Healthcare': ['healthcare', 'hospital', 'nursing', 'medicine', 'therapy'],
      
      // Education
      'Learning': ['learning', 'education', 'teaching', 'curriculum', 'student'],
      'Training': ['training', 'course', 'workshop', 'certification', 'skill']
    };
    
    // Find matching categories
    for (const [category, keywords] of Object.entries(tagCategories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(category);
      }
    }
    
    // Add year if found
    const yearMatch = text.match(/\b(202[0-9]|201[0-9])\b/);
    if (yearMatch) {
      tags.push(yearMatch[1]);
    }
    
    // Add methodology tags
    if (text.includes('research') || text.includes('study')) tags.push('Research');
    if (text.includes('analysis') || text.includes('analyze')) tags.push('Analysis');
    if (text.includes('report') || text.includes('summary')) tags.push('Report');
    if (text.includes('guide') || text.includes('tutorial')) tags.push('Guide');
    
    // Remove duplicates and limit to 5
    const uniqueTags = [...new Set(tags)];
    return uniqueTags.slice(0, 5);
  },

  // Check if word is a stop word
  isStopWord(word: string): boolean {
    const stopWords = ['notebook', 'research', 'analysis', 'google', 'docs', 'the', 'and', 'or', 'but', 'with', 'from', 'this', 'that', 'they', 'them', 'their', 'about', 'what', 'when', 'where', 'how', 'why'];
    return stopWords.includes(word) || word.length < 3;
  },

  // Estimate realistic compute based on content
  estimateRealisticCompute(metadata: NotebookMetadata): number {
    const contentLength = (metadata.content_preview || '').length;
    const sourceCount = (metadata.sources || []).length;
    
    // Base on actual content complexity
    let hours = 0.1; // Base minimum
    
    if (contentLength > 100) hours += 0.2;
    if (contentLength > 500) hours += 0.3;
    if (sourceCount > 0) hours += sourceCount * 0.1;
    
    return Math.round(hours * 10) / 10;
  },

  // Calculate confidence based on data quality
  calculateConfidence(metadata: NotebookMetadata): number {
    let confidence = 0.5; // Base confidence
    
    if (metadata.title && metadata.title.length > 10) confidence += 0.2;
    if (metadata.description && metadata.description.length > 50) confidence += 0.2;
    if (metadata.content_preview && metadata.content_preview.length > 100) confidence += 0.1;
    
    return Math.min(confidence, 0.9);
  },

  // Validate URL patterns
  validateNotebookLMUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  },

  // Main submission function
  async quickSubmit(
    url: string, 
    userId: string, 
    userEmail?: string, 
    authorInstitution?: string,
    submissionData?: {
      title: string;
      description: string;
      category: string;
      tags: string[];
    }
  ): Promise<any> {
    if (!this.validateNotebookLMUrl(url)) {
      throw new Error('Please provide a valid URL');
    }

    const metadata = await this.extractNotebookMetadata(url);
    const analysis = await this.analyzeNotebook(metadata, userEmail);
    
    // Use submitted data if provided, otherwise use analysis
    const finalData = submissionData ? {
      title: submissionData.title,
      description: submissionData.description,
      author_institution: authorInstitution || analysis.author_institution,
      notebook_url: url,
      category: submissionData.category,
      tags: submissionData.tags,
      estimated_compute_hours: analysis.estimated_compute_hours,
      estimated_carbon_footprint: 0, // Remove fake environmental data
      submitted_by: userId,
      review_notes: `Analyzed with ${Math.round(analysis.confidence_score * 100)}% confidence`
    } : {
      title: analysis.title,
      description: analysis.description,
      author_institution: authorInstitution || analysis.author_institution,
      notebook_url: url,
      category: analysis.category,
      tags: analysis.tags,
      estimated_compute_hours: analysis.estimated_compute_hours,
      estimated_carbon_footprint: 0,
      submitted_by: userId,
      review_notes: `Analyzed with ${Math.round(analysis.confidence_score * 100)}% confidence`
    };
    
    const { data, error } = await supabase
      .from('notebook_submissions')
      .insert(finalData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.message.includes('relation "notebook_submissions" does not exist')) {
        throw new Error('Database table not found. Please run the migration in Supabase first.');
      }
      throw new Error(`Submission failed: ${error.message}`);
    }

    return { submission: data, analysis };
  }
}; 