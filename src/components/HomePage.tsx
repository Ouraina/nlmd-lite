import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Leaf, Users, Sparkles, BarChart3, Shield, TestTube, Globe, Star } from 'lucide-react';

const demoNotebooks = [
  {
    id: '1',
    category: 'RESEARCH · DIRECTORY',
    title: 'notebooklm.directory',
    description: 'Vibrant ecosystem for curating this standard.',
    tags: ['AI', 'Directory'],
    views: 1200,
    cta: 'View',
  },
  {
    id: '2',
    category: 'BUSINESS · DIRECTORY',
    title: 'Startup Pitch Deck Analyzer',
    description: 'Comprehensive analysis of early and successful startup pitch decks, with AI-powered scoring and feedback.',
    tags: ['Business', 'AI'],
    views: 980,
    cta: 'View',
  },
  {
    id: '3',
    category: 'CREATIVE · WRITING',
    title: 'Creative Writing Workshop',
    description: 'AI-powered creative writing prompts and collaborative workshops for aspiring authors.',
    tags: ['Creative', 'Writing'],
    views: 750,
    cta: 'View',
  },
  {
    id: '4',
    category: 'RESEARCH · LITERATURE',
    title: 'Academic Literature Review Assistant',
    description: 'AI assistant for academic literature research, summarization, and citation management.',
    tags: ['Academic', 'Research'],
    views: 1100,
    cta: 'View',
  },
  {
    id: '5',
    category: 'BUSINESS · EDUCATION',
    title: 'Educational Curriculum Designer',
    description: 'AI-assisted curriculum design for educators, with standards alignment and resource suggestions.',
    tags: ['Education', 'AI'],
    views: 860,
    cta: 'View',
  },
  {
    id: '6',
    category: 'PERSONAL · FINANCE',
    title: 'Personal Finance Optimizer',
    description: 'AI-driven personal finance and budgeting assistant for individuals and families.',
    tags: ['Finance', 'Personal'],
    views: 670,
    cta: 'View',
  },
];

const featuredProjects = [
  {
    id: '1',
    category: 'RESEARCH · LITERATURE',
    title: 'Academic Literature Review Assistant',
    description: 'AI assistant for academic literature research, summarization, and citation management.',
    tags: ['Academic', 'Research'],
    views: 1100,
    cta: 'View',
  },
  {
    id: '2',
    category: 'BUSINESS · DIRECTORY',
    title: 'Startup Pitch Deck Analyzer',
    description: 'Comprehensive analysis of early and successful startup pitch decks, with AI-powered scoring and feedback.',
    tags: ['Business', 'AI'],
    views: 980,
    cta: 'View',
  },
];

const collections = [
  { name: 'This Week', key: 'week' },
  { name: 'Academic Excellence', key: 'academic' },
  { name: 'Creative Projects', key: 'creative' },
];

