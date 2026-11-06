// Turns what people type ("photographers", "biryani", "parlour") into words and categories we can match.
// Pure and unit-tested; used by lib/search.ts.

/** Everyday words (English + Roman Urdu) that point to a category slug. */
const SYNONYMS: Record<string, string[]> = {
  "mehndi-henna": ["mehndi", "mehendi", "henna", "hina", "heena", "mehandi"],
  "makeup-hair": ["makeup", "make-up", "beautician", "parlour", "parlor", "salon", "hair", "bridal-makeup", "mua", "beauty"],
  catering: ["catering", "caterer", "caterers", "cater", "food", "daig", "deg", "biryani", "qorma", "korma", "bbq", "kitchen", "cook", "chef", "khana", "dinner", "lunch"],
  decor: ["decor", "decoration", "decorations", "decorator", "decorators", "stage", "flowers", "floral", "lights", "balloon", "balloons", "theme"],
  photography: ["photography", "photographer", "photographers", "photo", "photos", "photoshoot", "camera", "video", "videographer", "videography", "videos", "cinematography", "drone", "album", "shoot"],
  "cakes-desserts": ["cake", "cakes", "baker", "bakers", "bakery", "dessert", "desserts", "cupcake", "cupcakes", "mithai", "sweets", "cookies"],
  "gifts-favours": ["gift", "gifts", "favour", "favours", "favor", "favors", "bid", "giveaway", "giveaways", "hampers", "hamper"],
  "designer-stitching": ["tailor", "tailors", "darzi", "stitching", "designer", "designers", "sherwani", "lehenga", "dress", "dresses", "clothes", "clothing", "outfit", "kurta", "boutique"],
  entertainment: ["dhol", "dholi", "dholak", "dj", "singer", "singers", "music", "band", "qawwali", "qawwal", "entertainment", "entertainer", "magician", "performer", "performers"],
  rentals: ["rental", "rentals", "rent", "chairs", "tables", "tent", "tents", "shamiana", "furniture", "crockery", "sound", "generator"],
};

const WORD_TO_CATEGORY = new Map<string, string>();
for (const [slug, words] of Object.entries(SYNONYMS)) for (const w of words) WORD_TO_CATEGORY.set(w, slug);

const STOP = new Set(["in", "for", "the", "a", "an", "and", "or", "near", "me", "of", "with", "best", "cheap", "good", "top", "ka", "ki", "ke", "wala", "wali", "walay"]);

/** Light English stemming: photographers → photographer → photograph, decorations → decoration → decorat. */
export function stems(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set([w]);
  if (w.length > 4 && w.endsWith("ies")) out.add(w.slice(0, -3) + "y");
  if (w.length > 3 && w.endsWith("es")) out.add(w.slice(0, -2));
  if (w.length > 3 && w.endsWith("s")) out.add(w.slice(0, -1));
  for (const base of [...out]) {
    if (base.length > 5 && base.endsWith("er")) out.add(base.slice(0, -2));
    if (base.length > 6 && base.endsWith("ing")) out.add(base.slice(0, -3));
    if (base.length > 6 && base.endsWith("ion")) out.add(base.slice(0, -3));
    if (base.length > 5 && base.endsWith("y")) out.add(base.slice(0, -1));
  }
  return [...out].filter((x) => x.length >= 3);
}

export type ParsedQuery = { words: { raw: string; variants: string[] }[]; categorySlugs: string[] };

export function parseQuery(q: string | undefined | null): ParsedQuery {
  const raw = (q ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter(Boolean);
  const words = raw.filter((w) => !STOP.has(w)).slice(0, 8);
  const categorySlugs = new Set<string>();
  const parsed = words.map((w) => {
    const variants = stems(w);
    for (const v of [w, ...variants]) {
      const slug = WORD_TO_CATEGORY.get(v);
      if (slug) categorySlugs.add(slug);
    }
    // "photograph" (a stem) should still find the photography category
    for (const [word, slug] of WORD_TO_CATEGORY) if (variants.some((v) => v.length >= 5 && word.startsWith(v))) categorySlugs.add(slug);
    return { raw: w, variants };
  });
  return { words: parsed, categorySlugs: [...categorySlugs] };
}

/** Does one word (any of its variants) appear in the text? */
export function wordMatches(text: string, variants: string[]): boolean {
  const t = text.toLowerCase();
  return variants.some((v) => t.includes(v));
}
