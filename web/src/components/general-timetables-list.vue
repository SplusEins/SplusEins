<template>
  <v-list v-model:opened="opened">
    <v-list-subheader> Alle Pläne </v-list-subheader>

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
            v-if="!isNaN(Number(semester))"
            :key="path + semester"
            :value="path + semester"
            subgroup
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props" :title="semester + '. Semester'" />
            </template>

            <v-list-item
              v-for="schedule in schedules"
              :key="schedule.id"
              :to="schedule.route"
              :title="schedule.label"
            />
          </v-list-group>

          <template v-else>
            <v-list-item
              v-for="schedule in schedules"
              :key="schedule.id"
              :to="schedule.route"
              :title="schedule.label"
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

const { getTimetablesAsTree: schedulesTree } = storeToRefs(useSplusStore());

/* names of the opened groups */
const opened = ref([]);
</script>
