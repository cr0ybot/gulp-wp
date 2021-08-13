/**
 * Gulp WP
 */

// Load .env file
const env = require( 'dotenv' ).config();
if ( process.env.NOTIFY === 'false' ) {
	process.env.DISABLE_NOTIFIER = true;
}

// Node
const { resolve } = require( 'path' );

// Internal
const GulpWPRegistry = require( './lib/registry' );
const {
	c,
	getPluginFile,
	isTheme,
	loadConfig,
	loadTasks,
	log,
} = require( './util' );

function init( gulp, config = {} ) {
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

	// Load local tasks first so we can ignore tasks meant to be overridden
	const localTaskFolder = config.taskFolder || 'gulp-wp';
	log.debug( 'Loading local tasks from', c.blue( localTaskFolder ) );
	const localTasks = loadTasks( localTaskFolder );
	log.debug(
		'Loaded local tasks:',
		c.cyan( Object.keys( localTasks ).join( ' ' ) )
	);

	// Load Gulp WP default tasks
	const gulpWPTasks = loadTasks(
		resolve( __dirname, 'tasks' ),
		Object.keys( localTasks )
	);
	log.debug(
		'Loaded Gulp WP tasks:',
		c.cyan( Object.keys( gulpWPTasks ).join( ' ' ) )
	);

	const tasks = Object.assign( {}, gulpWPTasks, localTasks );

	// Register our custom registry
	const gulpWP = new GulpWPRegistry( gulp, tasks, config );
	gulp.registry( gulpWP );

	return gulpWP;
}

// Expose GulpWPRegistry for advanced use
init.GulpWPRegistry = GulpWPRegistry;

module.exports = init;
