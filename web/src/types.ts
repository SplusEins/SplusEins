import type { RouteLocationRaw } from 'vue-router';
import type { Room } from '../../server/model/api';

// API responses, shared with the server so that they cannot drift apart
export type * from '../../server/model/api';

/* an entry of assets/timetables.json */
export interface TimetableEntry {
  timetablePath: string;
  label: string;
  faculty: string;
  type: string;
  id: string;
  /* a number, or e.g. 'WPF' */
  semester: number | string;
  degree: string;
}

/* a timetable of the Ostfalia, with the route that shows it */
export interface Schedule extends TimetableEntry {
  route: RouteLocationRaw;
}

/* courses of one or more timetables, created by the user */
export interface CustomTimetable {
  id: string[];
  label: string;
  /* ids of the chosen courses */
  whitelist: string[];
}

export type AnyTimetable = Schedule | CustomTimetable;

/* a timetable as shown in the agenda */
export interface Plan {
  name: string;
  route: RouteLocationRaw;
}

/* an event as the calendar shows it */
export interface CalendarEvent {
  id: string;
  name: string;
  /* 'YYYY-MM-DD HH:mm' */
  start: string;
  end: string;
  location: string;
  rooms: Room[];
  lecturer: string;
  info: string;
  color: string;
}

export interface AgendaEvent extends CalendarEvent {
  plan: Plan;
}
