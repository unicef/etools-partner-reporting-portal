/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const fancylog = require('fancy-log');
const argv = require('yargs').argv;
const jasmine = require('gulp-jasmine');
const cover = require('gulp-coverage');

// Got problems? Try logging 'em
// use -l to activate plylogs
if (argv.l) {
    const logging = require('plylog');
    logging.setVerbose();
};

// !!! IMPORTANT !!! //
// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
    // Name of your app
    appName: 'app',
    polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
    build: {
        rootDirectory: 'build/prp',
        bundledDirectory: 'bundled',
        unbundledDirectory: 'unbundled',
        // Accepts either 'bundled', 'unbundled', or 'both'
        // A bundled version will be vulcanized and sharded. An unbundled version
        // will not have its files combined (this is for projects using HTTP/2
        // server push). Using the 'both' option will create two output projects,
        // one for bundled and one for unbundled
        bundleType: 'bundled' // We will only be using a bundled build
    },
    // Path to your service worker, relative to the build root directory
    serviceWorkerPath: 'service-worker.js',
    // Service Worker precache options based on
    // https://github.com/GoogleChrome/sw-precache#options-parameter
    swPrecacheConfig: {
        replacePrefix: '/app/',
        navigateFallback: '/index.html',
        navigateFallbackWhitelist: [
            /^\/app\//,
            /^\/landing\//,
            /^\/unauthorized\//,
            /^\/not-found\//,
        ],
    },
    sourceCodeDirectory: './src'
};

// Change global config if building into eTools
const etoolsBuild = require('./gulp-tasks/etoolsBuild.js');
if (argv._[0] === 'fullBuild') {
    etoolsBuild.config();
}

// Add your own custom gulp tasks to the gulp-tasks directory
// A few sample tasks are provided for you
// A task should return either a WriteableStream or a Promise
const clean = require('./gulp-tasks/clean.js');
const images = require('./gulp-tasks/images.js'); //Any processing on images
const javascript = require('./gulp-tasks/javascript.js'); //Any processing on javascript
const html = require('./gulp-tasks/html.js'); //Any processing on html
const css = require('./gulp-tasks/css.js'); //Any processing on css
const project = require('./gulp-tasks/project.js');

// Log task end messages
var log = function(message) {
    return function() {
        fancylog(message);
    };
};

// The source task will split all of your source files into one
// big ReadableStream. Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json.
// Because most HTML Imports contain inline CSS and JS, those inline resources
// will be split out into temporary files. You can use gulpif to filter files
// out of the stream and run them through specific tasks. An example is provided
// which filters all images and runs them through imagemin

function source() {
    return project.splitSource()
        // Add your own build tasks here!
        .pipe(gulpif('**/*.html', html.lint())).on('end', log('Linted HTML'))
        .pipe(gulpif('**/*.html', html.minify())).on('end', log('Minified HTML'))

    // lint CSS not working correctly. Not seeing temporary css files
    // .pipe(gulpif('**/*.{css,html}', css.lint()))              .on('end', log('Linted CSS'))
    .pipe(gulpif('**/*.{html,css}', css.minify())).on('end', log('Minified CSS'))

    .pipe(gulpif('**/*.js', javascript.lint())).on('end', log('Linted Javascript'))
        .pipe(gulpif('**/*.js', javascript.minify())).on('end', log('Minified Javascript'))

    // .pipe(gulpif('**/*.{png,gif,jpg,svg}', images.minify())).on('end', log('Minified Images'))

    .pipe(project.rejoin()); // Call rejoin when you're finished
}

// The dependencies task will split all of your bower_components files into one
// big ReadableStream
// You probably don't need to do anything to your dependencies but it's here in
// case you need it :)
function dependencies() {
    return project.splitDependencies()
        .pipe(project.rejoin());
}

// Run tests!
gulp.task('specs', function() {
    return gulp.src('test/unit/*.js')
        .pipe(cover.instrument({
            pattern: ['src/*/*/js/*.js']
        }))
        // gulp-jasmine works on filepaths so you can't have any plugins before it
        .pipe(jasmine())
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(gulp.dest('test/reports'));
});

gulp.task('watch', function() {
    gulp.watch('test/unit/**.js', {ignoreInitial: false}, gulp.series('specs'));
});

// Clean the build directory, split all source and dependency files into streams
// and process them, and output bundled and unbundled versions of the project
// with their own service workers

// By default: just lint and minify
// No building into eTools
// hint: good for testing build efficiency
gulp.task('default', gulp.series([
    clean.build,
    project.merge(source, dependencies),
    project.serviceWorker
]));

// DO NOT RUN
// Fully builds project
// Minifying, linting, and building into eTools
// TODO: This task is on hold
gulp.task('fullBuild', gulp.series([
    clean.fullBuild,
    project.merge(source, dependencies),
    project.serviceWorker,
    etoolsBuild.buildTemplate
]));
