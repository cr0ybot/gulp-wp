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
	const tasks = loadTasks( gulp, config );

	// Register our custom registry
	const gulpWP = registry( gulp, tasks );
	gulp.registry( gulpWP );

	return gulpWP;
};
