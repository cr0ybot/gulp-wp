/**
 * Gulpfile
 */

const { series } = require( 'gulp' );

const test = ( done ) => {
	console.log( 'hello world' );
	done();
};

const test2 = ( done ) => {
	console.log( 'hello other world' );
	done();
};

module.exports = {
	default: series( test, test2 ),
	test,
	test2,
};
