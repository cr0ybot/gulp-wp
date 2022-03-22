/**
 * Task: version
 */

// Node
const { basename, dirname, extname } = require( 'path' );

// External
const replace = require( 'gulp-replace' );

// Internal
const { c, getFileData, getPackageJSON, handleStreamError, log } = require( '../util' );

module.exports = {
	task: ( gulp, { src }, registry ) => {
		const dest =
			src === 'package.json'
				? registry.config.plugin || 'style.css'
				: 'package.json';

		function getVersion( filePath ) {
			const filename = basename( filePath );

			// Get version from package.json
			if ( filename === 'package.json' ) {
				// NOTE: can't just `require` package.json because successive calls will use a cached version
				const { version } = getPackageJSON();
				return Promise.resolve( version );
			}

			// Get version from file header
			if (
				filename === 'style.css' ||
				extname( filename ).toLowerCase === '.php'
			) {
				return getFileData( filePath ).then( ( { Version } ) => {
					return Version;
				} );
			}

			return Promise.reject();
		}

		return function version() {
			// Regular express based on filetype
			// Note that the part used to match the version is captured for the replacement as $1
			const regex =
				extname( dest ).toLowerCase() === '.json'
					? new RegExp( /("version"\s*:\s*")[^"]+/ )
					: new RegExp(
							/^((\s*?\*\s*?)?Version:\s*)[^\r\n]+?$/,
							'm'
					  );

			return getVersion( src ).then( ( version ) => {
				log.info(
					'Copying version',
					c.cyan( version ),
					'from',
					c.blue( src ),
					'to',
					c.blue( dest )
				);
				return gulp
					.src( dest ) // input file is actually dest file!
					.pipe( handleStreamError( 'version' ) )
					.pipe( replace( regex, `$1${ version }` ) )
					.pipe( gulp.dest( dirname( dest ) ) );
			} );
		};
	},
	config: {
		src: 'package.json',
	},
};
