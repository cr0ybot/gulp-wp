/**
 * Gulp WP
 */

const registry = require( './lib/registry' );

const { loadTasks } = require( './util' );

// Load .env file
require( 'dotenv' ).config();

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

	return {
		tasks,
	};
};
