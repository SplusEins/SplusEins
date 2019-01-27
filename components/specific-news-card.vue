<template>
  <v-card>
    <v-card-title class="title-padding">
      <div class="headline">Neues {{ selectedItem.title }}</div>
      <v-btn
        icon
        @click="dialogOpen = true">
        <v-icon>mdi-newspaper</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <v-list 
        dense>
        <div 
          v-for="item in specificNews.slice(0,2)"
          :key="item.link"
          class="list-tile">
          <a 
            :href="item.link"
            target="_blank"
            class="link">
            {{ item.title }}
          </a>
          <br>
          <span>{{ item.text }}</span>
          <br>
        </div>
      </v-list>
    </v-card-text>

    <select-dialog
      :open.sync="dialogOpen"
      :items="availableSoures"
      :selected.sync="selectedItem"
      title="Quelle auswählen"/>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import SelectDialog from './select-dialog.vue'

export default {
  name: 'SpecificNewsCard',
  components: {
    SelectDialog,
  },
  data() {
    const availableSoures = [{description: 'Fakultät Informatik', title: 'aus der Informatik', path: 'Ostfalia/i'},
                             {description: 'Fakultät Elektrotechnik', title: 'aus der E-Technik', path: 'Ostfalia/e'},
                             {description: 'Fakultät Recht', title: 'aus dem Recht', path: 'Ostfalia/r'},
                             {description: 'Standort Wolfenbüttel', title: 'aus Wolfenbüttel', path: 'Ostfalia/wf'},
                             {description: 'Standort Wolfsburg', title: 'aus Wolfsburg', path: 'Ostfalia/wob'},
                             {description: 'Standort Salzgitter', title: 'aus Salzgitter', path: 'Ostfalia/sz'},
                             {description: 'Standort Suderburg', title: 'aus Suderburg', path: 'Ostfalia/sud'},];

    return {
      dialogOpen: false,
      availableSoures,
    }
  },
  computed: {
    ...mapState({
      specificNews: (state) => state.news.specificNews,
      specificNewsSource: (state) => state.news.specificNewsSource,
      browserStateReady: (state) => state.browserStateReady,
    }),
    selectedItem: {
      get(){ return this.availableSoures.filter(source => source.path == this.specificNewsSource)[0];},
      set(value){ this.setNewsSource({ source: value.path, generalNews: false });}
    },
  },
  watch: {
    specificNewsSource() {
      if (this.browserStateReady){
       this.loadNews(false);
      }
    },
  },
  mounted() {
    if(this.specificNews.length == 0) {
      this.loadNews(false);
    }
  },
  methods: {
    ...mapActions({
      loadNews: 'news/loadNews',
    }),
    ...mapMutations({
      setNewsSource: 'news/setNewsSource',
    }),
  },
};
</script>


<style lang="scss">

.title-padding{
  padding: 10px 16px 5px 16px;
}

.link{
  text-decoration: none;
}

.list-tile{
  padding: 5px 0 5px 0px;
}

.card-text-padding{
  padding-top: 0px;
}

</style>