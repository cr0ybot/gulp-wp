/**
 * Util
 */

// Node
const { readdirSync } = require( 'fs' );
const { basename, extname, join } = require( 'path' );

// External
const c = require( 'ansi-colors' );
const log = require( 'fancy-log' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );

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
const loadTasks = () => {
	// get files from tasks folder
	return (
		readdirSync( join( __dirname, '..', 'tasks' ) )
			// get only js files
			.filter( ( file ) => extname( file ) === '.js' )
			// create a tasks object and initialize each task function with config
			.reduce( ( acc, file ) => {
				const taskName = basename( file, '.js' );
				const taskInfo = require( `../tasks/${ taskName }` );

				// Validate task function
				if (
					taskInfo.hasOwnProperty( 'task' ) &&
					typeof taskInfo.task === 'function'
				) {
					acc[ taskName ] = taskInfo;
				} else {
					throw new Error(
						`Task file "${ taskName }" has no task property, or the task prop is not a function.`
					);
				}

				return acc;
			}, {} )
	);
};

module.exports = {
	handleStreamError,
	loadTasks,
};
