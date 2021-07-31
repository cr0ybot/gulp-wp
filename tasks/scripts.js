/**
 * Task: scripts
 */

// External
const dependents = require( 'gulp-dependents' );
const logFiles = require( 'gulp-debug' );
const named = require( 'vinyl-named' );
const filter = require( 'gulp-filter' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const wpWebpackConfig = require( '@wordpress/scripts/config/webpack.config' );

// Internal
const { dependentsConfig, handleStreamError } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		const srcFiles = `${ src }/**/*.*`;
		includePaths.push( src );

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

			return gulp
				.src( srcFiles, { since: gulp.lastRun( scripts ) } )
				.pipe( handleStreamError( 'scripts' ) )
				.pipe( dependents( dependentsConfig, { logDependents: true } ) )
				.pipe( filterEntries )
				.pipe( logFiles( { title: 'script entry:' } ) )
				.pipe( named() )
				.pipe(
					webpackStream( webpackConfig, webpack, ( err, stats ) => {
						if ( err ) {
							console.error( err );
							done();
						}
					} )
				)
				.pipe( gulp.dest( dest ) );
		};
	},
	config: {
		src: 'src/scripts',
		dest: 'dist/js',
		entries: 'src/scripts/*.*',
		includePaths: [ 'node_modules' ],
	},
};
