<template>
  <v-card class="fill-height">
    <v-card-title class="pb-1">
      <div class="text-h5 mr-1">
        Mensa {{ selectedLocation.title }} {{ isPlanOfToday? 'Heute' : 'Morgen' }}
      </div>
      <v-tooltip right>
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
            @click="dialogOpen = true"
          >
            <v-icon
              v-on="on"
            >
              {{ mdiFood }}
            </v-icon>
          </v-btn>
        </template>
        <span>Mensa auswählen</span>
      </v-tooltip>
    </v-card-title>
    <v-card-text class="pb-0">
      <template v-if="mensaMenus.length > 0">
        <v-list
          v-for="(item, idx) in mensaMenus"
          :key="item.id || idx"
          dense
        >
          <div>
            <b>{{ item.lane }}:</b>
            <br>
            <span>{{ item.name }}</span>
            <br>
          </div>
        </v-list>
      </template>
      <div v-else>
        <i>Kein Menü verfügbar.</i>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        nuxt
        :to="`/mensa?location=${selectedLocation.path}`"
        text
        color="primary"
      >
        Mehr
      </v-btn>
    </v-card-actions>
    <lazy-select-dialog
      :open.sync="dialogOpen"
      :items="availableLocations"
      :selected.sync="selectedLocation"
      title="Standort auswählen"
    />
  </v-card>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { mdiFood } from '@mdi/js'

export default {
  name: 'MensaCard',
  data () {
    const availableLocations = [
      { title: 'Wolfenbüttel', description: 'Mensa Wolfenbüttel', path: 'wf' },
      { title: 'Wolfsburg', description: 'Bistro 4U Wolfsburg', path: 'wob' },
      { title: 'Suderburg', description: 'Mensa Suderburg', path: 'sud' },
      { title: 'Salzgitter', description: 'Mensa Salzgitter', path: 'sz' }
    ];
    return {
      dialogOpen: false,
      availableLocations,
      mdiFood
    }
  },
  computed: {
    selectedLocation: {
      get () {
        let selected = this.availableLocations.find(loc => loc.path === this.location);
        if (!selected) {
          selected = this.availableLocations[0];
          this.setLocation(selected.path);
        }
        return selected;
      },
      set (value) { this.setLocation(value.path); }
    },
    mensaMenus () {
      return Object.values(this.getNextAvailablePlan.meals)
        .filter(({ lane }) => lane.startsWith('Essen '));
    },
    isPlanOfToday () {
      return this.$dayjs().isSame(this.getNextAvailablePlan.date, 'day');
    },
    ...mapGetters({
      getNextAvailablePlan: 'mensa/getNextAvailablePlan',
      location: 'mensa/location'
    })
  },
  mounted () {
    this.load();
  },
  watch: {
    location () {
      this.load();
    }
  },
  methods: {
    ...mapActions({
      load: 'mensa/load'
    }),
    ...mapMutations({
      setLocation: 'mensa/setLocation'
    })
  }
};
</script>
