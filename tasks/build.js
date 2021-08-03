/**
 * Task: build
 */

module.exports = {
	task: ( gulp, {}, registry ) => {
		const build = gulp.series(
			registry.get( 'clean' ),
			gulp.parallel(
				registry.get( 'styles' ),
				registry.get( 'scripts' ),
				registry.get( 'translate' )
			)
		);

		return build;
	},
	dependencies: [ 'clean', 'styles', 'scripts', 'translate' ],
};
