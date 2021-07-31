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
 * Global config used for all "instances" of gulp-dependents, because the first that runs sets the config for all.
 *
 * Custom JS parser: https://stackoverflow.com/a/66748484/900971
 */
const jsPostfixes = [ '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs' ];
const jsDependentsConfig = {
	postfixes: jsPostfixes,
	parserSteps: [
		/import(?:["'\s]*(?:[\w*${}\n\r\t, ]+)from\s*)?["'\s]*(.*[@\w_-]+)["'\s].*;?$/gm,
		function ( path ) {
			// Remove file extension, if any
			// TODO: insert postfixes dynamically?
			path = path.replace( /\.[js|jsx|ts|tsx|mjs|cjs]$/, '' );

			// Local packages
			paths = [ path, `${ path }/index` ];

			return paths;
		},
	],
	basePath: [ 'node_modules' ],
};
const dependentsConfig = {
	'.scss': {
		basePath: [ 'node_modules' ],
	},
};
for ( const ext of jsPostfixes ) {
	dependentsConfig[ ext ] = jsDependentsConfig;
}

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
	dependentsConfig,
	handleStreamError,
	loadTasks,
};
