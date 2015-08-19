var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var gulpzip = require('gulp-zip');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var fs = require('fs');

function make_browserify_task (task, config, sources, target) {
    var opts = {
        cache: {},
        packageCache: {},
        debug: true,
        entries: sources
    };
    if (config.watchify) {
        var b = watchify(browserify(opts));
    } else {
        b = browserify(opts);
    }
    if (config.buildConfig) {
        var buildConfig = fs.readFileSync(config.buildConfig, 'utf8');
    } else {
        buildConfig = '';
    }
    function bundle () {
        if (config.uglify) {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
                .pipe(replace(/^\/\/\s*@BUILDCONFIG@.*$/m, buildConfig))
                .pipe(replace(/^\/\/\s*@BUILDTIME@.*$/m, 'buildConfig.buildTime = "' + Date() + '";'))
                .pipe(uglify())
                .pipe(gulp.dest('js/'));
        } else {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
                .pipe(replace(/^\/\/\s*@BUILDCONFIG@.*$/m, buildConfig))
                .pipe(replace(/^\/\/\s*@BUILDTIME@.*$/m, 'buildConfig.buildTime = "' + Date() + '";'))
                .pipe(gulp.dest('js/'));
        }
    }
    gulp.task(task, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);
}

make_browserify_task('watchify', {watchify: true}, ['src/client.js'], 'client.js');
make_browserify_task('browserify', {}, ['src/client.js'], 'client.js');
make_browserify_task('browserify-ugly', {uglify: true}, ['src/client.js'], 'client.js');

gulp.task('forceExit', function(cb) {
  // not sure why browserify isn't exiting...
  process.exit(0);
});

gulp.task('zip-eb', ['browserify-ugly'], function () {
    return gulp.src(['index.html', 'src/**', 'package.json', 'blockly.html', 'assets/**', 'lib/**', 'css/**', 'js/**', '.ebextensions/**'], {base: '.'})
        .pipe(gulpzip('web.zip'))
        .pipe(gulp.dest('deployments/'));
});

gulp.task('build', ['zip-eb']);

//
//gulp.task('build', function (callback) {
//  runSequence(
//    'browserify',
//    'forceExit',
//    function (error) {
//      if (error) {
//        console.log(error.message);
//      } else {
//        console.log('RELEASE FINISHED SUCCESSFULLY');
//      }
//      callback(error);
//    });
//});
