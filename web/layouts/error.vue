<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true),
    }"
    class="fill-height"
  >
    <v-row
      align="center"
    >
      <v-col
        align="center"
      >
        <v-card
          class="pa-2 ma-2"
          :width="$vuetify.breakpoint.mobile ? undefined: '50%'"
        >
          <v-img
            v-if="error.statusCode == 404"
            class="ErrorImg"
            src="/404.png"
            position="right"
          />
          <v-img
            v-else-if="error.statusCode == 500"
            class="ErrorImg"
            src="/500.png"
            position="right"
          />

          <v-card-text class="text-center text-h6">
            <div
              v-if="error.statusCode == 404"
            >
              <span v-if="error.response"> {{ error.response.data }}  </span>
              <span v-else> Diese Seite gibt es leider nicht...</span>
            </div>
            <div
              v-if="error.statusCode == 500"
            >
              Internal Server Error
            </div>
          </v-card-text>

          <v-card-actions class="pt-5">
            <v-btn
              text
              to="/"
              nuxt
              color="primary"
            >
              Zurück zur Startseite
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped lang="scss">
.ErrorImg{
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 60%;
}
</style>
