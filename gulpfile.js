const gulp = require('gulp');

gulp.task('now:config', () => {
  return gulp
    .src(['_now/*'])
    .pipe(gulp.dest('dist/ang7-chat-graphcool'));
});

gulp.task('default', gulp.series(['now:config']));
