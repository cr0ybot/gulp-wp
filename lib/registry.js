/**
 * @module GulpWPRegistry
 */

const DefaultRegistry = require( 'undertaker-registry' );

/**
 * Custom Gulp task registry.
 *
 * @class
 * @param {Gulp} gulp Main gulp object
 */
class GulpWPRegistry extends DefaultRegistry {
	constructor( tasks ) {
		super();
		this.taskData = tasks;
	}

	init( { task } ) {
		// import default tasks
		/*
		task(
			'styles',
			require( './tasks/styles' )( {
				src: 'src/styles/*',
				dest: 'dist/css',
			} )
		);
		*/

		console.log( { tasks: this.taskData } );

		for ( const [ taskName, taskFn ] of Object.entries( this.taskData ) ) {
			console.log( taskFn );
			task( taskName, taskFn() );
		}
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

module.exports = ( tasks ) => {
	return new GulpWPRegistry( tasks );
};
