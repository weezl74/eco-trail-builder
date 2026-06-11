import nelson from '@/assets/audio/nelson.mp3.asset.json';
import goodbaa from '@/assets/audio/goodbaa.mp3.asset.json';
import badbaa from '@/assets/audio/badbaa.mp3.asset.json';

const cache: Record<string, HTMLAudioElement> = {};

const play = (url: string) => {
  try {
    let a = cache[url];
    if (!a) {
      a = new Audio(url);
      a.preload = 'auto';
      cache[url] = a;
    }
    a.currentTime = 0;
    void a.play().catch(() => {});
  } catch {
    /* no-op */
  }
};

export const playNelson = () => play(nelson.url);
export const playGoodBaa = () => play(goodbaa.url);
export const playBadBaa = () => play(badbaa.url);
