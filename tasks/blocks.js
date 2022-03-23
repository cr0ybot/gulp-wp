/**
 * Task: blocks
 */

// Node
const { basename, dirname, extname, join } = require( 'path' );

// External
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const filter = require( 'gulp-filter' );
const merge = require( 'merge-stream' );
const jsonImporter = require( 'node-sass-json-importer' );
const through2 = require( 'through2' );
const named = require( 'vinyl-named' );
const vinylRead = require( 'vinyl-read' );
const webpack = require( 'webpack' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const webpackStream = require( 'webpack-stream' );
const wpWebpackConfig = require( '@wordpress/scripts/config/webpack.config' );

// GulpWP
const { c, changed, handleStreamError, log, logFiles } = require( '../util' );

const blockAssets = [ 'script', 'style', 'editorScript', 'editorStyle', 'viewScript' ];

module.exports = {
	task: ( gulp, { src, entries, dest, includePaths } ) => {
		return function blocks( done ) {
			const filterOthers = filter( [
				'*.{php,json}',
				'!*.asset.php',
			] );

			/**
			 * Overwrites pieces of the default webpack config.
			 */
			const webpackConfig = {
				...wpWebpackConfig,
				optimization: {
					...( wpWebpackConfig?.optimization || {} ),
					splitChunks: {
						...( wpWebpackConfig?.optimization?.splitChunks || {} ),
						cacheGroups: {
							...( wpWebpackConfig?.optimization?.splitChunks
								?.cacheGroups || {} ),
							style: {
								type: 'css/mini-extract',
								test: /[\\/]style(\.module)?\.(sc|sa|c)ss$/,
								// Remove the default renaming of any file named "style".
								/*
								//chunks: 'all',
								enforce: true,
								name( module, chunks, cacheGroupKey ) {
									return `${ cacheGroupKey }-${ chunks[ 0 ].name }`;
								},
								*/
							},
							default: false,
						},
					},
				},
				module: {
					...( wpWebpackConfig?.module || {} ),
					// Complicated but successful insertion of jsonImporter into the sass-loader options
					rules: wpWebpackConfig.module.rules.map( ( rule ) => {
						const { test, use } = rule;
						if ( test.toString() === /\.(sc|sa)ss$/.toString() ) {
							return {
								test,
								use: use.map( ( u ) => {
									const { loader, options } = u;
									if (
										loader ==
										require.resolve( 'sass-loader' )
									) {
										return {
											loader,
											options: {
												...options,
												sassOptions: {
													importer: jsonImporter( {
														convertCase: true,
													} ),
												},
											},
										};
									}
									return u;
								} ),
							};
						}
						return rule;
					} ),
				},
				resolve: {
					...wpWebpackConfig.resolve,
					modules: [
						...( wpWebpackConfig.resolve?.modules || [] ),
						...includePaths,
					],
				},
				plugins: [
					new RemoveEmptyScriptsPlugin(),
					...(( wpWebpackConfig?.plugins || [] ).filter(plugin => ! (plugin instanceof CopyWebpackPlugin))),
				],
				devtool: 'source-map',
			};
			// Remove config props that may interfere with webpackStream
			delete webpackConfig[ 'entry' ];

			/**
			 * Reads block.json files for block assets.
			 *
			 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#assets
			 */
			const streamBlockAssets = through2.obj(function filterBlockAssetEntries( file, enc, cb ) {
				log.debug(file.path);
				// Parse block.json for asset files.
				const data = JSON.parse( file.contents.toString() );
				if ( data ) {
					// Check each potential blockAsset prop.
					for (const key of blockAssets) {
						if ( data.hasOwnProperty( key ) ) {
							// Value can be string or array, ensure array for consistency.
							if ( typeof data[key] !== 'array' ) {
								data[key] = [ data[key] ];
							}

							for ( const asset of data[key] ) {
								if ( asset.startsWith('file:') ) {
									const assetFile = asset.substring(5);
									log.debug('block asset:', c.blue(assetFile));
									let assetPath = dirname(file.path);
									// If asset is js, glob for js, ts, jsx, or tsx.
									if (assetFile.endsWith('js')) {
										assetPath += `/${assetFile.slice(0, -2)}{j,t}{s,sx}`;
									}
									// If asset is css, glob for sass, scss, or css.
									else if (assetFile.endsWith('css')) {
										assetPath += `/${assetFile.slice(0, -3)}{sa,sc,c}ss`;
									}
									// If neither, just pass the file through, consequences be damned.
									else {
										assetPath += `/${assetFile}`;
									}
									vinylRead.sync(assetPath).map(f => this.push(f));
								}
							}
						}
					}

					// End processing and remove this file from the stream.
					return cb();
				}

				// Pass the file through.
				return cb( null, file );
			});

			return merge(
				// Handle block assets.
				gulp.src( entries )
					.pipe( handleStreamError( 'blocks' ) )
					// Filter out all but entrypoints.
					.pipe( streamBlockAssets )
					.pipe( logFiles( { task: 'blocks', title: 'entry:' } ) )
					// Convert into named entrypoints for WebPack.
					.pipe(
						named( ( file ) => {
							// Include parent folder in name so that destination is sorted in block folders.
							return join(
								basename( dirname( file.path ) ),
								basename( file.path, extname( file.path ) )
							);
						} )
					)
					// TODO: webpack errors are displayed twice.
					.pipe( webpackStream( webpackConfig, webpack ) )
					.pipe( gulp.dest( dest ) ),
				// Handle moving other files (php, json)
				gulp.src( src )
					.pipe( handleStreamError( 'blocks' ) )
					.pipe( filterOthers )
					.pipe( changed( gulp.lastRun( blocks ) ) )
					.pipe( logFiles( { task: 'blocks', title: 'copy:' } ) )
					.pipe( gulp.dest( dest ) )
			);
		};
	},
	config: {
		src: 'src/blocks/*/*.*',
		srcBase: 'src/blocks', // for watch task to mirror deletions
		watch: [ 'src/blocks/**/*.*', 'theme.json' ],
		dest: 'dist/blocks',
		entries: 'src/blocks/*/block.json',
		includePaths: [ 'node_modules' ],
	},
};
