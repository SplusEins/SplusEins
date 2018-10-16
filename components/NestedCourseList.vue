<template>
  <v-list>
    <v-list-group
      v-for="{ faculty, degree } in facultiesAndDegrees"
      :key="faculty + degree"
      value="true"
      no-action>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-list-tile-title>{{ faculty }} - {{ degree }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <template 
        v-for="semester in getSemestersByFacultyAndDegree(faculty, degree)">
        <v-list-group
          v-if="getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester).length > 1"
          :key="semester"
          no-action
          sub-group>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentCourse.semester == semester">
              <v-icon>check</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile
            v-for="course in getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)"
            :key="course.id"
            @click="currentCourse = course">
            <v-list-tile-content value="true">
              <v-list-tile-title value="true">{{ course.label }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentCourse == course">
              <v-icon>check</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>

        <v-list-tile
          v-else
          :key="semester"
          @click="currentCourse = getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)">
          <v-list-tile-content>
            <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action v-if="currentCourse == getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)">
            <v-icon>check</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'NestedCourseList',
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
  methods: {
    ...mapMutations({
      setWeek: 'calendar/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
};
</script>
