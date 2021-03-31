<template>
  <v-bottom-sheet
    v-model="open"
    inset
  >
    <v-list>
      <v-subheader>Link Teilen</v-subheader>

      <v-list-item
        v-clipboard="textToCopy"
        @click="open = false"
      >
        <v-list-item-avatar>
          <v-avatar
            size="32px"
            tile
          >
            <v-icon>{{ mdiContentCopy }}</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-title>Link in die Zwischenablage kopieren</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>

<script>

import { mdiContentCopy } from '@mdi/js'

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
      textFieldCopySuccessMessage: undefined,
      mdiContentCopy
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
