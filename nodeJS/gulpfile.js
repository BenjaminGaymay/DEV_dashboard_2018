const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');

const cssFiles = {
    in: './scss/main.scss',
    dir: './public/css',
    file: 'style.css',
};

gulp.task('sass', () =>
    gulp.src(cssFiles.in)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename(cssFiles.file))
        .pipe(gulp.dest(cssFiles.dir))
);

gulp.task('sass:watch', () => gulp.watch(cssFiles.in, gulp.series('sass')));