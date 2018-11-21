<template lang="html">

  <v-list subheader>

    <v-subheader>
      Alle Pläne
    </v-subheader>

    <v-list-group
      v-for="(semesters, path) in timetablesTree"
      :key="path"
      no-action>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-list-tile-title>{{ path }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <template
        v-for="(timetables, semester) in semesters">
        <v-list-group
          v-if="timetables.length > 1"
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
            v-for="timetable in timetables"
            :to="timetableToRoute(timetable)"
            :key="timetable.id"
            nuxt>
            <v-list-tile-content value="true">
              <v-list-tile-title value="true">{{ timetable.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-else
          :to="timetableToRoute(timetables[0])"
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
      timetablesTree: 'splus/getTimetablesAsTree',
    }),
  },
  methods: {
    timetableToRoute(timetable) {
      return {
        name: 'timetable',
        params: { timetable: timetable.id },
      };
    },
  }
};
</script>
