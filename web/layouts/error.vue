<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true),
    }"
    class="container"
  >
    <v-layout
      align-center
      justify-center
      column
      fill-height
    >
      <v-card
        pa-2
        ma-2
        width="50%"
      >
        <v-img
          v-if="error.statusCode == 404"
          class="ErrorImg"
          src="/404.png"
          width="80%"
          position="right"
        />
        <v-img
          v-else-if="error.statusCode == 403 || error.statusCode == 401"
          class="ErrorImg"
          src="/403_401.png"
          width="80%"
          position="right"
        />

        <v-img
          v-else-if="error.statusCode == 500"
          class="ErrorImg"
          src="/500.png"
          width="80%"
          position="right"
        />

        <v-card-text>
          <div
            v-if="error.statusCode == 404"
            class="text-xs-center"
          >
            Diese Seite gibt es leider nicht...
          </div>
          <div
            v-if="error.statusCode == 403"
            class="text-xs-center"
          >
            Verbinde dich mit dem Ostfalia-WLAN, bevor du diesen Plan aufrufen
            kannst.
          </div>
        </v-card-text>

        <v-card-text>
          <div
            v-if="error.statusCode == 500"
            class="text-xs-center"
          >
            Internal Server Error
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn
            flat
            to="/"
            nuxt
            color="primary"
            @click="$track('Error', 'backToMain', 'error status', error.statusCode)"
          >
            Main Page
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.ui.isDark,
    }),
  },
}
</script>

<style scoped lang="scss">
.ErrorImg{
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}
</style>
