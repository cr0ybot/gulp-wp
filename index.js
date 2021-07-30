/**
 * Gulp WP
 */

// Load .env file
const env = require( 'dotenv' ).config();
if ( process.env.NOTIFY === 'false' ) {
	process.env.DISABLE_NOTIFIER = true;
}

// Internal
const registry = require( './lib/registry' );
const { loadTasks } = require( './util' );

module.exports = ( gulp, config = {} ) => {
	// TODO: load local config file (gulp-wp.config.js?)
	config.env = {
		DEV_URL: 'http://localhost',
		...env.parsed,
	};

	const tasks = loadTasks();

	// Register our custom registry
	const gulpWP = registry( gulp, tasks, config );
	gulp.registry( gulpWP );

	return gulpWP;
};
