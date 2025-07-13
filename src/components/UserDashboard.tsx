import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Upload, Folder, Star, Search, Filter, 
  Eye, Heart, Share2, Grid3X3, Table, BarChart3, Clock, Award, 
  Bookmark, Download, Settings, ChevronDown, SlidersHorizontal,
  Zap, Globe, Atom, Brain, Target, Layers, Calendar, User, ExternalLink,
  FolderPlus, Trash2, Edit3, Move, Copy
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Link, useNavigate } from 'react-router-dom';

interface PersonalNotebook {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  addedDate: string;
  lastViewed?: string;
  favorite: boolean;
  folderId?: string;
  author?: string;
  institution?: string;
}

interface NotebookFolder {
  id: string;
  name: string;
  color: string;
  notebookCount: number;
  createdDate: string;
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription(user?.id);
  const navigate = useNavigate();
  const isPremium = isActive();

  const [notebooks, setNotebooks] = useState<PersonalNotebook[]>([]);
  const [folders, setFolders] = useState<NotebookFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [urlToAdd, setUrlToAdd] = useState('');

  useEffect(() => {
    if (user) {
      loadUserNotebooks();
      loadUserFolders();
    }
  }, [user]);

  const loadUserNotebooks = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockNotebooks: PersonalNotebook[] = [
        {
          id: '1',
          title: 'My Research Notes',
          description: 'Personal research compilation on AI ethics and governance',
          url: 'https://notebooklm.google.com/notebook/abc123',
          tags: ['AI', 'Ethics', 'Research'],
          category: 'Research',
          addedDate: '2024-01-15',
          lastViewed: '2024-01-20',
          favorite: true,
          author: 'You',
          institution: 'Personal'
        },
        {
          id: '2',
          title: 'Project Planning Templates',
          description: 'Collection of project management templates and frameworks',
          url: 'https://notebooklm.google.com/notebook/def456',
          tags: ['Project Management', 'Templates', 'Business'],
          category: 'Business',
          addedDate: '2024-01-10',
          favorite: false,
          author: 'You',
          institution: 'Personal'
        }
      ];
      setNotebooks(mockNotebooks);
    } catch (error) {
      console.error('Error loading user notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFolders = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockFolders: NotebookFolder[] = [
        {
          id: '1',
          name: 'Research Projects',
          color: 'blue',
          notebookCount: 5,
          createdDate: '2024-01-01'
        },
        {
          id: '2',
          name: 'Work Documents',
          color: 'green',
          notebookCount: 3,
          createdDate: '2024-01-05'
        }
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error('Error loading user folders:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    const url = e.dataTransfer.getData('text/plain');
    if (url && url.includes('notebooklm.google.com')) {
      addNotebookFromUrl(url);
    }
  };

  const addNotebookFromUrl = async (url: string) => {
    try {
      // Mock API call - replace with actual service
      const newNotebook: PersonalNotebook = {
        id: Date.now().toString(),
        title: 'New Notebook',
        description: 'Notebook added from URL',
        url,
        tags: [],
        category: 'Personal',
        addedDate: new Date().toISOString().split('T')[0],
        favorite: false,
        author: 'You',
        institution: 'Personal'
      };
      
      setNotebooks(prev => [newNotebook, ...prev]);
      setUrlToAdd('');
    } catch (error) {
      console.error('Error adding notebook:', error);
    }
  };

  const toggleFavorite = (notebookId: string) => {
    setNotebooks(prev => 
      prev.map(notebook => 
        notebook.id === notebookId 
          ? { ...notebook, favorite: !notebook.favorite }
          : notebook
      )
    );
  };

  const filteredNotebooks = notebooks.filter(notebook => {
    const matchesSearch = notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notebook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notebook.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = selectedFolder ? notebook.folderId === selectedFolder : true;
    
    return matchesSearch && matchesFolder;
  });

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: NotebookFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      color: 'blue',
      notebookCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white">
      {/* Header Section */}
      <div className="bg-slate-900/80 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                My <span className="text-green-400">Notebooks</span>
              </h1>
              <p className="text-slate-300">
                {filteredNotebooks.length} notebooks in your collection
              </p>
            </div>
            
            {/* Premium Badge */}
            {isPremium && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                Premium Features Active
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Search your notebooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition-colors flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folders */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Collections</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === null ? 'bg-green-600 text-white' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    All Notebooks
                    <span className="ml-auto text-sm text-slate-400">({notebooks.length})</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedFolder('favorites')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === 'favorites' ? 'bg-green-600 text-white' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Favorites
                    <span className="ml-auto text-sm text-slate-400">({notebooks.filter(n => n.favorite).length})</span>
                  </div>
                </button>
                
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder === folder.id ? 'bg-green-600 text-white' : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {folder.name}
                      <span className="ml-auto text-sm text-slate-400">({folder.notebookCount})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Upload Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 mb-6 transition-colors ${
                draggedOver ? 'border-green-400 bg-green-400/5' : 'border-slate-600 hover:border-slate-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggedOver(true);
              }}
              onDragLeave={() => setDraggedOver(false)}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Add Notebook</h3>
                <p className="text-slate-400 mb-4">
                  Drag and drop a NotebookLM URL here, or paste it below
                </p>
                
                <div className="flex gap-3 max-w-md mx-auto">
                  <input
                    type="url"
                    placeholder="https://notebooklm.google.com/notebook/..."
                    value={urlToAdd}
                    onChange={(e) => setUrlToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => addNotebookFromUrl(urlToAdd)}
                    disabled={!urlToAdd.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            ) : (
              <>
                {/* Notebooks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNotebooks.map((notebook) => (
                    <div key={notebook.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-2 py-1 rounded-lg text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                          {notebook.category}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(notebook.id)}
                            className={`p-1 rounded transition-colors ${
                              notebook.favorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${notebook.favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-1 rounded text-slate-400 hover:text-slate-300 transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                        {notebook.title}
                      </h3>
                      
                      <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                        {notebook.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {notebook.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {notebook.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{notebook.tags.length - 3}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                        <span>Added {notebook.addedDate}</span>
                        {notebook.lastViewed && (
                          <span>Last viewed {notebook.lastViewed}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                          Open Notebook
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredNotebooks.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No notebooks found</h3>
                    <p className="text-slate-400">
                      {searchQuery ? 'Try adjusting your search' : 'Add your first notebook using the drop zone above'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-400 focus:border-transparent mb-4"
              autoFocus
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 