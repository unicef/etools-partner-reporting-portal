
module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'src/**/*',
    'images/**/*',
    'node_modules/numeral/min/numeral.min.js',
    'node_modules/moment/min/moment.min.js',
    'node_modules/web-animations-js/web-animations-next-lite.min.js',
    'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /^https:\/\/fonts.gstatic.com\//,
      handler: 'fastest'
    }
  ],
  replacePrefix: '/app/',
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [
    /^\/api\//,
    /^\/app\//,
    /^\/landing\//,
    /^\/unauthorized\//,
    /^\/not-found\//,
  ]
};
