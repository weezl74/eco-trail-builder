export type CardPalette = {
  id: string;
  label: string;
  front: string; // CSS background for front
  back: string; // CSS background for back
  swatch: string[]; // for picker preview
  carbonScore: 1 | 2 | 3 | 4; // 1 = best for carbon
  carbonNote: string;
};

export const CARD_PALETTES: CardPalette[] = [
  {
    id: 'midnight',
    label: 'Midnight Forest',
    front: 'linear-gradient(135deg, hsl(220 91% 15%), hsl(142 85% 20%))',
    back: 'linear-gradient(135deg, hsl(220 91% 10%), hsl(142 85% 15%))',
    swatch: ['#06122a', '#0a3d1f'],
    carbonScore: 1,
    carbonNote:
      'Best for carbon. Deep, dark pixels use the least power on the OLED screens most modern phones have — so your card sips battery and means less charging.',
  },
  {
    id: 'forest',
    label: 'Deep Forest',
    front: 'linear-gradient(135deg, hsl(150 60% 18%), hsl(95 50% 28%))',
    back: 'linear-gradient(135deg, hsl(150 60% 12%), hsl(95 50% 20%))',
    swatch: ['#123a26', '#3a6b2a'],
    carbonScore: 2,
    carbonNote:
      'Low carbon. Dark greens still keep most pixels dim on OLED phones, using around 30% less power than a bright card.',
  },
  {
    id: 'sunset',
    label: 'Caerphilly Sunset',
    front: 'linear-gradient(135deg, #F4971D, #c44b1a)',
    back: 'linear-gradient(135deg, #c44b1a, #6b1f0e)',
    swatch: ['#F4971D', '#c44b1a'],
    carbonScore: 3,
    carbonNote:
      'Medium carbon. Warm oranges sit in the middle — brighter than dark themes but cheaper to render than pure white.',
  },
  {
    id: 'daylight',
    label: 'Daylight',
    front: 'linear-gradient(135deg, #f5f7fb, #cfe1ff)',
    back: 'linear-gradient(135deg, #ffffff, #dbeafe)',
    swatch: ['#ffffff', '#cfe1ff'],
    carbonScore: 4,
    carbonNote:
      'Highest carbon. On OLED screens, near-white pixels can use up to 3× more power than dark ones, draining your battery faster and adding to charging emissions.',
  },
];

export const getPalette = (id: string): CardPalette =>
  CARD_PALETTES.find((p) => p.id === id) ?? CARD_PALETTES[0];
