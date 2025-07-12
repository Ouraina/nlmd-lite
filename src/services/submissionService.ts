import { supabase } from '../config/supabase';

export interface NotebookSubmission {
  id?: string;
  title: string;
  description: string;
  author_institution: string;
  notebook_url: string;
  category: string;
  tags?: string[];
  estimated_compute_hours?: number;
  estimated_carbon_footprint?: number;
  quality_score?: number;
  efficiency_rating?: string;
  status?: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface SubmissionFormData {
  title: string;
  description: string;
  author_institution: string;
  notebook_url: string;
  category: string;
  tags: string[];
  estimated_compute_hours?: number;
  estimated_carbon_footprint?: number;
}

export const submissionService = {
  // Submit a new notebook
  async submitNotebook(formData: SubmissionFormData): Promise<NotebookSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to submit a notebook');
    }

    const { data, error } = await supabase
      .from('notebook_submissions')
      .insert({
        ...formData,
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting notebook:', error);
      throw new Error('Failed to submit notebook');
    }

    return data;
  },

  // Get user's submissions
  async getUserSubmissions(userId: string): Promise<NotebookSubmission[]> {
    const { data, error } = await supabase
      .from('notebook_submissions')
      .select('*')
      .eq('submitted_by', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching user submissions:', error);
      throw new Error('Failed to fetch submissions');
    }

    return data || [];
  },

  // Get all approved submissions (for the main directory)
  async getApprovedSubmissions(): Promise<NotebookSubmission[]> {
    const { data, error } = await supabase
      .from('notebook_submissions')
      .select('*')
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved submissions:', error);
      throw new Error('Failed to fetch approved submissions');
    }

    return data || [];
  },

  // Update submission status (admin only)
  async updateSubmissionStatus(
    submissionId: string, 
    status: 'approved' | 'rejected', 
    reviewNotes?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await supabase
      .from('notebook_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: reviewNotes,
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error updating submission status:', error);
      throw new Error('Failed to update submission status');
    }
  },

  // Categories for the dropdown
  getCategories(): string[] {
    return [
      'AI & Machine Learning',
      'Data Science',
      'Research & Academia',
      'Business Analytics',
      'Education',
      'Healthcare',
      'Finance',
      'Marketing',
      'Engineering',
      'Creative Writing',
      'Legal',
      'Other'
    ];
  },

  // Validate notebook URL
  validateNotebookUrl(url: string): boolean {
    // Basic URL validation - you might want to make this more specific to NotebookLM URLs
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  },

  // Calculate estimated carbon footprint based on compute hours
  calculateEstimatedCarbonFootprint(computeHours: number): number {
    // Rough estimate: 0.5 kg CO2 per compute hour (this is a simplified calculation)
    return computeHours * 0.5;
  }
}; 