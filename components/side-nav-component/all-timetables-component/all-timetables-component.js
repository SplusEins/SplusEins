import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'all-timetables-component',
  computed: {
    currentCourse: {
      get() {
        return this.$store.state.courses.course;
      },
      set(value) {
        this.$store.commit('courses/setCourse', value);
      }
    },
    ...mapState({
      courses: state => state.splus.courses,
    }),
    ...mapGetters({
      facultiesAndDegrees: 'splus/facultiesAndDegrees',
      getSemestersByFacultyAndDegree: 'splus/getSemestersByFacultyAndDegree',
      getCoursesByFacultyAndDegreeAndSemester: 'splus/getCoursesByFacultyAndDegreeAndSemester',
    }),
  },
  mounted() {
  },
  methods: {
    ...mapMutations({
      setWeek: 'calendar/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
}
