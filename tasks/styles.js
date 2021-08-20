/**
 * Task: styles
 */

// External
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const dependents = require( 'gulp-dependents' );
const filter = require( 'gulp-filter' );
const glob = require( 'glob' );
const postcss = require( 'gulp-postcss' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const sassGlob = require( 'gulp-sass-glob' );
const jsonImporter = require( 'node-sass-json-importer' );

// Internal
const {
	assetFile,
	c,
	changed,
	dependentsConfig,
	getPackageJSON,
	handleStreamError,
	logFiles,
	log,
} = require( '../util' );

const postcssConfigFiles = [
	'.postcssrc',
	'.postcssrc.json',
	'.postcssrc.yml',
	'.postcssrc.js',
	'postcss.config.js',
];

module.exports = {
	task: ( gulp, { src, dest, entries, includePaths } ) => {
		return function styles() {
			const sassFilter = filter( '*.s[a|c]ss', { restore: true } );
			const filterEntries = filter( entries );

			// Check for postcss config in package.json
			const { postcss: postcssPackageConfig } = getPackageJSON();
			// Check for postcss config file
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
					.pipe( changed( gulp.lastRun( styles ) ) )
					.pipe(
						logFiles( {
							logLevel: 'debug',
							task: 'styles',
							title: 'file:',
						} )
					)
					.pipe( sassGlob() ) // transform sass glob imports
					.pipe(
						dependents( dependentsConfig, { logDependents: true } )
					)
					.pipe( filterEntries )
					.pipe( sassGlob() ) // again because dependents() pulls in the entry file
					.pipe( logFiles( { task: 'styles', title: 'entry:' } ) )
					.pipe( sassFilter )
					.pipe(
						sass.sync( {
							includePaths,
							indentType: 'tab',
							outputStype: 'expanded',
							importer: jsonImporter( {
								convertCase: true,
							} ),
						} )
					)
					.pipe( sassFilter.restore )
					// If there is a postcss config, gulp-postcss will use it. Otherwise, use our plugins.
					.pipe(
						hasPostcssConfig
							? postcss()
							: postcss( [ autoprefixer() ] )
					)
					.pipe(
						cleanCSS( {
							level: 2,
						} )
					)
					.pipe( assetFile() )
					.pipe( gulp.dest( dest, { sourcemaps: '.' } ) )
			);
		};
	},
	config: {
		src: 'src/styles/**/*.*',
		srcBase: 'src/styles', // for watch task to mirror deletions
		dest: 'dist/css',
		entries: 'src/styles/*.*',
		includePaths: [ 'node_modules' ],
	},
};
