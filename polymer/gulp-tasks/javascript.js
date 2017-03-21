// Any processing of javascript should
// go in functions here

'use strict';

const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const jscs = require('gulp-jscs');
const jscsStylish = require('gulp-jscs-stylish');
const lazypipe = require('lazypipe'); // Lazy pipe creates a reusable pipe stream

// Minify Javascript
function minify() {
  return uglify({
    preserveComments: false
    // options
  });
}

// Lint Javascript
var lint = lazypipe()
  .pipe(jshint)
  .pipe(jscs)
  .pipe(jscsStylish.combineWithHintResults)
  .pipe(jshint.reporter, jshintStylish)
  // Option to have js linting fail on error
  .pipe(jshint.reporter, 'fail');

module.exports = {
  minify: minify,
  lint: lint
};
