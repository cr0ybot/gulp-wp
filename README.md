# Gulp WP

Gulp WP is a single-dependency Gulp-based workflow script for WordPress themes and plugins. See the [Rationale](#rationale) section for why we've built this, but here's a summary:

Gulp WP is:

  * :arrows_clockwise: __Reusable__: It's a collection of workflow scripts that you can drop into any project without having to untangle it from other setups.
  * :left_right_arrow: __Extendable__: It's built with Gulp and can be used as-is or hooked into to customize or add new workflows for your specific project.
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

> Note that any argument that you can pass to the standard `gulp` command you can pass with `gulp-wp`, with the exception of `--gulpfile` and `--cwd`, since those are used internally to run the appropriate gulpfile.

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

#### Available Tasks

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

> See the [Tasks](#tasks) section below for more details about each task.

### Project Structure

If you want to use this workflow with zero configuration, your project must be set up with the files located where the default configuration expects:

```
project (root)
  ├╴gulp-wp.config.js // optional
  ├╴gulpfile.js // optional
  ├╴index.php // required by WordPress
  ├╴package.json
  ├╴style.css // required by WordPress, theme info only (no styles)
  ├╴dist // processed files only
  │ ├╴css
  │ │ ├╴*.css
  │ │ └╴*.css.map
  │ └╴js
  │   ├╴*.js
  │   └╴*.js.map
  ├╴languages
  └╴src
    ├╴styles
    │ ├╴*.[css|scss|sass]
    │ └╴[subfolders]
    └╴scripts
      ├╴*.js
      └╴[subfolders]
```

All files within the `styles` and `scripts` folders in `src` will be treated as separate entrypoints to transform, meaning they will be processed by the workflow and output to the appropriate folders in `dist`, including their sourcemap files.

> Yes, sourcemaps are output in development as well as production. It doesn't hurt performance and is helpful for production debuging and fellow developers learning our craft.

Subfolders in `styles` and `scripts` are not processed directly. Use subfolders to organize your partials or modules and import them where necessary into an entrypoint file in the root of the folder.

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

## Tasks

### Dev (Default)

```shell
gulp-wp
```

or

```shell
gulp-wp dev
```

### Build

```shell
gulp-wp build
```

### Styles

```shell
gulp-wp styles
```

Transforms your source files (`.css`, `.scss`, `.sass`) into CSS.

Features:
  * [gulp-sass](https://www.npmjs.com/package/gulp-sass): Implements [Dart Sass](http://sass-lang.com/dart-sass) and sets the `node_modules` folder as an `includePath` (so you can do `@import 'foo/bar'` instead of `@import '../../node_modules/foo/bar'`).
  * [gulp-sass-glob](https://www.npmjs.com/package/gulp-sass-glob): Import sass files using glob patterns, great for importing styles for components that don't depend on each other.
  * [gulp-postcss](https://www.npmjs.com/package/gulp-postcss): Currently the only PostCSS plugin in use by default is [Autoprefixer](https://www.npmjs.com/package/autoprefixer).
  * [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css): Minifies CSS inteligently. Set to level 2 optimizations by default.

> Using Sass is optional--If you prefer to use PostCSS plugins, refer to this documentation for how to load them via postcss config: https://www.npmjs.com/package/postcss-load-config

### Scripts

```shell
gulp-wp scripts
```

### Translate

```shell
gulp-wp translate
```

**This does not translate your project into other languages. It simply sets up the translation file which can then be used to translate your project!**

### Version

```shell
gulp-wp version
```

### Custom Tasks

So, you've installed `gulp-wp` and it's working well for you, except you'd rather it did one of the tasks a little differently, like adding your own task to run with the standard `watch` and `build` tasks.

Instead of running `gulp-wp` directly, you can instead add your own `gulpfile.js` in the root of your project and `require()` this module, then export your custom tasks and even modify ones provided by `gulp-wp`:

```javascript
const gulpWP = require('@b.d/gulp-wp');

// TODO: sort this out
```

Now, instead of running `gulp-wp`, you can run `gulp` directly (as long as you've also installed the [gulp-cli package](https://www.npmjs.com/package/gulp-cli) globally, otherwise you can run `npx gulp`).

## Rationale

There are plenty of WordPress-oriented wokflow scripts to choose from out there, and they seem to come in two flavors: A gulpfile that you drop into your project with a giant config object, or a scripts package like the official [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) that uses Webpack under the hood. Neither of these are ideal.

Putting someone else's gulpfile into your project does grant you the ability to modify it as you see fit, but it also means installing all of the gulp plugins necessary, and then maintaining the workflow yourself over the project's lifetime. Some provide a handy installer script that can update the workflow, but any customizations you've made are overwritten.

Single-dependency, zero-configuration scripts packages like `@wordpress/scripts` are ok, until you need additional functionality that is not included--like a special way of handling certain assets specific to your project. You can, of course, extend the Webpack config file, but, let's be honest, it's a _pain_. Webpack is a __JavaScript app packager__, but developing WordPress themes and plugins involves more than just JS (have you tried putting just Sass files through Webpack?). And many of us are already used to Gulp, but maintaining the workflow is not what we want to be spending our time doing.

But Gulp _is a task runner_. It was born to _run workflows_. Why should we abandon it?

Enter `@b.d/gulp-wp`, a reusable scripts package built with Gulp. All of the convenience of a single-dependency, zero-config workflow script package without the hassle of bending Webpack to the breaking point just to compile some Sass. Install it and get up-and-running immediately, or extend it using Gulp the way you're used to.

## About Blackbird

[Blackbird Digital](https://blackbird.digital/) is a digital marketing agency located near Cleveland, Ohio, USA. We've been building custom WordPress websites since 2012 and mobile apps for nearly as long. We want to make our own work better and more productive, and, in the spirit of WordPress and open source, yours too.
