<template>
  <v-snackbar
    v-model="snackbarOpen"
    color="error"
    right>
    {{ message }}
    <v-btn
      dark
      flat
      @click="clearError()">
      Schließen
    </v-btn>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsErrorSnackbar',
  computed: {
    snackbarOpen: {
        get() {
            return !!this.message;
        },
        set() {
            this.clearError();
        }
    },
    ...mapState({
      message: state => state.splus.error,
    }),
  },
  methods: {
    ...mapMutations({
      clearError: 'splus/clearError',
    }),
  },
};
</script>