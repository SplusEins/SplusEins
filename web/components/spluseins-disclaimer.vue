<template>
  <v-dialog v-model="dialogOpen" persistent width="500">
    <v-card>
      <v-card-title class="white--text primary"> Hinweis </v-card-title>
      <v-card-text class="pt-4 pb-0">
        <p>SplusEins ist ein inoffizielles Projekt, erstellt von Studis.</p>
        <p>
          Manchmal fehlen Stundenpläne ganz oder es gibt Fehler. Nutze dann
          stattdessen den offiziellen
          <a href="http://stundenplan.ostfalia.de/"> stundenplan.ostfalia.de</a
          >.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="dismissDisclaimer()">
          Verstanden
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsDisclaimer',
  computed: {
    dialogOpen: {
      get() {
        return (
          this.browserStateReady &&
          !this.hasSeenDisclaimer &&
          !this.hasSubscribableTimetables
        );
      },
      set() {
        this.dismissDisclaimer();
      },
    },
    ...mapState({
      browserStateReady: (state) => state.browserStateReady,
      hasSeenDisclaimer: (state) => state.ui.hasSeenDisclaimer,
    }),
    ...mapGetters('splus', ['hasSubscribableTimetables']),
  },
  methods: {
    ...mapMutations('ui', ['dismissDisclaimer']),
  },
};
</script>
