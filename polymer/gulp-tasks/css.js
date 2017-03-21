// Any processing of css should
// go in functions here

'use strict';

const csslint = require('gulp-csslint');
const cssSlam = require('css-slam').gulp;
const lazypipe = require('lazypipe'); // Lazy pipe creates a reusable pipe stream

// Minify CSS
function minify() {
  return cssSlam();
}

/**
 * Lint CSS
 *
 * TODO: consider using csslint-stylish to display css errors .pipe(gulpCssLint.formatter(require('csslint-stylish')))
 * csslint-stylish ... cannot be installed at the moment, some npm issue...
 *
 * .pipe(gulpCssLint.formatter('fail')); // Fail on error
 */

var lint = lazypipe()
  .pipe(csslint, {
    // options
    'shorthand': false
  })
  .pipe(csslint.formatter);

module.exports = {
  minify: minify,
  lint: lint
};
