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
      <v-list two-line>
        <template v-for="(item, index) in campusNews">
          <v-list-item :key="item.link" :href="item.link" target="_blank" rel="noopener">
            <v-list-item-avatar v-if="item.image" tile size="80">
              <v-img :src="item.image" cover></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="text-wrap font-weight-bold">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-wrap">{{ item.text }}</v-list-item-subtitle>
              <div class="d-flex mt-2">
                <div class="d-flex align-center mr-4">
                  <v-icon small class="mr-1">mdi-newspaper</v-icon>
                  <span class="text-caption">{{ shortname(item.source) }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon small class="mr-1">mdi-calendar</v-icon>
                  <span class="text-caption">{{ formatDate(item.date) }}</span>
                </div>
              </div>
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="index < campusNews.length - 1" :key="index"></v-divider>
        </template>
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
    formatDate (date) {
      return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    ...mapActions({
      loadCampusNews: 'news/loadCampusNews'
    })
  }
};
</script>

<style lang="scss" scoped>
.link {
  text-decoration: none;
  color: inherit;
}
</style>
