/*
  # Notebook Discovery and Scraping System

  1. New Tables
    - `scraping_operations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `operation_name` (text)
      - `source_platform` (text with constraints)
      - `search_query` (text)
      - `max_results` (integer)
      - `status` (text with constraints)
      - `items_discovered` (integer)
      - `items_processed` (integer)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `scraped_items`
      - `id` (uuid, primary key)
      - `operation_id` (uuid, foreign key to scraping_operations)
      - `title` (text)
      - `description` (text)
      - `source_url` (text)
      - `source_platform` (text)
      - `author` (text)
      - `institution` (text)
      - `published_date` (timestamptz)
      - `tags` (text array)
      - `category` (text with constraints)
      - `quality_score` (numeric)
      - `relevance_score` (numeric)
      - `estimated_compute_hours` (numeric)
      - `carbon_footprint_grams` (numeric)
      - `energy_efficiency_rating` (text with constraints)
      - `processing_status` (text with constraints)
      - `auto_imported` (boolean)
      - `discovered_at` (timestamptz)
      - `analyzed_at` (timestamptz)
      - `imported_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance optimization

  3. Integration
    - Links with existing notebook_directory for seamless import
    - Connects with environmental_impact tracking
    - User-scoped data access and management
*/

-- Create scraping_operations table
CREATE TABLE IF NOT EXISTS scraping_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  operation_name text NOT NULL,
  source_platform text NOT NULL CHECK (source_platform IN ('github', 'kaggle', 'notebooklm', 'papers_with_code', 'academic', 'youtube', 'reddit', 'twitter', 'all')),
  search_query text NOT NULL,
  max_results integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  items_discovered integer DEFAULT 0,
  items_processed integer DEFAULT 0,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scraped_items table
CREATE TABLE IF NOT EXISTS scraped_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES scraping_operations(id),
  title text NOT NULL,
  description text,
  source_url text NOT NULL,
  source_platform text NOT NULL,
  author text,
  institution text,
  published_date timestamptz,
  tags text[] DEFAULT '{}',
  category text CHECK (category IN ('Academic', 'Business', 'Creative', 'Research', 'Education', 'Personal')),
  quality_score numeric(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  relevance_score numeric(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  estimated_compute_hours numeric(10,2),
  carbon_footprint_grams numeric(10,2),
  energy_efficiency_rating text CHECK (energy_efficiency_rating IN ('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'unknown')),
  processing_status text NOT NULL DEFAULT 'discovered' CHECK (processing_status IN ('discovered', 'analyzed', 'imported', 'rejected')),
  auto_imported boolean DEFAULT false,
  discovered_at timestamptz DEFAULT now(),
  analyzed_at timestamptz,
  imported_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE scraping_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_items ENABLE ROW LEVEL SECURITY;

-- Create policies for scraping_operations
CREATE POLICY "Users can view their own scraping operations"
  ON scraping_operations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraping operations"
  ON scraping_operations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraping operations"
  ON scraping_operations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for scraped_items
CREATE POLICY "Users can view scraped items from their operations"
  ON scraped_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scraping_operations 
      WHERE scraping_operations.id = scraped_items.operation_id 
      AND scraping_operations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scraped items for their operations"
  ON scraped_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scraping_operations 
      WHERE scraping_operations.id = scraped_items.operation_id 
      AND scraping_operations.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS scraping_operations_user_id_idx ON scraping_operations(user_id);
CREATE INDEX IF NOT EXISTS scraping_operations_status_idx ON scraping_operations(status);
CREATE INDEX IF NOT EXISTS scraping_operations_source_platform_idx ON scraping_operations(source_platform);

CREATE INDEX IF NOT EXISTS scraped_items_operation_id_idx ON scraped_items(operation_id);
CREATE INDEX IF NOT EXISTS scraped_items_source_platform_idx ON scraped_items(source_platform);
CREATE INDEX IF NOT EXISTS scraped_items_processing_status_idx ON scraped_items(processing_status);
CREATE INDEX IF NOT EXISTS scraped_items_quality_score_idx ON scraped_items(quality_score);
CREATE INDEX IF NOT EXISTS scraped_items_energy_efficiency_idx ON scraped_items(energy_efficiency_rating);