<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Neues vom Campus
      </div>
    </v-card-title>
    <v-card-text>
      <v-list dense>
        <div
          v-for="item in campusNews.slice(0, 5)"
          :key="item.link"
          class="list-tile"
        >
          <a
            :href="item.link"
            target="_blank"
            class="link"
          >
            {{ item.title }}
          </a>
          <br>
          <span class="grey--text">{{ item.source }}.</span>
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
  computed: {
    ...mapState({
      campusNews: (state) => state.news.campusNews,
      browserStateReady: (state) => state.browserStateReady,
    }),
  },
  mounted() {
    this.loadCampusNews();
  },
  methods: {
    ...mapActions({
      loadCampusNews: 'news/loadCampusNews',
    }),
  },
};
</script>


<style lang="scss">

.link{
  text-decoration: none;
}

.list-tile{
  padding: 5px 0 5px 0px;
}

</style>
