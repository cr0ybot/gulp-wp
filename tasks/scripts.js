/**
 * Task: scripts
 */

// External
const dependents = require( 'gulp-dependents' );
const named = require( 'vinyl-named' );
const filter = require( 'gulp-filter' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const wpWebpackConfig = require( '@wordpress/scripts/config/webpack.config' );

// Internal
const {
	changed,
	dependentsConfig,
	handleStreamError,
	logFiles,
} = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		return function scripts( done ) {
			const filterEntries = filter( entries );

			const webpackConfig = {
				...wpWebpackConfig,
				resolve: {
					...wpWebpackConfig.resolve,
					modules: [
						...( wpWebpackConfig.resolve?.modules || [] ),
						...includePaths,
					],
				},
				devtool: 'source-map',
			};
			// Remove config props that may interfere with webpackStream
			delete webpackConfig[ 'entry' ];

			return (
				gulp
					.src( src )
					.pipe( handleStreamError( 'scripts' ) )
					.pipe( changed( gulp.lastRun( scripts ) ) )
					.pipe(
						dependents( dependentsConfig, { logDependents: true } )
					)
					.pipe( filterEntries )
					.pipe( logFiles( { task: 'scripts', title: 'entry:' } ) )
					.pipe( named() )
					// TODO: webpack errors are displayed twice
					.pipe( webpackStream( webpackConfig, webpack ) )
					.pipe( gulp.dest( dest ) )
			);
		};
	},
	config: {
		src: 'src/scripts/**/*.*',
		srcBase: 'src/scripts', // for watch task to mirror deletions
		dest: 'dist/js',
		entries: 'src/scripts/*.*',
		includePaths: [ 'node_modules' ],
	},
};
