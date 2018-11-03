module.exports = {
  "testEnvironment": "node",
  "roots": [
    "<rootDir>"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "js",
    "node"
  ],
};
