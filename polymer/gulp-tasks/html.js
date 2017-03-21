// Any processing of html should
// go in functions here

'use strict';

const htmlmin = require('gulp-htmlmin');
const htmlhint = require('gulp-htmlhint');
const lazypipe = require('lazypipe'); // Lazy pipe creates a reusable pipe stream

// Minify HTML
function minify() {
  return htmlmin({
    // options
    caseSensitive: true,
  });
}

var htmlLintOptions = {
  // options
  'tag-pair': true,
  'doctype-first': false,
  'title-require': false,
  'attr-value-double-quotes': true,
  'attr-no-duplication': true,
  'id-unique': true
};

/**
 * Lint HTML
 *
 * use if you want to stop when there are errors .pipe(htmlhint.failReporter({ suppress: true }));
 */
var lint = lazypipe()
  .pipe(htmlhint, htmlLintOptions)
  .pipe(htmlhint.reporter, 'htmlhint-stylish')
  .pipe(htmlhint.failReporter, { suppress: true });

module.exports = {
  minify: minify,
  lint: lint
};
