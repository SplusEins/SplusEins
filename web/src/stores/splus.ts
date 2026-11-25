import { defineStore } from 'pinia';

import dayjs from '../lib/dayjs';
import { ApiError, apiGet } from '../lib/api';
import TIMETABLES from '../assets/timetables.json';
import { useAppStore } from './app';
import {
  SEMESTER_WEEK_1,
  isCustomTimetable,
  timetablePlan,
  timetableDisplayName,
  truncateText,
  uniq,
} from '../lib/util';
import type { Dayjs } from 'dayjs';
import type { LocationQuery, RouteParams } from 'vue-router';
import type {
  AgendaEvent,
  AnyTimetable,
  CalendarEvent,
  CustomTimetable,
  Event,
  Schedule,
  Timetable,
} from '../types';

// 20 evenly spread hues, the first ten are 36° apart
const COURSE_COLORS = [
  '#266EC3',
  '#93640C',
  '#9A4A9B',
  '#198534',
  '#B44821',
  '#0D7B94',
  '#715ABE',
  '#72740C',
  '#B14166',
  '#068074',
  '#5464C4',
  '#856C02',
  '#A84482',
  '#0F825E',
  '#A55702',
  '#0B77A9',
  '#8851B0',
  '#557D09',
  '#B54247',
  '#0A7E84',
];

// agenda and its plan chips colour by plan
export function planColor(index: number): string {
  return COURSE_COLORS[index % COURSE_COLORS.length] ?? '#616161';
}

function toCalendarEvent(
  event: Event,
  timetable: AnyTimetable | undefined,
): CalendarEvent {
  return {
    id: event.id,
    name: event.title,
    start: dayjs(event.start).format('YYYY-MM-DD HH:mm'),
    end: dayjs(event.end).format('YYYY-MM-DD HH:mm'),
    location: event.location,
    rooms: event.rooms ?? [],
    lecturer: event.meta.organiserName,
    info: event.meta.description,
    color: courseColor(event, timetable),
  };
}

function courseColor(
  event: Event,
  timetable: AnyTimetable | undefined,
): string {
  // custom plans combine several plans, whose indexes would collide
  const whitelist = isCustomTimetable(timetable) ? timetable.whitelist : [];
  const index = whitelist.length
    ? whitelist.indexOf(event.id)
    : event.colorIndex;
  // grey for responses cached before the API sent colorIndex
  if (index === undefined) return '#616161';
  return COURSE_COLORS[index % COURSE_COLORS.length] ?? '#616161';
}

const formatDayjs = (date: Dayjs) => {
  return date.format('YYYY-MM-DD');
};

function defaultWeek() {
  if (
    dayjs().isoWeek() < SEMESTER_WEEK_1 &&
    SEMESTER_WEEK_1 - dayjs().isoWeek() < 10
  ) {
    // Use semester beginning instead of today if semester hasn't started yet
    // Do that only a few weeks before the semester so we avoid bugs with year wraparounds
    return formatDayjs(dayjs().isoWeek(SEMESTER_WEEK_1).startOf('isoWeek'));
  }

  // if the user is looking at today and is on Sat/Sun, peek to the next week
  if (dayjs().isoWeekday() === 6 || dayjs().isoWeekday() === 7) {
    return formatDayjs(dayjs().startOf('isoWeek').add(1, 'week'));
  } else {
    return formatDayjs(dayjs().startOf('isoWeek'));
  }
}

/**
 * Key of a saved timetable which stays the same while the app is updated.
 */
export function subscriptionKey(timetable: AnyTimetable): string {
  return isCustomTimetable(timetable)
    ? `custom:${timetable.label}`
    : timetable.id;
}

/**
 * Return all events for the given timetable and week.
 */
export async function loadEvents(
  timetable: AnyTimetable,
  weeks: number | string,
): Promise<Event[]> {
  let data;
  if (isCustomTimetable(timetable)) {
    const ids = timetable.id.join(',');
    const whitelist = timetable.whitelist.join(',');
    data = await apiGet<Timetable>(
      `/api/splus/${ids}/${weeks}/${whitelist}/${encodeURIComponent(timetable.label)}`,
    );
  } else {
    data = await apiGet<Timetable>(`/api/splus/${timetable.id}/${weeks}`);
  }

  return data?.events ?? [];
}

/**
 * Return all unique lectures for the given timetable.
 */
