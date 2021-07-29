/**
 * Util
 */

const { readdirSync } = require( 'fs' );
const { basename, extname, join } = require( 'path' );
const c = require( 'ansi-colors' );
const log = require( 'fancy-log' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const print = require( 'gulp-print' ).default;
const subpipe = require( 'subpipe' );

c.enabled = require( 'color-support' ).hasBasic;
notify.logLevel( 0 );

/**
 * Handle stream errors without stopping the entire workflow.
 *
 * @function
 * @returns {stream}
 */
const handleStreamError = ( task ) => {
	return plumber( {
		// NOTE: can't be arrow function
		errorHandler: function ( err ) {
			// Separate simplifier message for notification
			let notifyErr = err;

			// Checks for PluginError object and reformat
			if ( err.plugin && err.name && err.message ) {
				notifyErr = err.message;
				err = `${ c.red( err.name ) } in plugin "${ c.cyan(
					err.plugin
				) }"\n${ c.red( err.message ) }`;
			}

			log.error( err );
			notify( {
				title: `Error in '${ task }' task`,
				sound: process.env.NOTIFY || true,
			} ).write( notifyErr );

			this.emit( 'end' );
		},
	} );
};

/**
 * Stop handling stream errors.
 *
 * @function
 * @returns {function}
 */
handleStreamError.stop = () => {
	return plumber.stop();
};

/**
 * Load predefined tasks.
 *
 * @function
 * @returns {object} Tasks object
 */
const loadTasks = () =>
	readdirSync( join( __dirname, '..', 'tasks' ) )
		.filter( ( file ) => extname( file ) === '.js' )
		.reduce( ( acc, file ) => {
			const taskName = basename( file, '.js' );
			acc[ taskName ] = require( `../tasks/${ taskName }` );
			return acc;
		}, {} );

/**
 * Logs files in the stream with a title.
 *
 * @function
 * @returns {stream}
 */
const logEntries = ( title = 'Entries:' ) => {
	log( title );

	return subpipe( ( stream ) => stream.pipe( print() ) );
};

module.exports = {
	handleStreamError,
	loadTasks,
	logEntries,
};
