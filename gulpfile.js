const gulp = require('gulp'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', () => {
    return gulp.src('./sass/2-sections/*.sass')
               .pipe(sass({
                   includePaths: ['css'],
                   onError: sass.logError
               }))
               .pipe(autoprefixer({
                   browsers: ['last 2 versions'],
                   cascade: false
               }))
               .pipe(gulp.dest('public/css'));
});

gulp.task('default', ['sass']);

gulp.task('watch', () => {
    gulp.watch('./sass/2-sections/*.sass', ['sass']);
});