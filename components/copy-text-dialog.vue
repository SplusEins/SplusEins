<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="400">
    <v-card>

      <v-toolbar
        dark
        color="primary">
        <v-toolbar-title>Teilen</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="card-text">
        <v-text-field
          v-clipboard:copy="textToCopy"
          v-clipboard:success="onTextFieldCopySuccess"
          :value="textToCopy"
          :success-messages="textFieldCopySuccessMessage"
          append-icon="mdi-content-copy"
          autofocus
          solo
          full-width
          readonly />
      </v-card-text>

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

<style scoped lang="scss">
.card-text{
  padding-bottom: 0; 
}

.card-action{
  padding-top: 0;
}
</style> 
