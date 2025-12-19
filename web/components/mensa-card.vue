<template>
  <v-card class="fill-height">
    <v-card-title class="pb-1">
      <div class="text-h5 mr-1">
        {{ selectedLocation.description }}
        {{ isPlanOfToday ? 'Heute' : 'Morgen' }}
      </div>
      <v-tooltip right v-if="availableLocations.length > 0">
        <template #activator="{ on }">
          <v-btn icon v-on="on" @click="dialogOpen = true">
            <v-icon size="32px">
              {{ mdiMenuDown }}
            </v-icon>
          </v-btn>
        </template>
        <span>Mensa auswählen</span>
      </v-tooltip>
    </v-card-title>
    <v-card-text class="pb-0">
      <template v-if="mensaMenus.length > 0">
        <v-list v-for="(item, idx) in mensaMenus" :key="item.id || idx" dense>
          <div>
            <b>{{ item.lane }}:</b>
            <br />
            <span>{{ item.name }}</span>
            <br />
          </div>
        </v-list>
      </template>
      <div v-else>
        <i>Kein Menü verfügbar.</i>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn nuxt to="/mensa" text color="primary"> Mehr </v-btn>
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
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import { mdiMenuDown } from '@mdi/js';

const CITY_TO_KEY = {
  wolfenbüttel: 'wf',
  wolfsburg: 'wob',
  salzgitter: 'sz',
  suderburg: 'sud',
};

export default {
  name: 'MensaCard',
  data() {
    return {
      dialogOpen: false,
      mdiMenuDown,
    };
  },
  computed: {
    ...mapState('mensa', ['plans', 'location']),
    ...mapGetters('mensa', ['getNextAvailablePlan']),

    availableLocations() {
      if (!this.plans) return [];

      const seen = new Set();
      return this.plans
        .map((plan) => {
          const city = plan?.address?.city?.toLowerCase();
          const key = CITY_TO_KEY[city];
          if (!key || seen.has(key)) return null;

          seen.add(key);
          const title =
            plan?.address?.line1 || plan.name || 'Mensa Wolfenbüttel';

          return { key, description: title };
        })
        .filter(Boolean);
    },

    selectedLocation: {
      get() {
        const found = this.availableLocations.find(
          (l) => l.key === this.location,
        );
        return (
          found ||
          this.availableLocations[0] || {
            key: 'wf',
            description: 'Mensa Wolfenbüttel',
          }
        );
      },
      set(value) {
        this.setLocation(value.key);
      },
    },

    mensaMenus() {
      return (this.getNextAvailablePlan?.meals || []).filter((m) =>
        m?.lane?.startsWith('Essen '),
      );
    },

    isPlanOfToday() {
      return this.getNextAvailablePlan?.date
        ? this.$dayjs().isSame(this.getNextAvailablePlan.date, 'day')
        : false;
    },
  },

  async mounted() {
    await this.load();
    if (!this.location && this.availableLocations.length > 0) {
      this.setLocation(this.availableLocations[0].key);
    }
  },

  methods: {
    ...mapActions('mensa', ['load']),
    ...mapMutations('mensa', ['setLocation']),
  },
};
</script>
