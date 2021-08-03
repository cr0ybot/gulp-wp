/**
 * Task: clean
 *
 * Clean build folders
 */

// External
const del = require( 'del' );

// Internal
const { c, log } = require( '../util' );

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
