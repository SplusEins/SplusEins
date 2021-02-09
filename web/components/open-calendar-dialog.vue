<template>
  <v-bottom-sheet
    v-model="open"
    inset
  >
    <v-list>
      <v-subheader>Extern öffnen</v-subheader>
      <v-list-tile
        :href="downloadLink"
        @click="open = false; $track('Calendar', 'ICS', 'download')"
      >
        <v-list-tile-avatar>
          <v-avatar
            size="32px"
            tile
          >
            <v-icon>mdi-download</v-icon>
          </v-avatar>
        </v-list-tile-avatar>
        <v-list-tile-title>Aktuelle Daten herunterladen</v-list-tile-title>
      </v-list-tile>

      <v-list-tile
        v-clipboard="httpLink"
        @click="open = false; $track('Calendar', 'ICS', 'copy')"
      >
        <v-list-tile-avatar>
          <v-avatar
            size="32px"
            tile
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-avatar>
        </v-list-tile-avatar>
        <v-list-tile-title>Link in die Zwischenablage kopieren</v-list-tile-title>
      </v-list-tile>

      <v-list-tile
        :href="webcalLink"
        @click="open = false; $track('Calendar', 'ICS', 'open')"
      >
        <v-list-tile-avatar>
          <v-avatar
            size="32px"
            tile
          >
            <v-icon>mdi-open-in-app</v-icon>
          </v-avatar>
        </v-list-tile-avatar>
        <v-list-tile-title>Link in Kalender-App öffnen</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-bottom-sheet>
</template>

<script>

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
      textFieldCopySuccessMessage: undefined
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
