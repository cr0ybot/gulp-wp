/**
 * Gulp WP
 */

// Load .env file
const env = require( 'dotenv' ).config();
if ( process.env.NOTIFY === 'false' ) {
	process.env.DISABLE_NOTIFIER = true;
}

const registry = require( './lib/registry' );

const { loadTasks } = require( './util' );

module.exports = ( gulp ) => {
	const tasks = loadTasks();

	console.log( 'found tasks', tasks );

	// TODO: load config (cosmicconfig?)
	/*
	{
		tasks: {
			syles: {
				src: '',
				dest: '',
			}
		}
	}
	*/

	// Register our custom registry
	gulp.registry( registry( tasks ) );

	// TODO: Is this useful? How to easily reuse/compose tasks?
	return {
		tasks,
	};
};
