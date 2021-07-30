/**
 * Util
 */

// Node
const { readdirSync } = require( 'fs' );
const { basename, extname, join } = require( 'path' );

// External
const c = require( 'ansi-colors' );
const log = require( 'fancy-log' );
const merge = require( 'merge-deep' );
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
 * @returns {array} Array of task tulpes [taskname, taskFn] ordered by priority.
 */
const loadTasks = ( gulp, config = {} ) => {
	// get files from tasks folder
	return (
		readdirSync( join( __dirname, '..', 'tasks' ) )
			// get only js files
			.filter( ( file ) => extname( file ) === '.js' )
			// create a tasks object and initialize each task function with config
			.reduce( ( acc, file ) => {
				const taskName = basename( file, '.js' );
				const taskInfo = require( `../tasks/${ taskName }` );

				if (
					taskInfo.hasOwnProperty( 'task' ) &&
					typeof taskInfo.task === 'function'
				) {
					const taskConfig = merge(
						taskInfo?.config || {},
						config[ taskName ] || {}
					);

					acc[ taskName ] = taskInfo.task( gulp, taskConfig );
				} else {
					throw new Error(
						`Task file "${ taskName }" has no task property or the task prop is not a function.`
					);
				}

				return acc;
			}, {} )
	);
};

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
