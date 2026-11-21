import TIMETABLES from '../assets/timetables.json';
import { TimetableRequest } from '../model/SplusEinsModel';

/**
 * A timetable with all its courses, all except some or only some.
 */
export interface Source {
  timetable: TimetableRequest;
  except?: string[];
  only?: string[];
}

/**
 * @param csv comma-separated values from a URL, e.g. 'a,b,'
 * @returns the non-empty values, e.g. ['a', 'b']
 */
export function splitList(csv = ''): string[] {
  return csv.split(',').filter((value) => value.length > 0);
}

export function findTimetable(id: string): TimetableRequest | undefined {
  return TIMETABLES.find((t) => t.id === id);
}

/**
 * @param text e.g. 'se3,inf3!a.b,wpf:c.d': all courses of se3, those of
 * inf3 except a and b, and only c and d of wpf
 * @returns the sources of known timetables
 */
export function parseSources(text = ''): Source[] {
  return splitList(text).flatMap((part) => {
    const index = part.search(/[!:]/);
    const [id, operator, courses] =
      index === -1
        ? [part, '', '']
        : [part.slice(0, index), part[index], part.slice(index + 1)];
    const timetable = findTimetable(id);
    if (!timetable) return [];
    const list = courses.split('.').filter(Boolean);
    if (operator === '!') return [{ timetable, except: list }];
    if (operator === ':') return [{ timetable, only: list }];
    return [{ timetable }];
  });
}

export function includesCourse({ except, only }: Source, courseId: string) {
  return only ? only.includes(courseId) : !except?.includes(courseId);
}
