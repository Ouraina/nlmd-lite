import React from 'react';
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
  const [activeCollection, setActiveCollection] = React.useState('week');

  return (
    <div className="bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] min-h-screen text-white">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 md:px-0 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-green-500/10 text-green-400 px-4 py-1 rounded-full font-semibold text-xs mb-4">
            🚀 July 2025 • Global Launch • Community & Research
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            The Premier <span className="text-green-400">NotebookLM</span> Directory
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 mb-8">
            Discover. Build. Accelerate.<br />
            Help us build a smarter ecosystem by curating and creating amazing notebooks. We are powered by collaboration, ready to track and share the massive computational footprint of AI research. <span className="text-green-400">Contribute your vision and discover what’s possible.</span>
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 e.g. LLM, climate, curriculum, creative..."
              className="w-full md:w-96 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button className="bg-green-400 text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-300 transition-colors">
              Get Started
            </button>
          </div>
          {/* Subscribe & Support CTA */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <button
              className="relative bg-green-500 text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-400 transition-colors shadow-lg flex items-center gap-3"
              onClick={() => window.location.href = '/pricing'}
            >
              <span>Subscribe & Support</span>
              <span className="absolute -top-4 right-0 bg-green-700 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse border-2 border-green-300 shadow">Founders Launch Special</span>
            </button>
            <span className="text-green-300 text-xs font-semibold mt-2">Get PRO features for life, no price increases, ever.</span>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
            <button className="bg-green-500/10 border border-green-400 text-green-300 px-6 py-2 rounded-lg font-semibold hover:bg-green-400/20 transition-colors">
              Support Our Growth
            </button>
            <button className="bg-slate-800 border border-slate-600 text-slate-200 px-6 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
              Contribute Content
            </button>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl py-4 px-6 mb-8 inline-block">
            <span className="text-green-400 font-bold">Est. July 2025</span> – Global Launch
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

      {/* Listen to the Vision */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-16">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Listen to the Vision</h2>
          <audio controls className="w-full max-w-md mb-2">
            <source src="/NotebookLM_Directory_Overview.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <span className="text-slate-400 text-sm">Hear a glimpse of our vision for a shared AI research ecosystem.</span>
        </div>
      </section>

      {/* Popular Notebooks */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Popular <span className="text-green-400">Notebooks</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoNotebooks.map(nb => (
            <div key={nb.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col shadow-lg hover:border-green-400 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-400/10 text-green-300 px-2 py-1 rounded-full text-xs font-bold">{nb.category}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{nb.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{nb.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {nb.tags.map((tag, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{nb.views} views</span>
                <button className="text-green-400 hover:text-green-300 font-medium">{nb.cta} →</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-green-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-green-300 transition-colors">
            View All Notebooks
          </button>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured <span className="text-green-400">Collections</span></h2>
        <div className="flex justify-center gap-4 mb-8">
          {collections.map(col => (
            <button
              key={col.key}
              onClick={() => setActiveCollection(col.key)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeCollection === col.key ? 'bg-green-400 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {col.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map(proj => (
            <div key={proj.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col shadow-lg hover:border-green-400 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-400/10 text-green-300 px-2 py-1 rounded-full text-xs font-bold">{proj.category}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{proj.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{proj.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {proj.tags.map((tag, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{proj.views} views</span>
                <button className="text-green-400 hover:text-green-300 font-medium">{proj.cta} →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Subscribe Section */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-16">
        <div className="bg-green-500/10 border border-green-400 rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-green-300">Why Subscribe?</h2>
          <p className="text-slate-200 mb-4 text-lg">Your subscription powers open research, sustainable AI, and new features for all. Early supporters get a <span className='text-green-400 font-bold'>Founders badge</span> and <span className='text-green-400 font-bold'>lifetime PRO access</span>.</p>
          <ul className="text-left text-slate-300 mb-4 space-y-2">
            <li>• <span className="text-green-300 font-semibold">Founders Forever:</span> Get PRO features for life, no price increases, ever.</li>
            <li>• <span className="text-green-300 font-semibold">Unlimited notebook discovery</span> and advanced AI features</li>
            <li>• <span className="text-green-300 font-semibold">Carbon impact dashboard</span> and sustainability metrics</li>
            <li>• <span className="text-green-300 font-semibold">Priority support</span> and early access to new features</li>
            <li>• <span className="text-green-300 font-semibold">Founders badge</span> on your profile</li>
          </ul>
          <button
            className="bg-green-400 text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-300 transition-colors shadow"
            onClick={() => window.location.href = '/pricing'}
          >
            Subscribe & Support
          </button>
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
