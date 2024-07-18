var express = require('express'); // eslint-disable-line
var browserCapabilities = require('browser-capabilities'); // eslint-disable-line
const UAParser = require('ua-parser-js').UAParser; // eslint-disable-line

const app = express();
const basedir = __dirname + '/src/'; // eslint-disable-line

function getSourcesPath(request) {
  const userAgent = request.headers['user-agent'];
  let clientCapabilities = browserCapabilities.browserCapabilities(userAgent);
  const isEdge = (new UAParser(userAgent).getBrowser().name || '') === 'Edge';

  clientCapabilities = new Set(clientCapabilities); // eslint-disable-line
  if (clientCapabilities.has('modules')) {
    return basedir;
  } else {
    if (isEdge) {
      return basedir;
    } else {
      return basedir;
    }
  }
}

app.use('/ip/', (req, res, next) => {
  express.static(getSourcesPath(req))(req, res, next);
});

app.get(/.*service-worker\.js/, function (req, res) {
  res.sendFile(getSourcesPath(req) + 'service-worker.js');
});

app.use((req, res) => {
  // handles app access using a different state path than index (otherwise it will not return any file)
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  res.sendFile(getSourcesPath(req, 'index.html'));
});

app.listen(8082);
