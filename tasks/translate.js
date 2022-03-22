/**
 * Task: translate
 */

// Node
const { join } = require( 'path' );

// External
const sort = require( 'gulp-sort' );
const wpPot = require( 'gulp-wp-pot' );

// Internal
const { c, getFileData, handleStreamError, log, logFiles } = require( '../util' );

module.exports = {
	task: ( gulp, { src, dest }, registry ) => {
		return function translate() {
			const { plugin } = registry.config;
			const metadataFile = plugin !== undefined ? plugin : 'style.css';
			const packageName = plugin !== undefined ? 'Plugin Name' : 'Theme Name';

			return getFileData( metadataFile )
				.catch( ( err ) => {
					console.log(err);
					log.warn(
						c.yellow(
							'No metadata file found. Make sure you have a'
						),
						c.magenta( 'style.css' ),
						c.yellow( 'file with' ),
						c.cyan( 'Theme Name' ),
						c.yellow(
							'header field if your project is a theme or a main plugin file with the required'
						),
						c.cyan( 'Plugin Name' ),
						c.yellow( 'header field.' )
					);
					return {};
				} )
				.then( ( data ) => {
					const { ['Text Domain']: domain, [packageName]: package } = data;
					// Add metadataFile to src array
					if ( metadataFile ) {
						if ( Array.isArray( src ) ) {
							src.push( metadataFile );
						} else {
							src = [ src, metadataFile ];
						}
					}

					if ( ! package ) {
						log.warn(
							c.cyan( packageName ),
							c.yellow( 'not found.' )
						);
					} else {
						log.info(
							`${ c.cyan( packageName ) }:`,
							c.magenta( package )
						);
					}

					if ( ! domain ) {
						log.warn(
							c.cyan( 'Text Domain' ),
							c.yellow(
								'not found, all text domains will be included.'
							)
						);
					} else {
						log.info(
							`${ c.cyan( 'Text Domain' ) }:`,
							c.magenta( domain )
						);
					}

					return gulp
						.src( src )
						.pipe( handleStreamError( 'styles' ) )
						.pipe( sort() )
						.pipe(
							// TODO: wpPot config options
							wpPot( {
								domain,
								package,
								//bugReport: 'https://example.com',
								//lastTranslator: 'Your Name Here <you@example.com>',
								//team: 'Team Name Here <team@example.com>',
								metadataFile,
							} )
						)
						.pipe(
							gulp.dest(
								join(
									dest,
									`${ domain || 'translations' }.pot`
								)
							)
						)
						.pipe(
							logFiles( {
								task: 'translate',
								title: 'result:',
								showCount: false,
							} )
						);
				} );
		};
	},
	config: {
		src: [
			'**/*.php',
			'dist/**/*.{js,php}',
			'!node_modules/**/*',
			'!**/*.asset.php',
			'!src/**/*',
		],
		dest: 'languages',
	},
};
