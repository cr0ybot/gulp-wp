/**
 * Task: dev
 */

module.exports = {
	task: ( gulp, {}, registry ) => {
		const dev = gulp.series( 'build', 'serve', 'watch' );

		return dev;
	},
	dependencies: [ 'build', 'serve', 'watch' ],
};
