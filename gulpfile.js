var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var gzip = require('gulp-gzip');


gulp.task('css', () => {
  return gulp.src('src/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gzip())
    .pipe(gulp.dest('./public/dist'));
});