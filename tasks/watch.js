/**
 * Task: watch
 *
 * Watch project files for changes and run build tasks
 */

// Node
const { dirname, parse, relative, resolve } = require( 'path' );

// External
const del = require( 'del' );

// Internal
const { c, log } = require( '../util' );

module.exports = {
	task: ( gulp, {}, registry ) => {
		const {
			plugin,
			tasks: { scripts, styles, translate, version },
		} = registry.config;

		return function watch() {
			// Watch styles
			gulp.watch(
				styles.watch || `${ styles.src }/**/*.*`,
				{ cwd: './' },
				'styles'
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					log.debug(
						c.cyan( 'styles' ),
						'src deleted:',
						c.blue( filepath )
					);
					// Get the relative path of the file from it's src root
					const relPath = relative(
						resolve( styles.src ),
						resolve(
							dirname( filepath ),
							`${ parse( filepath ).name }.css`
						)
					);
					// Put the relative path in the context of the dest root
					const destPath = resolve( styles.dest, relPath );
					// Delete the dest file and any .map file of the same name
					del( [ destPath, `${ destPath }.map` ] ).then(
						( paths ) => {
							for ( const path of paths ) {
								log.debug(
									c.cyan( 'styles' ),
									'removed dest file:',
									c.blue( path )
								);
							}
						}
					);
				} );

			// Watch scripts
			gulp.watch(
				scripts.watch || `${ scripts.src }/**/*.*`,
				{ cwd: './' },
				'scripts'
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					log.debug(
						c.cyan( 'scripts' ),
						'src deleted:',
						c.blue( filepath )
					);
					// Get the relative path of the file from it's src root
					const relPath = relative(
						resolve( scripts.src ),
						resolve(
							dirname( filepath ),
							`${ parse( filepath ).name }.js`
						)
					);
					// Put the relative path in the context of the dest root
					const destPath = resolve( scripts.dest, relPath );
					// Delete the dest file and any .map file of the same name
					del( [ destPath, `${ destPath }.map` ] ).then(
						( paths ) => {
							for ( const path of paths ) {
								log.debug(
									c.cyan( 'scripts' ),
									'removed dest file:',
									c.blue( destPath )
								);
							}
						}
					);
				} );

			// Watch PHP for translate
			gulp.watch(
				translate.watch || translate.src,
				{
					cwd: './',
					ignored: ( path ) => path.includes( 'node_modules' ),
				},
				'translate'
			);

			// Watch version
			gulp.watch( version.src, { cwd: './' }, 'version' );
		};
	},
	dependencies: [ 'scripts', 'styles', 'translate', 'version' ],
};
