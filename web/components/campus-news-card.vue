<template>
  <v-card
    class="fill-height"
    :loading="campusNews.length === 0"
  >
    <v-card-title class="pb-1">
      <div class="text-h5 mr-1">
        Neues vom Campus
      </div>
    </v-card-title>
    <v-card-text>
      <v-list dense>
        <div
          v-for="item in campusNews"
          :key="item.link"
          class="py-1"
        >
          <a
            :href="item.link"
            target="_blank"
            class="link"
            rel="noopener"
          >
            {{ item.title }}
          </a>
          <br>
          <span class="text--secondary">
            {{ shortname(item.source) }}.
          </span>
          <span>{{ item.text }}</span>
          <br>
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'CampusNewsCard',
  data () {
    const availableSources = [
      { description: 'Campus 38', shortname: 'Campus38', path: 'campus38' },
      { description: 'Ostfalia Campus', shortname: 'Ostfalia', path: 'campus' }
    ];
    return {
      availableSources
    }
  },
  computed: {
    ...mapState({
      campusNews: (state) => state.news.campusNews
    })
  },
  mounted () {
    this.loadCampusNews();
  },
  methods: {
    shortname (path) {
      return this.availableSources.filter(source => source.path === path)[0].shortname;
    },
    ...mapActions({
      loadCampusNews: 'news/loadCampusNews'
    })
  }
};
</script>

<style lang="scss">

.link{
  text-decoration: none;
}

</style>
