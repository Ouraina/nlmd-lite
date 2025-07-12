export interface ScrapingJob {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  title?: string;
  content?: string;
  word_count?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface BatchJob {
  id: string;
  name: string;
  urls: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_jobs: number;
  completed_jobs: number;
  created_at: string;
  completed_at?: string;
}

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  timestamp: string;
}