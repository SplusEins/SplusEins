<template>
  <v-card>
    <v-card-title class="title-padding">
      <div class="headline">Neues von {{ generalNewsSource == 'Ostfalia'? 'der Ostfalia': 'Campus38' }}</div>
      <v-btn
        :loading="generalNewsLoading"
        icon
        @click="dialogOpen = true">
        <v-icon>mdi-newspaper</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <v-list 
        dense>
        <div 
          v-for="item in generalNews.slice(0,4)"
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
  name: 'GeneralNewsCard',
  components: {
    SelectDialog,
  },
  data() {
    const availableSoures = [{description: 'Ostfalia'}, {description: 'Campus38'}];

    return {
      dialogOpen: false,
      availableSoures,
    }
  },
  computed: {
    ...mapState({
      generalNews: (state) => state.news.generalNews,
      generalNewsSource: (state) => state.news.generalNewsSource,
      generalNewsLoading: (state) => state.news.loadingGeneral,
      browserStateReady: (state) => state.browserStateReady,
    }),
    selectedItem: {
      get(){ return {description: this.generalNewsSource};},
      set(value){ this.setNewsSource({ source: value.description, generalNews: true});}
    },
  },
  watch: {
    generalNewsSource() {
      if (this.browserStateReady){
       this.loadNews(true);
      }
    },
  },
  mounted() {
    this.loadNews(true);
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