const HomePage: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] min-h-screen text-white">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 md:px-0 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-green-500/10 text-green-400 px-4 py-1 rounded-full font-semibold text-xs mb-4">
            🚀 July 2025 • Global Launch • Community & Research
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-slate-300 text-2xl md:text-4xl">The Premier NotebookLM</span><br />
            <span className="text-green-400 text-5xl md:text-7xl drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">Directory</span>
          </h1>
          <div className="text-2xl md:text-3xl font-bold text-white mb-6 animate-[pulse_3s_ease-in-out_infinite,bounce_4s_ease-in-out_infinite]">
            Discover. Build. Accelerate.
          </div>
          <p className="text-lg md:text-xl text-slate-300 mb-8">
            Help us build a smarter ecosystem by curating and creating amazing notebooks. We are powered by collaboration, ready to track and share the massive computational footprint of AI research. <span className="text-green-400">Contribute your vision and discover what's possible.</span>
          </p>
          
          {/* Primary Action: Search + Get Started */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
            <input
              type="text"
              placeholder="🔍 e.g. LLM, climate, curriculum, creative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full md:w-96 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button 
              onClick={handleSearch}
              className="bg-green-400 text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-300 transition-colors"
            >
              Discover
            </button>
          </div>

          {/* Listen to the Vision - Moved Higher */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">🎧 Listen to the Vision</h3>
            <audio controls className="w-full max-w-md mx-auto mb-2 [&::-webkit-media-controls-panel]:bg-green-400 [&::-webkit-media-controls-current-time-display]:text-black [&::-webkit-media-controls-time-remaining-display]:text-black">
              <source src="/NotebookLM_Directory_Overview.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-slate-400 text-sm text-center">Hear our vision for a shared AI research ecosystem</p>
          </div>
          
          {/* Secondary Action: Subscribe - Higher Priority */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Why Subscribe?</h3>
            <button
              className="relative bg-green-500/10 border border-green-400 text-green-300 px-8 py-3 rounded-lg font-semibold hover:bg-green-400/20 transition-colors"
              onClick={() => window.location.href = '/pricing'}
            >
              <span>Subscribe & Support</span>
              <span className="absolute -top-2 -right-2 bg-green-400 text-black text-xs px-2 py-1 rounded-full font-semibold">Special</span>
            </button>
            <p className="text-slate-400 text-sm mt-2">Get PRO features for life, no price increases, ever.</p>
          </div>
          
          {/* Launch Date */}
          <div className="text-slate-400 text-sm">
            <span className="text-green-400 font-medium">Est. July 2025</span> – Global Launch
          </div>
        </div>
      </section>

      {/* Mission & Value Cards */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <Sparkles className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Our Mission</h3>
          <p className="text-slate-300">Expand access to AI research, foster collaboration, and accelerate discovery for all.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <Leaf className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Environmental Impact</h3>
          <p className="text-slate-300">Track, share, and reduce the carbon footprint of AI research and computation.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <Users className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Community Driven</h3>
          <p className="text-slate-300">Join a vibrant, open community of researchers, builders, and creators.</p>
        </div>
      </section>

      {/* Why Subscribe Section - Moved Higher */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-16">
        <div className="bg-green-500/10 border border-green-400 rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-green-300">Why Subscribe?</h2>
          <p className="text-slate-200 mb-6 text-lg">Your subscription powers open research, sustainable AI, and new features for all. Early supporters get a <span className='text-green-400 font-bold'>Founders badge</span> and <span className='text-green-400 font-bold'>lifetime PRO access</span>.</p>
          <ul className="text-left text-slate-300 mb-6 space-y-3 text-lg">
            <li>• <span className="text-green-300 font-semibold">Founders Forever:</span> Get PRO features for life, no price increases, ever.</li>
            <li>• <span className="text-green-300 font-semibold">Unlimited notebook discovery</span> and advanced AI features</li>
            <li>• <span className="text-green-300 font-semibold">Carbon impact dashboard</span> and sustainability metrics</li>
            <li>• <span className="text-green-300 font-semibold">Priority support</span> and early access to new features</li>
            <li>• <span className="text-green-300 font-semibold">Founders badge</span> on your profile</li>
          </ul>
          <button
            className="bg-green-400 text-black px-10 py-4 rounded-lg font-bold text-xl hover:bg-green-300 transition-colors shadow-lg"
            onClick={() => window.location.href = '/pricing'}
          >
            Subscribe & Support
          </button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-16">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Help Us Build Something Amazing</h2>
          <p className="text-slate-300 mb-4">Help us build the world’s best NotebookLM Directory. Your support enables us to create better discovery tools, protect research, and source inspiration for the entire AI community.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="bg-green-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors">
              Support Our Growth
            </button>
            <button className="bg-slate-800 border border-slate-600 text-slate-200 px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors">
              Explore Directory
            </button>
          </div>
        </div>
      </section>

      {/* Sustainable AI Research Section */}
      <section className="text-center mb-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Building the Future of <span className="text-green-400">Sustainable AI Research Discovery</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Every shareable notebook powers landmark research, saves computational resources, and accelerates discovery for the entire AI community.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <BookOpen className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Discover cutting-edge NotebookLM projects</h3>
          <p className="text-slate-300">Search our worldwide notebook archive.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <Globe className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Share your work and accelerate discovery</h3>
          <p className="text-slate-300">Contribute, curate, and collaborate with the global AI community.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
          <Star className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-bold text-lg mb-2">Build on existing knowledge, don’t reinvent</h3>
          <p className="text-slate-300">Leverage the best work from across the world.</p>
        </div>
      </section>







      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-center py-6 text-sm border-t border-slate-800">
        © 2024 NotebookLM Directory. Designed for future research and creativity.
      </footer>
    </div>
  );
};

export default HomePage;
