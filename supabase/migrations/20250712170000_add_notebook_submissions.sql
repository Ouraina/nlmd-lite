-- Create notebook submissions table
CREATE TABLE IF NOT EXISTS notebook_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_institution TEXT NOT NULL,
    notebook_url TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    estimated_compute_hours DECIMAL,
    estimated_carbon_footprint DECIMAL,
    quality_score DECIMAL DEFAULT 0,
    efficiency_rating TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notebook_submissions_status ON notebook_submissions(status);
CREATE INDEX idx_notebook_submissions_category ON notebook_submissions(category);
CREATE INDEX idx_notebook_submissions_submitted_by ON notebook_submissions(submitted_by);
CREATE INDEX idx_notebook_submissions_submitted_at ON notebook_submissions(submitted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE notebook_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view approved submissions" ON notebook_submissions
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own submissions" ON notebook_submissions
    FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users can insert their own submissions" ON notebook_submissions
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can update their own pending submissions" ON notebook_submissions
    FOR UPDATE USING (submitted_by = auth.uid() AND status = 'pending');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_notebook_submissions_updated_at
    BEFORE UPDATE ON notebook_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 