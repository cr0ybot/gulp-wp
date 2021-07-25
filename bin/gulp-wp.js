#!/usr/bin/env node

const { sync: resolveBin } = require( 'resolve-bin' );
const { sync: spawn } = require( 'cross-spawn' );

const { argv, cwd, exit } = process;

const gulpfile = require.resolve( '../gulpfile.js' );

const { status } = spawn(
	resolveBin( 'gulp' ),
	[ '--gulpfile', gulpfile, '--cwd', cwd(), ...argv.slice( 2 ) ],
	{
		stdio: 'inherit',
	}
);

exit( status );
