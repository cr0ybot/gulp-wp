/**
 * @module GulpWPRegistry
 */

// Node
const { dirname, join, parse, relative, resolve } = require( 'path' );

// External
const DefaultRegistry = require( 'undertaker-registry' );
const merge = require( 'merge-deep' );
const { DepGraph } = require( 'dependency-graph' );

// Internal
const { c, log } = require( '../util' );

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
		log(
			c.bold(
				c.yellow( `

 ┏━━┓      ┏┓ ┏┳━┓
 ┃┏━╋┳┳┓┏━┓┃┣━┫┃╻┃
 ┃┗┓┃╹┃┗┫╹┃┃╹┃╹┃┏┛
 ┗━━┻━┻━┫┏┛┗━┻━┻┛
        ┗┛
` )
			)
		);

		const { gulp, taskData, config } = this;

		const graph = new DepGraph();

		for ( const [ taskName, taskInfo ] of Object.entries( taskData ) ) {
			graph.addNode( taskName );
			const { dependencies = [] } = taskInfo;
			// for each dependency, add as a node and mark the dependency link
			if ( Array.isArray( dependencies ) && dependencies.length ) {
				for ( const dep of dependencies ) {
					graph.addNode( dep );
					graph.addDependency( taskName, dep );
				}
			}
		}

		const taskOrder = graph.overallOrder();

		config.tasks = config.tasks || {};

		// import default tasks
		for ( const taskName of taskOrder ) {
			// Check if task exists or if this is an errant dependency
			if ( ! taskData.hasOwnProperty( taskName ) ) {
				throw new Error(
					`Task "${ taskName }" does not exist, though marked as a dependency by these tasks: ${ graph.dependantsOf(
						taskName
					) }"`
				);
			}

			const taskInfo = taskData[ taskName ];
			/*
			console.log(
				'registering task',
				taskName,
				graph.dependenciesOf( taskName )
			);
			*/

			const taskConfig = ( config.tasks[ taskName ] = merge(
				taskInfo?.config || {},
				config.tasks[ taskName ] || {}
			) );

			task( taskName, taskInfo.task( gulp, taskConfig, this ) );
		}

		// Register default task
		task( 'default', this.get( 'dev' ) );
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
