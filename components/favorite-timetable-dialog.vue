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
            <v-flex xs12>
              <timetable-select @input="addSchedule"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>

      <v-list> 
        <v-list-tile
          v-for="schedule in favoriteSchedules"
          :key="schedule.id"
          nuxt>
          <v-list-tile-content>
            <v-list-tile-title>
              <v-icon @click = "removeFavoriteSchedule(schedule)">
                delete
              </v-icon>
              {{ schedule.degreeShort }} {{ schedule.label }} - {{ schedule.semester }}. Sem.
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
    addSchedule(schedule){
      if(this.favoriteSchedules.filter(favorite => favorite.id == schedule.id).length == 0){
        this.addFavoriteSchedule(schedule);
      }
    },
  },
};
</script>
