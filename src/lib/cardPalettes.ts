export type CardPalette = {
  id: string;
  label: string;
  front: string; // CSS background for front
  back: string; // CSS background for back
  text: string; // primary text/icon colour on the card
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
    text: '#ffffff',
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
    text: '#ffffff',
    swatch: ['#123a26', '#3a6b2a'],
    carbonScore: 2,
    carbonNote:
      'Low carbon. Dark greens still keep most pixels dim on OLED phones, using around 30% less power than a bright card.',
  },
  {
    id: 'ocean',
    label: 'Ocean Deep',
    front: 'linear-gradient(135deg, #0c2340, #2d8a9e)',
    back: 'linear-gradient(135deg, #06192e, #1a5a6a)',
    text: '#ffffff',
    swatch: ['#0c2340', '#2d8a9e'],
    carbonScore: 2,
    carbonNote:
      'Low carbon. Deep ocean blues keep the screen dim — easier on your battery and the grid.',
  },
  {
    id: 'noir-gold',
    label: 'Noir & Gold',
    front: 'linear-gradient(135deg, #0d0d0d, #1a1a1a 60%, #c9a84c)',
    back: 'linear-gradient(135deg, #0d0d0d, #c9a84c)',
    text: '#f0d78c',
    swatch: ['#0d0d0d', '#c9a84c'],
    carbonScore: 1,
    carbonNote:
      'Best for carbon. Mostly black with a gold accent — almost zero power on OLED screens.',
  },
  {
    id: 'sunset',
    label: 'Caerphilly Sunset',
    front: 'linear-gradient(135deg, #F4971D, #c44b1a)',
    back: 'linear-gradient(135deg, #c44b1a, #6b1f0e)',
    text: '#ffffff',
    swatch: ['#F4971D', '#c44b1a'],
    carbonScore: 3,
    carbonNote:
      'Medium carbon. Warm oranges sit in the middle — brighter than dark themes but cheaper to render than pure white.',
  },
  {
    id: 'terracotta',
    label: 'Terracotta & Sage',
    front: 'linear-gradient(135deg, #c4654a, #87a878)',
    back: 'linear-gradient(135deg, #8a3a25, #4a6741)',
    text: '#1f1208',
    swatch: ['#c4654a', '#87a878'],
    carbonScore: 3,
    carbonNote:
      'Medium carbon. Earthy mid-tones strike a balance between warmth and battery life.',
  },
  {
    id: 'blush',
    label: 'Blush & Lavender',
    front: 'linear-gradient(135deg, #f8e8ee, #c9a0dc)',
    back: 'linear-gradient(135deg, #e8c5d0, #9b72cf)',
    text: '#3a1f4a',
    swatch: ['#f8e8ee', '#c9a0dc)'],
    carbonScore: 4,
    carbonNote:
      'Higher carbon. Soft pastels push more pixels bright — pretty, but heavier on the battery.',
  },
  {
    id: 'arctic',
    label: 'Arctic Frost',
    front: 'linear-gradient(135deg, #e8f0f8, #6ba3c8)',
    back: 'linear-gradient(135deg, #b8d4e8, #2e6b8a)',
    text: '#0a2436',
    swatch: ['#e8f0f8', '#6ba3c8'],
    carbonScore: 4,
    carbonNote:
      'Higher carbon. Bright icy tones use more power on OLED — gorgeous but thirsty.',
  },
  {
    id: 'daylight',
    label: 'Daylight',
    front: 'linear-gradient(135deg, #f5f7fb, #cfe1ff)',
    back: 'linear-gradient(135deg, #ffffff, #dbeafe)',
    text: '#0a1f3d',
    swatch: ['#ffffff', '#cfe1ff'],
    carbonScore: 4,
    carbonNote:
      'Highest carbon. On OLED screens, near-white pixels can use up to 3× more power than dark ones, draining your battery faster and adding to charging emissions.',
  },
];

export const getPalette = (id: string): CardPalette =>
  CARD_PALETTES.find((p) => p.id === id) ?? CARD_PALETTES[0];
