<template>
  <v-bottom-sheet
    v-model="open"
    inset
  >
    <v-list>
      <v-subheader>Extern öffnen</v-subheader>
      <v-list-item
        :href="downloadLink"
        @click="open = false; $track('Calendar', 'ICS', 'download')"
      >
        <v-list-item-avatar>
          <v-avatar
            size="24px"
            tile
          >
            <v-icon>{{ mdiDownload }}</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-title>Aktuelle Daten herunterladen</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-clipboard="httpLink"
        @click="open = false; $track('Calendar', 'ICS', 'copy')"
      >
        <v-list-item-avatar>
          <v-avatar
            size="24px"
            tile
          >
            <v-icon>{{ mdiContentCopy }}</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-title>Link der Kalenderdatei kopieren</v-list-item-title>
      </v-list-item>

      <v-list-item
        :href="webcalLink"
        @click="open = false; $track('Calendar', 'ICS', 'open')"
      >
        <v-list-item-avatar>
          <v-avatar
            size="24px"
            tile
          >
            <v-icon>{{ mdiOpenInApp }}</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-title>Link in Kalender-App öffnen</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>

<script>

import { mdiDownload, mdiContentCopy, mdiOpenInApp } from '@mdi/js'

export default {
  name: 'OpenCalendarDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    timetableIds: {
      type: Array,
      required: true
    },
    titleIds: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      textFieldCopySuccessMessage: undefined,
      mdiDownload,
      mdiContentCopy,
      mdiOpenInApp
    };
  },
  computed: {
    calendarPath () {
      const endpoint = 'api/ics/v1/';
      return endpoint + this.timetableIds.join(',') + '/' + this.titleIds.join(',');
    },
    webcalLink () {
      const base = this.$axios.defaults.baseURL;
      const absoluteBase = base.startsWith('http') ? base : window.location.origin + base;
      const webcalBase = absoluteBase.replace(/^https?/i, 'webcal');
      return this.returnValidPath(webcalBase) + this.calendarPath;
    },
    httpLink () {
      const base = this.$axios.defaults.baseURL;
      const absoluteBase = base.startsWith('http') ? base : window.location.origin + base;
      return this.returnValidPath(absoluteBase) + this.calendarPath;
    },
    downloadLink () {
      const base = this.$axios.defaults.baseURL;
      return this.returnValidPath(base) + this.calendarPath;
    },
    open: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    }
  },
  methods: {
    onTextFieldCopySuccess () {
      this.textFieldCopySuccessMessage = 'Kopiert.';
    },
    returnValidPath (path) {
      return path.endsWith('/') ? path : path + '/';
    }
  }
};
</script>
