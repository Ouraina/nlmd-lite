import { supabase } from '../config/supabase';
import { ScrapingJob, BatchJob, ScrapedContent } from '../types/scraper';
import { v4 as uuidv4 } from 'uuid';

export class ScraperService {
  static async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      // Since we're in a browser environment, we'll simulate scraping
      // In a real application, this would be handled by a backend service
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Extract title
      const title = doc.querySelector('title')?.textContent || 'No title found';
      
      // Extract main content
      const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, main');
      const content = Array.from(contentElements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 20)
        .join('\n\n');
      
      const wordCount = content.split(/\s+/).length;
      
      return {
        url,
        title: title.trim(),
        content: content.trim(),
        wordCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to scrape ${url}: ${error}`);
    }
  }

  static async saveScrapingJob(job: Omit<ScrapingJob, 'id' | 'created_at'>): Promise<string> {
    const newJob = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...job
    };

    const { data, error } = await supabase
      .from('scraping_jobs')
      .insert(newJob)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async updateScrapingJob(id: string, updates: Partial<ScrapingJob>): Promise<void> {
    const { error } = await supabase
      .from('scraping_jobs')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async getScrapingJobs(): Promise<ScrapingJob[]> {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createBatchJob(name: string, urls: string[]): Promise<string> {
    const batchJob = {
      id: uuidv4(),
      name,
      urls,
      status: 'pending' as const,
      total_jobs: urls.length,
      completed_jobs: 0,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('batch_jobs')
      .insert(batchJob)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async getBatchJobs(): Promise<BatchJob[]> {
    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}