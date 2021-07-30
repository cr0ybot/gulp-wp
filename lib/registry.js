/**
 * @module GulpWPRegistry
 */

// External
const DefaultRegistry = require( 'undertaker-registry' );
const bs = require( 'browser-sync' ).create( 'gulp-wp' );
const merge = require( 'merge-deep' );

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
		const { gulp, taskData: tasks, config } = this;
		const taskArray = Object.entries( tasks );

		config.tasks = config.tasks || {};

		// import default tasks
		for ( const [ taskName, taskInfo ] of taskArray ) {
			//console.log( 'registering task', taskName );

			const taskConfig = ( config.tasks[ taskName ] = merge(
				taskInfo?.config || {},
				config.tasks[ taskName ] || {}
			) );

			task( taskName, taskInfo.task( gulp, taskConfig ) );
		}

		// register meta tasks
		// TODO: these need a proper home

		const build = gulp.parallel(
			this.get( 'styles' ),
			this.get( 'scripts' ),
			this.get( 'translate' )
		);
		task( 'build', build );

		const {
			env: { DEV_URL },
			tasks: {
				scripts: scriptsConfig,
				styles: stylesConfig,
				translate: translateConfig,
			},
		} = config;
		const serve = ( done ) => {
			bs.init(
				{
					host: new URL( DEV_URL ).hostname,
					proxy: DEV_URL,
					files: [
						'**/*.php',
						`${ scriptsConfig.dest }/**/*.js`,
						`${ stylesConfig.dest }/**/*.css`,
					],
					ignore: [
						'node_modules/**/*',
						`${ scriptsConfig.dest }/**/*.php`,
						`${ stylesConfig.dest }/**/*.php`,
					],
				},
				done
			);
		};
		serve.end = () => bs.exit();
		const watch = () => {
			gulp.watch(
				stylesConfig.watch || stylesConfig.src,
				{ cwd: './' },
				this.get( 'styles' )
			);
			gulp.watch(
				scriptsConfig.watch || scriptsConfig.src,
				{ cwd: './' },
				this.get( 'scripts' )
			);
			gulp.watch(
				translateConfig.watch || translateConfig.src,
				{ cwd: './' },
				this.get( 'translate' )
			);
		};
		const dev = () => {
			const devTasks = gulp.series( build, serve, watch );

			return devTasks;
		};
		task( 'default', dev() );
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

/**
 * Initialize custom Gulp task registry.
 *
 * @function
 * @param {Gulp} gulp Main gulp object
 * @param {object} tasks Tasks data
 * @param {object} config Configuration
 */
module.exports = ( gulp, tasks, config ) => {
	return new GulpWPRegistry( gulp, tasks, config );
};
