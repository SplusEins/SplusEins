import TIMETABLES from '../assets/timetables.json';
import {
  courseCount,
  timetableDisplayName,
  timetableSubtitle,
  truncateText,
  uniq,
} from './util';

export const TIMETABLES_BY_ID = new Map(TIMETABLES.map((t) => [t.id, t]));

/* the courses of a timetable: all, all except some, or only some */
export type Source =
  | { id: string; except?: string[]; only?: undefined }
  | { id: string; only: string[]; except?: undefined };

/* without a name it has one source and is a remembered timetable */
export interface Plan {
  name?: string;
  sources: Source[];
}

/**
 * @param text e.g. 'se3,inf3!a.b,wpf:c.d': all courses of se3, those of
 * inf3 except a and b, and only c and d of wpf
 */
export function parseSources(text = ''): Source[] {
  return text
    .split(',')
    .filter(Boolean)
    .map((part) => {
      const index = part.search(/[!:]/);
      const [id, operator, courses] =
        index === -1
          ? [part, '', '']
          : [part.slice(0, index), part[index], part.slice(index + 1)];
      const list = courses.split('.').filter(Boolean);
      if (operator === '!' && list.length) return { id, except: list };
      if (operator === ':') return { id, only: list };
      return { id };
    });
}

export function sourcesToString(sources: Source[]): string {
  return sources
    .map(({ id, except, only }) => {
      if (only) return `${id}:${only.join('.')}`;
      if (except?.length) return `${id}!${except.join('.')}`;
      return id;
    })
    .join(',');
}

export function includesCourse(
  { except, only }: Source,
  courseId: string,
): boolean {
  return only ? only.includes(courseId) : !except?.includes(courseId);
}

/**
 * @param sourceIds ids of the sources which contain the course
 * @returns the plan without the course, and without sources it was the last one of
 */
export function withoutCourse(
  plan: Plan,
  courseId: string,
  sourceIds: string[],
): Plan {
  const sources = plan.sources.flatMap((source): Source[] => {
    if (!sourceIds.includes(source.id)) return [source];
    if (!source.only) {
      const except = [...(source.except ?? []), courseId];
      return [{ id: source.id, except: uniq(except) }];
    }
    const only = source.only.filter((id) => id !== courseId);
    return only.length ? [{ id: source.id, only }] : [];
  });
  return { ...plan, sources };
}

/* the plan with the course of the timetable sourceId */
export function withCourse(
  plan: Plan,
  sourceId: string,
  courseId: string,
): Plan {
  const sources = plan.sources.map((source): Source => {
    if (source.id !== sourceId || includesCourse(source, courseId)) {
      return source;
    }
    if (source.only) return { id: source.id, only: [...source.only, courseId] };
    const except = (source.except ?? []).filter((id) => id !== courseId);
    return except.length ? { id: source.id, except } : { id: source.id };
  });
  if (!sources.some(({ id }) => id === sourceId)) {
    sources.push({ id: sourceId, only: [courseId] });
  }
  return { ...plan, sources };
}

/* identifies a saved plan */
export function planKey(plan: Plan): string {
  return plan.name ?? plan.sources[0]?.id ?? '';
}

/* a link to the plan, e.g. for chips */
export function planLink(plan: Plan, maxLength = Infinity) {
  return { name: planDisplayName(plan, maxLength), route: planRoute(plan) };
}

export function planRoute(plan: Plan) {
  return {
    name: 'plan',
    params: { sources: sourcesToString(plan.sources) },
    query: plan.name ? { name: plan.name } : {},
  };
}

/* maxLength truncates the name, but keeps the semester of a timetable */
export function planDisplayName(plan: Plan, maxLength = Infinity): string {
  if (plan.name) return truncateText(plan.name, maxLength);
  const id = plan.sources[0]?.id ?? '';
  const timetable = TIMETABLES_BY_ID.get(id);
  return timetable ? timetableDisplayName(timetable, maxLength) : id;
}

/* the name, or the label of the timetable without its semester */
export function planTitle(plan: Plan): string {
  const id = plan.sources[0]?.id ?? '';
  return plan.name ?? TIMETABLES_BY_ID.get(id)?.label ?? id;
}

/**
 * @returns e.g. '3. Semester · Informatik Bachelor · 1 Kurs ausgeblendet'
 * or 'Eigener Plan · aus 2 Plänen'
 */
export function planSubtitle(plan: Plan): string {
  const { sources } = plan;
  if (plan.name) {
    return `Eigener Plan · aus ${sources.length === 1 ? '1 Plan' : `${sources.length} Plänen`}`;
  }
  const { id, except, only } = sources[0] ?? { id: '' };
  const timetable = TIMETABLES_BY_ID.get(id);
  return [
    timetable && timetableSubtitle(timetable),
    except?.length && `${courseCount(except.length)} ausgeblendet`,
    only && `${courseCount(only.length)} ausgewählt`,
  ]
    .filter(Boolean)
    .join(' · ');
}
