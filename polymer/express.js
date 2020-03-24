var express = require('express');
var app = express();
var basedir = __dirname + '/build/prp/bundled/';

app.use('/', express.static(basedir));

app.get(/.*service-worker\.js/, function (req, res) {
  res.sendFile(basedir + 'service-worker.js');
});
app.use(function (req, res) {
  res.sendFile(basedir + 'index.html');
});

app.listen(8082);
