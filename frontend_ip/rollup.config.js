import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";

const importMetaUrlCurrentModulePlugin = () => {
  return {
    name: 'import-meta-url-current-module',
    resolveImportMeta(property, {moduleId}) {
      if (property === 'url') {
        return `new URL('${path.relative(process.cwd(), moduleId)}', document.baseURI).href`;
      }
      return null;
    }
  };
};
const fontsCopyConfig = {
    targets: [
        {
            src: 'node_modules/@fontsource/roboto/files/*',
            dest: 'src/files'
        },
        {
            src: 'node_modules/@fontsource/roboto-mono/files/*',
            dest: 'src/files'
        }
    ],
    copyOnce: true,
    flatten: true,
    hook: 'writeBundle',
    verbose: true
};
const config = {
  input: 'src_ts/app-shell.ts',
  output: {
    file: 'src/src/app-shell.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: true,
    compact: true
  },
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
  plugins: [
      importMetaUrlCurrentModulePlugin(),
      postcss({
          extract: 'fonts.css',
          inject: false,
          minimize: true,
      }),
      copy(fontsCopyConfig),
      resolve(),
      commonjs(),
      esbuild(),
      dynamicImportVars({
          exclude: [/\.css$/],
      }),
  ],
  preserveEntrySignatures: false
};

export default config;
