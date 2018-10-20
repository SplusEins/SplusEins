import COURSES from '~/assets/courses.json';

const identity = (x) => x;
const uniqBy = (keyGen) => (value, index, self) =>
  self.findIndex((otherValue) => keyGen(value) == keyGen(otherValue))
    == index;
const uniq = uniqBy(identity);

export const state = () => ({
  lectures: [],
  courses: COURSES,
});

export const getters = {
  getLecturesByWeekAndCourse: (state) => (week, course) => {
    return state.lectures.filter((lecture) =>
      lecture.week == week && lecture.course == course);
  },
  facultiesAndDegrees: (state) => {
    return state.courses
      .map(({ faculty, degree }) => ({ faculty, degree }))
      .filter(uniqBy(({ faculty, degree }) => faculty + degree));
  },
  getSemestersByFacultyAndDegree: (state) => (faculty, degree) => {
    return state.courses
      .filter((course) => course.faculty == faculty
        && course.degree == degree)
      .map((course) => course.semester)
      .filter(uniq);
  },
  getCoursesByFacultyAndDegreeAndSemester: (state) => (faculty, degree, semester) => {
    return state.courses
      .filter((course) => course.faculty == faculty
        && course.degree == degree
        && course.semester == semester);
  },
};

export const mutations = {
  addLectures(state, lectures) {
    console.log('Test')
    lectures
      .filter((lecture) => !state.lectures.find((lecture2) => lecture.id == lecture2.id))
      .forEach((lecture) => state.lectures.push(lecture));
  },
};

export const actions = {
  async load({ state, commit }, { course, week }) {
    const response = await this.$axios.get(`/api/splus/${course}/${week}`);
    commit('addLectures', response.data);
    console.log('Test')
  },
};
