import { daysUntil } from './dates';
import type { PantryItem } from './types';

export interface Ingredient {
  /** What the recipe calls it, shown to the user. */
  name: string;
  /** Any of these inside a pantry item's name counts as having it. */
  keys: string[];
  /** Salt, oil, spices: assumed to be at home, never "missing". */
  staple?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  ingredients: Ingredient[];
  steps: string[];
}

const ing = (name: string, keys: string[] = [name]): Ingredient => ({ name, keys });
const staple = (name: string): Ingredient => ({ name, keys: [name], staple: true });

const EGGS = ing('ביצים', ['ביצ']);
const TOMATOES = ing('עגבניות', ['עגבני']);
const ONION = ing('בצל');
const CHEESE = ing('גבינה צהובה', ['גבינה צהובה', 'מוצרלה', 'צהובה']);
const WHITE_CHEESE = ing('גבינה לבנה / קוטג׳', ['קוטג', 'גבינה לבנה', 'גבינה 5%', 'לבנה']);
const BREAD = ing('לחם', ['לחם', 'חלה', 'לחמני', 'באגט']);
const CHICKEN = ing('עוף', ['עוף', 'חזה', 'פרגי', 'כרעיים', 'שוקיים']);
const PASTA = ing('פסטה', ['פסטה', 'ספגטי', 'פנה', 'פוזילי']);
const MILK = ing('חלב', ['חלב']);
const OIL = staple('שמן');
const SALT = staple('מלח ופלפל');

