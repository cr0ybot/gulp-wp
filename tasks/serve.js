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

		const open = ( () => {
			if ( typeof BROWSERSYNC_OPEN === undefined ) {
				return hostname === 'localhost' ? true : 'external';
			} else if ( BROWSERSYNC_OPEN === 'false' ) {
				return false;
			}
			return BROWSERSYNC_OPEN;
		} )();

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
			open,
			// Conditionally add bs env config
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
