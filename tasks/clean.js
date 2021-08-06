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
	task: ( gulp, { cleanDest }, registry ) => {
		const { tasks } = registry.config;

		const delGlobs = cleanDest.map( ( task ) => tasks[ task ].dest );

		return function clean() {
			log.debug(
				'Cleaning',
				c.cyan( 'dest' ),
				'of',
				cleanDest.map( ( task ) => c.cyan( task ) ).join( ', ' )
			);
			return del( delGlobs ).then( ( paths ) => {
				for ( const path of paths ) {
					log.info( 'cleaned:', c.blue( path ) );
				}
			} );
		};
	},
	config: {
		cleanDest: [ 'scripts', 'styles' ],
	},
	dependencies: ( { cleanDest } ) => {
		return cleanDest || [];
	},
};
