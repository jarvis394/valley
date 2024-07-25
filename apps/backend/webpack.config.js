const { composePlugins, withNx } = require('@nx/webpack')

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    return {
      ...config,
      externals: [...config.externals, { sharp: 'commonjs sharp' }],
    }
  }
)
