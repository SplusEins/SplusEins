<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="400">
    <v-card>

      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Plan abbonieren</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="card-text-padding">
        <v-list>
          <v-list-tile
            v-for="schedule in subscribableTimetables"
            :key="schedule.label"
            @click="setSubscribedTimetable(schedule)">
            <v-list-tile-action>
              <v-icon
                v-if="schedule.label == subscribedTimetable.label">
                mdi-check
              </v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ schedule.description ? schedule.description : schedule.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  name: 'SubscribeDialog',
   props: {
    value: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    ...mapState({
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
    }),
    ...mapGetters({
      subscribableTimetables: 'splus/subscribableTimetables',
    }),
  },
  methods: {
    ...mapMutations({
      setSubscribedTimetable: 'splus/setSubscribedTimetable',
    }),
  },
};
</script>

<style scoped lang="scss">

.card-text-padding{
  padding: 0px 5px;
}

</style> 
