<template>
  <div class="d-flex align-center">
    <responsive-icon-button
      v-if="rememberable"
      :breakpoint="$vuetify.display.xlAndUp"
      :icon="isFavorite ? mdiHeart : mdiHeartOutline"
      :text="isFavorite ? 'Gemerkt' : 'Merken'"
      :color="isFavorite ? 'primary' : undefined"
      aria-label="Merken"
      :aria-pressed="isFavorite"
      @click="splus.toggleRemembered(currentSchedule.sources[0])"
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
          :title="currentSchedule.name ? 'Bearbeiten' : 'Kurse auswählen'"
          @click="editTimetableDialogOpen = true"
        />
        <v-list-item
          v-if="deletable"
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
        v-if="deletable"
        :breakpoint="$vuetify.display.xlAndUp"
        :icon="mdiDelete"
        text="Löschen"
        @click="deleteTimetableDialogOpen = true"
      />
      <responsive-icon-button
        :text="currentSchedule.name ? 'Bearbeiten' : 'Kurse auswählen'"
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
      :plan="currentSchedule"
      @on-delete="routeToRoot()"
    />
    <custom-timetable-dialog
      v-model="editTimetableDialogOpen"
      :plan="currentSchedule"
    />
    <copy-text-dialog v-model="shareDialogOpen" :text-to-copy="currentUrl()" />
    <open-calendar-dialog
      v-model="openCalendarDialogOpen"
      :sources="sourcesToString(currentSchedule.sources)"
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
import { sourcesToString } from '../lib/plans';
import CopyTextDialog from './copy-text-dialog.vue';
import OpenCalendarDialog from './open-calendar-dialog.vue';
import ResponsiveIconButton from './responsive-icon-button.vue';
import CustomTimetableDeleteDialog from './custom-timetable-delete-dialog.vue';
import CustomTimetableDialog from './custom-timetable-dialog.vue';

const router = useRouter();
const splus = useSplusStore();
const { schedule: currentSchedule, savedSchedule } = storeToRefs(splus);
const { mobile: isMobile } = useDisplay();

const editTimetableDialogOpen = ref(false);
const openCalendarDialogOpen = ref(false);
const deleteTimetableDialogOpen = ref(false);
const shareDialogOpen = ref(false);

/* a single timetable, which the heart saves without name */
const rememberable = computed(
  () =>
    !currentSchedule.value.name && currentSchedule.value.sources.length === 1,
);
const isFavorite = computed(() =>
  splus.isRemembered(currentSchedule.value.sources[0].id),
);
const deletable = computed(() => !!savedSchedule.value?.name);

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
