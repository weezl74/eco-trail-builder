import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Footprints, Bike, Car, Bus, MapPin, ScanLine, Play, Square } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';

type Mode = 'choose' | 'tracking' | 'result' | 'bus';
type Verdict = 'walk' | 'cycle' | 'car';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEarned: () => void;
}

const WalkMyWarmUpJourney: React.FC<Props> = ({ open, onOpenChange, onEarned }) => {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('choose');
  const [busStage, setBusStage] = useState<'scanning' | 'detected' | 'manual'>('scanning');
  const [manualRef, setManualRef] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [intensity, setIntensity] = useState(0); // 0..1 visual bar
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const accelSamples = useRef<number[]>([]);
  const tickRef = useRef<number | null>(null);
  const accelHandler = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  // reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMode('choose');
      setElapsed(0);
      setIntensity(0);
      setVerdict(null);
      setBusStage('scanning');
      setManualRef('');
      accelSamples.current = [];
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (accelHandler.current) window.removeEventListener('devicemotion', accelHandler.current);
    }
  }, [open]);

  const startTracking = async () => {
    setMode('tracking');
    setElapsed(0);
    accelSamples.current = [];

    // Try real accelerometer; fall back to simulated walking pattern.
    const DM = (window as any).DeviceMotionEvent;
    if (DM && typeof DM.requestPermission === 'function') {
      try { await DM.requestPermission(); } catch {}
    }
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      accelSamples.current.push(mag);
      setIntensity(Math.min(1, mag / 20));
    };
    accelHandler.current = handler;
    window.addEventListener('devicemotion', handler);

    tickRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
      // simulated reading if device sensor silent
      if (accelSamples.current.length < 2) {
        const sim = 9.8 + Math.sin(Date.now() / 250) * 4 + Math.random() * 2;
        accelSamples.current.push(sim);
        setIntensity(Math.min(1, sim / 20));
      }
    }, 1000);
  };

  const stopTracking = (forceVerdict?: Verdict) => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    if (accelHandler.current) window.removeEventListener('devicemotion', accelHandler.current);
    accelHandler.current = null;

    // Classify: stddev of magnitude. Cars are smoother (low variance, ~9.8g);
    // walking ~ moderate variance; cycling ~ higher variance with steady rhythm.
    const s = accelSamples.current;
    const mean = s.reduce((a, b) => a + b, 0) / (s.length || 1);
    const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / (s.length || 1);
    const std = Math.sqrt(variance);

    let v: Verdict;
    if (forceVerdict) v = forceVerdict;
    else if (std < 1.2) v = 'car';
    else if (std < 4) v = 'walk';
    else v = 'cycle';

    setVerdict(v);
    setMode('result');

    if (v !== 'car') {
      onEarned();
      toast({ title: t('Stamp earned! 🎉'), description: t('Active travel verified.') });
    } else {
      toast({
        title: t('No stamp this time'),
        description: t('Looks like a car journey — try walking, cycling or the bus next time.'),
        variant: 'destructive',
      });
    }
  };

  const confirmBus = () => {
    onEarned();
    toast({ title: t('Bus ticket accepted 🚌'), description: t('Stamp added to your #WalkMyWarmUp card.') });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-roboto">
            <Footprints className="h-5 w-5 text-[#F4971D]" /> {t('Log a leisure-centre journey')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" /> {t('Walk, cycle or take the bus to earn a stamp')}
          </DialogDescription>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#F4971D]/10 border-2 border-[#F4971D]/30 p-4 text-xs text-[#1f1f1f]/80">
              {t('Start tracking when you set off. We use your phone\'s motion sensor to check if you walked or cycled. A car ride won\'t count.')}
            </div>
            <Button onClick={startTracking} className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl">
              <Play className="h-4 w-4 mr-1" /> {t('Start journey tracking')}
            </Button>
            <Button onClick={() => setMode('bus')} variant="outline" className="w-full rounded-xl">
              <Bus className="h-4 w-4 mr-1" /> {t('Scan a bus ticket instead')}
            </Button>
          </div>
        )}

        {mode === 'tracking' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#1f1f1f] text-white p-5 text-center">
              <p className="text-xs opacity-70">{t('Tracking motion…')}</p>
              <p className="text-3xl font-bold font-roboto mt-1">
                {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-[#F4971D] transition-all"
                  style={{ width: `${Math.round(intensity * 100)}%` }}
                />
              </div>
              <p className="text-[10px] opacity-60 mt-1">{t('Accelerometer signal')}</p>
            </div>
            <Button onClick={() => stopTracking()} className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl">
              <Square className="h-4 w-4 mr-1" /> {t('I\'ve arrived — finish')}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => stopTracking('walk')} className="rounded-xl text-xs">
                <Footprints className="h-3 w-3 mr-1" /> {t('Walk')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => stopTracking('cycle')} className="rounded-xl text-xs">
                <Bike className="h-3 w-3 mr-1" /> {t('Cycle')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => stopTracking('car')} className="rounded-xl text-xs">
                <Car className="h-3 w-3 mr-1" /> {t('Car')}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">{t('Prototype: pick a mode to simulate the classifier')}</p>
          </div>
        )}

        {mode === 'result' && verdict && (
          <div className="space-y-3">
            <div className={`rounded-2xl p-5 text-center border-2 ${
              verdict === 'car' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-[#F4971D]/10 border-[#F4971D]/40 text-[#1f1f1f]'
            }`}>
              {verdict === 'walk' && <Footprints className="h-10 w-10 mx-auto" />}
              {verdict === 'cycle' && <Bike className="h-10 w-10 mx-auto" />}
              {verdict === 'car' && <Car className="h-10 w-10 mx-auto" />}
              <p className="font-bold font-roboto mt-2">
                {verdict === 'walk' && t('Walking detected')}
                {verdict === 'cycle' && t('Cycling detected')}
                {verdict === 'car' && t('Car journey detected')}
              </p>
              <p className="text-xs opacity-80 mt-1">
                {verdict === 'car'
                  ? t('No stamp this time. Try active travel on your next visit.')
                  : t('Stamp added — great work!')}
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl">
              {t('Done')}
            </Button>
          </div>
        )}

        {mode === 'bus' && busStage === 'scanning' && (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-[#1f1f1f] aspect-[4/3]">
              {/* simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1f1f1f] to-[#0f0f0f]" />
              {/* simulated ticket in frame */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-28 bg-[#fdf6e3] rounded-md shadow-2xl p-2 rotate-[-4deg]">
                <div className="text-[8px] font-bold text-[#1f1f1f]/80">STAGECOACH · CAERPHILLY</div>
                <div className="text-[7px] text-[#1f1f1f]/60">Day Rider · Adult</div>
                <div
                  className="mt-1 h-8 w-full"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 4px)',
                  }}
                />
                <div className="text-[7px] text-[#1f1f1f]/60 mt-0.5">REF 8842-AC · 11 Jun</div>
              </div>
              {/* viewfinder corners */}
              <div className="absolute inset-6 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#F4971D] rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#F4971D] rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#F4971D] rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#F4971D] rounded-br" />
              </div>
              {/* animated scan line */}
              <div
                className="absolute left-6 right-6 h-0.5 bg-[#F4971D] shadow-[0_0_12px_2px_rgba(244,151,29,0.8)]"
                style={{ animation: 'scanline 1.6s ease-in-out infinite' }}
              />
              <style>{`@keyframes scanline { 0%,100% { top: 16%; } 50% { top: 80%; } }`}</style>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/70">
                {t('Hold steady — aligning barcode…')}
              </div>
            </div>
            <Button onClick={() => setBusStage('detected')} className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl">
              <ScanLine className="h-4 w-4 mr-1" /> {t('Capture ticket')}
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => setBusStage('manual')} variant="outline" className="flex-1 rounded-xl text-xs">
                {t('Enter ref manually')}
              </Button>
              <Button onClick={() => setMode('choose')} variant="ghost" className="flex-1 rounded-xl text-xs">
                {t('Back')}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">{t('Prototype: real build uses on-device barcode/QR detection')}</p>
          </div>
        )}

        {mode === 'bus' && busStage === 'detected' && (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                <ScanLine className="h-4 w-4" /> {t('Ticket detected')}
              </div>
              <div className="mt-3 text-xs space-y-1 text-[#1f1f1f]/80">
                <div className="flex justify-between"><span className="opacity-60">{t('Operator')}</span><span className="font-semibold">Stagecoach</span></div>
                <div className="flex justify-between"><span className="opacity-60">{t('Type')}</span><span className="font-semibold">{t('Day Rider')}</span></div>
                <div className="flex justify-between"><span className="opacity-60">{t('Reference')}</span><span className="font-mono">8842-AC</span></div>
                <div className="flex justify-between"><span className="opacity-60">{t('Valid')}</span><span className="font-semibold">{t('Today')}</span></div>
              </div>
            </div>
            <Button onClick={confirmBus} className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl">
              {t('Claim stamp')}
            </Button>
            <Button onClick={() => setBusStage('scanning')} variant="ghost" className="w-full rounded-xl">
              {t('Rescan')}
            </Button>
          </div>
        )}

        {mode === 'bus' && busStage === 'manual' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#1f1f1f]/80">{t('Ticket reference')}</label>
            <input
              value={manualRef}
              onChange={(e) => setManualRef(e.target.value.toUpperCase())}
              placeholder="e.g. 8842-AC"
              className="w-full rounded-xl border-2 border-[#1f1f1f]/15 px-3 py-2 font-mono text-sm focus:border-[#F4971D] outline-none"
            />
            <Button
              onClick={confirmBus}
              disabled={manualRef.trim().length < 4}
              className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white rounded-xl disabled:opacity-50"
            >
              {t('Submit ticket')}
            </Button>
            <Button onClick={() => setBusStage('scanning')} variant="ghost" className="w-full rounded-xl">
              {t('Back to scanner')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalkMyWarmUpJourney;
