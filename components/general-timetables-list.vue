<template lang="html">

  <v-list>

    <v-subheader>
      Alle Pläne
    </v-subheader>

    <v-list-group
      v-for="(semesters, level1Title) in schedulesTree"
      :key="level1Title"
      no-action>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-list-tile-title>{{ level1Title }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <template 
        v-for="(schedules, semester) in semesters">
        <v-list-group
          v-if="schedules.length > 1"
          :key="level1Title + semester"
          no-action
          sub-group>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentSchedule.semester == semester && currentScheduleLevel1Title == level1Title">
              <v-icon>check</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile
            v-for="schedule in schedules"
            :key="schedule.id"
            @click="currentSchedule = schedule">
            <v-list-tile-content value="true">
              <v-list-tile-title value="true">{{ schedule.label }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentSchedule == schedule">
              <v-icon>check</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-else
          :key="semester"
          @click="currentSchedule = schedules[0]">
          <v-list-tile-content>
            <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action v-if="currentSchedule == schedules[0]">
            <v-icon>check</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </template>

    </v-list-group>

  </v-list>

</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';

export default {
  name: 'GeneralTimetablesList',
  computed: {
    currentSchedule: {
      get() {
        return this.$store.state.schedule.schedule;
      },
      set(value) {
        this.$store.commit('schedule/setSchedule', value);
      }
    },
    currentScheduleLevel1Title() {
      return this.scheduleToFacultyAndDegree(this.currentSchedule);
    },
    schedulesTree() {
      const tree = {};
      /*
       * convert star schema: { faculty, degree, semester, ...schedule }
       * into hierarchy: { (faculty, degree): { semester: schedules } }
       */
      this.schedules.forEach((schedule) => {
        const level1Title = this.scheduleToFacultyAndDegree(schedule);
        if (tree[level1Title] == undefined) {
          tree[level1Title] = {};
        }

        const leaf1 = tree[level1Title];
        if (leaf1[schedule.semester] == undefined) {
          leaf1[schedule.semester] = [];
        }

        const leaf2 = leaf1[schedule.semester];
        leaf2.push(schedule);
      });

      return tree;
    },
    ...mapState({
      schedules: state => state.splus.schedules,
    }),
  },
  mounted() {
    this.currentCourse = this.courses[0];
  },
  methods: {
    scheduleToFacultyAndDegree(schedule) {
      return `${schedule.faculty} - ${schedule.degree}`;
    },
    ...mapMutations({
      setWeek: 'calendar/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
}
</script>

<style scoped lang="scss">
  .all-timetables-component {

  }
</style>
