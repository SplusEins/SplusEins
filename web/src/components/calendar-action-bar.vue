<template>
  <div class="d-flex align-center">
    <responsive-icon-button
      v-if="!isCustomSchedule"
      :breakpoint="$vuetify.display.xlAndUp"
      :icon="isFavorite ? mdiHeart : mdiHeartOutline"
      :text="isFavorite ? 'Gemerkt' : 'Merken'"
      :color="isFavorite ? 'primary' : undefined"
      aria-label="Merken"
      :aria-pressed="isFavorite"
      @click="splus.toggleFavoriteSchedule(currentSchedule)"
    />

    <!-- mobile action bar -->
    <v-menu v-if="isMobile" location="bottom end">
      <template #activator="{ props }">
        <v-btn v-bind="props" :icon="mdiDotsVertical" aria-label="Mehr" />
      </template>

      <v-list>
        <v-list-item title="Teilen" @click="share()" />
        <v-list-item
          title="Extern öffnen"
          @click="openCalendarDialogOpen = true"
        />
        <v-list-item
          :title="isCustomSchedule ? 'Bearbeiten' : 'Kurse auswählen'"
          @click="editTimetableDialogOpen = true"
        />
        <v-list-item
          v-if="isCustomSchedule"
          title="Löschen"
          @click="deleteTimetableDialogOpen = true"
        />
      </v-list>
    </v-menu>

    <!-- desktop action bar -->
    <template v-else>
      <responsive-icon-button
        :breakpoint="$vuetify.display.xlAndUp"
        :icon="mdiShareVariant"
        text="Teilen"
        @click="share()"
      />
      <responsive-icon-button
        v-if="isCustomSchedule"
        :breakpoint="$vuetify.display.xlAndUp"
        :icon="mdiDelete"
        text="Löschen"
        @click="deleteTimetableDialogOpen = true"
      />
      <responsive-icon-button
        :text="isCustomSchedule ? 'Bearbeiten' : 'Kurse auswählen'"
        :breakpoint="$vuetify.display.xlAndUp"
        :icon="mdiPencil"
        @click="editTimetableDialogOpen = true"
      />
      <responsive-icon-button
        :breakpoint="$vuetify.display.xlAndUp"
        :icon="mdiCalendar"
        text="Extern öffnen"
        @click="openCalendarDialogOpen = true"
      />
    </template>

    <custom-timetable-delete-dialog
      v-model="deleteTimetableDialogOpen"
      :custom-schedule="currentSchedule"
      @on-delete="routeToRoot()"
    />
    <custom-timetable-dialog
      v-model="editTimetableDialogOpen"
      :custom-schedule="currentAsCustomSchedule"
    />
    <copy-text-dialog v-model="shareDialogOpen" :text-to-copy="currentUrl()" />
    <open-calendar-dialog
      v-model="openCalendarDialogOpen"
      :timetable-ids="timetableIds"
      :title-ids="titleIds"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import {
  mdiHeart,
  mdiHeartOutline,
  mdiDotsVertical,
  mdiShareVariant,
  mdiDelete,
  mdiPencil,
  mdiCalendar,
} from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import CopyTextDialog from './copy-text-dialog.vue';
import OpenCalendarDialog from './open-calendar-dialog.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';
import CustomTimetableDialog from './custom-timetable-dialog.vue';

const router = useRouter();
const splus = useSplusStore();
const { schedule: currentSchedule, isCustomTimetable: isCustomSchedule } =
  storeToRefs(splus);
const { mobile: isMobile } = useDisplay();

const editTimetableDialogOpen = ref(false);
const openCalendarDialogOpen = ref(false);
const deleteTimetableDialogOpen = ref(false);
const shareDialogOpen = ref(false);

const isFavorite = computed(() =>
  splus.isFavoriteSchedule(currentSchedule.value),
);
const timetableIds = computed(() =>
  isCustomSchedule.value
    ? currentSchedule.value.id
    : [currentSchedule.value.id],
);
const titleIds = computed(() =>
  isCustomSchedule.value ? currentSchedule.value.whitelist : [],
);
const currentAsCustomSchedule = computed(() => {
  if (isCustomSchedule.value) {
    return currentSchedule.value;
  } else {
    // new custom schedule with the regular as its base
    return {
      label: '',
      id: [currentSchedule.value.id],
      whitelist: [],
    };
  }
});

function routeToRoot() {
  router.replace('/');
}
function currentUrl() {
  return window.location.href;
}
async function share() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
  if (navigator.share) {
    try {
      await navigator.share({
        url: currentUrl(),
        title: splus.scheduleDisplayName(),
      });
    } catch (error) {
      // AbortError: the user closed the share dialog
      if (error.name !== 'AbortError') throw error;
    }
  } else {
    shareDialogOpen.value = true;
  }
}
</script>
