import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Plus, Play, Filter, Globe, Leaf } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Notebook {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  carbon_score: number;
  views: number;
  category: string;
  created_at: string;
}

const HomePage: React.FC = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotebooks = notebooks.filter(notebook => {
    const matchesSearch = notebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notebook.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notebook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || notebook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Academic', 'Business', 'Creative', 'Environmental', 'General'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-400 text-black px-3 py-1 rounded-full font-bold text-sm">
              NLM D
            </div>
            <div>
              <h1 className="text-2xl font-bold">notebooklm.directory</h1>
              <p className="text-gray-400 text-sm">Discover. Build. Accelerate.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">2.3M+ views • 47 countries</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-green-300 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Connect New Notebook</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notebooks, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-green-400 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notebooks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading notebooks...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotebooks.map((notebook) => (
              <div key={notebook.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-400 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-400 text-black px-2 py-1 rounded text-xs font-bold">
                      {notebook.category}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Leaf size={12} />
                      <span>{notebook.carbon_score}%</span>
                    </div>
                  </div>
                  <button className="text-green-400 hover:text-green-300">
                    <Play size={16} />
                  </button>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{notebook.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{notebook.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {notebook.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Globe size={12} />
                    <span>{notebook.views} views</span>
                  </div>
                  <a 
                    href={notebook.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Open →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotebooks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">No notebooks found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
};

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> 56538ba3cf656c39958ea1853b33d82ba75f0a95
