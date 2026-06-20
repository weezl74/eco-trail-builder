import React, { useState } from 'react';
import { ArrowLeft, Users, Copy, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroups } from '@/hooks/useGroups';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onBack: () => void;
}

const GroupsScreen: React.FC<Props> = ({ onBack }) => {
  const { group, members, loading, createGroup, joinByCode, leaveGroup, groupTotalPoints } = useGroups();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    setBusy(true);
    const { error } = await createGroup(name);
    setBusy(false);
    if (error) toast({ title: 'Could not create', description: error, variant: 'destructive' });
    else {
      setName('');
      toast({ title: 'Group created!' });
    }
  };

  const handleJoin = async () => {
    setBusy(true);
    const { error } = await joinByCode(code);
    setBusy(false);
    if (error) toast({ title: 'Could not join', description: error, variant: 'destructive' });
    else {
      setCode('');
      toast({ title: 'Joined!' });
    }
  };

  const copyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.code);
    toast({ title: 'Code copied' });
  };

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-[#1f1f1f] text-white font-bold mb-4 px-4 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <h1 className="text-white font-serif font-bold text-3xl mb-2 flex items-center gap-2">
        <Users className="w-7 h-7" /> Groups
      </h1>
      <p className="text-white/90 text-sm mb-5">
        Team up to bring Nelson home faster. Pooled points appear on a shared leaderboard.
      </p>

      {loading ? (
        <div className="bg-white rounded-2xl p-5 text-center text-[#1f1f1f]">Loading…</div>
      ) : group ? (
        <div className="space-y-4">
          <div className="bg-[#1f1f1f] text-white rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase text-white/60">Your group</div>
                <h2 className="font-serif font-bold text-2xl text-[#F4971D]">{group.name}</h2>
              </div>
              <button
                onClick={leaveGroup}
                className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"
              >
                <LogOut className="w-3 h-3" /> Leave
              </button>
            </div>
            <button
              onClick={copyCode}
              className="mt-3 inline-flex items-center gap-2 bg-[#F4971D]/15 text-[#F4971D] px-3 py-2 rounded-xl text-sm font-mono"
            >
              {group.code} <Copy className="w-3.5 h-3.5" />
            </button>
            <p className="text-xs text-white/60 mt-2">Share this code so friends can join.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 text-[#1f1f1f]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-serif font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F4971D]" /> Group leaderboard
              </div>
              <div className="text-sm font-bold text-[#F4971D]">{groupTotalPoints} pts pooled</div>
            </div>
            <ol className="space-y-2">
              {members.map((m, i) => (
                <li key={m.user_id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-center font-bold text-[#F4971D]">{i + 1}</span>
                    <span>{m.display_name}</span>
                  </span>
                  <span className="font-bold">{m.total_points} pts</span>
                </li>
              ))}
              {!members.length && <li className="text-sm text-[#1f1f1f]/60">No members yet.</li>}
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 text-[#1f1f1f] space-y-3">
            <h2 className="font-serif font-bold text-lg">Create a group</h2>
            <Label>Group name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nelson Town Heroes"
              className="rounded-xl"
            />
            <Button
              onClick={handleCreate}
              disabled={busy || !name.trim()}
              className="w-full rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold"
            >
              Create group
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-5 text-[#1f1f1f] space-y-3">
            <h2 className="font-serif font-bold text-lg">Join with a code</h2>
            <Label>6-character code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="rounded-xl uppercase font-mono"
              maxLength={6}
            />
            <Button
              onClick={handleJoin}
              disabled={busy || !code.trim()}
              className="w-full rounded-2xl bg-[#F4971D] hover:bg-[#e08914] text-[#1f1f1f] font-bold"
            >
              Join group
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsScreen;
