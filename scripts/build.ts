import esbuild from 'esbuild';
import path from 'path';
import NativeModulePlugin from './plugins/native-module-plugin'


esbuild.build({
  entryPoints: [path.resolve('src/index.ts')],
  bundle: true,
  platform: 'node',
  outfile: 'dist/index.js',
  plugins: [NativeModulePlugin],
});