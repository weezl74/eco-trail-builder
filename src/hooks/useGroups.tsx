import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

const makeCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

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
    const { data: memberships } = await (supabase as any)
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)
      .limit(1);

    const groupId = memberships?.[0]?.group_id;
    if (!groupId) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data: g } = await (supabase as any)
      .from('groups')
      .select('id,name,code,created_by')
      .eq('id', groupId)
      .maybeSingle();
    setGroup(g || null);

    const { data: mems } = await (supabase as any)
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (mems?.length) {
      const ids = mems.map((m: any) => m.user_id);
      const enriched: GroupMemberInfo[] = await Promise.all(
        ids.map(async (id: string) => {
          const { data } = await (supabase as any).rpc('get_public_profile', { _user_id: id });
          const row = Array.isArray(data) ? data[0] : data;
          return {
            user_id: id,
            display_name: row?.display_name || row?.username || 'Member',
            total_points: row?.total_points || 0,
          };
        }),
      );
      enriched.sort((a, b) => b.total_points - a.total_points);
      setMembers(enriched);
    } else {
      setMembers([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const createGroup = async (name: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    if (!name.trim()) return { error: 'Name required' };
    const code = makeCode();
    const { data, error } = await (supabase as any)
      .from('groups')
      .insert({ name: name.trim(), code, created_by: user.id })
      .select('id,name,code,created_by')
      .single();
    if (error) return { error: error.message };
    await (supabase as any)
      .from('group_members')
      .insert({ group_id: data.id, user_id: user.id });
    await loadGroup();
    return {};
  };

  const joinByCode = async (code: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    const clean = code.trim().toUpperCase();
    if (!clean) return { error: 'Code required' };
    const { data: g, error } = await (supabase as any)
      .from('groups')
      .select('id')
      .eq('code', clean)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!g) return { error: 'Group not found' };
    const { error: jerr } = await (supabase as any)
      .from('group_members')
      .insert({ group_id: g.id, user_id: user.id });
    if (jerr) return { error: jerr.message };
    await loadGroup();
    return {};
  };

  const leaveGroup = async () => {
    if (!user || !group) return;
    await (supabase as any)
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', user.id);
    await loadGroup();
  };

  const groupTotalPoints = members.reduce((s, m) => s + m.total_points, 0);

  return { group, members, loading, createGroup, joinByCode, leaveGroup, groupTotalPoints, reload: loadGroup };
};
