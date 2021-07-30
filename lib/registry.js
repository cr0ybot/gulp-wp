/**
 * @module GulpWPRegistry
 */

const DefaultRegistry = require( 'undertaker-registry' );

/**
 * Custom Gulp task registry.
 *
 * @class
 * @param {Gulp} gulp Main gulp object
 * @param {object} tasks Tasks data
 */
class GulpWPRegistry extends DefaultRegistry {
	constructor( gulp, tasks ) {
		super();
		this.gulp = gulp;
		this.taskData = tasks;
	}

	init( { task } ) {
		const { gulp, taskData: tasks } = this;
		const taskArray = Object.entries( tasks );

		// import default tasks
		for ( const [ taskName, taskFn ] of taskArray ) {
			//console.log( 'registering task', taskName );
			task( taskName, taskFn );
		}

		const { styles, scripts, translate } = tasks;
		const build = gulp.parallel( styles, scripts, translate );

		// register meta tasks
		task( 'build', build );
		task( 'default', gulp.series( build ) );
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

module.exports = ( gulp, tasks ) => {
	return new GulpWPRegistry( gulp, tasks );
};
