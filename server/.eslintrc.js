module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  // required to lint *.vue files
  plugins: ["@typescript-eslint"],
  // add your custom rules here
  rules: {},
};
