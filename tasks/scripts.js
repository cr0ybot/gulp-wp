/**
 * Task: scripts
 */

// External
const destClean = require( 'gulp-dest-clean' );
const logFiles = require( 'gulp-debug' );
const named = require( 'vinyl-named' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const wpWebpackConfig = require( '@wordpress/scripts/config/webpack.config' );

// Internal
const { handleStreamError } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest } ) => {
		return function scripts() {
			const webpackConfig = {
				...wpWebpackConfig,
				devtool: 'source-map',
			};
			// Remove config props that may interfere with webpackStream
			delete webpackConfig[ 'entry' ];

			return gulp
				.src( src, { sourcemaps: true } )
				.pipe( handleStreamError( 'styles' ) )
				.pipe( logFiles( { title: 'script entry:' } ) )
				.pipe( named() )
				.pipe( webpackStream( webpackConfig, webpack ) )
				.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
				.pipe( destClean( dest ) );
		};
	},
	config: {
		src: 'src/scripts/*.*',
		dest: 'dist/js',
		watch: 'src/scripts/**/*.*',
	},
};
