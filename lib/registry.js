/**
 * @module GulpWPRegistry
 */

// Node
const { dirname, join, parse, relative, resolve } = require( 'path' );

// External
const DefaultRegistry = require( 'undertaker-registry' );
const bs = require( 'browser-sync' ).create( 'gulp-wp' );
const del = require( 'del' );
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

		const {
			env: { DEV_URL },
			tasks: { scripts, styles, translate },
		} = config;

		// Clean build folders
		const clean = ( done ) => {
			del( [ scripts.dest, styles.dest ] );
			done();
		};

		const build = gulp.parallel(
			clean,
			this.get( 'styles' ),
			this.get( 'scripts' ),
			this.get( 'translate' )
		);
		task( 'build', build );

		const serve = ( done ) => {
			bs.init(
				{
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
				},
				done
			);
		};

		const watch = () => {
			gulp.watch(
				styles.watch || styles.src,
				{ cwd: './' },
				this.get( 'styles' )
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					//console.log( 'deleted:', filepath );
					const relPath = relative(
						resolve( dirname( styles.src.replace( '**/*', '' ) ) ),
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
				scripts.watch || scripts.src,
				{ cwd: './' },
				this.get( 'scripts' )
			)
				// Mirror src file deletions to dest
				.on( 'unlink', ( filepath ) => {
					//console.log( 'deleted:', filepath );
					const relPath = relative(
						resolve( dirname( scripts.src.replace( '**/*', '' ) ) ),
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

module.exports = GulpWPRegistry;
