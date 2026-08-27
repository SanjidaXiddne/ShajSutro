const COLOR_MAP: Record<string, string> = {
  // Whites / Creams
  white: "#FFFFFF",
  "off-white": "#F8F8F4",
  ivory: "#FFFFF0",
  cream: "#FFFDD0",
  vanilla: "#F3E5AB",
  pearl: "#F0EAD6",
  ecru: "#F2EFE4",
  eggshell: "#F0EAE1",
  chalk: "#F5F5F5",

  // Pinks & Roses
  pink: "#FFB6C1",
  "baby pink": "#FFD1DC",
  "light pink": "#FFB6C1",
  "deep pink": "#FF1493",
  "hot pink": "#FF69B4",
  "dusty pink": "#DCAE96",
  "dusty rose": "#DCAE96",
  rose: "#FF007F",
  blush: "#DE5D83",
  peach: "#FFE5B4",
  coral: "#FF7F50",
  salmon: "#FA8072",
  magenta: "#FF00FF",
  fuchsia: "#FF00FF",

  // Blues
  blue: "#3B82F6",
  "light blue": "#ADD8E6",
  "baby blue": "#89CFF0",
  "sky blue": "#87CEEB",
  "royal blue": "#4169E1",
  navy: "#000080",
  "navy blue": "#000080",
  "midnight blue": "#191970",
  midnight: "#191970",
  cyan: "#00FFFF",
  azure: "#007FFF",
  cerulean: "#007BA7",
  cobalt: "#0047AB",
  indigo: "#4B0082",
  denim: "#1560BD",
  "steel blue": "#4682B4",
  turquoise: "#40E0D0",
  teal: "#008080",
  aqua: "#00FFFF",

  // Greens
  green: "#22C55E",
  "light green": "#90EE90",
  "forest green": "#228B22",
  emerald: "#50C878",
  "emerald green": "#50C878",
  mint: "#98FF98",
  "pastel mint": "#AAF0D1",
  sage: "#BCB88A",
  olive: "#808000",
  "olive green": "#808000",
  lime: "#32CD32",
  moss: "#8A9A5B",
  jade: "#00A86B",
  pistachio: "#93C572",
  seafoam: "#9FE2BF",
  khaki: "#C3B091",

  // Reds & Maroons
  red: "#EF4444",
  "dark red": "#8B0000",
  crimson: "#DC143C",
  scarlet: "#FF2400",
  ruby: "#E0115F",
  burgundy: "#800020",
  maroon: "#800000",
  wine: "#722F37",
  cherry: "#DE3163",
  brick: "#CB4154",
  terracotta: "#E2725B",

  // Yellows & Golds
  yellow: "#EAB308",
  "light yellow": "#FFFFE0",
  "lemon yellow": "#FFF44F",
  gold: "#FFD700",
  golden: "#DAA520",
  amber: "#FFBF00",
  mustard: "#FFDB58",
  sunflower: "#FFC512",
  canary: "#FFEF00",
  bronze: "#CD7F32",
  copper: "#B87333",

  // Purples & Violets
  purple: "#A855F7",
  violet: "#8F00FF",
  lavender: "#E6E6FA",
  lilac: "#C8A2C8",
  plum: "#8E4585",
  mauve: "#E0B0FF",
  eggplant: "#614051",
  orchid: "#DA70D6",
  amethyst: "#9966CC",

  // Oranges & Browns
  orange: "#F97316",
  tangerine: "#F28500",
  apricot: "#FBCEB1",
  brown: "#78350F",
  "dark brown": "#5C4033",
  chocolate: "#7B3F00",
  coffee: "#6F4E37",
  caramel: "#AF6E4D",
  chestnut: "#954535",
  mocha: "#967969",
  tan: "#D2B48C",
  beige: "#F5F5DC",
  camel: "#C19A6B",
  sand: "#C2B280",
  taupe: "#483C32",
  oatmeal: "#E8E0D0",
  stone: "#928E85",

  // Blacks & Greys
  black: "#111111",
  charcoal: "#36454F",
  grey: "#6B7280",
  gray: "#6B7280",
  "light grey": "#D1D5DB",
  "light gray": "#D1D5DB",
  "dark grey": "#374151",
  "dark gray": "#374151",
  silver: "#C0C0C0",
  slate: "#708090",
  ash: "#B2BEB5",
  anthracite: "#293133",
};

