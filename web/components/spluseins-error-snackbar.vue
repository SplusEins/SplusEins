<template>
  <v-snackbar
    v-model="snackbarOpen"
    :timeout="-1"
    color="error"
    right
  >
    [{{ errorQueue.length }}] {{ next }}
    <template #action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="dequeueError()"
      >
        Schließen
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsErrorSnackbar',
  computed: {
    snackbarOpen: {
      get () {
        return this.errorQueue.length != 0;
      },
      set () {
        this.dequeueError();
      }
    },
    ...mapState({
      errorQueue: state => state.errorQueue
    }),
    next () {
      return this.errorQueue[0];
    }
  },
  methods: {
    ...mapMutations({
      dequeueError: 'dequeueError'
    })
  }
};
</script>
