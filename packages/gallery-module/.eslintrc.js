/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@valley/eslint-config/remix.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
}
