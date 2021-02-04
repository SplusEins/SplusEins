const path = require('path');

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  entry: {
    server: './server.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/server'),
  },
  module: {
    rules: [ {
      test: /\.ts$/,
      use: [
        { loader: 'ts-loader' },
      ],
      exclude: /node_modules/
    } ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    mainFields: [ 'main' ],
  },
};

module.exports = [ serverConfig ];
