/**
 * Task: dev
 */

module.exports = {
	task: ( gulp, {}, registry ) => {
		const dev = gulp.series(
			registry.get( 'build' ),
			registry.get( 'serve' ),
			registry.get( 'watch' )
		);

		return dev;
	},
	dependencies: [ 'build', 'serve', 'watch' ],
};
