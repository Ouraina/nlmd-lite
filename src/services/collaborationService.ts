import { supabase } from '../config/supabase';

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  sustainabilityGoals: any;
  settings: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface NotebookComment {
  id: string;
  notebookId: string;
  userId: string;
  parentId?: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  replies?: NotebookComment[];
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: any;
  following?: any;
}

export class CollaborationService {
  // Team Management
  static async createTeam(teamData: {
    name: string;
    description?: string;
    sustainabilityGoals?: any;
  }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamData.name,
        description: teamData.description,
        sustainability_goals: teamData.sustainabilityGoals || {},
        settings: {},
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await this.addTeamMember(data.id, user.id, 'owner');

    return data.id;
  }

  static async getTeams(userId?: string): Promise<Team[]> {
    let query = supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(role),
        member_count:team_members(count)
      `);

    if (userId) {
      query = query.eq('team_members.user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      avatarUrl: team.avatar_url,
      sustainabilityGoals: team.sustainability_goals,
      settings: team.settings,
      createdBy: team.created_by,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
      memberCount: team.member_count?.[0]?.count || 0,
      role: team.team_members?.[0]?.role
    }));
  }

  static async getTeam(teamId: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        member_count:team_members(count)
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      avatarUrl: data.avatar_url,
      sustainabilityGoals: data.sustainability_goals,
      settings: data.settings,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      memberCount: data.member_count?.[0]?.count || 0
    };
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({
        name: updates.name,
        description: updates.description,
        avatar_url: updates.avatarUrl,
        sustainability_goals: updates.sustainabilityGoals,
        settings: updates.settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId);

    if (error) throw error;
  }

  // Team Member Management
  static async addTeamMember(teamId: string, userId: string, role: TeamMember['role'] = 'member'): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role
      });

    if (error) throw error;
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles(id, full_name)
      `)
      .eq('team_id', teamId)
      .order('joined_at');

    if (error) throw error;

    return (data || []).map(member => ({
      id: member.id,
      teamId: member.team_id,
      userId: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      user: member.profiles ? {
        id: member.profiles.id,
        email: '', // Would need to join with auth.users for email
        full_name: member.profiles.full_name
      } : undefined
    }));
  }

  static async updateMemberRole(teamId: string, userId: string, role: TeamMember['role']): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Comments System
  static async addComment(notebookId: string, content: string, parentId?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notebook_comments')
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        parent_id: parentId,
        content
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  }

  static async getComments(notebookId: string): Promise<NotebookComment[]> {
    const { data, error } = await supabase
      .from('notebook_comments')
      .select(`
        *,
        profiles(id, full_name)
      `)
      .eq('notebook_id', notebookId)
      .order('created_at');

    if (error) throw error;

    // Organize comments into threads
    const comments = (data || []).map(comment => ({
      id: comment.id,
      notebookId: comment.notebook_id,
      userId: comment.user_id,
      parentId: comment.parent_id,
      content: comment.content,
      isResolved: comment.is_resolved,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: comment.profiles ? {
        id: comment.profiles.id,
        email: '',
        full_name: comment.profiles.full_name
      } : undefined,
      replies: []
    }));

    // Build comment tree
    const commentMap = new Map(comments.map(c => [c.id, c]));
    const rootComments: NotebookComment[] = [];

    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  static async updateComment(commentId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('notebook_comments')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) throw error;
  }

  static async resolveComment(commentId: string, isResolved: boolean = true): Promise<void> {
    const { error } = await supabase
      .from('notebook_comments')
      .update({ is_resolved: isResolved })
      .eq('id', commentId);

    if (error) throw error;
  }

  static async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('notebook_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  // Social Following
  static async followUser(followingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: followingId
      });

    if (error) throw error;
  }

  static async unfollowUser(followingId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  static async getFollowers(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        follower:profiles!user_follows_follower_id_fkey(id, full_name)
      `)
      .eq('following_id', userId);

    if (error) throw error;

    return (data || []).map(follow => ({
      id: follow.id,
      followerId: follow.follower_id,
      followingId: follow.following_id,
      createdAt: follow.created_at,
      follower: follow.follower
    }));
  }

  static async getFollowing(userId: string): Promise<UserFollow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        following:profiles!user_follows_following_id_fkey(id, full_name)
      `)
      .eq('follower_id', userId);

    if (error) throw error;

    return (data || []).map(follow => ({
      id: follow.id,
      followerId: follow.follower_id,
      followingId: follow.following_id,
      createdAt: follow.created_at,
      following: follow.following
    }));
  }

  static async isFollowing(followingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) return false;

    return !!data;
  }

  // Real-time subscriptions
  static subscribeToTeamUpdates(teamId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`team-${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members',
        filter: `team_id=eq.${teamId}`
      }, callback)
      .subscribe();
  }

  static subscribeToComments(notebookId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`comments-${notebookId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notebook_comments',
        filter: `notebook_id=eq.${notebookId}`
      }, callback)
      .subscribe();
  }
}