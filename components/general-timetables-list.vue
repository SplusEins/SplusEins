<template lang="html">

  <v-list>

    <v-subheader>
      Alle Pläne
    </v-subheader>

    <v-list-group
      v-for="(semesters, path) in schedulesTree"
      :key="path"
      no-action>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-list-tile-title>{{ path }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <template
        v-for="(schedules, semester) in semesters">
        <v-list-group
          v-if="schedules.length > 1"
          :key="path + semester"
          no-action
          sub-group>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title v-if="semester == 'WPF'">Wahlpflichtfächer</v-list-tile-title>
              <v-list-tile-title v-else>{{ semester }}. Semester</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentSemester == semester && currentSchedulePath == path">
              <v-icon color="primary">check</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile
            v-for="schedule in schedules"
            :key="schedule.id"
            @click="setCurrentSchedule(schedule)">
            <v-list-tile-content value="true">
              <v-list-tile-title value="true">{{ schedule.label }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentSchedule == schedule">
              <v-icon color="primary">check</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-else
          :key="semester"
          @click="setCurrentSchedule(schedules[0])">
          <v-list-tile-content>
            <v-list-tile-title v-if="semester == 'WPF'">Wahlpflichtfächer</v-list-tile-title>
            <v-list-tile-title v-else>{{ semester }}. Semester</v-list-tile-title>
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
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'GeneralTimetablesList',
  computed: {
    currentSemester() {
      return !!this.currentSchedule ? this.currentSchedule.semester : '';
    },
    currentSchedulePath() {
      return !!this.currentSchedule ? this.currentSchedule.path : '';
    },
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
      schedules: (state) => state.splus.schedules,
    }),
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
    }),
  },
  methods: {
    ...mapMutations({
      setCurrentSchedule: 'splus/setSchedule',
    })
  },
};
</script>
