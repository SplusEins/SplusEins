<template>
  <v-form v-model="valid">
    <v-layout
      row
      wrap>
      <v-flex
        xs12
        md5>
        <v-select
          :items="paths"
          v-model="selectedPath"
          label="Studiengang"
          required />
      </v-flex>
      <v-flex
        xs4
        md2>
        <v-select
          :items="semesters"
          :rules="[rules.required]"
          v-model="selectedSemester"
          label="Semester"
          required />
      </v-flex>
      <v-flex
        xs6
        md4>
        <v-select
          :items="schedules"
          :rules="[rules.resolvesToSchedule]"
          v-model="selectedSchedule"
          label="Vertiefung"
          item-text="label"
          required
          return-object />
      </v-flex>
      <v-flex
        xs2
        md1>
        <v-btn
          icon
          flat
          large
          color="secondary"
          @click.native="submit()">
          <v-icon>add</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TimetableSelect',
  data() {
    return {
      valid: false,
      selectedSchedule: undefined,
      selectedPath: '',
      selectedSemester: '',
      rules: {
        required: (value) => !!value || 'Pflichtfeld',
        resolvesToSchedule: () => !!this.selectedSchedule || 'Pflichtfeld',
      },
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
  methods: {
    submit() {
      if (this.valid) {
        this.$emit('input', this.selectedSchedule);
      }
    },
  },
};
</script>