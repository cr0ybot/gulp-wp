/**
 * Task: styles
 */

// External
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const dependents = require( 'gulp-dependents' );
const filter = require( 'gulp-filter' );
//const logFiles = require( 'gulp-debug' );
const postcss = require( 'gulp-postcss' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const sassGlob = require( 'gulp-sass-glob' );

// Internal
const { handleStreamError } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest, includePaths } ) => {
		const firstRun = Date.now();
		return function styles() {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			return (
				gulp
					.src( src, {
						sourcemaps: true,
						since: gulp.lastRun( styles ) || firstRun,
					} )
					.pipe( handleStreamError( 'styles' ) )
					//.pipe( logFiles( { title: 'style entry:' } ) )
					.pipe( sassFilter )
					.pipe( sassGlob() ) // transform glob imports
					.pipe(
						dependents(
							{
								'.scss': {
									basePath: includePaths,
								},
							},
							{ logDependents: true }
						)
					)
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
					.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
			);
		};
	},
	config: {
		src: 'src/styles/**/*.*', // Sass compiler will ignore partials as entries
		dest: 'dist/css',
		includePaths: [ 'node_modules' ],
	},
};
