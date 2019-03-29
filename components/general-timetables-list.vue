<template>
  <v-list subheader>
    <v-subheader>
      Alle Pläne
    </v-subheader>

    <v-list-group
      v-for="(semesters, path) in schedulesTree"
      :key="path"
      no-action
      @mouseover.native="$set(load, path, true)"
    >
      <v-list-tile slot="activator">
        {{ path }}
      </v-list-tile>

      <template v-for="(schedules, semester) in semesters">
        <v-list-group
          v-if="load[path] && schedules.length > 1"
          :key="path + semester"
          no-action
          sub-group
        >
          <v-list-tile slot="activator">
            {{ semester == 'WPF' ? 'Wahlpflichtfächer' : '' }}
            {{ semester == 'OTHER' ? 'Sonstiges' : '' }}
            {{ !['WPF', 'OTHER'].includes(semester) ? semester + '. Semester' : '' }}
          </v-list-tile>

          <v-list-tile
            v-for="schedule in schedules"
            :key="schedule.id"
            :to="schedule.route"
            nuxt
            @click="$track('Calendar', 'sideMenu plan used', 'normal')"
          >
            {{ schedule.label }}
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-if="load[path] && schedules.length == 1"
          :key="path + semester"
          :to="schedules[0].route"
          nuxt
          @click="$track('Calendar', 'sideMenu plan used', 'normal')"
        >
          {{ semester == 'WPF' ? 'Wahlpflichtfächer' : semester + '. Semester' }}
        </v-list-tile>
      </template>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'GeneralTimetablesList',
  data() {
    return {
      load: {},
    };
  },
  computed: {
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
    }),
  },
};
</script>