const KEYWORDS: [string, string][] = [
  ["baby pink", "#FFD1DC"],
  ["dusty pink", "#DCAE96"],
  ["hot pink", "#FF69B4"],
  ["pink", "#FFB6C1"],
  ["rose", "#FF007F"],
  ["blush", "#DE5D83"],
  ["peach", "#FFE5B4"],
  ["coral", "#FF7F50"],
  ["salmon", "#FA8072"],
  ["magenta", "#FF00FF"],
  ["fuchsia", "#FF00FF"],
  ["navy", "#000080"],
  ["sky", "#87CEEB"],
  ["cyan", "#00FFFF"],
  ["teal", "#008080"],
  ["turquoise", "#40E0D0"],
  ["aqua", "#00FFFF"],
  ["indigo", "#4B0082"],
  ["cobalt", "#0047AB"],
  ["blue", "#3B82F6"],
  ["mint", "#98FF98"],
  ["sage", "#BCB88A"],
  ["olive", "#808000"],
  ["emerald", "#50C878"],
  ["lime", "#32CD32"],
  ["forest", "#228B22"],
  ["green", "#22C55E"],
  ["crimson", "#DC143C"],
  ["maroon", "#800000"],
  ["burgundy", "#800020"],
  ["scarlet", "#FF2400"],
  ["ruby", "#E0115F"],
  ["wine", "#722F37"],
  ["red", "#EF4444"],
  ["gold", "#FFD700"],
  ["amber", "#FFBF00"],
  ["mustard", "#FFDB58"],
  ["lemon", "#FFF44F"],
  ["yellow", "#EAB308"],
  ["lavender", "#E6E6FA"],
  ["lilac", "#C8A2C8"],
  ["violet", "#8F00FF"],
  ["purple", "#A855F7"],
  ["plum", "#8E4585"],
  ["orange", "#F97316"],
  ["tangerine", "#F28500"],
  ["chocolate", "#7B3F00"],
  ["coffee", "#6F4E37"],
  ["brown", "#78350F"],
  ["beige", "#F5F5DC"],
  ["camel", "#C19A6B"],
  ["tan", "#D2B48C"],
  ["khaki", "#C3B091"],
  ["sand", "#C2B280"],
  ["ivory", "#FFFFF0"],
  ["cream", "#FFFDD0"],
  ["white", "#FFFFFF"],
  ["silver", "#C0C0C0"],
  ["grey", "#6B7280"],
  ["gray", "#6B7280"],
  ["charcoal", "#36454F"],
  ["black", "#111111"],
];

/**
 * Returns a valid CSS hex/color string for any arbitrary color input.
 */
export function getColorHex(colorInput: string): string {
  if (!colorInput) return "#E5E7EB";
  const trimmed = colorInput.trim();

  // If already hex, rgb, rgba, hsl, return directly
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl")
  ) {
    return trimmed;
  }

  const clean = trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, "");

  // 1. Direct exact match
  if (COLOR_MAP[clean]) {
    return COLOR_MAP[clean];
  }

  // 2. Multi-word exact phrase match
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (clean === name || clean.includes(name) || name.includes(clean)) {
      return hex;
    }
  }

  // 3. Keyword matching based on prominent color terms
  for (const [kw, hex] of KEYWORDS) {
    if (clean.includes(kw)) {
      return hex;
    }
  }

  // 4. Deterministic pleasing pastel color hash for completely unknown custom strings
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 65%)`;
}
