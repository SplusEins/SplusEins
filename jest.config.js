module.exports = {
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/file-mock.js",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/style-mock.js",
  },
  "moduleFileExtensions": [
    "js",
    "ts",
    "json",
    "vue",
  ],
  "transform": {
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  "testURL": "http://localhost/",
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "snapshotSerializers": [
    "jest-serializer-vue"
  ],
};
