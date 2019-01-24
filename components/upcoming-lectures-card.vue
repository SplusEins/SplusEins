<template>

  <v-card>
    <v-card-title>
      <span class="headline">Nächste Vorlesungen</span>
      <v-btn
        v-show="hasSubscribableTimetables"
        icon
        @click="subscribeDialogOpen = true">
        <v-icon>mdi-bookmark</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text v-if="nextEvent != undefined">
      {{ nextEvent.data.title }} {{ nextEvent.data.description }}
      <br>
      Datum: {{ nextEvent.schedule.on.format('dddd, DD.MM.YYYY') }}
      <br>
      Uhrzeit: {{ nextEvent.schedule.on.hour() }}:{{ nextEvent.schedule.on.minute() == 0? "00" : nextEvent.schedule.on.minute() }} Uhr
      <br>
      Raum: {{ nextEvent.data.location }}
    </v-card-text>
    <v-card-text v-else-if="hasSubscribableTimetables && nextEvent == undefined">
      <i>Keine weiteren Vorlesungen in dieser Woche!</i>
    </v-card-text>
    <v-card-text v-else>
      <i>Markiere bitte Favoriten oder erstelle personalisierte Pläne um diese Option nutzen zu können!</i>
    </v-card-text>
    
    <subscribe-dialog 
      v-model="subscribeDialogOpen"/>
  </v-card>

</template>

<script>
import * as moment from 'moment';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import SubscribeDialog from './subscribe-dialog.vue'

export default {
  name: 'UpcomingLecturesCard',
  components: {
    SubscribeDialog,
  },
  data() {
    return {
      nextEvent: undefined,
      subscribeDialogOpen: false
    }
  },
  computed: {
    ...mapState({
      lectures: (state) => state.splus.lectures,
      schedule: (state) => state.splus.schedule,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
      browserStateReady: (state) => state.browserStateReady,
    }),
    ...mapGetters({
      getLecturesAsEvents: 'splus/getLecturesAsEvents',
      subscribableTimetables: 'splus/subscribableTimetables',
    }),
    hasSubscribableTimetables() {
      return this.subscribableTimetables.length > 0;
    },
  },
  watch: {
    subscribedTimetable() {
      if(this.browserStateReady && !!this.subscribedTimetable.id){
        this.load();
      }
    },
    lectures() {
      if(!!this.schedule && !!this.subscribedTimetable.id && this.schedule.id == this.subscribedTimetable.id)  {
        const possibleNext = this.findNextEvent();
        if(possibleNext.ready){
          if(this.nextEvent && possibleNext.event && this.nextEvent.data.title == possibleNext.event.data.title) return;
          this.nextEvent = possibleNext.event;
        }
      }
    }
  },
  mounted() {
    if(!!this.schedule && !!this.subscribedTimetable.id && this.schedule.id != this.subscribedTimetable.id){
       this.load();
    }
    this.nextEvent = this.findNextEvent().event;
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
    findNextEvent() {
      const events = this.$store.getters['splus/getLecturesAsEvents']
      const possibleEvents = events.filter(event => moment(event.schedule.on).valueOf() - moment().valueOf() > 0)
                                      .sort((a,b) => moment(a.schedule.on).valueOf() - moment(b.schedule.on).valueOf())
      return {event: possibleEvents[0] != undefined? possibleEvents[0] : undefined, ready: events.length != 0 };
    },
    load(){
      this.setSchedule(this.subscribedTimetable);
      this.resetWeek();
      this.clearLectures();
      this.loadLectures();
    }
  }
};
</script>

<style lang="scss">

.v-card__text{
  padding-top: 0px;
}

</style>

