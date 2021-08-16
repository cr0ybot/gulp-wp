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
const jsonImporter = require( 'node-sass-json-importer' );

// Internal
const {
	assetFile,
	changed,
	dependentsConfig,
	handleStreamError,
	logFiles,
} = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		return function styles() {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			const filterEntries = filter( entries );

			return gulp
				.src( src, {
					sourcemaps: true,
				} )
				.pipe( handleStreamError( 'styles' ) )
				.pipe( changed( gulp.lastRun( styles ) ) )
				.pipe(
					logFiles( {
						logLevel: 'debug',
						task: 'styles',
						title: 'file:',
					} )
				)
				.pipe( sassGlob() ) // transform sass glob imports
				.pipe( dependents( dependentsConfig, { logDependents: true } ) )
				.pipe( filterEntries )
				.pipe( sassGlob() ) // again because dependents() pulls in the entry file
				.pipe( logFiles( { task: 'styles', title: 'entry:' } ) )
				.pipe( sassFilter )
				.pipe(
					sass.sync( {
						includePaths,
						indentType: 'tab',
						outputStype: 'expanded',
						importer: jsonImporter( {
							convertCase: true,
						} ),
					} )
				)
				.pipe( sassFilter.restore )
				.pipe( postcss( [ autoprefixer() ] ) )
				.pipe(
					cleanCSS( {
						level: 2,
					} )
				)
				.pipe( assetFile() )
				.pipe( gulp.dest( dest, { sourcemaps: '.' } ) );
		};
	},
	config: {
		src: 'src/styles/**/*.*',
		srcBase: 'src/styles', // for watch task to mirror deletions
		dest: 'dist/css',
		entries: 'src/styles/*.*',
		includePaths: [ 'node_modules' ],
	},
};
