import * as path from 'path';
import * as typescript from 'typescript';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const baseDir = __dirname;

function buildAliasesFromTsconfig(baseDir: string): { [module: string]: string } {
  const compilerOptions: typescript.CompilerOptions = require('../../tsconfig.base.json').compilerOptions;
  if (!compilerOptions.paths) {
    return {};
  }

  const output: { [module: string]: string } = {};
  for (const pathKey of Object.keys(compilerOptions.paths)) {
    const pathVals = compilerOptions.paths[pathKey];
    if (pathVals.length !== 1) {
      throw new Error('Unable to parse tsconfig paths');
    }
    output[pathKey.replace('/*', '')] = path.resolve(baseDir, '..', pathVals[0].replace('/*', ''));
  }
  return output;
}

module.exports = {
  entry: './src/app/index.ts',
  mode: 'development',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(baseDir, 'dist')
  },
  target: 'web',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      ...buildAliasesFromTsconfig(baseDir)
    }
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.[t|j]sx?$/,
        exclude: [/node_modules/],
        loader: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true,
              onlyCompileBundledFiles: true,
              // Types are checked via fork-ts-checker-webpack-plugin
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },
};
