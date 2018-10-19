const path = require('path');

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './server/serverless/api.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/server/serverless'),
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [ {
      test: /\.ts$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-env' ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-object-assign',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        },
        { loader: 'ts-loader' },
      ],
      exclude: /node_modules/
    } ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
};

module.exports = [ serverConfig ];
