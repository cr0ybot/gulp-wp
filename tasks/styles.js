/**
 * Task: styles
 */

// External
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const destClean = require( 'gulp-dest-clean' );
const filter = require( 'gulp-filter' );
const logFiles = require( 'gulp-debug' );
const postcss = require( 'gulp-postcss' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const sassGlob = require( 'gulp-sass-glob' );

// Internal
const { handleStreamError } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest } ) => {
		return function styles() {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			return gulp
				.src( src, { sourcemaps: true } )
				.pipe( handleStreamError( 'styles' ) )
				.pipe( logFiles( { title: 'style entry:' } ) )
				.pipe( sassFilter )
				.pipe( sassGlob() )
				.pipe(
					sass.sync( {
						includePaths: [ 'node_modules' ],
						indentType: 'tab',
						outputStype: 'expanded',
					} )
				)
				.pipe( sassFilter.restore )
				.pipe( postcss( [ autoprefixer() ] ) )
				.pipe(
					cleanCSS( {
						level: 2,
					} )
				)
				.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
				.pipe( destClean( dest ) );
		};
	},
	config: {
		src: 'src/styles/*.*',
		dest: 'dist/css',
		watch: 'src/styles/**/*.*',
	},
};
