jquery-platinum
===============

A jQuery utility library for building fast-loading, professional frontend code.

### Project goals

* Extend jQuery with expressive, useful utilities for arrays, objects and asynchronous operations
* Implement normalized APIs for common website requirements like Google Analytics and social sharing buttons
* Provide a build system to create custom, minified builds of the codebase tailored to specific needs

This is a work-in-progress. Currently, the project provides:

* Language utilities for managing function binding and argument currying
* Array utilities for functional-style iteration and functions for map, reduce, filter, etc.
* Basic asynchronous script-loading utilities using a light wrapper around `$.ajax()`
* A powerful API wrapping Google Analytics' asynchronous library
* A simple build system that automatically creates full and minified versions of each .js file in the src directory


Overview
--------

The easiest way to use the project is to
[download the current minified source](https://raw.github.com/skibblenybbles/jquery-platinum/master/jquery.platinum.min.js),
add it to your website's static media and include it on your website's pages after you include jQuery:

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script src="[path to your js files]jquery.platinum.min.js"></script>
```

The script adds a `$pt` global variable which you can use to conveniently access the utilities provided by
jquery-platinum. The utilities are also available on the jQuery object at `jQuery.platinum` or `$.platinum`.

If you don't like the global `$pt` variable, you can remove it by calling `$pt.noConflict()`, which works
just like jQuery's <code><a target="_blank" href="http://api.jquery.com/jQuery.noConflict/">noConflict()</a></code>.

For more advanced usage, you can download a specific plugin, such as
[jquery.platinum-analytics.js](https://raw.github.com/skibblenybbles/jquery-platinum/master/jquery.platinum-analytics.min.js).
Or, you can fork the project and modify the
[build script](https://github.com/skibblenybbles/jquery-platinum/blob/master/build/build.py).
The build script requires Python (for the script) and Java (for the included Google Closure Compiler).
I have plans to implement a useful command line interface for creating custom builds, but I am focusing on the
JavaScript at this point.

The following sections describe all of the utilities and plugins provided by each jquery.platinum*.js script.
As you might expect,
[jquery.platinum.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum.js)
contains the full build of all the utilities and plugins.

*******************


[jquery.platinum-array-base.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum-array-base.js)
----------------------------------------------------------------------------------------------------------------------------

This script contains array slicing, stepping and iterating utilities. It is similar to some of the functionality
provided by native JavaScript and jQuery, but ultimately it is more expressive. The functions operate on JavaScript
Arrays or array-like objects that have a `.length` attribute zero-based indexing, e.g. the `arguments` object
that is available in a function body can be manipulated with these functions.

### `$pt.array(values, [start, end, step])`

Takes a JavaScript Array or array-like object and returns a new JavaScript Array. Optionally
slices the array beginning at the `start` index and ending at the `end - 1` index. The `step`
parameter controls the increment of the index counter during iteration. Negative `start` and `end`
indexes are also supported. For example a `start` index of `-2` means to start at the second
from the last index in the array.

The effect is to create an expressive array utility that mimics the slicing and stepping provided
by Python's list implementation.

#### Arguments

Argument    | Description
------------|------------
`values`    | a JavaScript Array or array-like object.
`start`     | (optional) the index into the array where the iteration will start. It may be negative to index from the end of the array. If set to `null` or `undefined`, the value is set to the "start" of the array appropriate for the sign of the `step` argument.
`end`       | (optional) the index into the array where the iteration will stop (non-inclusive). It may be negative to index from the end of the array. If set to `null` or `undefined`, the value is set to the "end" of the array appropriate for the sign of the `step` argument.
`step`      | (optional) The amount by which to increment the array index counter during iteration. Use positive values to iterate forward and negative values to iterate in reverse. A value of `0` will be changed to `1` to avoid infinite iteration.

#### Returns

A new JavaScript Array with sliced and stepped values from the original `values` argument.

#### Example

```javascript
// create an array to use for experiments
var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// create a new array with only the first item
console.log($pt.array(values, 0, 1));
// output: [1]

// create a new array from all of the values at even indexes
console.log($pt.array(values, 0, null, 2));
// output: [1, 3, 5, 7, 9]

// create a new array from all the values at odd indexes
console.log($pt.array(values, 1, null, 2));
// output: [2, 4, 6, 8, 10]

// create a new array of the last 4 values
console.log($pt.array(values, -4));
// output: [7, 8, 9, 10]

// create a new reversed array
console.log($pt.array(values, null, null, -1));
// output: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

// create a new reversed array starting from the last index
// and ending at the 9th-to-last index, jumping 3 indexes at a time
console.log($pt.array(values, -1, -9, -3));
// output: [10, 7, 4]
```

*******************

### `$pt.array.each(values, fn, [start, end, stop])`

Takes a JavaScript Array or array-like object and runs the given function `fn` for each value in the array.
Optionally slices and steps through the input array in the same way as `$pt.array()`.

#### Arguments

Argument    | Description
------------|------------
`values`    | a JavaScript Array or array-like object.
`fn`        | a function that accepts a single argument that will be called for each object processed in the `values` array.
`start`     | (optional) see `$pt.array()`.
`end`       | (optional) see `$pt.array()`.
`step`      | (optional) see `$pt.array()`.

#### Returns

`undefined` (no return value)

