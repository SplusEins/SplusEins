import dayjs from './dayjs';

/* chip color of a meal category, other categories get the default color */
const CHIP_COLORS = {
  Vegan: 'success',
  Vegetarisch: 'warning',
  'Niedersachsen Menü': 'primary',
  Aktion: 'primary',
  'NEU bei uns': 'primary',
  StudiDeal: 'primary',
  Klimaessen: 'primary',
};

/**
 * Split a meal name like "Ofenkartoffel | Kräuterquark | Feldsalat" into
 * the dish and its sides.
 */
export function splitMealName(name) {
  const [title, ...sides] = name
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    title: title ?? name,
    sides: sides.length > 0 ? `mit ${sides.join(', ')}` : '',
  };
}

export function mealChips(categories) {
  return categories.map((text) => ({ text, color: CHIP_COLORS[text] }));
}

/**
 * Whether a meal fits the diet 'all', 'vegetarian' or 'vegan'.
 */
export function matchesDiet(diet, categories) {
  if (diet === 'vegan') return categories.includes('Vegan');
  if (diet === 'vegetarian') {
    return categories.includes('Vegan') || categories.includes('Vegetarisch');
  }
  return true;
}

/**
 * 'Heute' or 'Morgen' if the date is one of these days, otherwise undefined
 */
export function relativeDay(date) {
  if (dayjs().isSame(date, 'day')) return 'Heute';
  if (dayjs().add(1, 'day').isSame(date, 'day')) return 'Morgen';
  return undefined;
}
