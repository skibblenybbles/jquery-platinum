jquery-platinum
===============

A jQuery utility library for building fast-loading, professional frontend code.

### Project goals

* Extend jQuery with expressive, useful utilities for arrays, objects and asynchronous operations
* Provide normalized APIs for common website requirements like Google Analytics and social sharing buttons
* Implement a build system to create custom, minified builds of the codebase tailored to specific needs

This is a work-in-progress. Currently, the project provides:

* Language utilities for managing function binding and argument currying
* Array utilities for functional-style iteration and functions for map, reduce, filter, etc.
* Basic asynchronous script-loading utilities using a light wrapper around `$.ajax()`
* A powerful API wrapping Google Analytics' asynchronous library
* A simple build system that automatically creates full and minified versions of each .js file in the src directory

Overview
--------

The easiest way to use the project is to
<a href="https://raw.github.com/skibblenybbles/jquery-platinum/master/jquery.platinum.min.js">download the current minified source</a>,
add it to your website's static media and include it on your website's pages after you include jQuery:

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script src="[path to your js files]jquery.platinum.min.js"></script>
```

The script adds a `$pt` global variable which you can use to conveniently access the utilities provided by
jQuery Platinum. The utilities are also available on the jQuery object at `jQuery.platinum` or `$.platinum`.

If you don't like the global `$pt` variable, you can remove it by calling `$pt.noConflict()`, which works
just like jQuery's <code><a href="http://api.jquery.com/jQuery.noConflict/">noConflict()</a></code>.

For more advanced usage, you can download a specific plugin, such as
<a href="https://raw.github.com/skibblenybbles/jquery-platinum/master/jquery.platinum-analytics.min.js">jquery.platinum-analytics.js</a>.
Or, you can fork the project and modify the
<a href="https://github.com/skibblenybbles/jquery-platinum/blob/master/build/build.py">build script</a>.
The build script requires Python (for the script) and Java (for the included Google Closure Compiler).
I have plans to implement a useful command line interface for creating custom builds, but I am focusing on the
JavaScript at this point.

The following sections describe all of the utilities and plugins provided by each jquery.platinum*.js script.
<a href="https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum.js">jquery.platinum.js</a>
contains the full build of all the utilities and plugins.
