<template>
  <v-list>
    <v-list-tile
      to="/"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title
          @click="trackMatomoEvent('Menu','goToStartseite')">
          Startseite</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
export default { 
  methods:{
    trackMatomoEvent (category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    }
  }
};
</script>