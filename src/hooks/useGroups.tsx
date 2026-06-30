import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  code: string;
  created_by: string;
}

export interface GroupMemberInfo {
  user_id: string;
  display_name: string | null;
  total_points: number;
}

export const useGroups = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGroup = useCallback(async () => {
    if (!user) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const g = await api.get(`/users/${encodeURIComponent(user.id)}/group`);
      if (!g || !g.id) {
        setGroup(null);
        setMembers([]);
        setLoading(false);
        return;
      }
      setGroup({ id: g.id, name: g.name, code: g.code, created_by: g.created_by });
      try {
        const mems = await api.get(`/groups/${encodeURIComponent(g.id)}/members`);
        const list: GroupMemberInfo[] = (Array.isArray(mems) ? mems : []).map((m: any) => ({
          user_id: m.user_id,
          display_name: m.display_name || m.username || 'Member',
          total_points: m.total_points || 0,
        }));
        list.sort((a, b) => b.total_points - a.total_points);
        setMembers(list);
      } catch (e) {
        console.error('[useGroups] members fetch failed', e);
        setMembers([]);
      }
    } catch (e) {
      console.error('[useGroups] group fetch failed', e);
      setGroup(null);
      setMembers([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  const createGroup = async (name: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    if (!name.trim()) return { error: 'Name required' };
    try {
      await api.post('/groups', { name: name.trim(), created_by: user.id });
      await loadGroup();
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Failed to create group' };
    }
  };

  const joinByCode = async (code: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    const clean = code.trim().toUpperCase();
    if (!clean) return { error: 'Code required' };
    try {
      const g = await api.get(`/groups/by-code/${encodeURIComponent(clean)}`);
      if (!g || !g.id) return { error: 'Group not found' };
      await api.post(`/groups/${encodeURIComponent(g.id)}/members`, { user_id: user.id });
      await loadGroup();
      return {};
    } catch (e: any) {
      return { error: e?.message || 'Failed to join group' };
    }
  };

  const leaveGroup = async () => {
    if (!user || !group) return;
    try {
      await api.delete(`/groups/${encodeURIComponent(group.id)}/members/${encodeURIComponent(user.id)}`);
    } catch (e) {
      console.error('[useGroups] leave failed', e);
    }
    await loadGroup();
  };

  const groupTotalPoints = members.reduce((s, m) => s + m.total_points, 0);

  return { group, members, loading, createGroup, joinByCode, leaveGroup, groupTotalPoints, reload: loadGroup };
};
