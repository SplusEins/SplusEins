<template>
  <lazy-hydrate
    ssr-only
    :trigger-hydration="dialogOpen"
  >
    <v-dialog
      v-model="dialogOpen"
      max-width="400"
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
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="card-text-padding">
          <v-list>
            <v-list-item
              v-for="item in items"
              :key="!!item.description? item.description: item.label"
              @click="selectedItem = item, dialogOpen = false"
            >
              <v-list-item-action>
                <v-icon
                  v-if="!!item.description? item.description == selectedItem.description: item.label == selectedItem.label"
                >
                  {{ mdiCheck }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ !!item.description? item.description: item.label }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </lazy-hydrate>
</template>

<script>
import { mdiClose, mdiCheck } from '@mdi/js'
export default {
  name: 'SelectDialog',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Titel'
    },
    items: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      mdiClose,
      mdiCheck
    };
  },
  computed: {
    dialogOpen: {
      get () { return this.open; },
      set (value) { this.$emit('update:open', value); }
    },
    selectedItem: {
      get () { return this.selected; },
      set (value) { this.$emit('update:selected', value); }
    }
  }
};
</script>

<style scoped lang="scss">

.card-text-padding{
  padding: 0px 5px;
}

</style>
