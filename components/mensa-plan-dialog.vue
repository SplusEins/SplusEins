<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="1500px"
    hide-overlay
    transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Essensplan</v-toolbar-title>
      </v-toolbar>
      <v-container 
        fluid 
        grid-list-md>
        <v-layout 
          :wrap="$vuetify.breakpoint.smAndDown"
          row>
          <v-flex
            v-for="dayPlan in weekPlan"
            :key="dayPlan.date.day()"
            xs12
          >
            <v-card 
              height="100%">
              <v-card-title> 
                <h4>{{ getDayHeader(dayPlan.date) }}</h4>
              </v-card-title>
              <v-divider />
              <v-list 
                v-for="item in dayPlan.data"
                :key="item.id"
                dense
                two-line>
                <v-list-tile>
                  <v-list-tile-content class="content">
                    <span class="category">{{ item.category }}:</span>
                    <span>{{ item.name }} ({{ getPriceLabel(item.prices.students) }})</span>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout> 
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="js">
import { mapActions, mapState } from 'vuex';

export default {
  name: 'MensaPlanDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      weekdays : ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
    }
  },
  computed: {
     dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
    })
  },
  mounted() {
    this.loadWeek();
  },
  methods: {
    ...mapActions({
      loadWeek: 'mensa/loadWeek',
    }),
    getDayHeader(date){
      return this.weekdays[date.day()-1] + " - " + date.format('DD.MM.YYYY');
    },
    getPriceLabel(price){
      const euros = Math.floor(price);
      let cents = Math.round((price - euros) * 100);
      cents = cents != 0 ? cents : '00';
      return euros + ',' + cents + '€';
    }
  },
}
</script>

<style scoped lang="scss">

.category {
  font-weight: bold;
}

.content {
  justify-content: normal;
}

</style>
