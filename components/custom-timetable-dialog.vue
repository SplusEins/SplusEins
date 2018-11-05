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
        <v-toolbar-title>Neuer Stundenplan</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            dark
            flat
            @click.native="dialogOpen = false">Speichern</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container>
        <v-layout
          row
          wrap>
          <v-flex>
            <v-text-field
              v-model="timetableName"
              label="Plan benennen"
              single-line />
          </v-flex>

          <v-flex xs12>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Kurs suchen"
              single-line
              hide-details />
            <v-data-table
              v-model="timetableCourses"
              :headers="headers"
              :items="courses"
              :search="search"
              hide-headers
              hide-actions
              item-key="title">
              <template
                slot="items"
                slot-scope="props">
                <td>
                  <v-checkbox
                    v-model="props.selected"
                    primary
                    hide-details />
                </td>
                <td>{{ props.item.title }}</td>
                <td>{{ props.item.lecturer }}</td>
                <td v-show="$vuetify.breakpoint.smAndUp">{{ props.item.room }}</td>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'CustomTimetableDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      headers: [
        { text: 'Titel', value: 'title' },
        { text: 'Dozent', value: 'lecturer' },
        { text: 'Raum', value: 'room' },
      ],
      search: '',
      timetableCourses: [],
      timetableName: '',
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    ...mapGetters({
      courses: 'splus/getCourses',
    }),
  },
};
</script>
