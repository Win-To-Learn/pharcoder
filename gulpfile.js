var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var gulpzip = require('gulp-zip');
var uglify = require('gulp-uglify');
var del = require('del');
var shell = require('gulp-shell');
var argv = require('yargs').argv;

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
    function bundle () {
        if (config.uglify) {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
                .pipe(uglify())
                .pipe(gulp.dest('js/'));
        } else {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
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

gulp.task('updateServerUri', function(cb) {

});

gulp.task('build', ['updateServerUri', 'zip-eb']);

// run in series
gulp.task('android:build', ['android:clean', 'android:assemble', 'android:package']);

gulp.task('android:clean', function(cb) {
  return del([
    'android/org.starcoder.pharcoder/app/*.apk',
    'android/org.starcoder.pharcoder/app/**/*'
  ], cb);
});

gulp.task('android:assemble', ['android:clean'], function(cb) {
  return gulp
    .src(['manifest.json','index.html', 'blockly.html', 'icon.png', 'assets/**', 'css/**', 'js/**', 'lib/**', 'src/**'], {base: '.'})
    .pipe(gulp.dest('android/org.starcoder.pharcoder/app'), cb);
});

gulp.task('android:package', ['android:assemble'],
  shell.task([
    'crosswalk-app build ' + ((argv.release === undefined) ? 'debug' : 'release')
  ], {cwd: './android/org.starcoder.pharcoder'})
);

gulp.task('android:emulator',
  shell.task([
    'emulator ' + ((argv.name === undefined) ? '@Nexus' : argv.name)
  ])
);

gulp.task('android:install',
  shell.task([
    'adb install -r org.starcoder.pharcoder-debug.x86.apk'
  ], {cwd: './android/org.starcoder.pharcoder'})
);

gulp.task('exe', function(cb) {
  var nexe = require('nexe');
  nexe.compile({
    nodeVersion: '0.12.6',
    python: '/Users/dhyasama/Library/Python/2.7/lib/python/site-packages',
    input: './src/server.js',
    output: './build',
    nodeTempDir: './tmp/nexe',
    flags: false,
    framework: 'nodejs'
  }, function(err) {
    console.error(err);
  });
});
