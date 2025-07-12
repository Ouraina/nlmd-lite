import React, { useState } from 'react';
import { 
  ExternalLink, 
  Play, 
  MessageCircle, 
  FileText, 
  Users, 
  Star, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2,
  Mail,
  X
} from 'lucide-react';
import { PublicNotebook } from '../services/publicNotebookDiscoveryService';
import { useAuth } from '../hooks/useAuth';

interface NotebookViewerProps {
  notebook: PublicNotebook;
  isOpen: boolean;
  onClose: () => void;
}

export const NotebookViewer: React.FC<NotebookViewerProps> = ({ notebook, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [hasEmail, setHasEmail] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setHasEmail(true);
      setShowEmailCapture(false);
      // Store email in localStorage for now
      localStorage.setItem('userEmail', email);
      console.log('📧 Captured user email:', email);
      // After capturing email, redirect to original notebook
      window.open(notebook.public_url, '_blank');
    }
  };

  const handleViewOriginal = () => {
    // Log demo link warning
    if (notebook.title.includes('[DEMO]') || notebook.tags.includes('DEMO')) {
      console.warn('⚠️ This is a DEMO link. Real public NotebookLM links will be submitted by users.');
      alert('📍 DEMO CONTENT: This is a sample notebook to demonstrate our discovery engine. Real public NotebookLM links will be submitted by users and verified by our community.');
    }
    
    // If user is authenticated, send them directly to Google (good faith)
    if (user) {
      console.log('🔓 User authenticated, redirecting directly to Google NotebookLM');
      window.open(notebook.public_url, '_blank');
      return;
    }
    
    // For non-authenticated users, check if they've already provided email
    if (!hasEmail && !localStorage.getItem('userEmail')) {
      console.log('📧 Non-authenticated user, requesting email capture');
      setShowEmailCapture(true);
      return;
    }
    
    // User has provided email, send to notebook
    window.open(notebook.public_url, '_blank');
  };

  const getInteractionBadges = (features: PublicNotebook['interaction_features']) => {
    const badges = [];
    if (features.has_audio_overview) badges.push({ icon: Play, label: 'Audio Overview', color: 'bg-blue-500/20 text-blue-400' });
    if (features.has_faq) badges.push({ icon: MessageCircle, label: 'FAQ', color: 'bg-green-500/20 text-green-400' });
    if (features.has_briefing_docs) badges.push({ icon: FileText, label: 'Briefing Docs', color: 'bg-purple-500/20 text-purple-400' });
    if (features.allows_questions) badges.push({ icon: Users, label: 'Q&A', color: 'bg-orange-500/20 text-orange-400' });
    return badges;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm font-medium">
                {notebook.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">{notebook.discovery_metadata.quality_score.toFixed(1)}</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{notebook.title}</h1>
            {notebook.author_name && (
              <p className="text-slate-300">
                by {notebook.author_name}
                {notebook.author_institution && (
                  <span className="text-slate-400"> • {notebook.author_institution}</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-slate-300 leading-relaxed">{notebook.description}</p>
          </div>

          {/* Interactive Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Interactive Features</h3>
            <div className="flex flex-wrap gap-3">
              {getInteractionBadges(notebook.interaction_features).map((badge, index) => (
                <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${badge.color}`}>
                  <badge.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {notebook.tags.map((tag) => (
                <span key={tag} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Research Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Word Count</div>
                <div className="text-lg font-semibold text-white">
                  {notebook.discovery_metadata.word_count_estimate.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Sources</div>
                <div className="text-lg font-semibold text-white">
                  {notebook.discovery_metadata.source_count_estimate}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Type</div>
                <div className="text-lg font-semibold text-white capitalize">
                  {notebook.content_type}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Verified</div>
                <div className="text-lg font-semibold text-green-400">
                  {new Date(notebook.discovery_metadata.last_verified).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Community Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Community Engagement</h3>
            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span>{notebook.community_metrics.view_count.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span>{notebook.community_metrics.like_count.toLocaleString()} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-400" />
                <span>{notebook.community_metrics.share_count.toLocaleString()} shares</span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-yellow-400" />
                <span>{notebook.community_metrics.bookmark_count.toLocaleString()} bookmarks</span>
              </div>
            </div>
          </div>

          {/* Email Capture Modal */}
          {showEmailCapture && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
              <div className="text-center mb-4">
                <Mail className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Continue to Original NLM</h3>
                <p className="text-slate-300">
                  Quick email capture to continue to Google's NotebookLM. 
                  <br />
                  <span className="text-sm text-slate-400">
                    (Signed-in users skip this step - we respect your privacy!)
                  </span>
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 font-medium transition-colors"
                >
                  Continue
                </button>
              </form>
              <button
                onClick={() => setShowEmailCapture(false)}
                className="mt-3 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Heart className="w-5 h-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" />
              <span>Bookmark</span>
            </button>
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleViewOriginal}
              className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 font-medium flex items-center gap-2 transition-colors"
            >
              <span>View Original NLM</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 