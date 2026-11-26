import { mdiCarrot, mdiSprout } from '@mdi/js';

/* icons of the diet categories, shown on the meals and the filter */
export const DIET_ICONS = {
  Vegan: { icon: mdiSprout, color: 'success' },
  Vegetarisch: { icon: mdiCarrot },
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

/* whether the meal is one of the main dishes 'Essen 1', 'Essen 2', ... */
export const isMainDish = (lane) => lane.startsWith('Essen');

/* whether the meal is one of the vegetables and sides */
export const isSide = (lane) => ['Gemüse', 'Beilage'].includes(lane);

/* the meals in the order of the API, with the vegetables and sides last */
export function sortMeals(meals) {
  return [...meals].sort((a, b) => isSide(a.lane) - isSide(b.lane));
}
