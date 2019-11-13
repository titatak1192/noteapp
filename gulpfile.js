'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload');


    gulp.task('dev-server', ()=>{
        connect.server({
            root: '.',
            livereload: true
        });
    })

gulp.task('html', () => {
    return gulp.src('*.html')
        .pipe(livereload({ auto: true }))
});

gulp.task('scripts', ()=>{
    return gulp.src(['./app/*.js', './app/**/*.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest("./public/dist/"))
    .pipe(livereload({auto: true}));
})

gulp.task('watch', () => {
    livereload.listen({ auto: false });

    gulp.watch("*.html", gulp.parallel('html'));

    gulp.watch(['./app/*.js', './app/**/*.js'], gulp.parallel('scripts'))
});


gulp.task('default', gulp.parallel("dev-server", "watch"))