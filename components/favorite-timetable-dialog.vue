<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="800px"
    hide-overlay
    transition="dialog-bottom-transition">
    <v-card>

      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Favoriten bearbeiten</v-toolbar-title>
      </v-toolbar>

      <v-form>
        <v-container 
          grid-list-md
          pb-1>
          <v-layout
            row
            wrap>
            <v-flex xs11>
              <timetable-select v-model="selectedSchedule"/>
            </v-flex>
            <v-flex xs1>
              <v-btn
                :disabled="invalidAdd()"
                icon
                large
                flat
                @click.native="addFavoriteSchedule(selectedSchedule)">
                <v-icon>add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>

      <v-list v-if="favoriteSchedules.length != 0"> 
        <v-list-tile
          v-for="schedule in favoriteSchedules"
          :key="schedule.id"
          nuxt>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ schedule.degree }} - {{ schedule.label }} {{ schedule.semester }}. Semester
              <v-icon @click = "removeFavoriteSchedule(schedule)">
                delete
              </v-icon>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

    </v-card>
  </v-dialog>
</template>

<script lang="js">
import { mapState, mapMutations } from 'vuex';
import TimetableSelect from './timetable-select.vue';

export default {
  name: 'FavoriteTimetableDialog',
  components: {
    TimetableSelect,
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedSchedule: undefined,
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    ...mapState({
        favoriteSchedules: (state) => state.splus.favoriteSchedules,
    }),
  },
  methods: {
    ...mapMutations({
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
      removeFavoriteSchedule: 'splus/removeFavoriteSchedule',
    }),
    invalidAdd() {
      return this.selectedSchedule == undefined || this.favoriteSchedules.filter(schedule => schedule.id == this.selectedSchedule.id).length > 0;
    },
  },
};
</script>
