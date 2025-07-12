import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Target, MessageSquare, TrendingUp, Leaf } from 'lucide-react';
import { CollaborationService, Team, TeamMember } from '../../services/collaborationService';
import { AnalyticsService, TeamAnalytics } from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';

export const TeamDashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamDetails();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    if (!user) return;
    
    try {
      const userTeams = await CollaborationService.getTeams(user.id);
      setTeams(userTeams);
      
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async () => {
    if (!selectedTeam) return;

    try {
      const [members, analytics] = await Promise.all([
        CollaborationService.getTeamMembers(selectedTeam.id),
        AnalyticsService.getTeamAnalytics(selectedTeam.id)
      ]);

      setTeamMembers(members);
      setTeamAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load team details:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const teamId = await CollaborationService.createTeam({
        name: newTeamName,
        description: newTeamDescription,
        sustainabilityGoals: {
          carbonReduction: 1000,
          qualityThreshold: 0.8
        }
      });

      await loadTeams();
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamDescription('');

      // Select the newly created team
      const newTeam = teams.find(t => t.id === teamId);
      if (newTeam) {
        setSelectedTeam(newTeam);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="lg:col-span-2 h-64 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Collaboration</h1>
            <p className="text-slate-600 mt-2">Work together on sustainable research projects</p>
          </div>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Teams</h2>
            
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No teams yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first team to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{team.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{team.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(team.role || 'member')}`}>
                          {team.role}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{team.memberCount} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTeam ? (
              <>
                {/* Team Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedTeam.name}</h2>
                      <p className="text-slate-600 mt-1">{selectedTeam.description}</p>
                    </div>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>

                {/* Team Analytics */}
                {teamAnalytics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Total Notebooks</p>
                          <p className="text-2xl font-bold text-slate-900">{teamAnalytics.totalNotebooks}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Carbon Saved</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(teamAnalytics.carbonImpactReduction)}g
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Leaf className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Collaboration Score</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(teamAnalytics.collaborationScore * 100)}%
                          </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-900">Team Members</h3>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {member.user?.full_name || member.user?.email || 'Unknown User'}
                            </p>
                            <p className="text-sm text-slate-600">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sustainability Goals */}
                {teamAnalytics && teamAnalytics.goalProgress.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Target className="w-5 h-5 text-green-600" />
                      <h3 className="text-xl font-semibold text-slate-900">Sustainability Goals</h3>
                    </div>

                    <div className="space-y-4">
                      {teamAnalytics.goalProgress.map((goal, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 capitalize">
                              {goal.goalType.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-slate-600">
                              {goal.progress} / {goal.target}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.round((goal.progress / goal.target) * 100)}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Team</h3>
                <p className="text-slate-600">Choose a team from the sidebar to view details and collaborate</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Describe your team's purpose"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};