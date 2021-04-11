<template>
  <div>
    <span v-show="!isTinyMobile">
      <responsive-icon-button
        v-if="!isCustomSchedule"
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="isFavorite ? mdiHeart : mdiHeartOutline"
        :text="isFavorite ? 'Favorit entfernen' : 'Favorisieren'"
        @click="toggleFavorite"
      />
    </span>

    <!-- mobile action bar -->
    <v-menu
      bottom
      left
    >
      <template #activator="{ on, attrs }">
        <v-btn
          :small="$vuetify.breakpoint.xs"
          class="cursor-pointer"
          icon
          v-bind="attrs"
          v-on="on"
          v-show="isMobile"
        >
          <v-icon>{{ mdiDotsVertical }}</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-show="isTinyMobile"
          v-if="!isCustomSchedule"
          @click="toggleFavorite"
        >
          <v-list-item-content>
            <v-list-item-title v-if="!isFavorite">
              Favorisieren
            </v-list-item-title>
            <v-list-item-title v-else>
              Favorit entfernen
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Teilen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="openCalendarDialogOpen = true">
          <v-list-item-content>
            <v-list-item-title>Extern öffnen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="editTimetableDialogOpen = true">
          <v-list-item-content>
            <v-list-item-title v-if="isCustomSchedule">
              Bearbeiten
            </v-list-item-title>
            <v-list-item-title v-else>
              Personalisieren
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="isCustomSchedule"
          @click="deleteTimetableDialogOpen = true"
        >
          <v-list-item-title>Löschen</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- desktop action bar -->
    <span v-show="!isMobile">
      <responsive-icon-button
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="mdiShareVariant"
        text="Teilen"
        @click="share()"
      />
      <responsive-icon-button
        v-if="isCustomSchedule"
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="mdiDelete"
        text="Löschen"
        @click="deleteTimetableDialogOpen = true"
      />
      <responsive-icon-button
        :text="isCustomSchedule ? 'Bearbeiten' : 'Personalisieren'"
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="mdiPencil"
        @click="editTimetableDialogOpen = true"
      />
      <responsive-icon-button
        :breakpoint="$vuetify.breakpoint.xl"
        :icon="mdiCalendar"
        text="Extern öffnen"
        @click="openCalendarDialogOpen = true"
      />
    </span>

    <custom-timetable-delete-dialog
      v-model="deleteTimetableDialogOpen"
      :custom-schedule="currentSchedule"
      @on-delete="routeToRoot()"
    />
    <lazy-custom-timetable-dialog
      v-model="editTimetableDialogOpen"
      :custom-schedule="currentAsCustomSchedule"
    />
    <copy-text-dialog
      v-model="shareDialogOpen"
      :text-to-copy="currentUrl()"
    />
    <open-calendar-dialog
      v-model="openCalendarDialogOpen"
      :timetable-ids="timetableIds"
      :title-ids="titleIds"
    />
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';
import CopyTextDialog from './copy-text-dialog.vue';
import OpenCalendarDialog from './open-calendar-dialog.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';
import { mdiHeart, mdiHeartOutline, mdiDotsVertical, mdiShareVariant, mdiDelete, mdiPencil, mdiCalendar } from '@mdi/js'

export default {
  name: 'CalendarActionBar',
  components: {
    CopyTextDialog,
    OpenCalendarDialog,
    ResponsiveIconButton,
    CustomTimetableDeleteDialog
  },
  data () {
    return {
      editTimetableDialogOpen: false,
      openCalendarDialogOpen: false,
      deleteTimetableDialogOpen: false,
      shareDialogOpen: false,
      mdiHeart,
      mdiHeartOutline,
      mdiDotsVertical,
      mdiShareVariant,
      mdiDelete,
      mdiPencil,
      mdiCalendar
    };
  },
  computed: {
    isMobile () {
      return this.$vuetify.breakpoint.mobile;
    },
    isTinyMobile () {
      return this.$vuetify.breakpoint.width <= 400;
    },
    isFavorite () {
      return this.favoriteSchedules.filter(favorite => favorite.id == this.currentSchedule.id).length != 0;
    },
    timetableIds () {
      return this.isCustomSchedule ? this.currentSchedule.id : [this.currentSchedule.id];
    },
    titleIds () {
      return this.isCustomSchedule ? this.currentSchedule.whitelist : [];
    },
    currentAsCustomSchedule () {
      if (this.isCustomSchedule) {
        return this.currentSchedule;
      } else {
        // new custom schedule with the regular as its base
        return {
          label: '',
          id: [this.currentSchedule.id],
          whitelist: []
        };
      }
    },
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
      favoriteSchedules: (state) => state.splus.favoriteSchedules
    }),
    ...mapGetters({
      isCustomSchedule: 'splus/isCustomTimetable'
    })
  },
  methods: {
    routeToRoot () {
      this.$router.replace('/');
    },
    toggleFavorite () {
      if (this.isFavorite) {
        this.removeFavoriteSchedule(this.currentSchedule);
      } else {
        this.addFavoriteSchedule(this.currentSchedule);
      }
    },
    currentUrl () {
      return global.window ? window.location.href : '';
    },
    async share () {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      if (navigator.share) {
        await navigator.share({
          url: this.currentUrl()
        });
      } else {
        this.shareDialogOpen = true;
      }
    },
    ...mapMutations({
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
      removeFavoriteSchedule: 'splus/removeFavoriteSchedule'
    })
  }
};
</script>
