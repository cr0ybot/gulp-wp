/**
 * Util
 */

const { readdirSync } = require( 'fs' );
const { basename, extname, join } = require( 'path' );

const loadTasks = () =>
	readdirSync( join( __dirname, '..', 'tasks' ) )
		.filter( ( file ) => extname( file ) === '.js' )
		.reduce( ( acc, file ) => {
			const taskName = basename( file, '.js' );
			acc[ taskName ] = require( `../tasks/${ taskName }` );
			return acc;
		}, {} );

module.exports = {
	loadTasks,
};
