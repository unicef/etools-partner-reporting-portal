import defaultConfig from './rollup.config.js';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';

// For livereload to work you need to expose port in docker-compose.yaml with ports: -"3003:3003"
const appPort = 8082;
const liveReloadPort = 4001;

console.log("\x1b[92m" + "Starting app on port:" + appPort + " \x1b[0m");
console.log("\x1b[92m" + "LiveReload starting on port:" + liveReloadPort + " \x1b[0m");
console.log("\x1b[93m" + "LiveReload Hint: If live reload is not working you probably must expose port " + liveReloadPort + " in docker-compose.yaml" + " \x1b[0m");

// Extra files to copy in src directory ./src
const copyConfig = {
  targets: [
    {
      src: 'src_ts/**/*.json',
      dest: 'src'
    },
  ],
  copyOnce: true,
  flatten: false
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
    flatten: true
};

const config = {
  ...defaultConfig,
  output: {
    dir: 'src',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js',
  },
  watch: {
    include: ['src_ts/**', 'node_modules/**']
  },
  plugins: [
    ...defaultConfig.plugins,
      copy(copyConfig),
      copy(fontsCopyConfig),
    serve({
      historyApiFallback: true,
      openPage: 'index.html',
      port: appPort
    }),
    livereload({
      port: liveReloadPort,
      verbose: true,
      delay: 1000,
      watch: ['src'],
    }),
  ]
}

export default config;
