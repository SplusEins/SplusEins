import { defineStore } from 'pinia';

import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import TIMETABLES from '../assets/timetables.json';
import { useAppStore } from './app';
import {
  SEMESTER_WEEK_1,
  semesterLabel,
  shortenTimetableDegree,
  timetableDisplayName,
  truncateText,
  uniq,
} from '../lib/util';

// all keep white text at WCAG AA, the most distinct ones come first
const COURSE_COLORS = [
  '#1F5FBF',
  '#0F7A6C',
  '#7A4FC2',
  '#B04A16',
  '#2E7D32',
  '#B0306A',
  '#5B6B10',
  '#0E6E8C',
  '#C62828',
  '#0D3B66',
  '#8A5F18',
  '#4F5B66',
  '#95419A',
  '#1A533E',
  '#82064C',
  '#443198',
  '#6F4928',
  '#6A1B9A',
  '#3D4A0F',
  '#5D395A',
];

function isCustomTimetable(timetable) {
  return !!timetable && !!timetable.whitelist;
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
 * Return all events for the given timetable and week.
 */
export async function loadEvents(timetable, weeks) {
  let data;
  if (isCustomTimetable(timetable)) {
    const ids = timetable.id.join(',');
    const whitelist = timetable.whitelist.join(',');
    data = await apiGet(
      `/api/splus/${ids}/${weeks}/${whitelist}/${encodeURIComponent(timetable.label)}`,
    );
  } else {
    data = await apiGet(`/api/splus/${timetable.id}/${weeks}`);
  }

  return data.events;
}

/**
 * Return all unique lectures for the given timetable.
 */
export async function loadUniqueLectures(timetable) {
  return await apiGet(`/api/splus/${timetable.id}/lectures`);
}

/* all timetables of the Ostfalia, they do not change while the app runs */
const SCHEDULES = TIMETABLES.map((timetable) => ({
  ...timetable,
  path: `${timetable.faculty} ${timetable.degree}`,
  route: {
    name: 'plan-timetable',
    params: { timetable: timetable.id },
  },
  description:
    `${shortenTimetableDegree(timetable)} ${timetable.label}` +
    (semesterLabel(timetable.semester)
      ? ` - ${semesterLabel(timetable.semester)}`
      : ''),
}));

/* count the requests, so that only the response of the last one is used */
let loadCounter = 0;
let upcomingCounter = 0;
/* week of the last showWeek() call, which may still be loading */
let requestedWeek;

export const useSplusStore = defineStore('splus', {
  state: () => ({
    /**
     * Current timetable, either one of TIMETABLES or customTimetable.
     */
    schedule: undefined,
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
    customSchedules: {},
    favoriteSchedules: [],
    subscribedTimetable: {},
    /**
     * Events
     */
    events: [],
    /**
     * Currently viewed week as a date string. The date string specifies the first day of that week.
     */
    week: defaultWeek(),
    /**
     * Events of subscribedTimetable in defaultWeek, for upcoming-lectures-card
     */
    upcomingEvents: [],
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
      // keyed by title, organiser shortnames are empty in the current data
      const uniqueIds = uniq(state.events.map((event) => event.title).sort());

      return state.events.map((event) => {
        const color =
          COURSE_COLORS[uniqueIds.indexOf(event.title) % COURSE_COLORS.length];
        const description = event.meta.organiserName
          ? `Dozent: ${event.meta.organiserName}<br>${event.meta.description}`
          : `${event.meta.description}`;

        return {
          name: event.title,
          start: dayjs(event.start).format('YYYY-MM-DD HH:mm'),
          end: dayjs(event.end).format('YYYY-MM-DD HH:mm'),
          desc: description,
          location: event.location,
          color,
        };
      });
    },
    /**
     * Convert the state's star schema: { faculty, degree, semester, ...timetable }
     * into a hierarchy: { (faculty, degree): { semester: timetables } }
     */
    getTimetablesAsTree: () => {
      const tree = {};
      SCHEDULES.forEach((timetable) => {
        tree[timetable.path] ??= {};
        tree[timetable.path][timetable.semester] ??= [];
        tree[timetable.path][timetable.semester].push(timetable);
      });
      return tree;
    },
    timetableIds: () => {
      return SCHEDULES.map(({ id }) => id);
    },
    getTimetableById: () => (timetableId) => {
      return SCHEDULES.find(({ id }) => id === timetableId);
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
    subscribableTimetables: (state) => {
      return [
        ...Object.values(state.customSchedules),
        ...state.favoriteSchedules,
      ];
    },
    /**
     * Faculty of the subscribed timetable, of the first one for a custom timetable
     */
    subscribedFaculty() {
      const [id] = [].concat(this.subscribedTimetable.id ?? []);
      return this.getTimetableById(id)?.faculty;
    },
    hasSubscribableTimetables() {
      return this.subscribableTimetables.length > 0;
    },
  },
  actions: {
    addCustomSchedule(customTimetable) {
      const label = customTimetable.label;
      // never overwrite a stored timetable with the same name
      if (label in this.customSchedules) return;

      this.customSchedules[label] = customTimetable;
      if (Object.keys(this.subscribedTimetable).length === 0) {
        this.subscribedTimetable = this.customSchedules[label];
      }
    },
    deleteCustomSchedule(customTimetable) {
      delete this.customSchedules[customTimetable.label];
      if (this.subscribedTimetable.label === customTimetable.label) {
        this.subscribeFirstTimetable();
      }
    },
    /**
     * Store an edited custom timetable, which stays subscribed if it was before.
     */
    replaceCustomSchedule(oldTimetable, newTimetable) {
      const wasSubscribed =
        isCustomTimetable(this.subscribedTimetable) &&
        this.subscribedTimetable.label === oldTimetable.label;
      delete this.customSchedules[oldTimetable.label];
      this.customSchedules[newTimetable.label] = newTimetable;
      if (wasSubscribed) this.subscribedTimetable = newTimetable;
    },
    addFavoriteSchedule(favoriteTimetable) {
      if (
        !this.favoriteSchedules.some(
          (favorite) => favorite.id === favoriteTimetable.id,
        )
      ) {
        this.favoriteSchedules.push(favoriteTimetable);
        if (Object.keys(this.subscribedTimetable).length === 0) {
          this.subscribedTimetable = favoriteTimetable;
        }
      }
    },
    removeFavoriteSchedule(favoriteTimetable) {
      this.favoriteSchedules = this.favoriteSchedules.filter(
        (timetable) => timetable.id !== favoriteTimetable.id,
      );
      if (this.subscribedTimetable.id === favoriteTimetable.id) {
        this.subscribeFirstTimetable();
      }
    },
    /**
     * Show the first saved timetable on the start page, or none if there is none.
     */
    subscribeFirstTimetable() {
      this.subscribedTimetable = this.subscribableTimetables[0] ?? {};
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
     * Request the events of subscribedTimetable for defaultWeek
     */
    async loadUpcomingEvents() {
      const request = ++upcomingCounter;
      if (!this.subscribedTimetable.id) {
        this.upcomingEvents = [];
        return;
      }
      try {
        const events = await loadEvents(
          this.subscribedTimetable,
          dayjs(defaultWeek()).isoWeek(),
        );
        if (request === upcomingCounter) this.upcomingEvents = events;
      } catch (error) {
        // never show the events of another timetable
        if (request === upcomingCounter) this.upcomingEvents = [];
        // don't show the error because this error is not critical on the start page and looks bad
        console.error(
          'Error during API call for upcoming events on index page',
          error.message,
        );
      }
    },
    /**
     * Import timetable from route and set as current timetable.
     */
    importSchedule({ params, query }) {
      switch (parseFloat(query.v)) {
        case 1: {
          // query parameters are arrays only if they are given multiple times
          const whitelist = [].concat(query.course || []);
          const id = [].concat(query.id || []);
          const label = query.name || '';
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
