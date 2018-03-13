
// This is where functions relevant to
// building a frontend app into eTools
// should go

'use strict';

const path = require('path');
const gulp = require('gulp');
const del = require('del');
const useref = require('gulp-useref');

var indexPath = '';
var bowerPath = '';
var templatePath = '';

// Configure the main eTools project paths
function config() {
  global.config.build.rootDirectory = path.join('./dist/assets/frontend/', global.config.appName);
  global.config.build.templateDirectory = path.join('./dist/templates/frontend/', global.config.appName);
  global.config.build.bundledDirectory = '.';
  indexPath = path.join(global.config.build.rootDirectory, 'index.html');
  bowerPath = path.join(global.config.build.rootDirectory, 'bower.json');
  templatePath = global.config.build.templateDirectory;
}

// Move index.html and bower.json to templates dir
var moveToTemplate = function() {
  return new Promise(resolve => {
    gulp.src([indexPath, bowerPath])
      .pipe(useref({ //replace imports paths
        etools: function (content, target) {
          //console.log(content.match(/href="(.*?)"/g));
        }
      }))
      .pipe(gulp.dest(templatePath))
      .on('end', resolve)
  });
}

// Delete index.html and bower.json from the assets dir
var deleteFromBase = function() {
  return del([indexPath, bowerPath], {force: true});
}

function buildTemplate() {
  return moveToTemplate().then(function() {
    return deleteFromBase();
  });
}

module.exports = {
  config: config,
  buildTemplate: buildTemplate
};
