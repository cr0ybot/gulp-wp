/**
 * Task: build.
 */

module.exports = {
	task: (
		gulp,
		{
			preBuild: preBuildTasks,
			build: buildTasks,
			postBuild: postBuildTasks,
		}
	) => {
		function maybeParallel( tasks ) {
			if ( ! Array.isArray( tasks ) || tasks.length === 0 ) {
				return [];
			}

			return [ gulp.parallel( ...tasks ) ];
		}

		// Build main series array conditionally.
		const buildSeries = [
			...maybeParallel( preBuildTasks ),
			...maybeParallel( buildTasks ),
			...maybeParallel( postBuildTasks ),
		];

		const build = gulp.series( ...buildSeries );

		return build;
	},
	config: {
		preBuild: [ 'clean' ],
		build: [ 'styles', 'scripts', 'blocks' ],
		postBuild: [ 'translate', 'version' ],
	},
	dependencies: ( { preBuild, build, postBuild } ) => {
		const tasks = new Set( [ ...preBuild, ...build, ...postBuild ] );
		return Array.from( tasks );
	},
};
