import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScraperService } from '../../services/scraperService';

// Mock fetch
global.fetch = vi.fn();

describe('ScraperService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scrapeUrl', () => {
    it('successfully scrapes a URL and returns content', async () => {
      const mockResponse = {
        json: () => Promise.resolve({
          contents: '<html><head><title>Test Title</title></head><body><p>Test content paragraph</p></body></html>'
        })
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await ScraperService.scrapeUrl('https://test.com');

      expect(result).toEqual({
        url: 'https://test.com',
        title: 'Test Title',
        content: expect.stringContaining('Test content paragraph'),
        wordCount: expect.any(Number),
        timestamp: expect.any(String)
      });
    });

    it('handles scraping errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(ScraperService.scrapeUrl('https://invalid.com'))
        .rejects.toThrow('Failed to scrape https://invalid.com');
    });

    it('extracts word count correctly', async () => {
      const mockResponse = {
        json: () => Promise.resolve({
          contents: '<html><body><p>One two three four five</p></body></html>'
        })
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await ScraperService.scrapeUrl('https://test.com');
      expect(result.wordCount).toBe(5);
    });
  });

  describe('URL validation', () => {
    it('handles URLs with no title', async () => {
      const mockResponse = {
        json: () => Promise.resolve({
          contents: '<html><body><p>Content without title</p></body></html>'
        })
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await ScraperService.scrapeUrl('https://test.com');
      expect(result.title).toBe('No title found');
    });

    it('filters out short content snippets', async () => {
      const mockResponse = {
        json: () => Promise.resolve({
          contents: '<html><body><p>Short</p><p>This is a longer paragraph with meaningful content</p></body></html>'
        })
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await ScraperService.scrapeUrl('https://test.com');
      expect(result.content).not.toContain('Short');
      expect(result.content).toContain('meaningful content');
    });
  });
});