export type CategoryId =
  | 'dairy'
  | 'meat'
  | 'fish'
  | 'vegetables'
  | 'fruit'
  | 'bread'
  | 'eggs'
  | 'ready'
  | 'frozen'
  | 'dry'
  | 'drinks'
  | 'sauces'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Typical shelf life in days from purchase, used when no date is known. */
  shelfLifeDays: number;
  /** Rough average price in NIS, used for the savings screen when the receipt has no price. */
  avgPrice: number;
  /** Hebrew words that usually mean an item belongs here. Checked in order of CATEGORY_ORDER. */
  keywords: string[];
}

export const CATEGORIES: Record<CategoryId, Category> = {
  dairy: {
    id: 'dairy',
    label: 'מוצרי חלב',
    emoji: '🥛',
    shelfLifeDays: 7,
    avgPrice: 8,
    keywords: ['חלב', 'קוטג', 'גבינ', 'יוגורט', 'מעדן', 'שמנת', 'לבן', 'אשל', 'גיל', 'חמאה', 'לבנה', 'צפתית', 'בולגרית', 'מוצרלה', 'פרוביוטי', 'דנונה', 'מילקי', 'יופלה'],
  },
  meat: {
    id: 'meat',
    label: 'בשר ועוף',
    emoji: '🍗',
    shelfLifeDays: 3,
    avgPrice: 40,
    keywords: ['עוף', 'חזה', 'שניצל', 'פרגית', 'כרעיים', 'בשר', 'טחון', 'סטייק', 'אנטריקוט', 'הודו', 'נקניק', 'קבב', 'המבורגר', 'כבד', 'שוקיים'],
  },
  fish: {
    id: 'fish',
    label: 'דגים',
    emoji: '🐟',
    shelfLifeDays: 2,
    avgPrice: 45,
    keywords: ['דג', 'סלמון', 'אמנון', 'דניס', 'לברק', 'בורי', 'טונה טרי', 'פילה'],
  },
  vegetables: {
    id: 'vegetables',
    label: 'ירקות',
    emoji: '🥬',
    shelfLifeDays: 6,
    avgPrice: 7,
    keywords: ['עגבני', 'מלפפון', 'פלפל', 'חסה', 'בצל', 'שום', 'גזר', 'קישוא', 'חציל', 'כרוב', 'ברוקולי', 'כרובית', 'תפוח אדמה', 'תפו"א', 'בטטה', 'פטרוזיליה', 'כוסברה', 'שמיר', 'נענע', 'פטריות', 'תרד', 'סלרי', 'צנון', 'ירק'],
  },
  fruit: {
    id: 'fruit',
    label: 'פירות',
    emoji: '🍎',
    shelfLifeDays: 7,
    avgPrice: 9,
    keywords: ['תפוח', 'בננ', 'תפוז', 'קלמנטינ', 'אבטיח', 'מלון', 'ענב', 'אגס', 'אפרסק', 'נקטרינ', 'שזיף', 'תות', 'אבוקדו', 'מנגו', 'לימון', 'אשכולית', 'קיווי', 'רימון', 'פרי'],
  },
  bread: {
    id: 'bread',
    label: 'לחם ומאפים',
    emoji: '🍞',
    shelfLifeDays: 4,
    avgPrice: 12,
    keywords: ['לחם', 'חלה', 'פיתה', 'לחמני', 'באגט', 'טורטיי', 'מאפה', 'עוגה', 'קרואסון', 'בורקס', 'לאפה'],
  },
  eggs: {
    id: 'eggs',
    label: 'ביצים',
    emoji: '🥚',
    shelfLifeDays: 21,
    avgPrice: 14,
    keywords: ['ביצים', 'ביצה'],
  },
  ready: {
    id: 'ready',
    label: 'מוכן ומעדנייה',
    emoji: '🥗',
    shelfLifeDays: 4,
    avgPrice: 15,
    keywords: ['חומוס', 'טחינה', 'סלט', 'מטבוחה', 'חציל במיונז', 'פסטרמה', 'סלמי', 'מוכן', 'קציצות', 'ממרח'],
  },
  frozen: {
    id: 'frozen',
    label: 'קפואים',
    emoji: '🧊',
    shelfLifeDays: 90,
    avgPrice: 20,
    keywords: ['קפוא', 'גלידה', 'פיצה קפואה', 'אפונה', 'שעועית ירוקה', 'בצק עלים', 'מלאווח', 'ג\'חנון'],
  },
  dry: {
    id: 'dry',
    label: 'יבשים ושימורים',
    emoji: '🥫',
    shelfLifeDays: 180,
    avgPrice: 10,
    keywords: ['אורז', 'פסטה', 'ספגטי', 'קמח', 'סוכר', 'מלח', 'שמן', 'עדשים', 'שימור', 'טונה', 'תירס', 'קורנפלקס', 'דגני', 'קפה', 'תה', 'במבה', 'ביסלי', 'שוקולד', 'עוגיות', 'קרקר', 'פתיתים', 'קוסקוס', 'שיבולת'],
  },
  drinks: {
    id: 'drinks',
    label: 'משקאות',
    emoji: '🧃',
    shelfLifeDays: 60,
    avgPrice: 9,
    keywords: ['מיץ', 'מים', 'קולה', 'סודה', 'בירה', 'יין', 'משקה', 'פריגת', 'שוקו'],
  },
  sauces: {
    id: 'sauces',
    label: 'רטבים',
    emoji: '🫙',
    shelfLifeDays: 60,
    avgPrice: 10,
    keywords: ['קטשופ', 'מיונז', 'חרדל', 'רוטב', 'סויה', 'ריבה', 'דבש', 'ממרח שוקולד'],
  },
  other: {
    id: 'other',
    label: 'אחר',
    emoji: '📦',
    shelfLifeDays: 14,
    avgPrice: 10,
    keywords: [],
  },
};

/**
 * Order matters: more specific categories first so "שוקו" is a drink before
 * "שוקולד" is checked, and "טונה טרי" is fish before canned tuna is dry.
 */
const CATEGORY_ORDER: CategoryId[] = [
  'frozen',
  'fish',
  'ready',
  'sauces',
  'drinks',
  'eggs',
  'dairy',
  'meat',
  'bread',
  'vegetables',
  'fruit',
  'dry',
];

export const CATEGORY_LIST: Category[] = [...CATEGORY_ORDER, 'other' as const].map((id) => CATEGORIES[id]);

export function guessCategory(name: string): CategoryId {
  const normalized = name.trim().replace(/[׳']/g, "'");
  for (const id of CATEGORY_ORDER) {
    if (CATEGORIES[id].keywords.some((k) => normalized.includes(k))) return id;
  }
  return 'other';
}
