const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  entry: {
    server: './server.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/server')
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        { loader: 'ts-loader' }
      ],
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['main']
  }
};

// from https://github.com/node-fetch/node-fetch/issues/784#issuecomment-786305770
// keep_classnames is required to workaround node-fetch "Expected signal to be an instanceof AbortSignal" error
// we are using an AbortSignal through "timeout-signal" in controllers/mensa.ts
serverConfig.optimization = {
  minimizer: [
    new TerserPlugin({
      cache: true,
      parallel: true,
      terserOptions: {
        keep_classnames: /AbortSignal/,
        keep_fnames: /AbortSignal/
      }
    })
  ]
};

module.exports = [serverConfig];
