import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

const baseCategories = [
  {
    id: 'food',
    label: 'Land Use & Food',
    sub: 'Agriculture, farming and food sustainability',
    items: [
      { tag: '#FoodWasteWarrior', text: 'Used up leftovers creatively — nothing went to waste!' },
      { tag: '#GrowYourOwn', text: 'Harvested my first home-grown tomatoes — so satisfying!' },
      { tag: '#LocalLarder', text: 'Bought all my groceries from local producers this week.' },
      { tag: '#MeatFreeMonday', text: 'Enjoyed a delicious plant-based meal every Monday this month.' },
    ],
  },
  {
    id: 'energy',
    label: 'Energy & Home',
    sub: 'Heating, electricity and home efficiency',
    items: [
      { tag: '#OneDegreeDown', text: 'Turned the thermostat down by 1°C — barely noticed!' },
      { tag: '#AirFryerAce', text: 'Swapped the oven for the air fryer all week.' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    sub: 'Walking, cycling and shared travel',
    items: [
      { tag: '#WalkItOut', text: 'Walked the kids to school every day this week.' },
      { tag: '#LiftShare', text: 'Shared a lift with neighbours into town.' },
    ],
  },
];

const businessCategories = [
  {
    id: 'tree-planting',
    label: 'Tree Planting',
    sub: 'Organise or sponsor tree planting initiatives',
    items: [
      { tag: '#PlantATree', text: 'Sponsored 100 native saplings for the local woodland.' },
      { tag: '#TeamPlantDay', text: 'Closed the office for a team tree-planting day.' },
      { tag: '#RewildOurPatch', text: 'Adopted a rewilding patch near our premises.' },
    ],
  },
  {
    id: 'sponsorship',
    label: 'Event Sponsorship',
    sub: 'Sponsor community sustainability events',
    items: [
      { tag: '#GreenEvent', text: 'Sponsored a zero-waste community fair.' },
      { tag: '#FundTheFix', text: 'Sponsored a local Repair Café for the year.' },
    ],
  },
  {
    id: 'donations',
    label: 'Donations & In-Kind',
    sub: 'Donate goods, services or funds',
    items: [
      { tag: '#GiveBack', text: 'Donated surplus stock to a local community group.' },
      { tag: '#ProBono', text: 'Provided pro-bono services to a sustainability charity.' },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPosted?: () => void;
  isBusiness?: boolean;
}

const AddStoryDialog: React.FC<Props> = ({ open, onOpenChange, onPosted, isBusiness = false }) => {
  const categories = isBusiness ? [...baseCategories, ...businessCategories] : baseCategories;
  const [catId, setCatId] = useState(categories[0].id);
  const [submittingTag, setSubmittingTag] = useState<string | null>(null);
  const [usedTags, setUsedTags] = useState<Set<string>>(new Set());
  const cat = categories.find((c) => c.id === catId)!;
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_stories')
        .select('title')
        .eq('user_id', user.id);
      if (cancelled) return;
      setUsedTags(new Set((data ?? []).map((r) => r.title)));
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  const share = async (tag: string, text: string) => {
    if (!user) {
      toast({ title: t('Please sign in'), description: t('You need to be signed in to share a story.') });
      return;
    }
    if (usedTags.has(tag)) {
      toast({ title: t('Already shared'), description: t('You can only post each story once.') });
      return;
    }
    setSubmittingTag(tag);
    const { error } = await supabase.from('user_stories').insert({
      user_id: user.id,
      title: tag,
      content: text,
      run_type: catId,
      points_earned: 10,
    });
    setSubmittingTag(null);
    if (error) {
      toast({ title: t('Could not share story'), description: error.message, variant: 'destructive' });
      return;
    }
    setUsedTags((prev) => new Set(prev).add(tag));
    toast({ title: t('Story shared!'), description: tag });
    onPosted?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-0 text-white max-w-md p-5 rounded-3xl">
        <h2 className="font-serif font-bold text-3xl text-center mb-4">{t('Add A Community Story!')}</h2>

        <div className="bg-white rounded-2xl p-3 max-h-[60vh] overflow-y-auto">
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="w-full bg-[#1f1f1f] text-[#f5a623] font-serif font-bold rounded-xl p-3 mb-3"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{t(c.label)}</option>
            ))}
          </select>
          <p className="text-gray-600 font-serif text-sm px-2 -mt-2 mb-3">{t(cat.sub)}</p>

          <div className="space-y-3">
            {cat.items.map((it, i) => {
              const used = usedTags.has(it.tag);
              return (
                <button
                  key={i}
                  disabled={submittingTag !== null || used}
                  onClick={() => share(it.tag, it.text)}
                  className={`w-full rounded-xl p-3 text-center border transition ${
                    used
                      ? 'bg-[#1f1f1f]/50 border-white/10 opacity-60 cursor-not-allowed'
                      : 'bg-[#1f1f1f] border-white/20'
                  } disabled:opacity-50`}
                >
                  <p className="text-[#f5a623] font-serif font-bold">{it.tag}</p>
                  <p className="text-white font-serif mt-1 text-sm">{it.text}</p>
                  {used && (
                    <p className="text-white/60 text-xs mt-1">{t('Already shared')}</p>
                  )}
                  {submittingTag === it.tag && (
                    <p className="text-white/60 text-xs mt-1">{t('Sharing…')}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="w-full bg-red-500 text-white font-serif font-bold py-3 rounded-xl mt-4"
        >
          {t('CLOSE')}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoryDialog;
