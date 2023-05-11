/**
 * Task: styles
 */

// External
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const filter = require( 'gulp-filter' );
const glob = require( 'glob' );
const postcss = require( 'gulp-postcss' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const sassGlob = require( 'gulp-sass-glob-use-forward' );
const sassGlobLegacy = require( 'gulp-sass-glob' );
const jsonImporter = require( 'node-sass-json-importer' );

// Internal
const {
	assetFile,
	c,
	getPackageJSON,
	handleStreamError,
	logFiles,
	log,
} = require( '../util' );

// Possible postcss config file names.
const postcssConfigFiles = [
	'.postcssrc',
	'.postcssrc.json',
	'.postcssrc.yml',
	'.postcssrc.js',
	'postcss.config.js',
];

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		return function styles( done ) {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			const filterEntries = filter( entries );
			const filterStyles = filter( '*.[c|sa|sc]ss' );

			// Check for postcss config in local package.json
			const { postcss: postcssPackageConfig } = getPackageJSON();
			// Check for postcss config file in local directory
			const postcssFileConfig = glob.sync(
				`@(${ postcssConfigFiles.join( '|' ) })`,
				{ dot: true }
			);
			const hasPostcssConfig =
				typeof postcssPackageConfig !== 'undefined' ||
				postcssFileConfig.length > 0;

			if ( hasPostcssConfig ) {
				log.debug(
					'PostCSS config found:',
					( typeof postcssPackageConfig !== 'undefined' &&
						c.blue( 'package.json' ) ) ||
						c.blue( postcssFileConfig.join( ', ' ) )
				);
			} else {
				log.debug( 'No local PostCSS config found.' );
			}

			return (
				gulp
					.src( src, {
						sourcemaps: true,
					} )
					.pipe( handleStreamError( 'styles' ) )
					// Transform sass glob @import.
					.pipe( sassGlobLegacy() )
					// Transform sass glob @use/@forward.
					.pipe( sassGlob() )
					// Filter out non-sass files for the sass compilation step.
					.pipe( sassFilter )
					.pipe(
						sass
							.sync( {
								includePaths,
								indentType: 'tab',
								outputStype: 'expanded',
								importer: jsonImporter( {
									convertCase: true,
								} ),
							} )
							// This fixes issue with watch task hanging on error.
							.on( 'error', done )
					)
					// Restore any non-sass files that were previously filtered out.
					.pipe( sassFilter.restore )
					// Filter out anything without a style extension
					.pipe( filterStyles )
					// If there is a postcss config, gulp-postcss will use it. Otherwise, use our plugins.
					.pipe(
						hasPostcssConfig
							? postcss()
							: postcss( [ autoprefixer() ] )
					)
					// Filter out all but entrypoints.
					.pipe( filterEntries )
					.pipe( logFiles( { task: 'styles', title: 'entry:' } ) )
					// Optimize CSS with cleanCSS level 2.
					.pipe(
						cleanCSS( {
							level: 2,
						} )
					)
					// Generate *.asset.php file similar to what is provided by wp-scripts.
					.pipe( assetFile() )
					.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
			);
		};
	},
	config: {
		src: 'src/styles/**/*.*',
		srcBase: 'src/styles', // For watch task to mirror deletions.
		watch: [ 'src/styles/**/*.*', 'theme.json' ],
		dest: 'dist/css',
		entries: 'src/styles/*.*',
		includePaths: [ 'node_modules' ],
	},
};
