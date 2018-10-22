<template>
  <v-app>
    <HeaderComponent/>
    <v-content>
      <CalendarComponent/>
    </v-content>
    <FooterComponent/>
  </v-app>
</template>

<script>
import HeaderComponent from '../components/header-component.vue'
import CalendarComponent from '../components/calendar-component.vue'
import FooterComponent from '../components/footer-component.vue'

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
}
</script>

<style lang="scss">
</style>
