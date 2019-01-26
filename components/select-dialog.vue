<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="400">
    <v-card>

      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="card-text-padding">
        <v-list>
          <v-list-tile
            v-for="item in items"
            :key="!!item.description? item.description: item.label"
            @click="selectedItem = item">
            <v-list-tile-action>
              <v-icon
                v-if="!!item.description? item.description == selectedItem.description: item.label == selectedItem.label">
                mdi-check
              </v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ !!item.description? item.description: item.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'SelectDialog',
   props: {
    open: {
      type: Boolean,
      default: false
    },
    title:{
      type: String,
      default: 'Titel',
    },
    items: {
      type: Array,
      default: () => [], 
    },
    selected: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    dialogOpen: {
      get() { return this.open; },
      set(value) { this.$emit('update:open', value); }
    },
    selectedItem: {
      get() { return this.selected; },
      set(value) { this.$emit('update:selected', value); }
    }
  },
};
</script>

<style scoped lang="scss">

.card-text-padding{
  padding: 0px 5px;
}

</style> 
