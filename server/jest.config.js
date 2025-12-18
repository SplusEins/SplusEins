module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testURL: 'http://localhost/',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
};
