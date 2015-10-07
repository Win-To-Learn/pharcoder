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
var replace = require('gulp-replace');
var fs = require('fs');
var bump = require('gulp-bump');
var rename = require('gulp-rename');

function get_package_version() {
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return pkg.version;
}

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
        var serverUri = process.env.NODE_ENV == 'production' ? 'http://pharcoder-single-1.elasticbeanstalk.com:7610' : 'http://localhost:8080';
        if (config.uglify) {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
                .pipe(replace(/^\/\/\s*@BUILDCONFIG@.*$/m, buildConfig))
                .pipe(replace(/^\/\/\s*@BUILDVERSION@.*$/m, 'buildConfig.version = "' + get_package_version() + '";'))
                .pipe(replace(/^\/\/\s*@BUILDTIME@.*$/m, 'buildConfig.buildTime = "' + Date() + '";'))
                .pipe(replace('GULP_REPLACE_SERVER_URI', serverUri))
                .pipe(uglify())
                .pipe(gulp.dest('js/'));
        } else {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(target))
                .pipe(buffer())
                .pipe(replace(/^\/\/\s*@BUILDCONFIG@.*$/m, buildConfig))
                .pipe(replace(/^\/\/\s*@BUILDVERSION@.*$/m, 'buildConfig.version = "' + get_package_version() + '";'))
                .pipe(replace(/^\/\/\s*@BUILDTIME@.*$/m, 'buildConfig.buildTime = "' + Date() + '";'))
                .pipe(replace('GULP_REPLACE_SERVER_URI', serverUri))
                .pipe(gulp.dest('js/'));
        }
    }
    gulp.task(task, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);
}

make_browserify_task('watchify-client', {watchify: true}, ['src/client.js'], 'client.js');
make_browserify_task('watchify-frontend', {watchify: true}, ['src/frontend/Frontend.js'], 'frontend.js');
make_browserify_task('browserify', {}, ['src/client.js'], 'client.js');
make_browserify_task('browserify-ugly', {uglify: true}, ['src/client.js'], 'client.js');
make_browserify_task('browserify-frontend-ugly', {uglify: true}, ['src/frontend/Frontend.js'], 'frontend.js');

gulp.task('bump-patch', function () {
    gulp.src('./package.json')
        .pipe(bump({type: 'patch'}))
        .pipe(gulp.dest('.'));
});

gulp.task('bump-minor', function () {
    gulp.src('./package.json')
        .pipe(bump({type: 'minor'}))
        .pipe(gulp.dest('.'));
});

gulp.task('bump-major', function () {
    gulp.src('./package.json')
        .pipe(bump({type: 'major'}))
        .pipe(gulp.dest('.'));
});

gulp.task('watchify', ['watchify-client', 'watchify-frontend']);

gulp.task('forceExit', function(cb) {
  // not sure why browserify isn't exiting...
  process.exit(0);
});

gulp.task('zip-eb', ['browserify-ugly', 'browserify-frontend-ugly'], function () {
    return gulp.src(['src/server.js', 'src/server/**', 'src/common/**', 'src/schema/**', 'package.json', 'assets/**',
        'lib/**', 'css/**', 'js/**', '.ebextensions/**', 'html/**'], {base: '.'})
        //.pipe(rename(function (path) {
        //    console.log('NN', path.dirname, path.basename);
        //}))
        .pipe(gulpzip('web.zip'))
        .pipe(gulp.dest('deployments/'));
});

gulp.task('updateServerUri', function(cb) {

});

gulp.task('build-bump', ['bump-patch', 'updateServerUri', 'zip-eb']);
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
    'crosswalk-app build ' + 'release'
  ], {cwd: './android/org.starcoder.pharcoder'})
);

//gulp.task('android:package', ['android:assemble'],
//  shell.task([
//    'crosswalk-app build ' + ((argv.release === undefined) ? 'debug' : 'release')
//  ], {cwd: './android/org.starcoder.pharcoder'})
//);

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

gulp.task('android:zipalign',
  shell.task([
    './zipalign -f 4 ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned.x86.apk  ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.x86.apk',
    './zipalign -f 4 ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned.armeabi-v7a.apk  ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.armeabi-v7a.apk'
  ], {cwd: './android'})
);

gulp.task('android:sign',
  shell.task([
    'jarsigner -verbose -keystore ./org.starcoder.pharcoder/pharcoder.keystore -storepass Asteroids71 -keypass Asteroids71 ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.armeabi-v7a.apk pharcoder',
    'mv ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.armeabi-v7a.apk ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-signed-zipaligned.armeabi-v7a.apk',
    'jarsigner -verbose -keystore ./org.starcoder.pharcoder/pharcoder.keystore -storepass Asteroids71 -keypass Asteroids71 ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.x86.apk pharcoder',
    'mv ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-unsigned-zipaligned.x86.apk ./org.starcoder.pharcoder/org.starcoder.pharcoder-release-signed-zipaligned.x86.apk',
  ], {cwd: './android'})
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
