/**
 * @module GulpWPRegistry
 */

// External
const DefaultRegistry = require( 'undertaker-registry' );
const merge = require( 'deepmerge' );
const { DepGraph } = require( 'dependency-graph' );

// Internal
const { c, log } = require( '../util' );
const { version } = require( '../package.json' );

const overwriteArrayMerge = ( destinationArray, sourceArray ) => sourceArray;

/**
 * Custom Gulp task registry.
 *
 * @class
 * @param {Object} gulp   Main gulp object
 * @param {Object} tasks  Tasks data
 * @param {Object} config Configuration
 */
class GulpWPRegistry extends DefaultRegistry {
	constructor( gulp, tasks = {}, config = {} ) {
		super();
		this.gulp = gulp;
		this.taskData = tasks;
		this.config = config;
	}

	init( { task } ) {
		log.info(
			c.yellow( `

 ┏━━┓      ┏┓ ┏┳━┓   ┏
 ┃┏━╋┳┳┓┏━┓┃┣━┫┃╻┃ ███
 ┃┗┓┃╹┃┗┫╹┃┃╹┃╹┃┏┛ ▐█▌
 ┗━━┻━┻━┫┏┛┗━┻━┻┛  ▝▀▘ v${ version }
        ┗┛
` )
		);

		const { gulp, taskData, config } = this;
		config.tasks = config.tasks || {};

		const graph = new DepGraph();

		for ( const [ taskName, taskInfo ] of Object.entries( taskData ) ) {
			graph.addNode( taskName );

			// Handle merging config early in case `dependencies` is a function.
			// NOTE: array properties are overwritten, not concatenated!
			const taskConfig = ( config.tasks[ taskName ] = merge(
				taskInfo?.config || {},
				config.tasks[ taskName ] || {},
				{
					arrayMerge: overwriteArrayMerge,
				}
			) );

			log.debug( taskConfig );

			const { dependencies = [] } = taskInfo;
			// `dependencies` can be a function that builds a dependency array dynamically.
			const deps =
				typeof dependencies === 'function'
					? dependencies( taskConfig )
					: dependencies;
			// For each dependency, add as a node and mark the dependency link.
			if ( Array.isArray( deps ) && deps.length ) {
				for ( const dep of deps ) {
					graph.addNode( dep );
					graph.addDependency( taskName, dep );
				}
			}
		}

		const taskOrder = graph.overallOrder();
		log.debug( 'taskOrder:', taskOrder );

		// Import core tasks.
		for ( const taskName of taskOrder ) {
			// Check if task exists or if this is an errant dependency.
			if ( ! taskData.hasOwnProperty( taskName ) ) {
				throw new Error(
					`Task "${ taskName }" does not exist, though marked as a dependency by these tasks: ${ graph.dependantsOf(
						taskName
					) }"`
				);
			}

			const taskConfig = config.tasks[ taskName ];

			log.debug( 'Registering task', c.cyan( taskName ) );
			log.debug(
				c.cyan( taskName ),
				'dependencies:',
				graph.dependenciesOf( taskName )
			);
			log.debug( c.cyan( taskName ), 'config:', taskConfig );

			const { task: taskFn } = taskData[ taskName ];
			task( taskName, taskFn( gulp, taskConfig, this ) );
		}

		// Register default task.
		task( 'default', this.get( 'dev' ) );
	}

	// get(taskName) {}

	// set( taskName, fn ) {
	// 	const task = this._tasks[taskName] = fn.bind(this.context);
	// 	return task;
	// }

	// tasks() {}
}

module.exports = GulpWPRegistry;
