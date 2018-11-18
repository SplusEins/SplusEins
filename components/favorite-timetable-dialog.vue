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
        <v-toolbar-title>Favoriten hinzufügen</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            :disabled="selectedSchedule == undefined"
            dark
            flat
            @click.native="add()">Hinzufügen</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-form>
        <v-container grid-list-md>
          <v-layout
            row
            wrap>
            <v-flex xs12>
              <timetable-select v-model="selectedSchedule"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="js">
import { mapMutations } from 'vuex';
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
  },
  methods: {
    add(){
      this.dialogOpen = false;
      this.addFavoriteSchedule(this.selectedSchedule);
    },
    ...mapMutations({
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
    }),
  },
};
</script>
