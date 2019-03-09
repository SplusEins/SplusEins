<template>
  <div>
    <span v-show="!isTinyMobile">
      <responsive-icon-button
        v-if="!isCustomSchedule"
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
        :text="isFavorite ? 'Favorit entfernen' : 'Favorisieren'"
        @click="toggleFavorite" />
    </span>

    <!-- mobile action bar -->
    <v-menu
      v-show="isMobile"
      bottom
      left>
      <v-btn
        slot="activator"
        :small="$vuetify.breakpoint.xs"
        class="cursor-pointer"
        icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <v-list>
        <v-list-tile
          v-show="isTinyMobile"
          v-if="!isCustomSchedule"
          @click="toggleFavorite">
          <v-list-tile-content>
            <v-list-tile-title v-if="!isFavorite">Favorisieren</v-list-tile-title>
            <v-list-tile-title v-else>Favorit entfernen</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="share()">
          <v-list-tile-content>
            <v-list-tile-title>Teilen</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :href="icsLink">
          <v-list-tile-content>
            <v-list-tile-title>Extern öffnen</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          @click="editTimetableDialogOpen = true; $track('Calendar', isCustomSchedule ? 'clickEditCustomSchedule' : 'clickEditSchedule')">
          <v-list-tile-content>
            <v-list-tile-title v-if="isCustomSchedule">Bearbeiten</v-list-tile-title>
            <v-list-tile-title v-else>Personalisieren</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="isCustomSchedule"
          @click="deleteTimetableDialogOpen = true; $track('Calendar', 'clickDeleteCustomSchedule')">
          <v-list-tile-title>Löschen</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <!-- desktop action bar -->
    <span v-show="!isMobile">
      <responsive-icon-button
        :breakpoint="$vuetify.breakpoint.xl"
        icon="mdi-share-variant"
        text="Teilen"
        @click="share" />
      <responsive-icon-button
        v-if="isCustomSchedule"
        :breakpoint="$vuetify.breakpoint.xl"
        icon="mdi-delete"
        text="Löschen"
        @click="deleteTimetableDialogOpen = true; $track('Calendar', 'clickDeleteCustomSchedule')" />
      <responsive-icon-button
        :text="isCustomSchedule ? 'Bearbeiten' : 'Personalisieren'"
        :breakpoint="$vuetify.breakpoint.xl"
        icon="mdi-pencil"
        @click="editTimetableDialogOpen = true; $track('Calendar', isCustomSchedule ? 'clickEditCustomSchedule' : 'clickEditSchedule')" />
      <responsive-icon-button
        :breakpoint="$vuetify.breakpoint.xl"
        :href="icsLink"
        icon="mdi-calendar"
        text="Extern öffnen"
        @click="() => undefined" />
    </span>

    <custom-timetable-delete-dialog
      v-model="deleteTimetableDialogOpen"
      :custom-schedule="currentSchedule"
      @on-delete="routeToRoot()" />
    <custom-timetable-dialog
      v-model="editTimetableDialogOpen"
      :custom-schedule="currentAsCustomSchedule" />
    <copy-text-dialog
      v-model="shareDialogOpen"
      :text-to-copy="currentUrl()" />

  </div>
</template>

<script lang="js">
import { mapMutations, mapState, mapGetters } from 'vuex';
import CopyTextDialog from './copy-text-dialog.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';
import CustomTimetableDialog from './custom-timetable-dialog.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';

export default {
  name: 'CalendarActionBar',
  components: {
    CopyTextDialog,
    ResponsiveIconButton,
    CustomTimetableDialog,
    CustomTimetableDeleteDialog,
  },
  data() {
    return {
      editTimetableDialogOpen: false,
      deleteTimetableDialogOpen: false,
      shareDialogOpen: false,
    };
  },
  computed: {
    isMobile() {
      return !this.$vuetify.breakpoint.mdAndUp;
    },
    isTinyMobile() {
      return this.$vuetify.breakpoint.width <= 400;
    },
    isFavorite() {
      return this.favoriteSchedules.filter(favorite => favorite.id == this.currentSchedule.id).length != 0;
    },
    icsLink() {
      let base = this.$axios.defaults.baseURL;
      if (!base.startsWith('http')) {
        base = window.location.origin + base;
      }
      base = base.replace(/^https?/i, 'webcal');

      const path = 'api/ics/v1/';;
      const timetable = this.currentSchedule;

      let timetables;
      let titleIds;
      if (this.isCustomSchedule) {
        timetables = this.currentSchedule.id.join(',');
        titleIds = this.currentSchedule.whitelist.join(',');
      } else {
        timetables = this.currentSchedule.id;
        titleIds = '';
      }

      return base + path + timetables + '/' + titleIds;
    },
    currentAsCustomSchedule() {
      if (this.isCustomSchedule) {
        return this.currentSchedule;
      } else {
        // new custom schedule with the regular as its base
        return {
          label: '',
          id: [this.currentSchedule.id],
          whitelist: [],
        };
      }
    },
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
      favoriteSchedules: (state) => state.splus.favoriteSchedules,
    }),
    ...mapGetters({
      isCustomSchedule: 'splus/isCustomSchedule',
    }),
  },
  methods: {
    routeToRoot() {
      this.$router.replace('/');
    },
    toggleFavorite() {
      if (this.isFavorite) {
        this.removeFavoriteSchedule(this.currentSchedule);
        this.$track('Calendar', 'removeFavorites');
      } else {
        this.addFavoriteSchedule(this.currentSchedule);
        this.$track('Calendar', 'addToFavorites');
      }
    },
    currentUrl(){
      return !!global.window ? window.location.href : '';
    },
    async share() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      if (navigator.share) {
        await navigator.share({
          url: this.currentUrl(),
        });
      } else {
        this.shareDialogOpen = true;
      }
    },
    ...mapMutations({
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
      removeFavoriteSchedule: 'splus/removeFavoriteSchedule',
    }),
  },
};
</script>
