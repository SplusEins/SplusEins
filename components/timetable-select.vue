<template>
  <v-layout
    row
    wrap>
    <v-flex
      md5
      xs9>
      <v-select
        :items="paths"
        v-model="selectedPath"
        label="Studiengang" />
    </v-flex>
    <v-flex
      md2
      xs3>
      <v-select
        :items="semesters"
        v-model="selectedSemester"
        label="Semester" />
    </v-flex>
    <v-flex
      v-show="!($vuetify.breakpoint.smAndDown && !hasMultipleSchedules)"
      md5>
      <v-select
        :items="schedules"
        v-model="selectedSchedule"
        label="Vertiefung"
        item-text="label"
        return-object />
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TimetableSelect',
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
  },
  data() {
    return {
      selectedPath: '',
      selectedSemester: '',
    };
  },
  computed: {
    selectedSchedule: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    paths() {
      return Object.keys(this.schedulesTree);
    },
    semesters() {
      return this.schedulesTree[this.selectedPath] != undefined ?
        Object.keys(this.schedulesTree[this.selectedPath])
        : [];
    },
    schedules() {
      return this.schedulesTree[this.selectedPath] != undefined ?
        this.schedulesTree[this.selectedPath][this.selectedSemester] || []
        : [];
    },
    hasMultipleSchedules() {
      return this.schedules && this.schedules.length > 1;
    },
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
    }),
  },
  watch: {
    selectedPath() {
      if (this.semesters.length == 1) {
        this.selectedSemester = this.semesters[0];
      } else {
        this.selectedSemester = '';
      }
    },
    selectedSemester() {
      if (this.schedules.length == 1) {
        this.selectedSchedule = this.schedules[0];
      } else {
        this.selectedSchedule = undefined;
      }
    },
  },
};
</script>