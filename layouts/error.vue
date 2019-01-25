<template>
  <v-app :dark="isDark">
    <spluseins-header/>
    <v-content fill-height>
      <v-layout 
        align-center 
        justify-center 
        column 
        fill-height>
        <v-card
          pa-2
          ma-2
          width="50%"
        >
          <v-card-media
            v-if="error.statusCode == 404"
            class="ErrorImg"
            src="/404.png"
            width="80%"
            position="right"
          />
          <v-card-media
            v-else-if="error.statusCode == 403 || 401"
            class="ErrorImg"
            src="/403_401.png"
            width="80%"
            position="right"
          />

          <v-card-media
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
              color="amber"
              @click="trackMatomoEvent('Error','goBackToMainPage','with error:' + error.statusCode)">
              Main Page
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-layout>
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SpluseinsHeader from '../components/spluseins-header.vue';
import SpluseinsFooter from '../components/spluseins-footer.vue';

export default {
  components: {
    SpluseinsHeader,
    SpluseinsFooter,
  },
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
  methods: {
    trackMatomoEvent (category, action, name) {
      this.$matomo.trackEvent(category, action, name);
    },
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