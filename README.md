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

#### Tasks

There are several tasks available for individual aspects of development. Generally speaking, you probably shouldn't need to run them individually, since they are run as needed during the `watch` and `build` tasks.

Running a task in your project is as simple as calling `npx gulp-wp foo` where "foo" is the task name:

Task | Description
-----|------------
`watch` | Default task that runs when no task is specified. Runs everything that `build` does, but also watches your files for changes and sends real-time updates via BrowserSync to your browser.
`build` | Runs all of the various tasks to build your project for deployment.
`scripts` | Runs `@wordpress/scripts` to package your JavaScript and generate asset files with a version hash and dependency array.
`styles` | Compiles your Sass or Post CSS.
`translate` | Runs `wp-pot` to create translation files.
`version` | Copies version number updates from `package.json` to your theme's `style.css` file or your plugin's main php file.

## Environment Configuration

There are certain configurations that may be unique to each developer or environment, such as the local development URL or what browser BrowserSync should open, if any, so this package supports [Dotenv](https://www.npmjs.com/package/dotenv) for the options listed below. Just add a file to the root of your project named ".env", add any of the below options, and don't forget to add the file to your `gitignore`.

Option | Default | Type | Description
-------|---------|------|------------
DEV_URL | "http://localhost" | string | Local development URL for Browsersync. HTTPS and paths are accepted: "https://devdomain.local/foo".
NOTIFY | `true` | boolean&#124;string | Either a boolean to turn notifications on/off, or a string specifying what sound should be used (Mac only). See https://github.com/mikaelbr/node-notifier for sound name options.
BROWSERSYNC_OPEN | `true` | boolean | See https://browsersync.io/docs/options#option-open
BROWSERSYNC_BROWSER | N/A | string | Must be either a single string value or an array in JSON format as a string. See https://browsersync.io/docs/options#option-browser
BROWSERSYNC_NOTIFY | `true` | boolean | See https://browsersync.io/docs/options#option-notify

### Example Dotenv file

file: .env

```shell
DEV_URL="https://mydevsite.local/"
NOTIFY=true
BROWSERSYNC_OPEN=false
BROWSERSYNC_BROWSER="['firefox', 'google chrome']"
BROWSERSYNC_NOTIFY=true
```

## Customization

TODO: how to customize/add gulp-wp tasks

## Rationale

There are plenty of WordPress-oriented wokflow scripts to choose from out there, and they seem to come in two flavors: A gulpfile that you drop into your project with a giant config object, or a scripts package like the official [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) that uses Webpack under the hood. Neither of these are ideal.

Putting someone else's gulpfile into your project does grant you the ability to modify it as you see fit, but it also means installing all of the gulp plugins necessary, and then maintaining the workflow yourself over the project's lifetime. Some provide a handy installer script that can update the workflow, but any customizations you've made are overwritten.

Single-dependency, zero-configuration scripts packages like `@wordpress/scripts` are ok, until you need additional functionality that is not included--like a special way of handling certain assets specific to your project. You can, of course, extend the Webpack config file, but, let's be honest, it's a _pain_. Webpack is a __JavaScript app packager__, but developing WordPress themes and plugins involves more than just JS (have you tried putting just Sass files through Webpack?). And many of us are already used to Gulp, but maintaining the workflow is not what we want to be spending our time doing.

But Gulp _is a task runner_. It was born to _run workflows_. Why should we abandon it?

Enter `@b.d/gulp-wp`, a reusable scripts package built with Gulp. All of the convenience of a single-dependency, zero-config workflow script package without the hassle of bending Webpack to the breaking point just to compile some Sass. Install it and get up-and-running immediately, or extend it using Gulp the way you're used to.

## About Blackbird

[Blackbird Digital](https://blackbird.digital/) is a digital marketing agency located near Cleveland, Ohio, USA. We've been building custom WordPress websites since 2012 and mobile apps for nearly as long. We want to make our own work better and more productive, and, in the spirit of WordPress and open source, yours too.
