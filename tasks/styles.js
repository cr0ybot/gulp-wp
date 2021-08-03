/**
 * Task: styles
 */

// External
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const dependents = require( 'gulp-dependents' );
const filter = require( 'gulp-filter' );
const postcss = require( 'gulp-postcss' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const sassGlob = require( 'gulp-sass-glob' );

// Internal
const { dependentsConfig, handleStreamError, logFiles } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		const srcFiles = `${ src }/**/*.*`;

		return function styles() {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			const filterEntries = filter( entries );

			return gulp
				.src( srcFiles, {
					sourcemaps: true,
					since: gulp.lastRun( styles ),
				} )
				.pipe( handleStreamError( 'styles' ) )
				.pipe( sassFilter )
				.pipe( sassGlob() ) // transform glob imports
				.pipe( dependents( dependentsConfig, { logDependents: true } ) )
				.pipe( filterEntries )
				.pipe( logFiles( { task: 'styles', title: 'entry:' } ) )
				.pipe(
					sass.sync( {
						includePaths,
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
				.pipe( gulp.dest( dest, { sourcemaps: '.' } ) );
		};
	},
	config: {
		src: 'src/styles',
		dest: 'dist/css',
		entries: 'src/styles/*.*',
		includePaths: [ 'node_modules' ],
	},
};
