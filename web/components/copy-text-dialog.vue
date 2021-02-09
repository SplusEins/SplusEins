<template>
  <v-bottom-sheet
    v-model="open"
    inset
  >
    <v-list>
      <v-subheader>Link Teilen</v-subheader>

      <v-list-tile
        v-clipboard="textToCopy"
        @click="open = false"
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
    </v-list>
  </v-bottom-sheet>
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
    }
  },
  data () {
    return {
      textFieldCopySuccessMessage: undefined
    };
  },
  computed: {
    open: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    }
  },
  methods: {
    onTextFieldCopySuccess () {
      this.textFieldCopySuccessMessage = 'Kopiert.';
    }
  }
};
</script>
