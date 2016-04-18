var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
    var files = [
        './pixelRenderer.js',
        './wiretypes.js',
        './game.js',
        './options.js',
        './title.js',
        './index.js'
    ];

    return gulp.src(files)
        .pipe(concat('game.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
    return gulp.src('*.png')
        .pipe(gulp.dest('dist'));
});

gulp.task('sounds', function () {
    return gulp.src('sounds/*.wav')
        .pipe(gulp.dest('dist/sounds'));
});

gulp.task('default', ['build', 'images', 'sounds']);
