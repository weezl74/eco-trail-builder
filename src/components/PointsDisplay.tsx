import { usePoints } from '@/hooks/usePoints';

/**
 * Displays Wool, Tree, and Total points for the signed-in user.
 * Total comes from profiles.total_points (source of truth).
 * Wool/Tree are derived from user_points_ledger for display only.
 */
export const PointsDisplay = ({ className = '' }: { className?: string }) => {
  const { wool, tree, total } = usePoints();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-xl">🧶</span>
        <span className="text-sm font-semibold">{wool}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Wool</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl">🌳</span>
        <span className="text-sm font-semibold">{tree}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tree</span>
      </div>
      <div className="flex flex-col items-center border-l pl-4">
        <span className="text-sm font-bold">{total}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
      </div>
    </div>
  );
};
