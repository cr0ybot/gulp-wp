/**
 * @module GulpWPRegistry
 */

// Node
const { dirname, join, parse, relative, resolve } = require( 'path' );

// External
const DefaultRegistry = require( 'undertaker-registry' );
const bs = require( 'browser-sync' ).create( 'gulp-wp' );
const merge = require( 'merge-deep' );
const { DepGraph } = require( 'dependency-graph' );

/**
 * Custom Gulp task registry.
 *
 * @class
 * @param {Gulp} gulp Main gulp object
 * @param {object} tasks Tasks data
 * @param {object} config Configuration
 */
class GulpWPRegistry extends DefaultRegistry {
	constructor( gulp, tasks = {}, config = {} ) {
		super();
		this.gulp = gulp;
		this.taskData = tasks;
		this.config = config;
	}

	init( { task } ) {
		const { gulp, taskData, config } = this;

		const graph = new DepGraph();

		for ( const [ taskName, taskInfo ] of Object.entries( taskData ) ) {
			graph.addNode( taskName );
			const { dependencies = [] } = taskInfo;
			// for each dependency, add that node and mark the dependency
			if ( Array.isArray( dependencies ) && dependencies.length ) {
				for ( const dep of dependencies ) {
					graph.addNode( dep );
					graph.addDependency( taskName, dep );
				}
			}
		}

		const taskOrder = graph.overallOrder();
		console.log( { taskOrder } );

		config.tasks = config.tasks || {};

		// import default tasks
		for ( const taskName of taskOrder ) {
			const taskInfo = taskData[ taskName ];
			console.log(
				'registering task',
				taskName,
				graph.dependenciesOf( taskName )
			);

			const taskConfig = ( config.tasks[ taskName ] = merge(
				taskInfo?.config || {},
				config.tasks[ taskName ] || {}
			) );

			console.log( this.config );
			task( taskName, taskInfo.task( gulp, taskConfig, this ) );
		}

		// Register meta tasks
		// TODO: these need a proper home

		const {
			env: {
				DEV_URL,
				BROWSERSYNC_OPEN,
				BROWSERSYNC_BROWSER,
				BROWSERSYNC_NOTIFY,
			},
			tasks: { scripts, styles, translate },
		} = config;

		const build = gulp.series(
			this.get( 'clean' ),
			gulp.parallel(
				this.get( 'styles' ),
				this.get( 'scripts' ),
				this.get( 'translate' )
			)
		);
		task( 'build', build );

		const bsConfig = {
			host: new URL( DEV_URL ).hostname,
			proxy: DEV_URL,
			files: [
				'**/*.php',
				`${ scripts.dest }/**/*.js`,
				`${ styles.dest }/**/*.css`,
			],
			ignore: [
				'node_modules/**/*',
				`${ scripts.dest }/**/*.php`,
				`${ styles.dest }/**/*.php`,
			],
			// Conditionally add bs env config
			...( BROWSERSYNC_OPEN && { open: BROWSERSYNC_OPEN === 'true' } ),
			...( BROWSERSYNC_BROWSER && {
				browser: JSON.parse( BROWSERSYNC_BROWSER ),
			} ),
			...( BROWSERSYNC_NOTIFY && {
				notify: BROWSERSYNC_NOTIFY === 'true',
			} ),
		};

		const serve = ( done ) => {
			bs.init( bsConfig, done );
		};
		task( 'serve', serve );

		const watch = () => {
			gulp.watch(
				`${ styles.src }/**/*.*`,
				{ cwd: './' },
				this.get( 'styles' )
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
				this.get( 'scripts' )
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
				this.get( 'translate' )
			);
		};
		task( 'watch', watch );

		const dev = () => {
			const devTasks = gulp.series(
				this.get( 'build' ),
				this.get( 'serve' ),
				this.get( 'watch' )
			);

			return devTasks;
		};
		task( 'default', dev() );
		task( 'dev', this.get( 'default' ) );
	}

	//get(taskName) {}

	/*
	set( taskName, fn ) {
		const task = this._tasks[taskName] = fn.bind(this.context);
		return task;
	}
	*/

	//tasks() {}
}

module.exports = GulpWPRegistry;