export const RECIPES: Recipe[] = [
  {
    id: 'shakshuka',
    title: 'שקשוקה',
    emoji: '🍳',
    minutes: 25,
    ingredients: [EGGS, TOMATOES, ONION, ing('פלפל', ['פלפל אדום', 'פלפל']), ing('שום'), OIL, SALT],
    steps: [
      'מטגנים בצל קצוץ ופלפל בשמן עד שמזהיבים.',
      'מוסיפים שום ועגבניות חתוכות, מתבלים ומבשלים כ-10 דקות לרוטב סמיך.',
      'עושים גומות ברוטב, שוברים לתוכן ביצים, מכסים ומבשלים 5-7 דקות.',
    ],
  },
  {
    id: 'israeli-salad',
    title: 'סלט ישראלי קצוץ',
    emoji: '🥗',
    minutes: 10,
    ingredients: [TOMATOES, ing('מלפפונים', ['מלפפון']), ONION, ing('לימון'), ing('פטרוזיליה'), staple('שמן זית'), SALT],
    steps: ['קוצצים דק עגבניות, מלפפונים, בצל ופטרוזיליה.', 'מתבלים בשמן זית, לימון, מלח ופלפל ומערבבים.'],
  },
  {
    id: 'veg-omelette',
    title: 'חביתת ירק',
    emoji: '🥚',
    minutes: 10,
    ingredients: [EGGS, ing('פטרוזיליה', ['פטרוזיליה', 'שמיר', 'כוסברה', 'בצל ירוק']), ONION, OIL, SALT],
    steps: ['טורפים ביצים עם עשבי תיבול קצוצים ובצל.', 'מטגנים במחבת משומנת משני הצדדים.'],
  },
  {
    id: 'pasta-tomato',
    title: 'פסטה ברוטב עגבניות',
    emoji: '🍝',
    minutes: 20,
    ingredients: [PASTA, TOMATOES, ing('שום'), ing('בזיליקום'), staple('שמן זית'), SALT],
    steps: [
      'מבשלים פסטה לפי ההוראות.',
      'בינתיים מטגנים שום בשמן זית, מוסיפים עגבניות קצוצות ומבשלים 10 דקות.',
      'מערבבים את הפסטה ברוטב ומגישים עם בזיליקום.',
    ],
  },
  {
    id: 'pasta-cream',
    title: 'פסטה שמנת ופטריות',
    emoji: '🍄',
    minutes: 20,
    ingredients: [PASTA, ing('שמנת'), ing('פטריות'), ONION, ing('גבינה מגורדת', ['פרמזן', 'צהובה', 'מוצרלה']), SALT],
    steps: [
      'מבשלים פסטה.',
      'מטגנים בצל ופטריות, מוסיפים שמנת ומצמצמים מעט.',
      'מערבבים עם הפסטה ומפזרים גבינה.',
    ],
  },
  {
    id: 'schnitzel',
    title: 'שניצל ביתי',
    emoji: '🍗',
    minutes: 30,
    ingredients: [CHICKEN, EGGS, ing('פירורי לחם', ['פירורי', 'פנקו']), staple('קמח'), OIL, SALT],
    steps: [
      'פורסים את החזה לפרוסות דקות.',
      'טובלים בקמח, בביצה טרופה ובפירורי לחם.',
      'מטגנים בשמן חם 3-4 דקות מכל צד.',
    ],
  },
  {
    id: 'chicken-tray',
    title: 'עוף בתנור עם ירקות',
    emoji: '🥘',
    minutes: 60,
    ingredients: [CHICKEN, ing('תפוחי אדמה', ['תפוח אדמה', 'תפו"א', 'בטטה']), ing('גזר'), ONION, ing('שום'), OIL, SALT],
    steps: [
      'חותכים ירקות לקוביות גדולות ומניחים בתבנית.',
      'מניחים מעל את העוף, מתבלים בשמן, שום, מלח ופפריקה.',
      'אופים בחום 200 מעלות כשעה, עד שהעוף שחום.',
    ],
  },
  {
    id: 'veg-soup',
    title: 'מרק ירקות',
    emoji: '🍲',
    minutes: 45,
    ingredients: [
      ing('גזר'),
      ONION,
      ing('קישואים', ['קישוא']),
      ing('תפוחי אדמה', ['תפוח אדמה', 'תפו"א', 'בטטה']),
      ing('סלרי'),
      OIL,
      SALT,
    ],
    steps: [
      'מטגנים בצל בסיר.',
      'מוסיפים את כל הירקות חתוכים, מכסים במים ומתבלים.',
      'מבשלים 30-40 דקות. אפשר לטחון למרק קרם.',
    ],
  },
  {
    id: 'quiche',
    title: 'פשטידת ירקות וגבינות',
    emoji: '🥧',
    minutes: 50,
    ingredients: [
      EGGS,
      WHITE_CHEESE,
      CHEESE,
      ing('ירק לפשטידה', ['ברוקולי', 'כרובית', 'תרד', 'קישוא', 'פטריות']),
      ing('שמנת'),
      staple('קמח'),
      SALT,
    ],
    steps: [
      'מאדים או מטגנים קלות את הירק.',
      'מערבבים ביצים, גבינות, שמנת וכף קמח, ומוסיפים את הירק.',
      'אופים בתבנית ב-180 מעלות כ-40 דקות.',
    ],
  },
  {
    id: 'toast',
    title: 'טוסט גבינה',
    emoji: '🥪',
    minutes: 10,
    ingredients: [BREAD, CHEESE, TOMATOES, ing('זיתים')],
    steps: ['ממלאים לחם בגבינה, עגבנייה וזיתים.', 'קולים במכונת טוסט או במחבת עד שהגבינה נמסה.'],
  },
  {
    id: 'french-toast',
    title: 'פרנץ׳ טוסט',
    emoji: '🍞',
    minutes: 15,
    ingredients: [BREAD, EGGS, MILK, staple('סוכר / דבש'), OIL],
    steps: [
      'טורפים ביצים עם חלב וקצת סוכר.',
      'טובלים פרוסות לחם (גם לחם של כמה ימים) ומטגנים משני הצדדים.',
    ],
  },
  {
    id: 'tuna-salad',
    title: 'סלט טונה',
    emoji: '🐟',
    minutes: 10,
    ingredients: [ing('טונה'), ing('תירס'), ing('מלפפון חמוץ', ['חמוצ']), ONION, ing('מיונז'), EGGS],
    steps: ['מערבבים טונה מסוננת עם תירס, חמוצים ובצל קצוץ.', 'מוסיפים מיונז וביצה קשה קצוצה.'],
  },
  {
    id: 'hummus-plate',
    title: 'צלחת חומוס עם ביצה',
    emoji: '🫓',
    minutes: 15,
    ingredients: [ing('חומוס'), EGGS, ing('פיתות', ['פית']), TOMATOES, ing('מלפפונים', ['מלפפון']), staple('שמן זית')],
    steps: ['מבשלים ביצים 10 דקות.', 'מגישים חומוס עם ביצה חצויה, שמן זית, פיתות וירקות חתוכים.'],
  },
  {
    id: 'meatballs',
    title: 'קציצות ברוטב עגבניות',
    emoji: '🧆',
    minutes: 45,
    ingredients: [ing('בשר טחון', ['טחון']), ONION, EGGS, TOMATOES, ing('פטרוזיליה'), ing('פירורי לחם', ['פירורי', 'לחם']), SALT],
    steps: [
      'לשים בשר עם בצל מגורד, ביצה, פטרוזיליה ופירורי לחם.',
      'מכינים רוטב מעגבניות מרוסקות ומבשלים בו את הקציצות 30 דקות.',
    ],
  },
  {
    id: 'stir-fry',
    title: 'מוקפץ עוף וירקות',
    emoji: '🥢',
    minutes: 25,
    ingredients: [
      CHICKEN,
      ing('ירקות להקפצה', ['פלפל', 'ברוקולי', 'גזר', 'קישוא', 'פטריות', 'כרוב']),
      ing('אורז או אטריות', ['אורז', 'אטריות', 'נודלס']),
      ing('רוטב סויה', ['סויה']),
      OIL,
    ],
    steps: [
      'מבשלים אורז או אטריות.',
      'מקפיצים רצועות עוף בשמן חם, מוציאים ומקפיצים את הירקות.',
      'מחזירים את העוף, מוסיפים סויה ומגישים.',
    ],
  },
  {
    id: 'zucchini-fritters',
    title: 'לביבות קישואים',
    emoji: '🥒',
    minutes: 25,
    ingredients: [ing('קישואים', ['קישוא']), EGGS, ing('גבינה בולגרית', ['בולגרית', 'פטה', 'צפתית']), staple('קמח'), OIL, SALT],
    steps: [
      'מגררים קישואים וסוחטים מהם את הנוזלים.',
      'מערבבים עם ביצים, גבינה מפוררת וקמח.',
      'מטגנים כפות מהתערובת עד שהן זהובות.',
    ],
  },
  {
    id: 'banana-cake',
    title: 'עוגת בננות',
    emoji: '🍌',
    minutes: 60,
    ingredients: [ing('בננות בשלות', ['בננ']), EGGS, staple('קמח'), staple('סוכר'), OIL],
    steps: [
      'מועכים 3 בננות בשלות (ככל שהן שחורות יותר, יותר טוב).',
      'מערבבים עם 2 ביצים, חצי כוס שמן, חצי כוס סוכר וכוס וחצי קמח תופח.',
      'אופים ב-180 מעלות כ-45 דקות.',
    ],
  },
  {
    id: 'smoothie',
    title: 'שייק פירות',
    emoji: '🥤',
    minutes: 5,
    ingredients: [ing('פירות', ['בננ', 'תות', 'מנגו', 'אפרסק', 'תפוח']), ing('יוגורט או חלב', ['יוגורט', 'חלב', 'לבן']), staple('דבש')],
    steps: ['טוחנים פירות (גם כאלה שהתרככו) עם יוגורט או חלב ומעט דבש.'],
  },
  {
    id: 'yogurt-bowl',
    title: 'קערת יוגורט ופירות',
    emoji: '🍓',
    minutes: 5,
    ingredients: [ing('יוגורט', ['יוגורט', 'לבן']), ing('פירות', ['בננ', 'תות', 'תפוח', 'ענב', 'מנגו']), ing('גרנולה', ['גרנולה', 'שיבולת', 'דגני'])],
    steps: ['מניחים יוגורט בקערה, מוסיפים פירות חתוכים ומפזרים גרנולה.'],
  },
  {
    id: 'cheese-sandwich',
    title: 'כריך גבינה וירקות',
    emoji: '🥙',
    minutes: 5,
    ingredients: [BREAD, WHITE_CHEESE, ing('מלפפונים', ['מלפפון']), TOMATOES],
    steps: ['מורחים גבינה על לחם ומוסיפים פרוסות ירקות.'],
  },
];

