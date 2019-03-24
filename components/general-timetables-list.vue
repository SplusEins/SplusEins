<template>
  <v-list subheader>
    <v-subheader>
      Alle Pläne
    </v-subheader>

    <v-list-group
      v-for="(semesters, path) in schedulesTree"
      :key="path"
      no-action
    >
      <v-list-tile slot="activator">
        {{ path }}
      </v-list-tile>

      <lazy-hydrate
        v-for="(schedules, semester) in semesters"
        :key="path + semester"
        when-visible
      >
        <v-list-group
          v-if="schedules.length > 1"
          no-action
          sub-group
        >
          <v-list-tile slot="activator">
            {{ semester == 'WPF' ? 'Wahlpflichtfächer' : '' }}
            {{ semester == 'OTHER' ? 'Sonstiges' : '' }}
            {{ !['WPF', 'OTHER'].includes(semester) ? semester + '. Semester' : ''}}
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
          v-else
          :key="semester"
          :to="schedules[0].route"
          nuxt
          @click="$track('Calendar', 'sideMenu plan used', 'normal')"
        >
          {{ semester == 'WPF' ? 'Wahlpflichtfächer' : semester + '. Semester' }}
        </v-list-tile>
      </lazy-hydrate>
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
};
</script>
