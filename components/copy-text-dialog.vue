<template>
  <v-dialog
    v-model="dialogOpen"
    width="400">
    <v-card>
      <v-card-title
        class="headline"
        primary-title>
        Kopieren
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-clipboard:copy="textToCopy"
          v-clipboard:success="onTextFieldCopySuccess"
          :value="textToCopy"
          :success-messages="textFieldCopySuccessMessage"
          append-icon="file_copy"
          autofocus
          solo
          readonly />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          flat
          primary
          @click="dialogOpen = false">
          Schließen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'CopyTextDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    textToCopy: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      textFieldCopySuccessMessage: undefined,
    };
  },
  computed: {
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