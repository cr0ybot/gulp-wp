/**
 * Task: serve
 *
 * Proxy your WordPress install to inject style changes and reload scripts & PHP via BrowserSync
 */

// External
const bs = require( 'browser-sync' ).create( 'gulp-wp' );

// Internal
const { log } = require( '../util' );

module.exports = {
	task: ( gulp, {}, registry ) => {
		const {
			env: {
				DEV_URL,
				BROWSERSYNC_OPEN,
				BROWSERSYNC_BROWSER,
				BROWSERSYNC_NOTIFY,
			},
			tasks: { scripts, styles },
		} = registry.config;

		const { hostname } = new URL( DEV_URL );

		const bsConfig = {
			host: hostname,
			proxy: DEV_URL,
			files: [
				'**/*.php',
				`${ scripts.dest }/**/*.js`,
				`${ styles.dest }/**/*.css`,
			],
			ignore: [
				'node_modules/**/*',
				`${ scripts.dest }/**/*.php`,
				`${ styles.dest }/**/*.php`,
			],
			// Conditionally add bs env config
			open:
				BROWSERSYNC_OPEN ||
				( hostname === 'localhost' ? true : 'external' ),
			...( BROWSERSYNC_BROWSER && {
				browser: JSON.parse( BROWSERSYNC_BROWSER ),
			} ),
			...( BROWSERSYNC_NOTIFY && {
				notify: BROWSERSYNC_NOTIFY === 'true',
			} ),
		};

		return function serve( done ) {
			log.debug( 'BrowserSync config:', bsConfig );
			bs.init( bsConfig, done );
		};
	},
	dependencies: [ 'scripts', 'styles' ],
};
