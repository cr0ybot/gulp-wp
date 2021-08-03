/**
 * Task: watch
 *
 * Watch project files for changes and run build tasks
 */

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
					//console.log( 'deleted:', filepath );
					const relPath = relative(
						resolve( dirname( styles.src ) ),
						join(
							dirname( filepath ),
							`${ parse( filepath ).name }.css`
						)
					);
					const destPath = resolve( styles.dest, relPath );
					//console.log( 'removing dest file:', destPath );
					del.sync( [ destPath, `${ destPath }.map` ] );
				} );
			gulp.watch(
				`${ scripts.src }/**/*.*`,
				{ cwd: './' },
				registry.get( 'scripts' )
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					//console.log( 'deleted:', filepath );
					const relPath = relative(
						resolve( dirname( scripts.src ) ),
						join(
							dirname( filepath ),
							`${ parse( filepath ).name }.js`
						)
					);
					const destPath = resolve( scripts.dest, relPath );
					//console.log( 'removing dest file:', destPath );
					del.sync( [ destPath, `${ destPath }.map` ] );
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
