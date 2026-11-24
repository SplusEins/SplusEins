const MEAT = ['Schwein', 'Rind', 'Geflügel', 'Fisch', 'Lamm', 'Wild'];
const HIGHLIGHTS = {
  'Niedersachsen Menü': 'Niedersachsen-Menü',
  Aktion: 'Aktion',
  'NEU bei uns': 'Neu',
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
  return { title: title ?? name, sides: sides.join(', ') };
}

/**
 * Chips of a meal: vegan, vegetarian or the kind of meat, then highlights.
 */
export function mealChips(categories) {
  const chips = [];
  if (categories.includes('Vegan')) {
    chips.push({ text: 'Vegan', color: 'success' });
  } else if (categories.includes('Vegetarisch')) {
    chips.push({ text: 'Vegetarisch', color: 'warning' });
  } else {
    const meat = categories.filter((category) => MEAT.includes(category));
    if (meat.length > 0) chips.push({ text: meat.join(', ') });
  }
  for (const category of categories) {
    if (HIGHLIGHTS[category]) {
      chips.push({ text: HIGHLIGHTS[category], color: 'primary' });
    }
  }
  return chips;
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
