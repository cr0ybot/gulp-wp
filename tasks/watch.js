/**
 * Task: watch
 *
 * Watch project files for changes and run build tasks
 */

// Node
const { dirname, join, parse, relative, resolve } = require( 'path' );

// External
const del = require( 'del' );

// Internal
const { c, log } = require( '../util' );

module.exports = {
	task: ( gulp, {}, registry ) => {
		const {
			tasks: { scripts, styles, translate },
		} = registry.config;

		return function watch() {
			gulp.watch(
				`${ styles.src }/**/*.*`,
				{ cwd: './' },
				registry.get( 'styles' )
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					log.debug(
						c.cyan( 'styles' ),
						'src deleted:',
						c.blue( filepath )
					);
					const relPath = relative(
						resolve( dirname( styles.src ) ),
						join(
							dirname( filepath ),
							`${ parse( filepath ).name }.css`
						)
					);
					const destPath = resolve( styles.dest, relPath );
					del( [ destPath, `${ destPath }.map` ] ).then(
						( paths ) => {
							for ( const path of paths ) {
								log.debug(
									c.cyan( 'styles' ),
									'removed dest file:',
									c.blue( destPath )
								);
							}
						}
					);
				} );
			gulp.watch(
				`${ scripts.src }/**/*.*`,
				{ cwd: './' },
				registry.get( 'scripts' )
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					log.debug(
						c.cyan( 'scripts' ),
						'src deleted:',
						c.blue( filepath )
					);
					const relPath = relative(
						resolve( dirname( scripts.src ) ),
						join(
							dirname( filepath ),
							`${ parse( filepath ).name }.js`
						)
					);
					const destPath = resolve( scripts.dest, relPath );
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
			gulp.watch(
				translate.watch || translate.src,
				{ cwd: './' },
				registry.get( 'translate' )
			);
		};
	},
	dependencies: [ 'scripts', 'styles', 'translate' ],
};
