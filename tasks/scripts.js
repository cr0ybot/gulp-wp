/**
 * Task: scripts
 */

// External
const destClean = require( 'gulp-dest-clean' );
const named = require( 'vinyl-named' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const wpWebpackConfig = require( '@wordpress/scripts/config/webpack.config' );

// Internal
const { handleStreamError, logEntries } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest } ) => {
		return function scripts() {
			const webpackConfig = {
				...wpWebpackConfig,
				devtool: 'source-map',
			};
			// Remove config props that may interfere with webpackStream
			delete webpackConfig[ 'entry' ];

			return (
				gulp
					.src( src, { sourcemaps: true } )
					.pipe( handleStreamError( 'styles' ) )
					//.pipe( logEntries( 'Script entries:' ) )
					.pipe( named() )
					.pipe( webpackStream( webpackConfig, webpack ) )
					.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
					.pipe( destClean( dest ) )
			);
		};
	},
	config: {
		src: 'src/scripts/*.*',
		dest: 'dist/js',
	},
};
