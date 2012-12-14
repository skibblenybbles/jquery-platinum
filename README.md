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


[jquery.platinum-array-base.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum-array-base.js)
-------------------------------

This script provides array slicing, stepping and iterating utilities. It is similar to some of the functionality
provided by native JavaScript and jQuery, but it is more expressive. The functions operate on JavaScript
Arrays or array-like objects that have a `.length` attribute and zero-based indexing. For examplethe `arguments`
object that is available inside of a function can be passed to these utilities to create normal Array objects.

### `$pt.array(values, [start, end, step])`

Takes an Array or array-like object and returns a new Array. Optionally slices the array beginning
at the `start` index and ending at the `end - 1` index. The `step` parameter controls the increment
of the index counter during iteration. Negative `start` and `end` indexes are also supported. For
example a `start` index of `-2` means to start at the second from the last index in the array.

The effect is to create an expressive array utility that mimics the slicing and stepping provided
by Python's list implementation.

#### Parameters

Parameter   | Description
------------|------------
`values`    | an Array or array-like object.
`start`     | (optional) the index into the array where the iteration will start. It may be negative to index from the end of the array. If set to `null` or `undefined`, the value is set to the "start" of the array appropriate for the sign of the `step` argument.
`end`       | (optional) the index into the array where the iteration will stop (non-inclusive). It may be negative to index from the end of the array. If set to `null` or `undefined`, the value is set to the "end" of the array appropriate for the sign of the `step` argument.
`step`      | (optional) The amount by which to increment the array index counter during iteration. Use positive values to iterate forward and negative values to iterate in reverse. A value of `0` will be changed to `1` to avoid infinite iteration.

#### Returns

A new Array with sliced and stepped values from the original `values` argument.

#### Examples

```javascript
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


### `$pt.array.each(values, fn, [start, end, stop])`

Takes a JavaScript Array or array-like object and runs the given function `fn` for each value in the array.
Optionally slices and steps through the input array in the same way as `$pt.array()`.

#### Parameters

Parameter   | Description
------------|------------
`values`    | a JavaScript Array or array-like object.
`fn`        | a function that accepts a single argument that will be called for each object processed in the `values` array.
`start`     | (optional) see `$pt.array()`.
`end`       | (optional) see `$pt.array()`.
`step`      | (optional) see `$pt.array()`.

#### Returns

`undefined` (no return value)

#### Examples

```javascript
var values = ["hello", "there", "how", "are", "you", "i", "am", "fine"];

// log the first 5 values
$pt.array.each(values, function(value) { console.log(value); }, 0, 5);
// output:
// hello
// there
// how
// are
// you

// log the last 3 values in reverse
$pt.array.each(values, function(value) { console.log(value); }, -1, -4, -1);
// output:
// fine
// am
// i
```


[jquery.platinum-scripts.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum-scripts.js)
----------------------------

This script provides utilities for loading scripts asynchronously.

### `$pt.scripts.load(url, options)`

Loads a JavaScript file with the given `url` and executes it. This is a lightweight wrapper around
`$.ajax()` with hard-coded values `dataType === true` and `cache === true`. According to jQuery's documentation,
the provided `$.getScript()` sets `cache` to `false`, so this is probably a better choice for loading
scripts asynchronously in most cases. It returns the resulting promise from calling `$.ajax()`, so you
can hook a load callback by calling the return value's `done()` method.

#### Parameters

Parameter   | Description
------------|------------
`url`       | The URL of the script to load.
`options`   | (optional) additional options to pass to the `$.ajax()` call.

#### Returns

A promise to load the requested script

#### Example

```javascript
// load jQuery UI and log a message once it has loaded
$pt.scripts.load("//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js").done(function() {
    console.log("jQuery UI has loaded!");
});
```


[jquery.platinum-lang.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum-lang.js)
-------------------------

*Includes jquery.platinum-array-base.js.*

This script provides language helper utilities for binding
functions to objects and currying arguments to functions. Combined judiciously with `$pt.array` utilities,
the `$pt.lang` utilities can improve your code's readability and help you avoid common bugs introduced
by JavaScript's built-in `for (;;)` syntax.


### `$pt.lang.hitch(that, fn, [args ...])`

Creates a new function binding the given function `fn` to the object `that`. When the resulting function
is called, its `this` value will be the `that` object. Optionally curries any number of extra
arguments to the new function as well.

#### Parameters

Parameter   | Description
------------|------------
`that`      | an object to which the resulting function's `this` value will be bound and to which `args` will be curried.
`fn`        | the function to bind to the `that` object.
`args`      | (optional) N additional arguments that will be curried as the first N arguments passed to the function `fn`.

#### Returns

A new function that calls `fn` with its `this` value bound to `that` and curried arguments `args`.

#### Examples

```javascript
// create an object with a property and a method to log the property
var owner = {
    prop: "This is my property.",
    log: function() {
        console.log(this.prop);
    }
};

// call it
owner.log();
// output: This is my property.

// now store owner's log() as a global
var log = owner.log;

// call it
log();
// output: undefined
// (this is because the global log() is bound to window, not owner)

// prove it
window.prop = "And I am the window";
log();
// output: And I am the window

// overwrite log(), by setting it to the function created by hitching owner's log() to owner
log = $pt.lang.hitch(owner, owner.log);

// call it
log();
// output: This is my property.

// create a thief with its own property
var thief = {
    prop: "I like to steal methods."
};

// bind owner's log() to thief
thief.log = $pt.lang.hitch(thief, owner.log);

// call it
thief.log();
// output: I like to steal methods.

// work with $pt.array.each() to log each item in an array
$pt.array.each([2, 4, 6, 8, 10], $pt.lang.hitch(console, console.log));
// output:
// 2
// 4
// 6
// 8
// 10

// what about currying? here's a contrived example:
var person = {
    first: "Bob",
    last: "Hope",
    log: function(lastName, firstName) {
        console.log(firstName + " " + lastName);
    },
    display: function() {
        this.log(this.last, this.first);
    }
};
person.display();
// output: Bob Hope

// let's overwrite the log() method with the curried lastName of "The Builder"
person.log = $pt.lang.hitch(person, person.log, "The Builder");
person.display();
// output: The Builder Hope

// play a little more
person.last = "Pharaoh";
person.display();
// output: The Builder Pharaoh
```


### `$pt.lang.partial(fn, [args ...])`

Creates a new function binding the given function `fn` to null with optionally curried arguments.

#### Parameters

Parameter   | Description
------------|------------
`fn`        | the function to which `args` will be curried.
`args`      | (optional) N additional arguments that will be curried as the first N arguments passed to the function `fn`.

#### Returns

A new function that calls `fn` with its `this` value bound to `null` and curried arguments `args`.

#### Examples

```javascript
// add a click handler to all <a> tags on the page that logs a curried message
$("a").click($p.lang.partial(function(message, evt) {
    console.log(message);
    // notice how evt got passed as the second argument instead
    // of the usual first argument
    evt.preventDefault();
}, "It works!"));

// upon click of a link tag:
// ouput: It works!
```


