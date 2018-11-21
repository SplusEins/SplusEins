<template>
  <v-layout
    row
    wrap>
    <v-flex
      xs12
      md5>
      <v-select
        :items="paths"
        v-model="selectedPath"
        label="Studiengang" />
    </v-flex>
    <v-flex
      xs4
      md2>
      <v-select
        :items="semesters"
        :disabled="selectedPath == undefined"
        v-model="selectedSemester"
        label="Semester" />
    </v-flex>
    <v-flex
      xs6
      md4>
      <v-select
        :items="schedules"
        :disabled="selectedSemester == undefined"
        v-model="selectedSchedule"
        label="Vertiefung"
        item-text="label"
        return-object />
    </v-flex>
    <v-flex
      xs2
      md1>
      <v-btn
        :disabled="loading || selectedSchedule == undefined"
        :loading="loading"
        icon
        flat
        large
        color="secondary"
        @click.native="submit()">
        <v-icon>add</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TimetableSelect',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      selectedSchedule: undefined,
      selectedPath: undefined,
      selectedSemester: undefined,
    };
  },
  computed: {
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
        this.selectedSemester = undefined;
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
  methods: {
    submit() {
      if (this.valid) {
        this.$emit('input', this.selectedSchedule);
      }
    },
  },
};
</script>