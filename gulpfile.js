// Dependencies
const gulp = require ('gulp');
const babel = require ('gulp-babel');
const clean = require('gulp-clean');
const eslint = require ('gulp-eslint');

// Constants
const BABEL_CONFIG = {
	presets: ['es2015', 'stage-3']
};

// Tasks
gulp.task ('clean', () =>
	gulp
		.src ('dist', { read: false })
		.pipe (clean ()));

gulp.task ('lint', () =>
	gulp
		.src ('src/**/*.js')
		.pipe (eslint ())
		.pipe (eslint.format ())
		.pipe (eslint.failOnError()));

gulp.task ('build', ['lint', 'clean'], () =>
	gulp
		.src ([
			'src/**/*.js',
			'!src/test/**'
		])
		.pipe (babel (BABEL_CONFIG))
		.pipe (gulp.dest ('dist')));

gulp.task ('default', ['build']);
