<template>
  <v-list v-model:opened="opened">
    <v-list-group
      v-for="(semesters, path) in schedulesTree"
      :key="path"
      :value="path"
    >
      <template #activator="{ props }">
        <v-list-item v-bind="props" :title="path" />
      </template>

      <!-- there are many timetables, so only render those of opened groups -->
      <template v-if="opened.includes(path)">
        <template v-for="(schedules, semester) in semesters">
          <v-list-group
            v-if="semesterLabel(schedules[0].semester)"
            :key="path + semester"
            :value="path + semester"
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props" :title="semester + '. Semester'" />
            </template>

            <timetable-list-item
              v-for="schedule in schedules"
              :key="schedule.id"
              :timetable="schedule"
            />
          </v-list-group>

          <template v-else>
            <timetable-list-item
              v-for="schedule in schedules"
              :key="schedule.id"
              :timetable="schedule"
            />
          </template>
        </template>
      </template>
    </v-list-group>
  </v-list>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';
import { semesterLabel } from '../lib/util';
import TimetableListItem from './timetable-list-item.vue';

const { getTimetablesAsTree: schedulesTree } = storeToRefs(useSplusStore());

/* names of the opened groups */
const opened = ref([]);
</script>
