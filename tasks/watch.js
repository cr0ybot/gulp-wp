/**
 * Task: watch.
 *
 * Watch project files for changes and run build tasks.
 */

// Node
const { dirname, parse, relative, resolve } = require( 'path' );

// External
const del = require( 'del' );

// Internal
const { c, log } = require( '../util' );

module.exports = {
	task: ( gulp, { tasks }, registry ) => {
		const mirrorDelete = ( task, mirrorDeletion ) => {
			const taskConfig = registry.config.tasks[ task ];

			return ( filepath ) => {
				log.debug( c.cyan( task ), 'src deleted:', c.blue( filepath ) );
				// Get the relative path of the file from it's src root.
				// TODO: This does not work with globs!!!
				const relPath = relative(
					resolve( taskConfig.srcBase || taskConfig.src ),
					resolve(
						dirname( filepath ),
						`${ parse( filepath ).name }`
					)
				);
				log.debug( relPath );
				// Put the relative path in the context of the dest root.
				const destPath = resolve( taskConfig.dest, relPath );
				// Delete the dest files.
				const delFiles = Array.isArray( mirrorDeletion )
					? mirrorDeletion.map( ( ext ) => `${ destPath }${ ext }` )
					: `${ destPath }${ mirrorDeletion }`;
				log.debug( delFiles );
				del( delFiles ).then( ( paths ) => {
					for ( const path of paths ) {
						log.debug(
							c.cyan( task ),
							'removed dest file:',
							c.blue( path )
						);
					}
				} );
			};
		};

		return function watch() {
			for ( let task of tasks ) {
				let mirrorDeletion = false;
				// Handle object task config.
				if (
					typeof task === 'object' &&
					task.hasOwnProperty( 'task' )
				) {
					mirrorDeletion = task.mirrorDeletion || mirrorDeletion;
					task = task.task;
				}
				const taskConfig = registry.config.tasks[ task ];

				const watcher = gulp.watch(
					taskConfig.watch || taskConfig.src,
					{
						cwd: './',
						ignored: ( path ) => path.includes( 'node_modules' ),
					},
					registry.get( task )
				);

				if ( mirrorDeletion ) {
					watcher.on(
						'unlink',
						mirrorDelete( task, mirrorDeletion )
					);
				}
			}
		};
	},
	config: {
		tasks: [
			{
				task: 'scripts',
				mirrorDeletion: [ '.js', '.js.map', '.asset.php' ],
			},
			{
				task: 'styles',
				mirrorDeletion: [ '.css', '.css.map', '.asset.php' ],
			},
			{
				task: 'blocks',
				mirrorDeletion: [
					'.css',
					'.css.map',
					'.js',
					'.js.map',
					'.json',
					'.php',
					'.asset.php',
				],
			},
			'translate',
			'version',
		],
	},
	dependencies: ( { tasks } ) => {
		return tasks.map( ( task ) =>
			typeof task === 'string' ? task : task.task
		);
	},
};
