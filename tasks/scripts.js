/**
 * Task: scripts.
 */

// External
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const dedupe = require( 'gulp-dedupe' );
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
		return function scripts() {
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
				plugins: [
					// Remove the default CopyWebpackPlugin which will grab errant json and php files.
					...( wpWebpackConfig?.plugins || [] ).filter(
						( plugin ) => ! ( plugin instanceof CopyWebpackPlugin )
					),
				],
				devtool: 'source-map',
			};
			// Remove config props that may interfere with webpackStream.
			delete webpackConfig.entry;

			return (
				gulp
					.src( src )
					.pipe( handleStreamError( 'scripts' ) )
					// Filter out files that have not changed since last run.
					.pipe( changed( gulp.lastRun( scripts ) ) )
					// Find dependents for the changed files.
					.pipe(
						dependents( dependentsConfig, { logDependents: true } )
					)
					// Remove duplicate files.
					.pipe( dedupe() )
					// Filter out all but entrypoints.
					.pipe( filterEntries )
					.pipe( logFiles( { task: 'scripts', title: 'entry:' } ) )
					// Convert into named entrypoints for WebPack.
					.pipe( named() )
					// TODO: webpack errors are displayed twice.
					.pipe( webpackStream( webpackConfig, webpack ) )
					.pipe( gulp.dest( dest ) )
			);
		};
	},
	config: {
		src: 'src/scripts/**/*.*',
		srcBase: 'src/scripts', // For watch task to mirror deletions.
		dest: 'dist/js',
		entries: 'src/scripts/*.*',
		includePaths: [ 'node_modules' ],
	},
};
