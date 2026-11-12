import { defineStore } from 'pinia';

import dayjs from '../lib/dayjs';
import { apiGet, errorCode } from '../lib/api';
import TIMETABLES from '../assets/timetables.json';
import { useAppStore } from './app';
import {
  SEMESTER_WEEK_1,
  shortenTimetableDegree,
  timetableDisplayName,
  truncateText,
  uniq,
  customTimetableToRoute,
  scalarArraysEqual,
} from '../lib/util';

const COURSE_COLORS = [
  '#1F5FBF',
  '#0F7A6C',
  '#7A4FC2',
  '#B04A16',
  '#2E7D32',
  '#B0306A',
  '#5B6B10',
  '#0E6E8C',
];

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
  const isCustomTimetable = Array.isArray(timetable.id);

  let data;
  if (isCustomTimetable) {
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

/**
 * Transform v2 events to v1 lectures.
 */
export function eventsAsLectures(events) {
  return events.map((event) => {
    const startMoment = dayjs(event.start);
    return {
      title: event.title,
      day: startMoment.isoWeekday(),
      begin: startMoment.hour() + startMoment.minute() / 60,
      info: event.meta.description,
      room: event.location,
      lecturer: event.meta.organiserName,
      titleId: event.id,
      organiserShortname: event.meta.organiserShortname,
      start: event.start,
      duration: event.duration,
    };
  });
}

function isCustomTimetable(timetable) {
  return !!timetable && !!timetable.whitelist;
}

/* all timetables of the Ostfalia, they do not change while the app runs */
const SCHEDULES = TIMETABLES.map((timetable) => ({
  ...timetable,
  path: `${timetable.faculty} ${timetable.degree}`,
  route: {
    name: 'plan-timetable',
    params: { timetable: timetable.id },
  },
  description: `${shortenTimetableDegree(timetable)} ${timetable.label} - ${timetable.semester}. Sem.`,
}));

/* counts the requests of load(), so that only the response of the last one is used */
let loadCounter = 0;

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
    week: undefined,
    /**
     * Events of subscribedTimetable for the default week, for stats-card
     */
    upcomingEvents: [],
    /**
     * Events of all favorite and custom timetables for this and next week
     */
    agendaEvents: [],
  }),
  getters: {
    weekOrDefault: (state) => {
      return state.week || defaultWeek();
    },
    getHasEventsOnWeekend: (state) => {
      return (
        state.events
          .map(({ start }) => dayjs(start).isoWeekday())
          .filter((day) => day > 5).length > 0 // 1: Monday, 5: Friday
      );
    },
    /**
     * @return The events as timestamp-aware dayspan calendar event inputs.
     * @see https://clickermonkey.github.io/dayspan/docs/interfaces/eventinput.html
     */
    getCalendarEvents: (state) => {
      // keyed by title, organiser shortnames are empty in the current data
      const uniqueIds = uniq(state.events.map((event) => event.title).sort());

      const eventsByStart = new Map();
      state.events.forEach((event) =>
        eventsByStart.set(event.start, [
          ...(eventsByStart.get(event.start) || []),
          event,
        ]),
      );

      return state.events.map((event) => {
        const color =
          COURSE_COLORS[uniqueIds.indexOf(event.title) % COURSE_COLORS.length];
        const description = event.meta.organiserName
          ? `Dozent: ${event.meta.organiserName}<br>${event.meta.description}`
          : `${event.meta.description}`;

        const startMoment = dayjs(event.start);
        return {
          name: event.title,
          start: startMoment.format('YYYY-MM-DD HH:mm'),
          end: startMoment
            .add(event.duration, 'hours')
            .format('YYYY-MM-DD HH:mm'),
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
    customTimetablesAsRoutes: (state) => {
      return Object.values(state.customSchedules).map(customTimetableToRoute);
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
    hasSubscribableTimetables() {
      return this.subscribableTimetables.length > 0;
    },
  },
  actions: {
    decrementWeek() {
      this.week = formatDayjs(dayjs(this.week).subtract(1, 'week'));
    },
    incrementWeek() {
      this.week = formatDayjs(dayjs(this.week).add(1, 'week'));
    },
    resetWeek(forceDefault) {
      if (forceDefault) {
        this.week = defaultWeek();
      } else {
        this.week = this.week || defaultWeek();
      }
    },
    addCustomSchedule(customTimetable) {
      const label = customTimetable.label;
      const customTimetableStored = this.customSchedules[label];

      // detect conflicts - never overwrite
      if (customTimetableStored !== undefined) {
        const coursesGiven = customTimetable.whitelist;
        const coursesStored = customTimetableStored.whitelist;

        if (
          customTimetable.id !== customTimetableStored.id ||
          !scalarArraysEqual(coursesGiven, coursesStored)
        ) {
          console.log(
            'not overwriting local custom timetable ' +
              'with different configuration',
          );
        }

        return;
      }

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
    setSubscribedTimetable(timetable) {
      this.subscribedTimetable = timetable;
    },

    /**
     * Request the events of the current timetable for the current week.
     */
    async load() {
      const request = ++loadCounter;
      try {
        const events = await loadEvents(
          this.schedule,
          dayjs(this.week).isoWeek(),
        );
        // e.g. the user switched to the next week before the response arrived
        if (request !== loadCounter) return;
        this.events = events;
      } catch (error) {
        if (request !== loadCounter) return;
        useAppStore().enqueueError(
          error.status === 404
            ? 'Dieser Plan existiert nicht (mehr).'
            : `Stundenplan konnte nicht geladen werden (${errorCode(error)}).`,
        );
        console.error('error during API call', error.message);
      }
    },
    /**
     * Request lectures of subscribedTimetable for defaultWeek
     */
    async loadUpcomingEvents() {
      if (!this.subscribedTimetable.id) return;
      try {
        this.upcomingEvents = await loadEvents(
          this.subscribedTimetable,
          dayjs(defaultWeek()).isoWeek(),
        );
      } catch (error) {
        // don't show the error because this error is not critical on the start page and looks bad
        console.error(
          'Error during API call for upcoming events on index page',
          error.message,
        );
      }
    },
    /**
     * Request events of all subscribable timetables for this and next week
     */
    async loadAgendaEvents() {
      const week = dayjs(defaultWeek());
      const weeks = [week.isoWeek(), week.add(1, 'week').isoWeek()].join(',');
      try {
        const perTimetable = await Promise.all(
          this.subscribableTimetables.map(async (timetable) => {
            const events = await loadEvents(timetable, weeks);
            const plan = isCustomTimetable(timetable)
              ? {
                  name: timetable.label,
                  route: customTimetableToRoute(timetable),
                }
              : {
                  name: timetableDisplayName(timetable),
                  route: {
                    name: 'plan-timetable',
                    params: { timetable: timetable.id },
                  },
                };
            return events.map((event) => ({ ...event, plan }));
          }),
        );
        this.agendaEvents = perTimetable.flat();
      } catch (error) {
        console.error('Error during API call for agenda events', error.message);
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