export interface RecipeMatch {
  recipe: Recipe;
  /** Pantry items the recipe would use, soonest to expire first. */
  uses: PantryItem[];
  /** Of `uses`, the ones expiring within RESCUE_SOON_DAYS. */
  rescues: PantryItem[];
  missing: Ingredient[];
}

/** Items this close to expiry are what a recipe should "rescue". */
export const RESCUE_SOON_DAYS = 3;

function normalize(text: string): string {
  return text.replace(/[׳'"״]/g, '');
}

/**
 * Recipes worth cooking now: they use something that is about to expire, and
 * need as little shopping as possible. Recipes using nothing at home are left out.
 */
export function suggestRecipes(active: PantryItem[], today: Date = new Date()): RecipeMatch[] {
  const sorted = [...active].sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
  const matches: RecipeMatch[] = [];
  for (const recipe of RECIPES) {
    const uses: PantryItem[] = [];
    const missing: Ingredient[] = [];
    for (const ingredient of recipe.ingredients) {
      const found = sorted.find(
        (item) => !uses.includes(item) && ingredient.keys.some((k) => normalize(item.name).includes(normalize(k))),
      );
      if (found) uses.push(found);
      else if (!ingredient.staple) missing.push(ingredient);
    }
    if (uses.length === 0) continue;
    const rescues = uses.filter((i) => daysUntil(i.expiresOn, today) <= RESCUE_SOON_DAYS);
    matches.push({ recipe, uses, rescues, missing });
  }
  return matches.sort(
    (a, b) =>
      b.rescues.length - a.rescues.length ||
      a.missing.length - b.missing.length ||
      b.uses.length - a.uses.length,
  );
}
