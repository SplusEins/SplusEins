<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ customSchedule.label }} löschen?
      </v-card-title>
      <v-card-actions>
        <v-spacer />

        <v-btn
          flat
          @click="dialogOpen = false"
        >
          Abbrechen
        </v-btn>
        <v-btn
          flat
          color="error"
          @click="confirmDelete()"
        >
          Löschen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'CustomTimetableDeleteDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    customSchedule: {
      type: Object,
      required: true
    }
  },
  computed: {
    dialogOpen: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    }
  },
  methods: {
    confirmDelete () {
      this.dialogOpen = false;
      this.deleteCustomSchedule(this.customSchedule);
      this.$emit('on-delete');
    },
    ...mapMutations({
      deleteCustomSchedule: 'splus/deleteCustomSchedule'
    })
  }
};
</script>
