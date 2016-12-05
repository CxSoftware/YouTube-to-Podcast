// Dependencies
const gulp = require ('gulp');
const babel = require ('gulp-babel');
const eslint = require ('gulp-eslint');
const lab = require ('gulp-lab');

// Constants
const BABEL_CONFIG = {
	presets: ['es2015', 'stage-3']
};
const LAB_CONFIG =
	'--verbose ' +
	'--sourcemaps ' +
	'--colors ' +
	'--leaks';

// Tasks
gulp.task ('lint', () =>
	gulp
		.src ('src/**/*.js')
		.pipe (eslint ())
		.pipe (eslint.format ())
		.pipe (eslint.failOnError()));

gulp.task ('build', ['lint'], () =>
	gulp
		.src ([
			'src/**/*.js',
			'!src/test/**'
		])
		.pipe (babel (BABEL_CONFIG))
		.pipe (gulp.dest ('dist')));

gulp.task ('build-tests', ['build'], () =>
	gulp
		.src ('src/test/**/*.js')
		.pipe (babel (BABEL_CONFIG))
		.pipe (gulp.dest ('test')));

gulp.task ('test', ['build-tests'], () =>
	gulp
		.src ('test')
		.pipe (lab (LAB_CONFIG)));

gulp.task ('default', ['test']);
