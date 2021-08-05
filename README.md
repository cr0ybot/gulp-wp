# Gulp WP

Gulp WP is a single-dependency Gulp-based workflow script for WordPress themes and plugins. See the [Rationale](#rationale) section for why we've built this, but here's a summary:

Gulp WP is:

  * :arrows_clockwise: __Reusable__: It's a collection of workflow scripts that you can drop into any project without having to untangle it from other setups.
  * :left_right_arrow: __Extendable__: It's built with Gulp 4 and can be used as-is or hooked into to customize or add new workflows for your specific project.
  * :arrow_up: __Updatable__: One single NPM dependency to update when needed!
  * :ok: __Sensible__: It comes with "sensible defaults", and uses the official [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) package for JS with some conveniences added for multiple entrypoints.

It is also :cool: , :new: , & :free: !

## Getting Started

### Requirements

 * Node.js v14.6+
 * NPM v7+

### Installation

During this package's development, it can be installed directly from the `develop` branch on GitHub:

```shell
npm install --save-dev https://github.com/BlackbirdDigital/gulp-wp.git#develop
```

It can also be installed by cloning the repo locally and linking to it in your project. This is handy if you intend to work on this package:

```shell
git clone --branch develop https://github.com/BlackbirdDigital/gulp-wp.git
cd /path/to/project
npm install --save-dev /path/to/cloned/gulp-wp
```

The intended installation after publishing on npm will look like:

```shell
npm install --save-dev @b.d/gulp-wp
```

### Usage

You can start running the workflow immediately with this command in your project folder:

```shell
npx gulp-wp
```

This will run the default task, which watches and compiles your files and runs BrowserSync.

> Note that any argument that you can pass to the standard `gulp` command you can pass with `gulp-wp`, with the exception of `--gulpfile` and `--cwd`, since those are used internally to run the appropriate gulpfile. For isntance, you can also use the `-LLLL` flag to see debug messages from Gulp WP.

If you'd prefer, you can canonize the tasks as npm scripts in your project's `package.json`:

```json
{
	...

	"scripts": {
		"start": "gulp-wp",
		"build": "gulp-wp build",
		...
	}
}
```

The above allows you to run the default task via `npm start` and the build task via `npm run build`.

> Note that usage is different if you want to customize the tasks or add your own. See [Customization](#customization) for details.

#### Main Tasks

There are several tasks available for individual aspects of development. Generally speaking, you probably shouldn't need to run them individually, since they are run as needed during the `watch` and `build` tasks.

Running a task in your project is as simple as calling `npx gulp-wp foo` where "foo" is the task name:

Task | Description
-----|------------
[dev](#dev-default) | Default task that runs when no task is specified (i.e. `npx gulp-wp`). Runs everything that `build` does, but also watches your files for changes and sends real-time updates via BrowserSync to your browser.
[build](#build) | Runs all of the various tasks to build your project for deployment.
[scripts](#scripts) | Runs `@wordpress/scripts` to package your JavaScript and generate asset files with a version hash and dependency array.
[styles](#styles) | Compiles your Sass or Post CSS.
[translate](#translate) | Runs `wp-pot` to create translation files.
[version](#version) | Copies version number updates from `package.json` to your theme's `style.css` file or your plugin's main php file.

> See the [Tasks](#tasks) section below for additional tasks and more details.

### Project Structure

If you want to use this workflow with zero configuration, your project must be set up with the files located where the default configuration expects:

```
project (root)
  ├╴gulp-wp.config.js // optional
  ├╴gulpfile.js // optional
  ├╴index.php // required for themes
  ├╴package.json
  ├╴style.css // required for themes, theme info only (no styles)
  ├╴dist // processed files only
  │ ├╴css
  │ │ ├╴*.css
  │ │ └╴*.css.map
  │ └╴js
  │   ├╴*.js
  │   └╴*.js.map
  ├╴languages
	│ └╴{textdomain}.pot
  └╴src
    ├╴styles
    │ ├╴*.[css|scss|sass]
    │ └╴{subfolders}
    └╴scripts
      ├╴*.[js|mjs|cjs|jsx|ts|tsx]
      └╴{subfolders}
```

Only files within the root of the `styles` and `scripts` folders in `src` will be treated as separate entrypoints to transform, meaning they will be processed by the workflow and output to the appropriate folders in `dist`, including their sourcemap files. Subfolders in `styles` and `scripts` are not processed directly. Use subfolders to organize your partials or modules and import them where necessary into an entrypoint file in the root of the folder. Note that it is still best practice to prepend Sass partial file names with "_".

> Yes, sourcemaps are output in development as well as production. It doesn't hurt performance and is helpful for production debuging and fellow developers learning our craft.

#### Theme or Plugin

Gulp WP can be used for themes *and* plugins. It will assume your project is a theme if there is a `style.css` file in the root, as WordPress requires this file with theme info in the header. Otherwise, it will look for your main plugin PHP file. The [translate task](#translate) uses the theme or plugin header info to set the `package` and `text-domain`.

## Configuration

While this package can be used with "zero configuration", your project may require that some defaults are changed.

### Environment Configuration

There are certain configurations that may be unique to each developer or environment, such as the local development URL or what browser BrowserSync should open, if any, so this package supports [Dotenv](https://www.npmjs.com/package/dotenv) for the options listed below. Just add a file to the root of your project named ".env", add any of the below options, and don't forget to add the file to your `gitignore`.

Option | Default | Type | Description
-------|---------|------|------------
DEV_URL | "http://localhost" | string | Local development URL for Browsersync. HTTPS and paths are accepted: "https://devdomain.local/foo".
NOTIFY | `true` | boolean&#124;string | Either a boolean to turn notifications on/off, or a string specifying what sound should be used (Mac only). See https://github.com/mikaelbr/node-notifier for sound name options.
BROWSERSYNC_OPEN | `true` | boolean | See https://browsersync.io/docs/options#option-open
BROWSERSYNC_BROWSER | N/A | string | Must be either a single string value or an array in JSON format as a string. See https://browsersync.io/docs/options#option-browser
BROWSERSYNC_NOTIFY | `true` | boolean | See https://browsersync.io/docs/options#option-notify

#### Example Dotenv file

file: .env

```shell
DEV_URL="https://mydevsite.local/"
NOTIFY=true
BROWSERSYNC_OPEN=false
BROWSERSYNC_BROWSER="['firefox', 'google chrome']"
BROWSERSYNC_NOTIFY=true
```

> Note that you can also set other environment variables for tools used by this workflow. For instance, you can set `DISABLE_NOTIFIER=true` to turn off `gulp-notify` directly instead of using the `NOTIFY` option.

### Project Configuration

If it's really necessary, you *can* provide a configuration object to Gulp WP, either via a `gulp-wp.config.js` file in the root of your project, or as the second parameter when requiring `gulp-wp` in a custom `gulpfile.js` (See [Gulpfile Config](#gulpfile-config)).

There are very few options, and most are geared towards individual task config. Each task file contains it's own default configuration in its export object. See [Tasks](#tasks) for default task config.

file: gulp-wp.config.js

```javascript
module.exports = {
	plugin: 'plugin-file.php', // Optional: explicitly specify your main plugin file that contains header info
	tasks: {
		scripts: {
			src: 'foo/styles',
			dest: 'bar/styles',
		},
		styles: {
			src: 'foo/scripts',
			dest: 'bar/scripts',
		},
		translate: {
			dest: 'translations',
		},
	},
};
```

## Tasks

### Dev (Default)

```shell
gulp-wp
```

or

```shell
gulp-wp dev
```

Runs `build`, then watches your files for changes, incimentally recompiles, and streams updates to or reloads your browser via BrowserSync.

### Build

```shell
gulp-wp build
```

Runs `clean` and then `styles`, `scripts`, and `translate` in parallel.

### Clean

```shell
gulp-wp clean
```

Cleans the `dest` folders of `styles` and `scripts`.

### Scripts

```shell
gulp-wp scripts
```

Transforms your _script_ source files (`.js`, `.jsx`, `.ts`, `.tsx`, etc) into JS for the browser.

Features:
  * [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts): Scripts are transformed via Webpack and the official `@wordpress/scripts` config. This provides many benefits, most notably that "asset" files are generated that include a version hash and a dependencies array for enqueuing based on imports of core `@wordpress/*` modules.
  * [gulp-dependents](https://www.npmjs.com/package/gulp-dependents): While this is by default a Sass tool, it has been configured to also handle JavaScript ES6 imports. Only entrypoint files that import the module you just edited will be recompiled.

Default config:

```javascript
{
	src: 'src/scripts/**/*.*', // all script source files for dependency tree
	dest: 'dist/js',
	entries: 'src/scripts/*.*', // files that are entrypoints
	includePaths: [ 'node_modules' ],
}
```

### Styles

```shell
gulp-wp styles
```

Transforms your _style_ source files (`.css`, `.scss`, `.sass`) into CSS for the browser.

Features:
  * [gulp-sass](https://www.npmjs.com/package/gulp-sass): Implements [Dart Sass](http://sass-lang.com/dart-sass) and sets the `node_modules` folder as an `includePath` (so you can do `@import 'foo/bar'` instead of `@import '../../node_modules/foo/bar'`).
  * [gulp-sass-glob](https://www.npmjs.com/package/gulp-sass-glob): Import sass files using glob patterns, great for importing styles for components that don't depend on each other.
  * [gulp-postcss](https://www.npmjs.com/package/gulp-postcss): Currently the only PostCSS plugin in use by default is [Autoprefixer](https://www.npmjs.com/package/autoprefixer).
  * [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css): Minifies CSS inteligently. Set to level 2 optimizations by default.
  * [gulp-dependents](https://www.npmjs.com/package/gulp-dependents): Only recompile the entry files that import/use the partial you just edited.

> Using Sass is optional--If you prefer to use PostCSS plugins, refer to this documentation for how to load them via postcss config: https://www.npmjs.com/package/postcss-load-config

Default config:

```javascript
{
	src: 'src/styles/**/*.*', // all style source files for dependency tree
	dest: 'dist/css',
	entries: 'src/styles/*.*', // files that are entrypoints
	includePaths: [ 'node_modules' ],
}
```

### Translate

```shell
gulp-wp translate
```

Generate a `.pot` file for your project.

Features:
  * [gulp-wp-pot](https://www.npmjs.com/package/gulp-wp-pot) Pot file generator
  * Gets `package` and `text-domain` from your project's theme/plugin header

> This task does not translate your project into other languages. It simply sets up the translation file which can then be used to translate your project with a tool like [Poedit](https://poedit.net/)!

Default config:

```javascript
{
	src: [ '**/*.php', '!node_modules/**/*', '!**/*.asset.php' ],
	dest: 'languages',
}
```

### Version

```shell
gulp-wp version
```

Copies the version number from `package.json` to your theme's `style.css` header or your plugin's main PHP file header. This allows for using [npm version](https://docs.npmjs.com/cli/v7/commands/npm-version) to manage version changes, though it requires some additional setup in your `package.json` to be useful:

```json
{
	...
	"scripts": {
		"version": "gulp-wp build && git add --all",
		...
	}
}
```

> Note that if you are using a custom `gulpfile.js`, replace "gulp-wp" with "gulp".

Now you can run `npm version patch` to bump the patch number from eg. 1.0.0 to 1.0.1, after which the build task will run and modified files will be added to your git index (the `version` script above), and then the commit will be tagged.

If you'd rather control the version number via the `style.css` or main plugin PHP file, you can pass that file as the `src` config parameter. This will reverse the direction so that the version number is injected into `package.json`, but the `npm version` command will not work.

Default config:

```javascript
{
	src: 'package.json',
}
```

### Watch

```shell
gulp-wp watch
```

Not meant to be run directly. This task is run by `dev` to watch files related to `scripts`, `styles`, and `translate`. You can pass a `watch` config parameter to any of those tasks to influence what files this task watches.

### Custom Tasks

So, you've installed `gulp-wp` and it's working well for you, except you'd rather it did one of the tasks differently, or you need to add your own task to run with the `dev` and `build` tasks.

This module uses a [custom Gulp registry](https://gulpjs.com/docs/en/advanced/creating-custom-registries/) to load tasks in a special format. Without having to create a `gulpfile.js`, you can define self-contained tasks by adding JS files to a folder named `gulp-wp` in the root of your project. You can even override default Gulp WP tasks by providing a task the same name, just be aware that you will need to rebuild the full task yourself. These JS modules must export an object with a specific interface:

file: gulp-wp/example.js

```javascript
/**
 * Note that Gulp WP currently uses CommonJS module format.
 * You should `require` any node modules necessary that you have installed as
 * a `dependency` in your `package.json`.
 */
module.exports = {
	/**
	 * The task property is a function that returns your gulp task function.
	 * Note that it should only `return` a single function; multiple are shown
	 * below as examples only.
	 */
	task: ( gulp, config, registry ) => {
		/**
		 * Example using a task config value and the gulp `done` callback.
		 */
		const { who } = config;
		return function example( done ) {
			console.log( 'hello', who );
			done();
		}

		/**
		 * Example using task config values and gulp pipes.
		 */
		const { src, dest } = config;
		return function example() {
			return gulp.src( src )
				.pipe(/* do pipe things */)
				.pipe( gulp.dest( dest ) );
		}

		/**
		 * Example using series/parallel and dependent tasks
		 * Note that the gulp.series or gulp.parallel must be returned directly.
		 */
		const example = gulp.series(
			registry.get( 'clean' ),
			gulp.parallel(
				registry.get( 'scripts' ),
				registry.get( 'styles' )
			)
		);
		return example;

		/**
		 * Example using config props of dependent tasks.
		 * Only the configs of tasks listed in `dependencies` can be relied on to
		 * exist in `registry.config.tasks`.
		 */
		const { scripts, styles } = registry.config.tasks;
		return function example(done) {
			console.log( 'scripts src', scripts.src );
			console.log( 'styles src', styles.src );
			done();
		}
	},
	/**
	 * Default config is defined with the task and is overridable in the project
	 * level config. In this case, it would be located at `config.tasks.example`.
	 */
	config: {
		who: 'world',
		src: 'foo/*',
		dest: 'bar',
	},
	/**
	 * List all tasks that are used or referenced in this task, even if it's just
	 * for a config property, and even if the dependent task already has its own
	 * dependency on another referenced task.
	 */
	dependencies: [ 'clean', 'scripts', 'styles' ],
};
```

> You can change the folder from which local tasks should be loaded via the config property `taskFolder`. This should be a path string relative to your project root, though it can instead be an absolute path.

When overriding a Gulp WP task, you can import the default task directly to access it's properties if needed:

```javascript
const { config, dependencies } = require( '@b.d/gulp-wp/tasks/example' );
module.exports = {
	task: // your override task wrapper here
	config: {
		...config,
		foo: 'bar',
	},
	dependencies: [ ...dependencies, 'baz' ],
}
```

> There is currently no way to insert custom functionality into a default task, so it needs to be rebuilt the way you want it to work. It could be helpful to copy the task file from the Gulp WP tasks folder as a starting point.

### Using Gulp Directly

Instead of running `gulp-wp`, you can instead add your own `gulpfile.js` in the root of your project and `require()` this module, then `export` your custom tasks and even override ones provided by `gulp-wp`:

```javascript
const gulp = require('gulp');

// Require GulpWP and pass your local `gulp` instance to it
const gulpWP = require('@b.d/gulp-wp')(gulp);

// Run this custom task via `gulp custom`
exports.custom = (done) => {
	// ... do custom task
	done();
}

// Run this custom build task via `gulp build`
exports.build = gulp.series( 'clean', gulp.parallel( 'scripts', 'styles', 'translate', custom ) );
```
> Note that you will have to rebuild the `build` task manually by re-adding all of the tasks you want to run. This new recomposed `build` will be used in the `dev`/`default` task.

Now, instead of running `gulp-wp`, you can run `gulp` directly (as long as you've also installed the [gulp-cli package](https://www.npmjs.com/package/gulp-cli) globally, otherwise you can run `npx gulp`).

> Note that you really shouldn't need `gulpfile.babel.js` anymore if you're using a recent Node.js version. The only thing you can't currently do is use `import` and `export`. Just use `require` and `module.exports`.

You can still use the task files as described in [Custom Tasks](#custom-tasks).

#### Gulpfile Config

If you are providing a custom `gulpfile.js`, you can pass a custom config object as the second parameter when `require`-ing `gulp-wp`:

```javascript
const gulp = require('gulp');

const config = {
	// your config here
};

// Require GulpWP and pass your custom config
const gulpWP = require('@b.d/gulp-wp')(gulp, config);
```

## Rationale

There are plenty of WordPress-oriented wokflow scripts to choose from out there, and they seem to come in two flavors: A gulpfile that you drop into your project with a giant config object, or a scripts package like the official [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) that uses Webpack under the hood. Neither of these are ideal.

Putting someone else's gulpfile into your project does grant you the ability to modify it as you see fit, but it also means installing all of the gulp plugins necessary, and then maintaining the workflow yourself over the project's lifetime. Some provide a handy installer script that can update the workflow, but any customizations you've made are overwritten.

Single-dependency, zero-configuration scripts packages like `@wordpress/scripts` are ok, until you need additional functionality that is not included--like a special way of handling certain assets specific to your project. You can, of course, extend the Webpack config file, but, let's be honest, it's a _pain_. Webpack is a __JavaScript app packager__, but developing WordPress themes and plugins involves more than just JS (have you tried putting just Sass files through Webpack?). And many of us are already used to Gulp, but maintaining the workflow is not what we want to be spending our time doing.

But Gulp _is a task runner_. It was born to _run workflows_. Why should we abandon it?

Enter `@b.d/gulp-wp`, a reusable scripts package built with Gulp. All of the convenience of a single-dependency, zero-config workflow script package without the hassle of bending Webpack to the breaking point just to compile some Sass. Install it and get up-and-running immediately, or extend it using Gulp the way you're used to.

## About Blackbird

[Blackbird Digital](https://blackbird.digital/) is a digital marketing agency located near Cleveland, Ohio, USA. We've been building custom WordPress websites since 2012 and mobile apps for nearly as long. We want to make our own work better and more productive, and, in the spirit of WordPress and open source, yours too.
