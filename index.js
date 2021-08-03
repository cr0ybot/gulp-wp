/**
 * Gulp WP
 */

// Load .env file
const env = require( 'dotenv' ).config();
if ( process.env.NOTIFY === 'false' ) {
	process.env.DISABLE_NOTIFIER = true;
}

// Internal
const GulpWPRegistry = require( './lib/registry' );
const { getPluginFile, isTheme, loadConfig, loadTasks } = require( './util' );

module.exports = ( gulp, config = {} ) => {
	const localConfig = loadConfig();
	config = Object.assign( {}, localConfig, config );

	// Add env explicitly so that it can't be set via config
	config.env = {
		DEV_URL: 'http://localhost',
		...env.parsed,
	};

	// If `plugin` not specified in config, check for style.css and then for a plugin entry point
	if ( ! config.plugin ) {
		if ( ! isTheme() ) {
			config.plugin = getPluginFile();
		}
	}

	const tasks = loadTasks();

	// Register our custom registry
	const gulpWP = new GulpWPRegistry( gulp, tasks, config );
	gulp.registry( gulpWP );

	return gulpWP;
};
