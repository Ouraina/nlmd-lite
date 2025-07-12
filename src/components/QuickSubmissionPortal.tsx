import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { realNotebookAnalysisService, NotebookAnalysis } from '../services/realNotebookAnalysisService';
import { 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Brain,
  Zap,
  Edit3,
  Clock
} from 'lucide-react';

export const QuickSubmissionPortal: React.FC = () => {
  const { user } = useAuth();
  const [notebookUrl, setNotebookUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<NotebookAnalysis | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  // Editable fields
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [editableAuthor, setEditableAuthor] = useState('');
  const [editableCategory, setEditableCategory] = useState('');
  const [editableTags, setEditableTags] = useState<string[]>([]);

  const categories = ['Sports', 'Business', 'Data Science', 'AI & Machine Learning', 'Healthcare', 'Finance', 'Education', 'Technology', 'Legal', 'Research'];

  const handleAnalyze = async () => {
    if (!notebookUrl.trim()) {
      setError('Please enter a NotebookLM URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const metadata = await realNotebookAnalysisService.extractNotebookMetadata(notebookUrl);
      const analysisResult = await realNotebookAnalysisService.analyzeNotebook(metadata, user?.email);
      
      setAnalysis(analysisResult);
      
      // Set editable fields
      setEditableTitle(analysisResult.title);
      setEditableDescription(analysisResult.description);
      setEditableAuthor(analysisResult.author_institution);
      setEditableCategory(analysisResult.category);
      setEditableTags(analysisResult.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze notebook');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !analysis) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setError('');

    try {
      // Use the edited values
      const submissionData = {
        title: editableTitle,
        description: editableDescription,
        category: editableCategory,
        tags: editableTags
      };

      await realNotebookAnalysisService.quickSubmit(
        notebookUrl, 
        user.id, 
        user.email, 
        editableAuthor,
        submissionData
      );
      setSubmitStatus('success');
      
      // Reset form
      setNotebookUrl('');
      setAnalysis(null);
      setEditableTitle('');
      setEditableDescription('');
      setEditableAuthor('');
      setEditableCategory('');
      setEditableTags([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit notebook');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotebookUrl(e.target.value);
    setError('');
    setAnalysis(null);
  };

  const addTag = (tagText: string) => {
    if (tagText.trim() && !editableTags.includes(tagText.trim())) {
      setEditableTags([...editableTags, tagText.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter(tag => tag !== tagToRemove));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-slate-300 mb-8">You need to be signed in to submit a notebook to the directory.</p>
            <a
              href="/login"
              className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 font-medium inline-block"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Submit Your <span className="text-green-400">Notebook</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Paste your NotebookLM link and we'll extract the details automatically
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Notebook submitted successfully! We'll review it soon.</span>
          </div>
        )}

        {/* URL Input */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="url"
              value={notebookUrl}
              onChange={handleUrlChange}
              placeholder="Paste your NotebookLM public link here..."
              className="w-full px-6 py-4 pr-16 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
            <ExternalLink className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !notebookUrl.trim()}
            className="bg-green-500 text-black px-8 py-3 rounded-lg hover:bg-green-400 disabled:bg-green-600 disabled:cursor-not-allowed font-medium text-lg inline-flex items-center gap-3"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <Brain className="w-5 h-5 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <Zap className="w-5 h-5" />
                Analyze Notebook
              </>
            )}
          </button>
        </div>

        {/* Results - Clean Single Block */}
        {analysis && (
          <div className="mb-8">
            <div className="bg-slate-800/80 rounded-lg border border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Extracted Information</h3>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Clock className="w-4 h-4" />
                    <span>{analysis.estimated_compute_hours}h processing</span>
                    <span className="text-slate-400">•</span>
                    <span>{Math.round(analysis.confidence_score * 100)}% confidence</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  
                  {/* Title Enhancement Options */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-2">Enhance title:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Analysis',
                        'Research',
                        'Study',
                        'Guide',
                        'Report',
                        '2025'
                      ].map((enhancement) => (
                        <button
                          key={enhancement}
                          onClick={() => {
                            if (!editableTitle.includes(enhancement)) {
                              setEditableTitle(prev => `${prev} ${enhancement}`.trim());
                            }
                          }}
                          className="px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        >
                          + {enhancement}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your notebook..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  
                  {/* Description Templates */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-2">Quick templates:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Comprehensive analysis of',
                        'Research study focusing on',
                        'Data-driven insights into',
                        'Strategic overview of',
                        'In-depth exploration of',
                        'Practical guide to'
                      ].map((template, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const newDesc = editableDescription.trim() 
                              ? `${editableDescription.endsWith('.') ? editableDescription : editableDescription + '.'} ${template} ${editableTitle?.toLowerCase() || 'the topic'}.`
                              : `${template} ${editableTitle?.toLowerCase() || 'the topic'}.`;
                            setEditableDescription(newDesc);
                          }}
                          className="px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        >
                          + {template}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    rows={3}
                    placeholder="Enter a description of your notebook's content and purpose..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white resize-none"
                  />
                </div>

                {/* Row: Author + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Author</label>
                    <input
                      type="text"
                      value={editableAuthor}
                      onChange={(e) => setEditableAuthor(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={editableCategory}
                      onChange={(e) => setEditableCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                  
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editableTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm cursor-pointer hover:bg-green-500/30 transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <span className="text-xs hover:text-red-400">×</span>
                      </span>
                    ))}
                  </div>
                  
                  {/* Quick Tag Suggestions */}
                  {editableTags.length < 5 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-2">Quick add:</p>
                      <div className="flex flex-wrap gap-1">
                        {['AI', 'Data Science', 'Research', 'Analysis', 'Guide', 'Tutorial', '2025', 'Machine Learning', 'Business', 'Strategy', 'Healthcare', 'Finance', 'Education', 'Sports', 'Technology'].filter(tag => !editableTags.includes(tag)).slice(0, 8).map(tag => (
                          <button
                            key={tag}
                            onClick={() => addTag(tag)}
                            className="px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Tag Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type a custom tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white text-sm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                      Press Enter
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-600">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 disabled:bg-green-600 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Submit to Directory
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-400" />
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-white">Extract Metadata</p>
                <p className="text-slate-300">We analyze your public notebook URL to extract title and content information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-white">Smart Categorization</p>
                <p className="text-slate-300">Automatic categorization and tag generation based on content analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-white">Review & Submit</p>
                <p className="text-slate-300">Edit any extracted information and submit to our curated directory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 