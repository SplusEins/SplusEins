<template>
  <v-list subheader>
    <v-subheader> Alle Pläne </v-subheader>

    <v-list-group
      v-for="(semesters, path) in schedulesTree"
      :key="path"
      no-action
      @mouseover.native="$set(load, path, true)"
    >
      <template #activator>
        <v-list-item-title>{{ path }}</v-list-item-title>
      </template>

      <template v-for="(schedules, semester) in semesters">
        <v-list-group
          v-if="load[path] && !isNaN(Number(semester))"
          :key="path + semester"
          no-action
          sub-group
        >
          <template #activator>
            <v-list-item-title>
              {{ semester + '. Semester' }}
            </v-list-item-title>
          </template>

          <v-list-item
            v-for="schedule in schedules"
            :key="schedule.id"
            :to="schedule.route"
            nuxt
          >
            {{ schedule.label }}
          </v-list-item>
        </v-list-group>

        <v-list-item
          v-else
          v-for="schedule in schedules"
          :key="schedule.id"
          :to="schedule.route"
          nuxt
        >
          {{ schedule.label }}
        </v-list-item>
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
      schedulesTree: 'splus/getTimetablesAsTree',
    }),
  },
};
</script>
