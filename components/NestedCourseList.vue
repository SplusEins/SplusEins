<template>
  <v-list>
    <v-list-group
      v-for="(semesters, level1Title) in coursesTree"
      :key="level1Title"
      value="true"
      no-action>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-list-tile-title>{{ level1Title }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <template 
        v-for="(courses, semester) in semesters">
        <v-list-group
          v-if="courses.length > 1"
          :key="level1Title + semester"
          no-action
          sub-group>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="currentCourse.semester == semester && currentCourseLevel1Title == level1Title">
              <v-icon>check</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile
            v-for="course in courses"
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
          @click="currentCourse = courses[0]">
          <v-list-tile-content>
            <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action v-if="currentCourse == courses[0]">
            <v-icon>check</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';

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
    currentCourseLevel1Title() {
      return this.courseToFacultyAndDegree(this.currentCourse);
    },
    coursesTree() {
      const tree = {};
      /*
       * convert star schema: { faculty, degree, semester, ...course }
       * into hierarchy: { (faculty, degree): { semester: courses } }
       */
      this.courses.forEach((course) => {
        const level1Title = this.courseToFacultyAndDegree(course);
        if (tree[level1Title] == undefined) {
          tree[level1Title] = {};
        }

        const leaf1 = tree[level1Title];
        if (leaf1[course.semester] == undefined) {
          leaf1[course.semester] = [];
        }

        const leaf2 = leaf1[course.semester];
        leaf2.push(course);
      });

      return tree;
    },
    ...mapState({
      courses: state => state.splus.courses,
    }),
  },
  methods: {
    courseToFacultyAndDegree(course) {
      return `${course.faculty} - ${course.degree}`;
    },
    ...mapMutations({
      setWeek: 'calendar/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
};
</script>
