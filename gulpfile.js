'use strict';
var gulp = require('gulp'),
  connect = require('connect'),
  livereload = require('gulp-livereload'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  less = require('gulp-less'),
  rubySass = require('gulp-ruby-sass'),
  plumber = require('gulp-plumber'),
  autoprefixer = require('gulp-autoprefixer'),
  cache = require('gulp-cache'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  minifyHtml = require('gulp-minify-html'),
  size = require('gulp-size'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index');

var exec = require('child_process').exec;

/* browserify */ 
gulp.task('browserify', function() {
  var sourceFile = './public/scripts/main.js',
    destFolder = './public/scripts/browserify/',
    destFile = 'main.js';

  var bundler = browserify({
    entries: sourceFile,
    cache: {}, packageCache: {}, fullPaths: true, debug: true
  });

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', function (err) {
        console.log(err);
      })
      .pipe(source(destFile))
      .pipe(gulp.dest(destFolder));
  };

  if(global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }
  return bundle();
});

/* styles */
gulp.task('styles', function () {
  return rubySass('public/styles/main.scss', { style: 'expanded' })
    .pipe(gulp.dest('public/styles/'));
});

/* js hint */
gulp.task('jshint', function () {
  return gulp.src('public/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/* extras */
gulp.task('extras', function () {
  return gulp.src([
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

/* connect */
gulp.task('connect', ['styles'], function () {
  var public_client = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('public'))
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('public'));

  require('http').createServer(public_client)
    .listen(3000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:3000');
    });
});

/* serve */
gulp.task('serve', ['watch'], function () {
    gulp.start('browserify');  
});

gulp.task('rails', function() {
  // exec('rails server');
});
 
gulp.task('serve:full-stack', ['rails', 'serve']);

/* copy bower components */
gulp.task('bower', function () {
  var paths = {
    js: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/mithril/mithril.min.js'
    ]
  }

  gulp.src(paths.js)
    .pipe(gulp.dest('public/scripts'));
});

/* watch */
gulp.task('watch', ['connect', 'bower'], function () {
  livereload.listen();

  gulp.watch([
    'public/*.html',
    'public/styles/**/*.css',
    'public/scripts/**/*.js'
  ]).on('change', livereload.changed);
  
    gulp.watch('public/styles/**/*.scss', ['styles']); 

    gulp.watch('public/scripts/**/*.js', ['browserify']);
});

/* build */
gulp.task('build', ['styles','extras', 'bower'], function () {
  gulp.start('browserify');

  /* public */
  gulp.src('public/**/*')
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'build', gzip: true}));

  /* html */
  var opts = {comments:true,spare:true, quotes: true};
  gulp.src('dist/*.html')
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('dist'));    
});

/* default */
gulp.task('default', function () {
  gulp.start('serve');
});