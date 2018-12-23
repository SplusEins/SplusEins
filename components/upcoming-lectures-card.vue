<template>
  <v-card>
    <v-card-title 
      primary-title
      pb-0>
      <span class="headline">Nächste Vorlesungen</span>
      <v-btn
        icon
        @click="subscribeDialogOpen = true">
        <v-icon>mdi-settings</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text v-if="nextEvent != undefined">
      {{ nextEvent.data.title }} {{ nextEvent.data.description }}
      <br>
      Uhrzeit: {{ nextEvent.schedule.on.hour() }}:{{ nextEvent.schedule.on.minute() }} Uhr
      <br>
      Raum: {{ nextEvent.data.location }}
    </v-card-text>
    <subscribe-dialog 
      v-model="subscribeDialogOpen"/>
  </v-card>

</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import * as moment from 'moment';
import SubscribeDialog from './subscribe-dialog.vue'
import { constants } from 'zlib';

export default {
  name: 'UpcomingLecturesCard',
  components: {
    SubscribeDialog,
  },
  data() {
    return {
      events: [],
      nextEvent: undefined, 
      subscribeDialogOpen: false
    }
  },
  computed: {
    ...mapState({
      lectures: (state) => state.splus.lectures,
      customSchedules: (state) => state.splus.customSchedules,
      favoriteSchedules: (state) => state.splus.favoriteSchedules,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
      browserStateReady: (state) => state.browserStateReady,
    }),
    ...mapGetters({
      getLecturesAsEvents: 'splus/getLecturesAsEvents',
    }),
  },
  watch: {
    subscribedTimetable() {
      if(this.browserStateReady){
        this.setSchedule(this.subscribedTimetable);
        this.resetWeek();
        this.clearLectures();
        this.loadLectures();
      }
    },
    lectures() {
      this.events = this.$store.getters['splus/getLecturesAsEvents'];
      this.nextEvent = this.findNextEvent();
    }
  },
  methods: {
    ...mapMutations({
      setSchedule: 'splus/setSchedule',
      resetWeek: 'splus/resetWeek',
      clearLectures: 'splus/clearLectures',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
    findNextEvent(){
      // let possibleEvents = this.events.filter(event => moment(event.schedule.on).valueOf() - moment().valueOf() > 0)
      //                                 .sort((a,b) => moment(a.schedule.on).valueOf() - moment(b.schedule.on).valueOf())
      let possibleEvents = this.events.sort((a,b) => moment(a.schedule.on).valueOf() - moment(b.schedule.on).valueOf());
      return possibleEvents[0] != undefined? possibleEvents[0] : undefined;
    }
  }

};
</script>
