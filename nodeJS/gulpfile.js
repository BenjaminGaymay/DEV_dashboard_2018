const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');

const cssFiles = {
    in: './scss/**/*.scss',
    dir: './public/css',
    file: 'style.css',
};

gulp.task('sass', () =>
    gulp.src(cssFiles.in)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename(cssFiles.file))
        .pipe(gulp.dest(cssFiles.dir))
);

gulp.task('sass:watch', () =>
    gulp.watch(cssFiles.in, ['sass'])
);