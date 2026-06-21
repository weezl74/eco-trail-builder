// Climate quotes & stats with a local / Welsh flavour.
// Some entries are "stats" tied to a place and carry a hero photo (Unsplash,
// no key needed) that can persist as the wallet card background.

export type ClimateQuote = {
  id: string;
  en: string;
  cy: string;          // Welsh translation
  attribution?: string;
  place?: string;      // e.g. "Caerphilly", "Wales", "Greenland"
  /** Optional background photo URL — shown when the user saves it as a card. */
  image?: string;
  kind: 'quote' | 'stat';
};

// Photos are hot-linked from Unsplash's CDN with sensible crop params.
const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

export const CLIMATE_QUOTES: ClimateQuote[] = [
  {
    id: 'wales-net-zero',
    kind: 'stat',
    en: 'Wales has cut its greenhouse gas emissions by 38% since 1990 — and is aiming for net zero by 2050.',
    cy: 'Mae Cymru wedi torri ei hallyriadau nwyon tŷ gwydr 38% ers 1990 — ac yn anelu at sero net erbyn 2050.',
    attribution: 'Welsh Government, 2024',
    place: 'Wales',
    image: u('photo-1500530855697-b586d89ba3ee'), // green welsh-style hills
  },
  {
    id: 'caerphilly-trees',
    kind: 'stat',
    en: 'Caerphilly County Borough is home to over 30% woodland cover — well above the Welsh average.',
    cy: 'Mae dros 30% o Fwrdeistref Sirol Caerffili dan goed — yn uwch o lawer na chyfartaledd Cymru.',
    place: 'Caerphilly',
    image: u('photo-1448375240586-882707db888b'), // forest
  },
  {
    id: 'thunberg',
    kind: 'quote',
    en: 'No one is too small to make a difference.',
    cy: 'Nid oes neb yn rhy fach i wneud gwahaniaeth.',
    attribution: 'Greta Thunberg',
  },
  {
    id: 'rs-thomas',
    kind: 'quote',
    en: 'There is no present in Wales, and no future; there is only the past.',
    cy: 'Nid oes presennol yng Nghymru, na dyfodol; nid oes ond y gorffennol.',
    attribution: 'R. S. Thomas',
  },
  {
    id: 'arctic-ice',
    kind: 'stat',
    en: 'The Arctic is warming nearly four times faster than the rest of the planet.',
    cy: 'Mae’r Arctig yn cynhesu bron i bedair gwaith yn gyflymach na gweddill y blaned.',
    attribution: 'Nature Communications, 2022',
    place: 'Arctic',
    image: u('photo-1517783999520-f068d7431a60'), // ice
  },
  {
    id: 'attenborough',
    kind: 'quote',
    en: 'The truth is: the natural world is changing. And we are totally dependent on that world.',
    cy: 'Y gwir yw: mae’r byd naturiol yn newid. Ac rydym yn gwbl ddibynnol ar y byd hwnnw.',
    attribution: 'Sir David Attenborough',
  },
  {
    id: 'amazon',
    kind: 'stat',
    en: 'The Amazon rainforest produces around 6% of the world’s oxygen and stores 150 billion tonnes of carbon.',
    cy: 'Mae fforest law yr Amazon yn cynhyrchu tua 6% o ocsigen y byd ac yn storio 150 biliwn tunnell o garbon.',
    place: 'Amazon, Brazil',
    image: u('photo-1542601906990-b4d3fb778b09'), // rainforest
  },
  {
    id: 'welsh-renewables',
    kind: 'stat',
    en: 'In 2023, renewable sources generated the equivalent of 55% of Wales’ electricity consumption.',
    cy: 'Yn 2023, cynhyrchodd ffynonellau adnewyddadwy gyfwerth â 55% o ddefnydd trydan Cymru.',
    attribution: 'Welsh Government Energy Generation Report',
    place: 'Wales',
    image: u('photo-1466611653911-95081537e5b7'), // wind turbines
  },
  {
    id: 'coral',
    kind: 'stat',
    en: 'Half of the Great Barrier Reef’s coral has been lost since 1995 due to warming seas.',
    cy: 'Mae hanner cwrel y Barriff Mawr wedi’i golli ers 1995 oherwydd cynhesu’r môr.',
    attribution: 'Royal Society, 2020',
    place: 'Great Barrier Reef',
    image: u('photo-1582967788606-a171c1080cb0'), // coral
  },
  {
    id: 'mary-robinson',
    kind: 'quote',
    en: 'Climate change is a man-made problem with a feminist solution.',
    cy: 'Newid hinsawdd yw problem wnaed gan ddyn — gyda datrysiad ffeministaidd.',
    attribution: 'Mary Robinson',
  },
  {
    id: 'welsh-bog',
    kind: 'stat',
    en: 'Welsh peat bogs store more carbon per hectare than any rainforest — but 90% are damaged.',
    cy: 'Mae mawndiroedd Cymru’n storio mwy o garbon yr hectar nag unrhyw fforest law — ond mae 90% wedi’u difrodi.',
    place: 'Mid Wales',
    image: u('photo-1500382017468-9049fed747ef'), // bog/moorland
  },
  {
    id: 'gandhi',
    kind: 'quote',
    en: 'The Earth has enough for every man’s need, but not for every man’s greed.',
    cy: 'Mae gan y Ddaear ddigon ar gyfer angen pob dyn, ond nid ar gyfer trachwant pob dyn.',
    attribution: 'Mahatma Gandhi',
  },
];
