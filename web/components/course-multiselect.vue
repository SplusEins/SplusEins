<template>
  <div>
    <v-alert
      :value="overlappingCourses.length > 0"
      type="warning"
    >
      Kurse überschneiden sich: {{ overlappingCourses.join(', ') }}
    </v-alert>
    <v-data-table
      v-model="selectedCourses"
      :headers="$vuetify.breakpoint.mobile ? headers_mobile : headers"
      :items="courses"
      hide-default-footer
      item-key="titleId"
      show-select
      mobile-breakpoint="0"
      no-data-text="Keine Kurse geladen."
      disable-pagination
      disable-filtering
      sort-by="title"
      must-sort
    >
      <template #item.room="{ item }">
        <span v-html="item.room" />
      </template>
      <template #item.data-table-select="{item, isSelected, select}">
        <v-simple-checkbox
          :value="isSelected"
          @input="select"
          :disabled="!isSelected && selectedCourses.length > maxCourses"
          :color="overlappingCourses.includes(item.title) ? 'warning' : undefined"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>

export default {
  name: 'CourseMultiselect',
  props: {
    maxCourses: {
      type: Number,
      default: () => Infinity
    },
    lectures: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      headers: [
        { value: 'title', text: 'Vorlesung' },
        { value: 'lecturer', text: 'Dozent' },
        { value: 'room', text: 'Raum' }
      ],
      headers_mobile: [
        { value: 'title', text: 'Vorlesung' }
      ]
    };
  },
  computed: {
    courses () {
      const lecturesById = new Map();
      this.lectures.forEach((lecture) => lecturesById.set(lecture.titleId, lecture));
      return [...lecturesById.values()];
    },
    selectedCourses: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    },
    overlappingCourses () {
      // get all lectures which have their title selected
      let selectedLectures = this.lectures.filter(
        (lecture) => this.selectedCourses.some(
          (course) => course.titleId === lecture.titleId));

      // filter duplicates
      const key = (lecture) =>
        `${lecture.organiserShortname} ${lecture.titleId} ${lecture.room} ` +
        `${lecture.start} ${lecture.duration}`;
      const lecturesByKey = new Map();
      selectedLectures.forEach((lecture) => lecturesByKey.set(key(lecture), lecture));
      selectedLectures = [...lecturesByKey.values()];

      // group all lectures by day because only they can conflict
      const lecturesByDay = new Map();
      selectedLectures.forEach((lecture) => {
        const key = `${this.$dayjs(lecture.start).week()} ${lecture.day}`;
        const list = lecturesByDay.get(key) || [];
        list.push(lecture);
        lecturesByDay.set(key, list);
      });

      // given two lectures, return true if they overlap
      const overlapsWith = ({
        begin: thisBegin,
        duration: thisDuration
      }) => ({
        begin: otherBegin,
        duration: otherDuration
      }) => (thisBegin >= otherBegin && thisBegin <= otherBegin + otherDuration) ||
           (thisBegin + thisDuration >= otherBegin && thisBegin + thisDuration <= otherBegin + otherDuration);

      const withoutAt = (list, at) => list.filter((el, index) => index != at);

      // find conflicts
      const overlapLectures = [].concat(...[...lecturesByDay.values()].map(
        // for every day…
        (lectures) => lectures.filter(
          // …get those two lectures…
          (oneLecture, index, self) =>
          // …where there is an overlap
            withoutAt(self, index).some(overlapsWith(oneLecture)))
      )
      );

      // get the titles of the overlaps
      const overlapTitles = new Map();
      overlapLectures.forEach(
        (lecture) => overlapTitles.set(lecture.titleId, lecture.title));

      return [...overlapTitles.values()]
    }
  },
  methods: {
    getShortMetadata (data) {
      if (data.organiserShortname && data.room) {
        return `(${data.organiserShortname}, ${data.room})`
      } else if (data.organiserShortname) {
        return `(${data.organiserShortname})`;
      } else if (data.room) {
        return `(${data.room})`;
      } else {
        return '';
      }
    }
  }
};
</script>
