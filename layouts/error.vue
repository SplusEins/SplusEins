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
            class="Error404Img"
            src="/404.png"
            width="80%"
            position="right"
          />
          <v-card-text>
            <div 
              v-if="error.statusCode != 404" 
              class="text-xs-center"
            >
              OOPSIE WOOPSIE!! UwU We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquaters are working VEWY HAWD to fix this.
            </div>
            <div 
              v-else 
              class="text-xs-center"
            >
              Diese Seite gibt es leider nicht...
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
      isDark: state => state.theme.isDark,
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
.Error404Img{
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}
</style>