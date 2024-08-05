module.exports = {
  'apps/**/*.{js,ts,tsx}': ['yarn lint'],
  'apps/**/*.{js,ts,tsx}': [
    (files) => `yarn prettier --write ${files.join(' ')}`,
  ],
  'packages/**/*.{js,ts,tsx}': ['yarn lint'],
  'packages/**/*.{js,ts,tsx}': [
    (files) => `yarn prettier --write ${files.join(' ')}`,
  ],
}
