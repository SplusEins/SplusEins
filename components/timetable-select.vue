<template>
  <v-layout
    row
    wrap
  >
    <v-flex
      xs12
      md5
    >
      <v-select
        v-model="selectedPath"
        :items="paths"
        label="Studiengang"
      />
    </v-flex>
    <v-flex
      xs4
      md2
    >
      <v-select
        v-model="selectedSemester"
        :items="semesters"
        :disabled="selectedPath == undefined"
        label="Semester"
      />
    </v-flex>
    <v-flex
      xs4
      md3
    >
      <v-select
        v-model="selectedSchedule"
        :items="schedules"
        :disabled="selectedSemester == undefined"
        label="Vertiefung"
        item-text="label"
        return-object
      />
    </v-flex>
    <v-flex align-self-center>
      <v-btn
        :disabled="disableLoad"
        :loading="loading"
        round
        depressed
        color="secondary"
        @click.native="submit()"
      >
        laden
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
    },
    selectedSchedules: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedSchedule: undefined,
      selectedPath: undefined,
      selectedSemester: undefined,
    };
  },
  computed: {
    paths() {
      return Object.keys(this.schedulesTree)
        .filter((path) => !path.includes('Räume'));
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
    disableLoad() {
      return this.loading || this.selectedSchedule == undefined || this.selectedSchedules.includes(this.selectedSchedule);
    },
    ...mapGetters({
      schedulesTree: 'splus/getTimetablesAsTree',
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
      this.$emit('input', this.selectedSchedule);
    },
  },
};
</script>
