<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="450"
  >
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Extern öffnen</v-toolbar-title>
      </v-toolbar>

      <v-container>
        <p>
          In deiner Kalender-Anwendung kannst du den Link abonnieren oder die Kalenderdatei für die nächsten Wochen importieren.
          <br>
          Über den Link werden die Daten automatisch aktualisiert.
        </p>
        <v-layout
          row
          wrap
          justify-space-between
        >
          <v-card-text>
            <v-text-field
              v-clipboard:copy="httpLink"
              v-clipboard:success="onTextFieldCopySuccess"
              :value="httpLink"
              :success-messages="textFieldCopySuccessMessage"
              append-icon="mdi-content-copy"
              autofocus
              solo
              full-width
              readonly
            />
          </v-card-text>

          <v-btn
            :href="downloadLink"
            flat
            @click="$track('ICS', 'download')"
          >
            <v-icon left>
              mdi-download
            </v-icon>
            Herunterladen
          </v-btn>

          <v-btn
            :href="webcalLink"
            flat
            @click="$track('ICS', 'open')"
          >
            <v-icon left>
              mdi-open-in-app
            </v-icon>
            App öffnen
          </v-btn>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
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
    },
  },
  data() {
    return {
      textFieldCopySuccessMessage: undefined,
    };
  },
  computed: {
    calendarPath() {
      const endpoint = 'api/ics/v1/';
      return endpoint + this.timetableIds.join(',') + '/' + this.titleIds.join(',');
    },
    webcalLink() {
      const base = this.$axios.defaults.baseURL;
      const absoluteBase = base.startsWith('http') ? base : window.location.origin + base;
      const webcalBase = absoluteBase.replace(/^https?/i, 'webcal');
      return webcalBase + this.calendarPath;
    },
    httpLink() {
      const base = this.$axios.defaults.baseURL;
      const absoluteBase = base.startsWith('http') ? base : window.location.origin + base;
      return absoluteBase + this.calendarPath;
    },
    downloadLink() {
      const base = this.$axios.defaults.baseURL;
      return base + this.calendarPath;
    },
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
  },
  methods: {
    onTextFieldCopySuccess() {
      this.textFieldCopySuccessMessage = 'Kopiert.';
    },
  },
};
</script>
