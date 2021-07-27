/**
 * Util
 */

const { readdirSync } = require( 'fs' );
const { basename, extname, join } = require( 'path' );
const log = require( 'fancy-log' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const print = require( 'gulp-print' ).default;
const subpipe = require( 'subpipe' );

/**
 * Handle stream errors without stopping the entire workflow.
 *
 * @function
 * @returns {plumber}
 */
const handleStreamError = ( task ) => {
	return plumber( {
		errorHandler: notify.onError( {
			title: `Error in '${ task }' task`,
			sound: true,
		} ),
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
