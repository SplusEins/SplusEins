<template lang="html">

  <v-list subheader>

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
          </v-list-tile>

          <v-list-tile
            v-for="schedule in schedules"
            :to="scheduleToRoute(schedule)"
            :key="schedule.id"
            nuxt>
            <v-list-tile-content value="true">
              <v-list-tile-title value="true">{{ schedule.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-else
          :to="scheduleToRoute(schedules[0])"
          :key="semester"
          nuxt>
          <v-list-tile-content>
            <v-list-tile-title v-if="semester == 'WPF'">Wahlpflichtfächer</v-list-tile-title>
            <v-list-tile-title v-else>{{ semester }}. Semester</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

    </v-list-group>

  </v-list>

</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'GeneralTimetablesList',
  computed: {
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
    }),
  },
  methods: {
    scheduleToRoute(schedule) {
      return {
        name: 'schedule',
        params: { schedule: schedule.id },
      };
    },
  }
};
</script>
