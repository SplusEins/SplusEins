
import AllTimetablesComponent from './all-timetables-component/index.vue'
import FavouriteTimetablesComponent from './favourite-timetables-component/index.vue'
import MyTimetablesComponent from './my-timetables-component/index.vue'

export default {
  name: 'side-nav-component',
  components: {
    AllTimetablesComponent,
    FavouriteTimetablesComponent,
    MyTimetablesComponent
  },
  props: ['drawer'],
  data () {
    return {

    }
  },
  computed: {
  },
  mounted () {

  },
  methods: {

  }
}
