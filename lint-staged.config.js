module.exports = {
  'apps/**/*.{js,ts,tsx}': [
    () => `turbo typecheck`,
    () => `turbo lint`,
    (files) => `yarn prettier --write ${files.join(' ')}`,
  ],
  'packages/**/*.{js,ts,tsx}': [
    () => `turbo typecheck`,
    () => `turbo lint`,
    (files) => `yarn prettier --write ${files.join(' ')}`,
  ],
  '*.{json,md,yml}': [(files) => `yarn prettier --write ${files.join(' ')}`],
}
