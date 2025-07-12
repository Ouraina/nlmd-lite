import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScrapingDashboard } from '../../components/ScrapingDashboard';

// Mock the scraper service
vi.mock('../../services/scraperService', () => ({
  ScraperService: {
    getScrapingJobs: vi.fn(() => Promise.resolve([])),
    getBatchJobs: vi.fn(() => Promise.resolve([])),
    saveScrapingJob: vi.fn(() => Promise.resolve('test-id')),
    scrapeUrl: vi.fn(() => Promise.resolve({
      title: 'Test Title',
      content: 'Test Content',
      wordCount: 100,
      timestamp: new Date().toISOString()
    })),
    updateScrapingJob: vi.fn(() => Promise.resolve()),
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ScrapingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard with correct title', () => {
    renderWithRouter(<ScrapingDashboard />);
    expect(screen.getByText('Web Scraping Dashboard')).toBeInTheDocument();
  });

  it('displays stats cards', () => {
    renderWithRouter(<ScrapingDashboard />);
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('allows switching between single and batch tabs', () => {
    renderWithRouter(<ScrapingDashboard />);
    
    const batchTab = screen.getByText('Batch URLs');
    fireEvent.click(batchTab);
    
    expect(screen.getByPlaceholderText('My Batch Job')).toBeInTheDocument();
  });

  it('validates URL input before starting scraping', () => {
    renderWithRouter(<ScrapingDashboard />);
    
    const startButton = screen.getByText('Start Scraping');
    expect(startButton).toBeDisabled();
    
    const urlInput = screen.getByPlaceholderText('https://example.com');
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
    
    expect(startButton).not.toBeDisabled();
  });

  it('displays export data button', () => {
    renderWithRouter(<ScrapingDashboard />);
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });
});