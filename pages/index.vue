<template>
  <v-app id="inspire">
    <header-component/>
    <v-content>
      <calendar-component/>
    </v-content>
    <footer-component/>
  </v-app>
</template>

<script>
import HeaderComponent from '../components/header-component/index.vue'
import CalendarComponent from '../components/calendar-component/calendar.vue'
import FooterComponent from '../components/footer-component/index.vue'

export default {
  name: 'HomePage',
  layout: 'empty',
  components: {
    HeaderComponent,
    CalendarComponent,
    FooterComponent
  },
  data() {
    return {
      drawer: null
    }
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
