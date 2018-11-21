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
        :items="timetables"
        :disabled="selectedSemester == undefined"
        v-model="selectedTimetable"
        label="Vertiefung"
        item-text="label"
        return-object />
    </v-flex>
    <v-flex
      xs2
      md1>
      <v-btn
        :disabled="loading || selectedTimetable == undefined"
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
      selectedTimetable: undefined,
      selectedPath: undefined,
      selectedSemester: undefined,
    };
  },
  computed: {
    paths() {
      return Object.keys(this.timetablesTree);
    },
    semesters() {
      return this.timetablesTree[this.selectedPath] != undefined ?
        Object.keys(this.timetablesTree[this.selectedPath])
        : [];
    },
    timetables() {
      return this.timetablesTree[this.selectedPath] != undefined ?
        this.timetablesTree[this.selectedPath][this.selectedSemester] || []
        : [];
    },
    hasMultipleTimetables() {
      return this.timetables && this.timetables.length > 1;
    },
    ...mapGetters({
      timetablesTree: 'splus/getTimetablesAsTree',
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
      if (this.timetables.length == 1) {
        this.selectedTimetable = this.timetables[0];
      } else {
        this.selectedTimetable = undefined;
      }
    },
  },
  methods: {
    submit() {
      this.$emit('input', this.selectedTimetable);
    },
  },
};
</script>