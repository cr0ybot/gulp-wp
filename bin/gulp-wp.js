#!/usr/bin/env node

const pkgUp = require( 'pkg-up' ).sync;
const resolveBin = require( 'resolve-bin' ).sync;
const spawn = require( 'cross-spawn' ).sync;

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
