/**
 * Util
 */

// Node
const { createHash } = require( 'crypto' );
const {
	accessSync,
	closeSync,
	constants: fsConstants,
	openSync,
	readFileSync,
	readSync,
} = require( 'fs' );
const { basename, dirname, join, parse, resolve } = require( 'path' );
const { cwd } = require( 'process' );
const { promisify } = require( 'util' );

// External
const c = require( 'ansi-colors' );
const debug = require( 'gulp-debug' );
const { sync: glob } = require( 'glob' );
const log = require( 'gulplog' );
const { isMatch } = require( 'micromatch' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const through2 = require( 'through2' );
const toAbsGlob = require( 'to-absolute-glob' );
const Vinyl = require( 'vinyl' );
const wpGetFileData = require( '@martin-pettersson/wp-get-file-data' );

c.enabled = require( 'color-support' ).hasBasic;

notify.logLevel( 0 );

const assetFile = ( ignoreGlob = false ) => {
	function generateAssetFile( file, enc, cb ) {
		// Ignore glob
		ignoreGlob =
			typeof ignoreGlob === 'string' ? [ ignoreGlob ] : ignoreGlob;
		if (
			Array.isArray( ignoreGlob ) &&
			isMatch(
				file.path,
				ignoreGlob.map( ( g ) => toAbsGlob( g, { cwd: file.cwd } ) )
			)
		) {
			log.debug( 'asset file: ignoring', c.blue( file.path ) );
			return cb( null, file );
		}

		// Generate md5 hash from file contents
		const md5 = createHash( 'md5' );
		md5.update( file.contents, 'utf8' );
		const hash = md5.digest( 'hex' ).slice( 0, 32 );

		// Gather originating file info
		const base = dirname( file.path );
		const assetName = `${ parse( basename( file.path ) ).name }.asset.php`;
		const path = join( base, assetName );
		const contents = Buffer.from(
			`<?php return array('version' => '${ hash }', 'dependencies' => array());`
		);
		log.debug( 'asset file:', c.blue( path ) );
		// Create php file with md5 hash as version
		const asset = new Vinyl( {
			base,
			path,
			contents,
		} );
		this.push( asset );

		return cb( null, file );
	}
	return through2.obj( generateAssetFile );
};

/**
 * Filter out files that haven't changed since timestamp in a stream.
 *
 * Generally, you should pass gulp.lastRun( taskFn ) as the timestamp.
 * Based on a shortcoming of the gulp.src `since` option: https://github.com/gulpjs/vinyl-fs/issues/226
 *
 * @function
 * @param {number} timestamp Timestamp to check against file modification/creation times
 * @param {string|string[]} includeGlob Glob to include regardless of file timestamp
 */
const changed = ( timestamp, includeGlob = false ) => {
	function filterChanged( file, enc, cb ) {
		// Check for file match to include regardless of timestamp
		includeGlob =
			typeof includeGlob === 'string' ? [ includeGlob ] : includeGlob;
		if (
			Array.isArray( includeGlob ) &&
			isMatch(
				file.path,
				includeGlob.map( ( g ) => toAbsGlob( g, { cwd: file.cwd } ) )
			)
		) {
			log.debug( 'including unchanged file:', c.blue( file.path ) );
			return cb( null, file );
		}

		// Skip file if mtime or ctime is less than timestamp
		if (
			file.stat &&
			Math.max( file.stat.mtime, file.stat.ctime ) <= timestamp
		) {
			return cb();
		}

		return cb( null, file );
	}
	return through2.obj( filterChanged );
};

/**
 * Global config used for all "instances" of gulp-dependents, because the first that runs sets the config for all.
 *
 * Custom JS parser: https://stackoverflow.com/a/66748484/900971
 */
const jsPostfixes = [ '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs' ];
const jsDependentsConfig = {
	postfixes: jsPostfixes,
	parserSteps: [
		/(?:import|export)(?:["'\s]*(?:[\w*${}\n\r\t, ]+)from\s*)?["'\s]*(.*[@\w_-]+)["'\s].*;?$/gm,
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
 * Get WP file header data.
 *
 * @returns {object} File header data
 */
const getFileData = promisify( wpGetFileData.getFileData );

/**
 * Get the contents of package.json
 *
 * @returns {object} Contents of package.json
 */
const getPackageJSON = () => {
	// NOTE: can't just `require` package.json because successive calls will use a cached version
	return JSON.parse( readFileSync( resolve( cwd(), 'package.json' ) ) );
};

/**
 * Attempts to locate the main plugin file similar to how WordPress does, with a little extra help from `glob`.
 *
 * @function
 * @returns {string} Plugin file path
 */
const getPluginFile = () => {
	// get all php files in the root of the cwd
	const pluginFilePaths = glob( './*.php' );
	// for each file, check the first 8192 bytes for "Plugin Name"
	log.debug( 'Looking for main plugin file...' );
	for ( const path of pluginFilePaths ) {
		try {
			const header = Buffer.alloc( 8192 );
			const fd = openSync( path );
			readSync( fd, header );
			closeSync( fd );
			if ( header.indexOf( 'Plugin Name:' ) !== -1 ) {
				log.debug( 'Found main plugin file:', c.blue( path ) );
				return path;
			}
		} catch ( err ) {
			// Not this one...
		}
	}
	log.warn(
		c.yellow(
			'Not able to locate main plugin file. Make sure you include the required'
		),
		c.cyan( 'Plugin Name' ),
		c.yellow( 'field.' )
	);
	return null;
};

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
 * Checks if style.css exists.
 *
 * @function
 * @returns {boolean}
 */
const isTheme = () => {
	try {
		accessSync( 'style.css', fsConstants.R_OK );
		log.debug( 'Project is type', c.cyan( 'theme' ) );
		return true;
	} catch ( err ) {
		log.debug( 'Project is type', c.cyan( 'plugin' ) );
		return false;
	}
};

/**
 * Load local config file if it exists
 *
 * @function
 * @returns {object} Config object
 */
const loadConfig = () => {
	const configPath = join( cwd(), 'gulp-wp.config.js' );
	try {
		accessSync( configPath, fsConstants.R_OK );
		log.debug( 'Loading local config file', c.blue( configPath ) );
		return require( configPath );
	} catch ( err ) {
		log.debug( 'No local config file found' );
		return null;
	}
};

/**
 * Load tasks files from a directory.
 *
 * TODO: second parameter for ignore tasks array so that we can load local tasks first and skip loading the equivalent Gulp WP task
 *
 * @function
 * @param {string} dirPath Path to tasks folder
 * @returns {object} Object with tasks as properties
 */
const loadTasks = ( dirPath, ignore = [] ) => {
	if ( typeof dirPath !== 'string' ) {
		throw new Error( 'No path provided to loadTasks.' );
	}

	const taskFiles = glob( '*.js', { cwd: dirPath } );
	if ( taskFiles.length === 0 ) {
		return {};
	}
	return taskFiles.reduce( ( acc, file ) => {
		const taskName = basename( file, '.js' );

		// Skip if found in ignore list
		if ( ignore.includes( taskName ) ) {
			return acc;
		}

		const taskInfo = require( resolve( dirPath, taskName ) );

		// Validate task function exists
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
	}, {} );
};

/**
 * File logging utility
 */
const logFiles = ( options ) => {
	const { logLevel = 'info', task, title: desc } = options;
	const append = desc || 'files:';
	const title = `${ c.cyan( task ) } ${ append }`;
	options = Object.assign( {}, options, {
		title,
		logger: log[ logLevel ],
	} );
	return debug( options );
};

module.exports = {
	assetFile,
	c,
	changed,
	dependentsConfig,
	getFileData,
	getPackageJSON,
	getPluginFile,
	handleStreamError,
	isTheme,
	loadConfig,
	loadTasks,
	log,
	logFiles,
};
