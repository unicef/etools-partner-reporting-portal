const express = require('express'); // eslint-disable-line
const compression = require('compression'); // eslint-disable-line
const browserCapabilities = require('browser-capabilities'); // eslint-disable-line
const UAParser = require('ua-parser-js').UAParser; // eslint-disable-line

const app = express();
const basedir = __dirname + '/src/'; // eslint-disable-line

function getSourcesPath(request, filePath = '') {
    const userAgent = request.headers['user-agent'];
    const clientCapabilities = browserCapabilities.browserCapabilities(userAgent);
    const browserName = new UAParser(userAgent).getBrowser().name || '';
    // skip Edge because browser-capabilities library is outdated
    const needToUpgrade = !clientCapabilities.has('modules') && browserName !== 'Edge';
    return needToUpgrade ? `${basedir}upgrade-browser.html` : `${basedir}${filePath}`;
}

app.use(compression());

app.use('/ip/', (req, res, next) => {
    express.static(getSourcesPath(req))(req, res, next);
});

app.get(/.*service-worker\.js/, (req, res) => {
    res.sendFile(getSourcesPath(req, 'service-worker.js'));
});

app.use((req, res) => {
    // handles app access using a different state path than index (otherwise it will not return any file)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.sendFile(getSourcesPath(req, 'index.html'));
});

app.listen(8082);
