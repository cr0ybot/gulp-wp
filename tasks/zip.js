/**
 * Task: zip.
 *
 * Creates a production-ready zip archive of your project that ignores source
 * files and other non-production files.
 */

// Node
const { basename } = require( 'path' );
const { cwd } = require( 'process' );

// External
const gulpZip = require( 'gulp-zip' );

// Internal
const { c, handleStreamError, log, logFiles } = require( '../util' );

function getIgnoreGlob( src ) {
	if ( Array.isArray( src ) ) {
		return `!{${ src.join( ',' ) }}`;
	}

	return `!${ src }`;
}

module.exports = {
	task: ( gulp, { src, dest }, registry ) => {
		if ( ! Array.isArray( src ) ) {
			src = [ src ];
		}
		const { scripts, styles } = registry.config.tasks;

		const zipProject = () => {
			const zipname = `${ basename( cwd() ) }.zip`;
			const projectGlobs = src.concat( [
				getIgnoreGlob( scripts.src ),
				getIgnoreGlob( styles.src ),
			] );
			log.debug( 'Project globs:', c.blue( projectGlobs ) );
			log.info( 'Generating zip:', c.blue( zipname ) );

			return gulp
				.src( projectGlobs, { nodir: true } )
				.pipe( handleStreamError( 'zip' ) )
				.pipe( logFiles( { task: 'zip' } ) )
				.pipe( gulpZip( zipname ) )
				.pipe( gulp.dest( dest ) );
		};

		const zip = gulp.series( 'build', zipProject );
		return zip;
	},
	config: {
		src: [
			'**/*', // All project files.
			'!**/.*', // Ignore dotfiles.
			'!**/_*', // Ignore partial files.
			'!{node_modules,node_modules/**/*}', // Ignore node_modules.
			'!{package.json,package-lock.json,yarn.lock}', // Ignore npm/yarn files.
			'!{gulp*,gulp**/*}', // Ignore anything that starts with "gulp".
		],
		dest: '../', // Output to parent folder (dangerous?).
		ignoreSrc: [ 'scripts', 'styles', 'blocks' ],
	},
	dependencies: ( { ignoreSrc = [] } ) => [ ...ignoreSrc, 'build' ],
};
