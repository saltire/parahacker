var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {
    return gulp.src(['./src/js/*.js', './src/index.js'])
        .pipe(concat('game.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('images', function () {
    return gulp.src('./src/img/*.png')
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('sounds', function () {
    return gulp.src('./src/sounds/*.wav')
        .pipe(gulp.dest('./dist/sounds'));
});

gulp.task('default', ['html', 'js', 'images', 'sounds']);
