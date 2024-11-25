module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["next/core-web-vitals", "plugin:storybook/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {}
};