export async function loadUniqueLectures(
  timetable: Schedule,
): Promise<Event[]> {
  return (await apiGet<Event[]>(`/api/splus/${timetable.id}/lectures`)) ?? [];
}

/* all timetables of the Ostfalia, they do not change while the app runs */
const SCHEDULES: Schedule[] = TIMETABLES.map((timetable) => ({
  ...timetable,
  route: {
    name: 'plan-timetable',
    params: { timetable: timetable.id },
  },
}));
const SCHEDULES_BY_ID = new Map(
  SCHEDULES.map((schedule) => [schedule.id, schedule]),
);
// every timetable id ends with its semester, e.g. '_ws26'
const semesterOf = (id: string) => /_[^_]+$/.exec(id)?.[0];
const CURRENT_SEMESTERS = new Set(SCHEDULES.map(({ id }) => semesterOf(id)));

// e.g. " informatik se 3", so " se" matches the start of a word
const searchText = (text: unknown) =>
  ` ${String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')}`;

/* the values of a query parameter, which may be given several times */
function strings(value: LocationQuery[string] | undefined): string[] {
  return ([] as (string | null)[])
    .concat(value ?? [])
    .filter((item) => item !== null);
}

/* count the requests, so that only the response of the last one is used */
let loadCounter = 0;
let agendaCounter = 0;
/* week of the last showWeek() call, which may still be loading */
let requestedWeek: string | undefined;

