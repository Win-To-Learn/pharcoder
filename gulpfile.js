var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var git = require('gulp-git');

function make_browserify_task (task, sources, target) {
    var opts = {
        cache: {},
        packageCache: {},
        debug: true,
        entries: sources
    };
    var b = watchify(browserify(opts));
    function bundle () {
        return b.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(target))
            .pipe(buffer())
            .pipe(gulp.dest('js/'));
    }
    gulp.task(task, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);
}

make_browserify_task('browserify', ['src/client.js'], 'client.js');

gulp.task('forceExit', function(cb) {
  // not sure why browserify isn't exiting...
  process.exit(0);
});

gulp.task('build', function (callback) {
  runSequence(
    'browserify',
    'forceExit',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY');
      }
      callback(error);
    });
});
