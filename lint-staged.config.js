module.exports = {
  'apps/**/*.{js,ts,tsx}': [
    () => `turbo typecheck`,
    () => `turbo lint`,
    (files) => `pnpm prettier --write ${files.join(' ')}`,
  ],
  'packages/**/*.{js,ts,tsx}': [
    () => `turbo typecheck`,
    () => `turbo lint`,
    (files) => `pnpm prettier --write ${files.join(' ')}`,
  ],
  '*.{json,md,yml}': [(files) => `pnpm prettier --write ${files.join(' ')}`],
}