export const useSplusStore = defineStore('splus', {
  state: () => ({
    /**
     * Current timetable, either one of TIMETABLES or customTimetable.
     */
    schedule: undefined as AnyTimetable | undefined,
    /**
     * Map of created or visited custom timetables.
     * Key: label
     *
     * Values: custom timetable like this:
     * { ...timetable, label, whitelist: [ titleId ] }
     *
     * where
     * timetable: Base timetable.
     * label: Custom name.
     * filters: Whitelist array of keys.
     */
    customSchedules: {} as Record<string, CustomTimetable>,
    /**
     * Ids of the favorite timetables. Only ids are saved, so that labels
     * stay current and timetables of past semesters can be dropped.
     */
    favoriteIds: [] as string[],
    /**
     * subscriptionKey of the timetable shown on the start page
     */
    subscribedKey: null as string | null,
    /**
     * Events
     */
    events: [] as Event[],
    /**
     * Currently viewed week as a date string. The date string specifies the first day of that week.
     */
    week: defaultWeek(),
    /**
     * Events of all favorite and custom timetables for this and next week
     */
    agendaEvents: [] as AgendaEvent[],
  }),
  getters: {
    /**
     * Last day of the week to show: Friday, or the last day with events on the weekend
     * (1: Monday, 7: Sunday)
     */
    lastWeekday: (state) => {
      return Math.max(
        5,
        ...state.events.map(({ start }) => dayjs(start).isoWeekday()),
      );
    },
    /**
     * @return The events as timestamp-aware dayspan calendar event inputs.
     * @see https://clickermonkey.github.io/dayspan/docs/interfaces/eventinput.html
     */
    getCalendarEvents: (state) => {
      return state.events.map((event) =>
        toCalendarEvent(event, state.schedule),
      );
    },
    /**
     * Group the timetables: { 'faculty degree': { semester: timetables } }
     */
    getTimetablesAsTree: () => {
      const tree: Record<string, Record<string, Schedule[]>> = {};
      SCHEDULES.forEach((timetable) => {
        const semesters = (tree[`${timetable.faculty} ${timetable.degree}`] ??=
          {});
        (semesters[timetable.semester] ??= []).push(timetable);
      });
      return tree;
    },
    /**
     * Timetables where every query word starts a word of label, faculty,
     * degree or semester, those matching in the label first.
     */
    searchTimetables: () => (query: string) => {
      // skip "sem" or "semester" as in "3. Semester", but keep "se" for "SE"
      const queryWords = searchText(query)
        .split(' ')
        .filter(
          (word) => word && !(word.length >= 3 && 'semester'.startsWith(word)),
        );
      if (queryWords.length === 0) return [];
      const matches = (text: string) => {
        const words = searchText(text);
        return (word: string) => words.includes(` ${word}`);
      };
      const inLabel = ({ label }: Schedule) =>
        Number(queryWords.some(matches(label)));
      return SCHEDULES.filter(({ label, faculty, degree, semester }) =>
        queryWords.every(matches(`${label} ${faculty} ${degree} ${semester}`)),
      ).sort((a, b) => inLabel(b) - inLabel(a));
    },
    timetableIds: () => {
      return SCHEDULES.map(({ id }) => id);
    },
    getTimetableById: () => (timetableId: string) => {
      return SCHEDULES_BY_ID.get(timetableId);
    },
    favoriteSchedules: (state) => {
      return state.favoriteIds
        .map((id) => SCHEDULES_BY_ID.get(id))
        .filter((schedule) => schedule !== undefined);
    },
    customTimetableLabels: (state) => {
      return Object.keys(state.customSchedules);
    },
    isCustomTimetable: (state) => {
      return isCustomTimetable(state.schedule);
    },
    // pass maxLabelLength to truncate for space-constrained UI (see timetableDisplayName)
    scheduleDisplayName:
      (state) =>
      (maxLabelLength = Infinity) => {
        if (!state.schedule) return '';
        return isCustomTimetable(state.schedule)
          ? truncateText(state.schedule.label, maxLabelLength)
          : timetableDisplayName(state.schedule, maxLabelLength);
      },
    subscribableTimetables(): AnyTimetable[] {
      return [
        ...Object.values(this.customSchedules),
        ...this.favoriteSchedules,
      ];
    },
    // {} if there is none
    subscribedTimetable(): AnyTimetable | Record<string, never> {
      return (
        this.subscribableTimetables.find(
          (timetable) => subscriptionKey(timetable) === this.subscribedKey,
        ) ??
        this.subscribableTimetables[0] ??
        {}
      );
    },
    /* faculties of the favorite and custom timetables */
    savedFaculties(): string[] {
      const ids = this.subscribableTimetables.flatMap(({ id }) => id);
      return uniq(ids.map((id) => SCHEDULES_BY_ID.get(id)?.faculty)).filter(
        (faculty) => faculty !== undefined,
      );
    },
    isFavoriteSchedule: (state) => (timetable: Schedule) =>
      state.favoriteIds.includes(timetable.id),
    hasSubscribableTimetables(): boolean {
      return this.subscribableTimetables.length > 0;
    },
  },
  actions: {
    addCustomSchedule(customTimetable: CustomTimetable) {
      const label = customTimetable.label;
      // never overwrite a stored timetable with the same name
      if (label in this.customSchedules) return;

      this.customSchedules[label] = customTimetable;
      this.subscribedKey ??= subscriptionKey(customTimetable);
    },
    deleteCustomSchedule(customTimetable: CustomTimetable) {
      delete this.customSchedules[customTimetable.label];
      this.unsubscribe(customTimetable);
    },
    /**
     * Store an edited custom timetable, which stays subscribed if it was before.
     */
    replaceCustomSchedule(
      oldTimetable: CustomTimetable,
      newTimetable: CustomTimetable,
    ) {
      const wasSubscribed =
        this.subscribedKey === subscriptionKey(oldTimetable);
      delete this.customSchedules[oldTimetable.label];
      this.customSchedules[newTimetable.label] = newTimetable;
      if (wasSubscribed) this.subscribedKey = subscriptionKey(newTimetable);
    },
    addCourseToCustomSchedule(
      label: string,
      timetableId: string,
      courseId: string,
    ) {
      const old = this.customSchedules[label];
      if (!old) return;
      this.replaceCustomSchedule(old, {
        ...old,
        id: uniq([...old.id, timetableId]),
        whitelist: [...old.whitelist, courseId],
      });
    },
    removeCourseFromCustomSchedule(label: string, courseId: string) {
      const old = this.customSchedules[label];
      if (!old) return undefined;
      const updated = {
        ...old,
        whitelist: old.whitelist.filter((id) => id !== courseId),
      };
      this.replaceCustomSchedule(old, updated);
      return updated;
    },
    addFavoriteSchedule(favoriteTimetable: Schedule) {
      if (this.favoriteIds.includes(favoriteTimetable.id)) return;
      this.favoriteIds.push(favoriteTimetable.id);
      this.subscribedKey ??= subscriptionKey(favoriteTimetable);
    },
    toggleFavoriteSchedule(timetable: Schedule) {
      if (this.isFavoriteSchedule(timetable)) {
        this.removeFavoriteSchedule(timetable);
      } else {
        this.addFavoriteSchedule(timetable);
      }
    },
    removeFavoriteSchedule(favoriteTimetable: Schedule) {
      this.favoriteIds = this.favoriteIds.filter(
        (id) => id !== favoriteTimetable.id,
      );
      this.unsubscribe(favoriteTimetable);
    },
    /**
     * If the removed timetable was subscribed, show the first saved one instead.
     */
    unsubscribe(removedTimetable: AnyTimetable) {
      if (this.subscribedKey !== subscriptionKey(removedTimetable)) return;
      const first = this.subscribableTimetables[0];
      this.subscribedKey = first ? subscriptionKey(first) : null;
    },
    /**
     * Forget saved timetables of past semesters and broken ones. Unknown
     * timetables of the current semester are kept, as they may come back
     * with the next update of timetables.json.
     */
    forgetPastSemesters() {
      const keep = (id: string) =>
        SCHEDULES_BY_ID.has(id) || CURRENT_SEMESTERS.has(semesterOf(id));
      this.favoriteIds = this.favoriteIds.filter(keep);
      this.customSchedules = Object.fromEntries(
        // saved data may be broken, so do not trust the types here
        Object.entries(this.customSchedules ?? {}).filter(([, custom]) =>
          ([] as unknown[])
            .concat((custom as CustomTimetable | undefined)?.id)
            .some((id) => typeof id === 'string' && keep(id)),
        ),
      );
    },

    /**
     * Load the events of the current timetable in the given week and show
     * both together afterwards, so that the calendar does not flicker.
     * @param week first day of the week, e.g. '2026-11-16'
     */
    async showWeek(week = defaultWeek()) {
      requestedWeek = week;
      const request = ++loadCounter;
      try {
        if (!this.schedule) throw new Error('no timetable selected');
        const events = await loadEvents(this.schedule, dayjs(week).isoWeek());
        // e.g. the user switched to the next week before the response arrived
        if (request !== loadCounter) return;
        this.events = events;
      } catch (error) {
        if (request !== loadCounter) return;
        this.events = [];
        if (error instanceof ApiError && error.status === 404) {
          useAppStore().enqueueError('Dieser Plan existiert nicht (mehr).');
        } else {
          useAppStore().reportLoadError('Stundenplan', error);
        }
      }
      this.week = week;
    },
    /**
     * Show the week `weeks` weeks after the last requested one, so that quick clicks add up.
     */
    moveWeek(weeks: number) {
      const week = dayjs(requestedWeek ?? this.week).add(weeks, 'week');
      return this.showWeek(formatDayjs(week));
    },
    /**
     * Request events of all subscribable timetables for this and next week
     */
    async loadAgendaEvents() {
      const request = ++agendaCounter;
      const week = dayjs(defaultWeek());
      const weeks = [week.isoWeek(), week.add(1, 'week').isoWeek()].join(',');
      const perTimetable = await Promise.allSettled(
        this.subscribableTimetables.map(async (timetable, i) => {
          const events = await loadEvents(timetable, weeks);
          return events.map((event) => ({
            ...toCalendarEvent(event, timetable),
            color: planColor(i),
            plan: timetablePlan(timetable),
          }));
        }),
      );
      // e.g. a timetable was removed before the response arrived
      if (request !== agendaCounter) return;
      // a failing plan must not hide the events of the others
      this.agendaEvents = perTimetable.flatMap((result) => {
        if (result.status === 'fulfilled') return result.value;
        console.error(
          'Error during API call for agenda events',
          result.reason instanceof Error ? result.reason.message : undefined,
        );
        return [];
      });
    },
    /**
     * Import timetable from route and set as current timetable.
     */
    importSchedule({
      params,
      query,
    }: {
      params: RouteParams;
      query: LocationQuery;
    }) {
      switch (parseFloat(String(query.v))) {
        case 1: {
          // query parameters are arrays only if they are given multiple times
          const whitelist = strings(query.course);
          const id = strings(query.id);
          const label = String(query.name || '');
          const customTimetable = { id, label, whitelist };

          this.addCustomSchedule(customTimetable);
          this.schedule = customTimetable;
          break;
        }
        default: {
          if (query.v !== undefined) {
            console.log('unsupported custom timetable query version', query);
          }

          // standard, no filters
          this.schedule = SCHEDULES.find(
            (timetable) => timetable.id === params.timetable,
          );
        }
      }
    },
  },
});
