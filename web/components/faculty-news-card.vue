<template>
  <v-card>
    <v-card-title class="title-padding">
      <div class="headline">
        Neues {{ selectedItem.title }}
      </div>
      <v-btn
        icon
        @click="dialogOpen = true; $track('News', 'openSelectNews')"
      >
        <v-icon>mdi-newspaper</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <v-list dense>
        <div
          v-for="item in facultyNews"
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
          <span>{{ item.text }}</span>
          <br>
        </div>
      </v-list>
    </v-card-text>

    <select-dialog
      :open.sync="dialogOpen"
      :items="availableSoures"
      :selected.sync="selectedItem"
      title="Quelle auswählen"
    />
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import SelectDialog from './select-dialog.vue'

export default {
  name: 'FacultyNewsCard',
  components: {
    SelectDialog
  },
  data () {
    const availableSoures = [
      { description: 'Fakultät Elektrotechnik', title: 'aus der E-Technik', path: 'e' },
      { description: 'Fakultät Recht', title: 'aus dem Recht', path: 'r' },
      { description: 'Fakultät Versorgungstechnik', title: 'aus der Versorgungstechnik', path: 'v' },
      { description: 'Standort Wolfenbüttel', title: 'aus Wolfenbüttel', path: 'wf' },
      { description: 'Standort Wolfsburg', title: 'aus Wolfsburg', path: 'wob' },
      { description: 'Standort Suderburg', title: 'aus Suderburg', path: 'sud' }];

    return {
      dialogOpen: false,
      availableSoures
    }
  },
  computed: {
    selectedItem: {
      get () { return this.availableSoures.filter(source => source.path === this.faculty)[0]; },
      set (value) { this.setFaculty(value.path); }
    },
    ...mapState({
      facultyNews: (state) => state.news.facultyNews,
      faculty: (state) => state.news.faculty,
      lazyLoad: (state) => state.lazyLoad
    })
  },
  mounted () {
    if (this.lazyLoad) {
      // static build -> no news are in the store
      this.loadNews();
    }
  },
  methods: {
    ...mapActions({
      loadNews: 'news/loadFacultyNews',
      setFaculty: 'news/setFaculty'
    })
  }
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
