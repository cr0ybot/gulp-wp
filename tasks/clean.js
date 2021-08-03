/**
 * Task: clean
 *
 * Clean build folders
 */

const c = require( 'ansi-colors' );
const del = require( 'del' );
const log = require( 'fancy-log' );

module.exports = {
	task: ( gulp, {}, registry ) => {
		// Depends on scripts and style tasks to be loaded, even if they aren't used directly
		const {
			tasks: { scripts, styles },
		} = registry.config;

		return function clean() {
			return del( [ scripts.dest, styles.dest ] ).then( ( paths ) => {
				for ( const path of paths ) {
					log.info( 'cleaned:', c.blue( path ) );
				}
			} );
		};
	},
	config: {},
	dependencies: [ 'scripts', 'styles' ],
};
