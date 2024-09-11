export const workboxConfig = {
  globDirectory: "src/",
  globIgnores: [
    'index.html',
  ],
  globPatterns: [
    'manifest.json',
    'version.json',
    'src/**/*',
    'node_modules/**/*',
    'assets/**/*'
  ],
  swDest: "src/service-worker.js",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'StaleWhileRevalidate'
    }
  ]
};
