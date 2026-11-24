import { mdiCarrot, mdiSprout } from '@mdi/js';
import dayjs from './dayjs';

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

/**
 * 'Heute' or 'Morgen' if the date is one of these days, otherwise undefined
 */
export function relativeDay(date) {
  if (dayjs().isSame(date, 'day')) return 'Heute';
  if (dayjs().add(1, 'day').isSame(date, 'day')) return 'Morgen';
  return undefined;
}

/**
 * 'Diese Woche', 'Nächste Woche' or the calendar week of the date
 */
export function weekLabel(date) {
  const day = dayjs(date);
  const weeks = day.startOf('isoWeek').diff(dayjs().startOf('isoWeek'), 'week');
  if (weeks === 0) return 'Diese Woche';
  if (weeks === 1) return 'Nächste Woche';
  return `KW ${day.isoWeek()}`;
}
