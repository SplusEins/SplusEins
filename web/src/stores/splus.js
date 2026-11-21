import { defineStore } from 'pinia';

import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import TIMETABLES from '../assets/timetables.json';
import { useAppStore } from './app';
import { SEMESTER_WEEK_1, uniq } from '../lib/util';
import {
  parseSources,
  planDisplayName,
  planKey,
  planRoute,
  sourcesToString,
  withCourse,
} from '../lib/plans';

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
export function planColor(index) {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

function toCalendarEvent(event) {
  return {
    id: event.id,
    name: event.title,
    start: dayjs(event.start).format('YYYY-MM-DD HH:mm'),
    end: dayjs(event.end).format('YYYY-MM-DD HH:mm'),
    location: event.location,
    lecturer: event.meta.organiserName,
    info: event.meta.description,
    sources: event.sources,
    color: COURSE_COLORS[event.colorIndex % COURSE_COLORS.length],
  };
}

const formatDayjs = (date) => {
  return date.format('YYYY-MM-DD');
};

function defaultWeek() {
  if (
    dayjs().isoWeek() < SEMESTER_WEEK_1 &&
    SEMESTER_WEEK_1 - dayjs().isoWeek() < 10
  ) {
    // Use semester beginning instead of today if semester hasn't started yet
    // Do that only a few weeks before the semester so we avoid bugs with year wraparounds
    return formatDayjs(dayjs().isoWeek(SEMESTER_WEEK_1).startOf('isoweek'));
  }

  // if the user is looking at today and is on Sat/Sun, peek to the next week
  if (dayjs().isoWeekday() === 6 || dayjs().isoWeekday() === 7) {
    return formatDayjs(dayjs().startOf('isoweek').add(1, 'week'));
  } else {
    return formatDayjs(dayjs().startOf('isoweek'));
  }
}

/**
 * Return all events of the plan in the given weeks.
 */
export async function loadEvents(plan, weeks) {
  return await apiGet(`/api/splus/${sourcesToString(plan.sources)}/${weeks}`);
}

/**
 * Return all unique lectures for the given timetable.
 */
export async function loadUniqueLectures(timetable) {
  return await apiGet(`/api/splus/${timetable.id}/lectures`);
}

/* all timetables of the Ostfalia, they do not change while the app runs */
const SCHEDULES = TIMETABLES;
const SCHEDULES_BY_ID = new Map(
  SCHEDULES.map((schedule) => [schedule.id, schedule]),
);
// every timetable id ends with its semester, e.g. '_ws26'
const semesterOf = (id) => /_[^_]+$/.exec(id)?.[0];
const CURRENT_SEMESTERS = new Set(SCHEDULES.map(({ id }) => semesterOf(id)));

// e.g. " informatik se 3", so " se" matches the start of a word
const searchText = (text) =>
  ` ${String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')}`;

/* count the requests, so that only the response of the last one is used */
let loadCounter = 0;
let agendaCounter = 0;
/* week of the last showWeek() call, which may still be loading */
let requestedWeek;

export const useSplusStore = defineStore('splus', {
  state: () => ({
    /**
     * Plan of the page, described by its URL: { name?, sources }
     */
    schedule: undefined,
    /**
     * Saved plans, see lib/plans.js. Only ids are saved, so that labels
     * stay current and timetables of past semesters can be dropped.
     */
    plans: [],
    /**
     * Events
     */
    events: [],
    /**
     * Currently viewed week as a date string. The date string specifies the first day of that week.
     */
    week: defaultWeek(),
    /**
     * Events of all saved plans for this and next week
     */
    agendaEvents: [],
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
      return state.events.map(toCalendarEvent);
    },
    /**
     * Group the timetables: { 'faculty degree': { semester: timetables } }
     */
    getTimetablesAsTree: () => {
      const tree = {};
      SCHEDULES.forEach((timetable) => {
        const path = `${timetable.faculty} ${timetable.degree}`;
        tree[path] ??= {};
        tree[path][timetable.semester] ??= [];
        tree[path][timetable.semester].push(timetable);
      });
      return tree;
    },
    /**
     * Timetables where every query word starts a word of label, faculty,
     * degree or semester, those matching in the label first.
     */
    searchTimetables: () => (query) => {
      // skip "sem" or "semester" as in "3. Semester", but keep "se" for "SE"
      const queryWords = searchText(query)
        .split(' ')
        .filter(
          (word) => word && !(word.length >= 3 && 'semester'.startsWith(word)),
        );
      if (queryWords.length === 0) return [];
      const matches = (text) => {
        const words = searchText(text);
        return (word) => words.includes(` ${word}`);
      };
      const inLabel = ({ label }) => queryWords.some(matches(label));
      return SCHEDULES.filter(({ label, faculty, degree, semester }) =>
        queryWords.every(matches(`${label} ${faculty} ${degree} ${semester}`)),
      ).sort((a, b) => inLabel(b) - inLabel(a));
    },
    timetableIds: () => {
      return SCHEDULES.map(({ id }) => id);
    },
    getTimetableById: () => (timetableId) => {
      return SCHEDULES_BY_ID.get(timetableId);
    },
    // pass maxLength to truncate for space-constrained UI
    scheduleDisplayName:
      (state) =>
      (maxLength = Infinity) =>
        state.schedule ? planDisplayName(state.schedule, maxLength) : '',
    /* the saved plan with the key of the open one */
    savedSchedule: (state) =>
      state.schedule &&
      state.plans.find((plan) => planKey(plan) === planKey(state.schedule)),
    /**
     * 'changed' if the open plan differs from the saved one with its key,
     * 'unsaved' if it has a name or selected courses and is not saved
     */
    unsavedState() {
      if (!this.schedule) return undefined;
      const { name, sources } = this.schedule;
      if (!this.savedSchedule) {
        const selected =
          sources.length === 1 && (sources[0].except || sources[0].only);
        return name || selected ? 'unsaved' : undefined;
      }
      return sourcesToString(this.savedSchedule.sources) ===
        sourcesToString(sources)
        ? undefined
        : 'changed';
    },
    /* the saved plan of the timetable, or the timetable with all courses */
    timetablePlan: (state) => (id) =>
      state.plans.find((plan) => planKey(plan) === id) ?? {
        sources: [{ id }],
      },
    /* faculties of the saved plans */
    savedFaculties: (state) => {
      const ids = state.plans.flatMap(({ sources }) =>
        sources.map(({ id }) => id),
      );
      return uniq(ids.map((id) => SCHEDULES_BY_ID.get(id)?.faculty)).filter(
        Boolean,
      );
    },
    /* whether the timetable is saved as a plan without name */
    isRemembered: (state) => (id) =>
      state.plans.some((plan) => !plan.name && plan.sources[0].id === id),
    hasPlans: (state) => state.plans.length > 0,
  },
  actions: {
    /**
     * Save the plan in place of the one with oldKey, or of the one with the
     * same key.
     */
    savePlan(oldKey, plan) {
      const keys = [oldKey, planKey(plan)];
      const index = this.plans.findIndex((p) => keys.includes(planKey(p)));
      this.plans = this.plans.filter((p) => !keys.includes(planKey(p)));
      this.plans.splice(index < 0 ? this.plans.length : index, 0, plan);
    },
    deletePlan(key) {
      this.plans = this.plans.filter((plan) => planKey(plan) !== key);
    },
    /* remember the timetable, or forget it */
    toggleRemembered(source) {
      if (this.isRemembered(source.id)) {
        this.deletePlan(source.id);
      } else {
        this.savePlan(undefined, { sources: [source] });
      }
    },
    addCourse(key, sourceId, courseId) {
      const plan = this.plans.find((p) => planKey(p) === key);
      this.savePlan(key, withCourse(plan, sourceId, courseId));
    },
    /**
     * Forget timetables of past semesters and broken plans. Unknown
     * timetables of the current semester are kept, as they may come back
     * with the next update of timetables.json.
     */
    forgetPastSemesters() {
      const keep = (source) =>
        SCHEDULES_BY_ID.has(source?.id) ||
        CURRENT_SEMESTERS.has(semesterOf(source?.id));
      this.plans = this.plans
        .filter((plan) => Array.isArray(plan?.sources))
        .map((plan) => ({ ...plan, sources: plan.sources.filter(keep) }))
        .filter((plan) => plan.sources.length > 0);
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
        const events = await loadEvents(this.schedule, dayjs(week).isoWeek());
        // e.g. the user switched to the next week before the response arrived
        if (request !== loadCounter) return;
        this.events = events;
      } catch (error) {
        if (request !== loadCounter) return;
        this.events = [];
        if (error.status === 404) {
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
    moveWeek(weeks) {
      const week = dayjs(requestedWeek ?? this.week).add(weeks, 'week');
      return this.showWeek(formatDayjs(week));
    },
    /**
     * Request events of all saved plans for this and next week
     */
    async loadAgendaEvents() {
      const request = ++agendaCounter;
      const week = dayjs(defaultWeek());
      const weeks = [week.isoWeek(), week.add(1, 'week').isoWeek()].join(',');
      const perTimetable = await Promise.allSettled(
        this.plans.map(async (plan, i) => {
          const events = await loadEvents(plan, weeks);
          return events.map((event) => ({
            ...toCalendarEvent(event),
            color: planColor(i),
            plan: { name: planDisplayName(plan), route: planRoute(plan) },
          }));
        }),
      );
      // e.g. a plan was removed before the response arrived
      if (request !== agendaCounter) return;
      // a failing plan must not hide the events of the others
      this.agendaEvents = perTimetable.flatMap((result) => {
        if (result.status === 'fulfilled') return result.value;
        console.error(
          'Error during API call for agenda events',
          result.reason?.message,
        );
        return [];
      });
    },
    /**
     * Open the plan of the route, e.g. /plan/se3,wpf:a.b?name=Mein%20Plan
     */
    openPlan({ params, query }) {
      const sources = parseSources(params.sources).filter(({ id }) =>
        SCHEDULES_BY_ID.has(id),
      );
      if (sources.length === 0) {
        this.schedule = undefined;
        return;
      }
      this.schedule = query.name ? { name: query.name, sources } : { sources };
    },
  },
});
