/**
 * Task: styles
 */

const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );

module.exports = ( { src = 'src/styles/*', dest = 'dist/css' } = {} ) => {
	return function styles() {
		return gulp.src( src ).pipe( sass() ).pipe( gulp.dest( dest ) );
	};
};
