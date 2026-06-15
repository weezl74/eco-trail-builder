import React, { useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavings, RENEWABLE_COSTS, RenewableType } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';
import { Leaf, Sun, Wind, Droplets, TreePine, Sparkles, Wallet } from 'lucide-react';

export type Txn = {
  id: string;
  label: string;
  delta: number; // wool points delta (+ earn, - spend)
  date: Date;
  icon: React.ReactNode;
  kind: 'earn' | 'spend' | 'open';
};

const renewableMeta: Record<RenewableType, { label: string; icon: React.ReactNode }> = {
  solar: { label: 'Solar panel', icon: <Sun className="h-4 w-4" /> },
  wind: { label: 'Wind turbine', icon: <Wind className="h-4 w-4" /> },
  mine_water: { label: 'Mine water heat', icon: <Droplets className="h-4 w-4" /> },
};

export const useWoolTransactions = (): { txns: Txn[]; balance: number } => {
  const { pledged, renewables, accessories, woolPoints } = useSavings();

  return useMemo(() => {
    const events: Txn[] = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let t = now;
    const step = () => {
      t -= Math.floor(day * (0.5 + Math.random() * 1.5));
      return new Date(t);
    };

    pledged.forEach((id, i) => {
      events.push({
        id: `p-${id}-${i}`,
        label: `Pledge: ${id.replace(/[-_]/g, ' ')}`,
        delta: 25,
        date: step(),
        icon: <Leaf className="h-4 w-4 text-green-600" />,
        kind: 'earn',
      });
    });
    renewables.forEach((r) => {
      const meta = renewableMeta[r.type];
      events.push({
        id: `r-${r.id}`,
        label: meta.label,
        delta: -RENEWABLE_COSTS[r.type],
        date: step(),
        icon: meta.icon,
        kind: 'spend',
      });
    });
    accessories.forEach((a, i) => {
      events.push({
        id: `a-${a}-${i}`,
        label: `Accessory: ${a.replace(/[-_]/g, ' ')}`,
        delta: -20,
        date: step(),
        icon: <Sparkles className="h-4 w-4 text-purple-500" />,
        kind: 'spend',
      });
    });

    // Sort oldest → newest
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    const knownNet = events.reduce((sum, e) => sum + e.delta, 0);
    const opening = woolPoints - knownNet;

    const openEntry: Txn = {
      id: 'open',
      label: 'Opening balance',
      delta: opening,
      date: new Date(t - day),
      icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
      kind: 'open',
    };

    const all = [openEntry, ...events];
    return { txns: all, balance: woolPoints };
  }, [pledged, renewables, accessories, woolPoints]);
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

const WoolStatement: React.FC<Props> = ({ open, onOpenChange }) => {
  const { t } = useTranslations();
  const { txns, balance } = useWoolTransactions();

  // Newest first, compute running balance going forward then reverse
  let run = 0;
  const withRun = txns.map((x) => {
    run += x.delta;
    return { ...x, running: run };
  });
  const display = [...withRun].reverse();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>{t('Wool statement')}</span>
            <span className="text-base font-bold text-[#F4971D]">
              {balance.toLocaleString()} {t('wool')}
            </span>
          </SheetTitle>
          <p className="text-xs text-muted-foreground text-left">
            {t('Your earnings and spending of Wool points')}
          </p>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <ul className="divide-y">
            {display.map((x) => (
              <li key={x.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {x.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate capitalize">{x.label}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtDate(x.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      x.delta > 0 ? 'text-green-600' : x.delta < 0 ? 'text-red-500' : 'text-foreground'
                    }`}
                  >
                    {x.delta > 0 ? '+' : ''}
                    {x.delta}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t('bal')} {x.running}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default WoolStatement;
