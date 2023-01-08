import type { Plugin } from 'esbuild';
import path from 'path';

const nativeModulePlugin: Plugin = {
  name: 'native-module-plugin',
  setup(build) {
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => {
      return {
        path: require.resolve(args.path, {
          paths: [args.resolveDir]
        }),
        namespace: 'node-file'
      }
    });

    build.onLoad({ filter: /\.node$/, namespace: 'node-file' }, args => {
      return {
        contents: `
          import path from ${JSON.stringify(args.path)}
          try { module.exports = require(path)}
          catch {}
        `
      }
    })

    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => {
      console.log(args)
      return {
        path: args.path,
        namespace: 'file',
      }
    })

    const opts = build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  }
}

export default nativeModulePlugin;