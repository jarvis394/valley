module.exports = {
  'apps/**/*.{ts,tsx}': (files) => {
    return `nx affected --target=typecheck --files=${files.join(',')}`
  },
  'apps/**/*.{js,ts,jsx,tsx,json}': [
    (files) => `nx affected:lint --files=${files.join(',')}`,
    (files) => `nx format:write --files=${files.join(',')}`,
  ],
  'libs/**/*.{ts,tsx}': (files) => {
    return `nx affected --target=typecheck --files=${files.join(',')}`
  },
  'libs/**/*.{js,ts,jsx,tsx,json}': [
    (files) => `nx affected:lint --files=${files.join(',')}`,
    (files) => `nx format:write --files=${files.join(',')}`,
  ],
}
