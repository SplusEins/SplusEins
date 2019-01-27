<template>

  <v-card>
    <v-card-title>
      <span class="headline">Nächste Vorlesung</span>
      <v-btn
        v-show="hasSubscribableTimetables"
        icon
        @click="dialogOpen = true">
        <v-icon>mdi-bookmark-outline</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text v-if="nextEvent != undefined">
      <b>{{ nextEvent.title }} {{ nextEvent.lecturer }}</b>
      <br>
      Datum: {{ nextEvent.start.format('dddd, DD.MM.YYYY') }}
      <br>
      Uhrzeit: {{ nextEvent.start.hour() }}:{{ nextEvent.start.minute() == 0? "00" : nextEvent.start.minute() }} Uhr
      <br>
      Raum: {{ nextEvent.room }}
    </v-card-text>
    <v-card-text v-else-if="hasSubscribableTimetables && nextEvent == undefined">
      <i>Keine weiteren Vorlesungen in dieser Woche!</i>
    </v-card-text>
    <v-card-text v-else>
      <i>Markiere bitte Favoriten oder erstelle personalisierte Pläne, um diese Option nutzen zu können!</i>
    </v-card-text>
    
    <select-dialog
      :open.sync="dialogOpen"
      :items="subscribableTimetables"
      :selected.sync="selectedItem"
      title="Plan abbonieren"/>
  </v-card>

</template>

<script>
import * as moment from 'moment';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import SelectDialog from './select-dialog.vue'

export default {
  name: 'UpcomingLecturesCard',
  components: {
    SelectDialog,
  },
  data() {
    return {
      nextEvent: undefined,
      dialogOpen: false,
    }
  },
  computed: {
    selectedItem: {
      get(){ return this.subscribedTimetable;},
      set(value){ this.setSubscribedTimetable(value);}
    },
    hasSubscribableTimetables() {
      return this.subscribableTimetables.length > 0;
    },
    ...mapState({
      upcomingLectures: (state) => state.splus.upcomingLectures,
      upcomingLecturesTimetable: (state) => state.splus.upcomingLecturesTimetable,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
      browserStateReady: (state) => state.browserStateReady,
    }),
    ...mapGetters({
      subscribableTimetables: 'splus/subscribableTimetables',
    }),
  },
  watch: {
    subscribedTimetable() {
      if(this.browserStateReady && !!this.subscribedTimetable.id){
        this.load();
      }
    },
    upcomingLectures() {
      this.nextEvent = this.findNextEvent();
    },
  },
  mounted() {
    if(!!this.subscribedTimetable.id) {
       this.load();
    }
  },
  methods: {
    ...mapMutations({
      setSubscribedTimetable: 'splus/setSubscribedTimetable',
      setUpcomingLecturesTimetable: 'splus/setUpcomingLecturesTimetable',
    }),
    ...mapActions({
      loadLectures: 'splus/loadUpcomingLectures',
    }),
    findNextEvent() {
      const possibleEvents = this.upcomingLectures
                             .map(event => {return {title: event.title,
                                                    room: event.room,
                                                    lecturer: event.lecturer,
                                                    start: moment(event.start).hour(parseInt(event.begin / 1)).minute(event.begin % 1 * 60)}})
                             .filter(event => event.start.valueOf() - moment().valueOf() > 0)
                             .sort((a,b) => a.start.valueOf() - b.start.valueOf());                              
      return possibleEvents[0] != undefined? possibleEvents[0] : undefined;
    },
    load(){
      this.setUpcomingLecturesTimetable(this.subscribedTimetable);
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

