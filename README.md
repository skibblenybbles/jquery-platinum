jquery-platinum
===============

A jQuery utility library for building fast-loading, professional frontend code.

*Important! This project is a work-in-progress, so the APIs may change. If you want a snapshot of the current version, clone it or fork it.*

### Project goals

* Extend jQuery with expressive, useful utilities for arrays, objects and asynchronous operations
* Implement normalized APIs for common website requirements like Google Analytics and social sharing buttons
* Provide a build system to create custom, minified builds of the codebase tailored to specific needs

This is a work-in-progress. Currently, the project provides:

* Language utilities for managing function binding and argument currying
* Array utilities for functional-style iteration and functions for map, reduce, filter, etc.
* Basic asynchronous script-loading utilities using a light wrapper around `$.ajax()`
* A convenient API wrapping Google Analytics' asynchronous library
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

`undefined` (no return value).

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
can register a load callback by calling the return value's `done()` method.

#### Parameters

Parameter   | Description
------------|------------
`url`       | The URL of the script to load.
`options`   | (optional) additional options to pass to the `$.ajax()` call.

#### Returns

A promise to load the requested script.

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

This script provides language helper utilities for binding functions to objects and currying arguments
to functions. Combined judiciously with `$pt.array` utilities, the `$pt.lang` utilities can improve
your code's readability and help you avoid common bugs introduced by JavaScript's built-in `for (;;)` syntax.


### `$pt.lang.hitch(that, fn, [args ...])`

Creates a new function binding the given function `fn` to the object `that`. When the resulting function
is called, its `this` value will be the `that` object. Optionally curries any number of extra
arguments to the new function as well.

#### Parameters

Parameter   | Description
------------|------------
`that`      | an object to which the resulting function's `this` value will be bound and to which `args` will be curried.
`fn`        | the function to bind to the `that` object.
`args ...`  | (optional) N additional arguments that will be curried as the first N arguments passed to the function `fn`.

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

// overwrite log() by setting it to the function created by hitching owner's log() to owner
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

// what about currying? here's a contrived example to show how it works:
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

// let's overwrite the log() method, currying the lastName parameter as "A New"
person.log = $pt.lang.hitch(person, person.log, "A New");
person.display();
// output: A New Hope

// play a little more
person.last = "Born Child";
person.display();
// output: A New Born Child
```


### `$pt.lang.partial(fn, [args ...])`

Creates a new function binding the given function `fn` to null with optionally curried arguments.

#### Parameters

Parameter   | Description
------------|------------
`fn`        | the function to which `args` will be curried.
`args ...`  | (optional) N additional arguments that will be curried as the first N arguments passed to the function `fn`.

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


### `$pt.lang.delegate(target, source)`

For each method in `source` that does not exist in `target`, adds a new method to `target` that
calls the `source`'s method. In other words, this function makes `target` implement all of `source`'s
methods. The exception is that `target`'s `constructor` method will not be overwritten.

#### Parameters

Parameter   | Description
------------|------------
`target`    | the target object that will have all of `source`'s methods added to it.
`source`    | the source object to which `target` will delegate methods.

#### Returns

`undefined` (no return value).

#### Examples

```javascript
// here's our source object
var monkey = {
    first: "Curious",
    last: "George",
    display: function() {
        console.log(this.first + " " + this.last);
    }
};

// here's our target object
var person = {
    displayPet: function() {
        this.display();
    }
};

// try it
person.displayPet();
// output: TypeError: Object #<Object> has no method 'display'

// delegate monkey's methods to person to make this work
$pt.lang.delegate(person, monkey);
person.displayPet();
// output: Curious George

// note that person does not have monkey's properties:
person.first
// output: undefined
```


[jquery.platinum-analytics.js](https://github.com/skibblenybbles/jquery-platinum/blob/master/jquery.platinum-analytics.js)
------------------------------

*Includes jquery.platinum-array-base.js, jquery.platinum-lang.js and jquery.platinum-scripts.js*

This script wraps the Google Analytics (GA) asynchronous library with a convenient API. It makes the most common 
case of loading GA and tracking a pageview very simple, but it also enables you to manage complex analytics
requirements on sites with multiple GA trackers.

When you begin using `$pt.analytics` methods, the Google Analtyics ga.js script will be automatically loaded 
using `$pt.scripts.load()`, so you do not need to *(and should not)* put the usual GA `<script>` tags
in your HTML to load Google Analytics. However, you must call the `setAccount()` method on the
`$pt.analytics` object to configure your GA account before calling its other methods (more details below).
Until you call `setAccount()`, any calls to `$pt.analytics` methods will be silently ignored.

The methods provided by `$pt.analytics` each return an opaque object that wraps the GA `_gaq.push(...)` methods.
Rather than using GA's obscure `_gaq.push(['_trackPageview', '/some-url/'])` syntax, you can write the more natural
syntax `$pt.analytics.trackPageview('/some-url/')` instead.

Each method in `$pt.analytics` returns the opaque analytics object, so you can chain GA methods
together. Fore example, you can write a chain of commands like:

```javascript
$pt.analytics
    .setAccount("UA-XXXXXXXX-Y")
    .setCustomVar(1, "User State", "Authenticated", 2)
    .trackPageview();

// this is precisely equivalent to:
_gaq.push(['_setAccount', "UA-XXXXXXXX-Y"]);
_gaq.push(['_setCustomVar', 1, "User State", "Authenticated", 2]);
_gaq.push(['_trackPageview']);
```

The above examples all assume usage of the "default tracker" whose name is `""`, the empty string.
Another common pattern is to use a "rollup tracker" for all of your websites and a site-specific
tracker for each website. With `$pt.analytics`, you can "choose" a tracker object by calling
`$pt.analytics` as a function and passing it the names of the trackers you would like to use:

```javascript
$pt.analytics("rollupTracker")
    .setAccount("UA-XXXXXXXX-1")
    .trackPageview();

$pt.analytics("siteTracker")
    .setAccount("UA-XXXXXXXX-2")
    .trackPageview();

// this is precisely equivalent to:
_gaq.push(['rollupTracker._setAccount', "UA-XXXXXXXX-1"]);
_gaq.push(['rollupTracker._trackPageview']);
_gaq.push(['siteTracker._setAccount', "UA-XXXXXXXX-2"]);
_gaq.push(['siteTracker._trackPageview']);
```

Under the hood, GA creates a new tracker object on-demand whenever you make `_gaq.push(...)` calls
like those in the previous example, i.e. after calling `_gaq.push(['exampleTracker.trackPageview'])`, 
GA will use the existing tracker named `'exampleTracker'` or create a new tracker named `'exampleTracker'`
if it doesn't already exist. A subsequent call to `_gat.getTrackerByName('exampleTracker')` would
return this tracker object.

The previous example on using multiple trackers with `$pt.analytics(...)` has a nicer syntax than
`_gaq.push(...)`, but it doesn't save you very much typing. The good news is that `$pt.analytics(...)`
also allows you to specify multiple tracker names, so you can send the same commands to multiple
trackers in one call, even with chaining:

```javascript
// set up the trackers
$pt.analytics("rollupTracker").setAccount("UA-XXXXXXXX-1");
$pt.analytics("siteTracker").setAccount("UA-XXXXXXXX-2");

// set a custom variable and track a pageview with both trackers
$pt.analytics("rollupTracker", "siteTracker")
    .setCustomVar(1, "User State", "Authenticated", 2)
    .trackPageview();
```

An alternative, equivalent syntax allows you to pass an array to `$pt.analytics(...)`

```javascript
// set up the trackers
$pt.analytics("rollupTracker").setAccount("UA-XXXXXXXX-1");
$pt.analytics("siteTracker").setAccount("UA-XXXXXXXX-2");

// set a custom variable and track a pageview with both trackers
$pt.analytics(["rollupTracker", "siteTracker"])
    .setCustomVar(1, "User State", "Authenticated", 2)
    .trackPageview();
```

Of course, we could store the tracker names in an array and pass that:

```javascript
var trackers = ["rollupTracker", "siteTracker"];

// set up the trackers
$pt.analytics("rollupTracker").setAccount("UA-XXXXXXXX-1");
$pt.analytics("siteTracker").setAccount("UA-XXXXXXXX-2");

// set a custom variable and track a pageview with both trackers
$pt.analytics(trackers)
    .setCustomVar(1, "User State", "Authenticated", 2)
    .trackPageview();
```

Finally, we can also pass `"*"` to `$pt.analytics(...)` to use all known trackers, i.e.
all trackers that have been set up through `$pt.analytics(...)` with a call to 
`setAccount(...)`:

```javascript
// set up the trackers
$pt.analytics("rollupTracker").setAccount("UA-XXXXXXXX-1");
$pt.analytics("siteTracker").setAccount("UA-XXXXXXXX-2");

// set a custom variable and track a pageview with both trackers
$pt.analytics("*")
    .setCustomVar(1, "User State", "Authenticated", 2)
    .trackPageview();
```

The previous four examples are all precisely equivalent to calling:

```javascript
// set up the trackers
_gaq.push(['rollupTracker._setAccount', "UA-XXXXXXXX-1"]);
_gaq.push(['siteTracker._setAccount', "UA-XXXXXXXX-2"]);

// set a custom variable and track a pageview with both trackers
_gaq.push(['rollupTracker._setCustomVar', 1, "User State", "Authenticated", 2]);
_gaq.push(['siteTracker._setCustomVar', 1, "User State", "Authenticated", 2]);
_gaq.push(['rollupTracker._trackPageview']);
_gaq.push(['siteTracker._trackPageview']);
```

GA allows you to pass callback functions to `_gaq.push(...)` that are called after the ga.js
script has loaded asynchronously. The callbacks can then call methods on the global `_gat` variable
to do things like get a named tracker, find out a tracker's version, get a linker URL, etc.
`$pt.analytics` wraps each of the GA's `_get*` methods in a more convenient way:

```javascript
// set an account for the default tracker, or the $pt.analytics method will be ignored
$pt.analytics.setAccount("UA-XXXXXXXX-1");

// with vanilla ga.js, to log the default tracker's version, you would write:
_gaq.push(function() {
    var tracker = _gat.getTrackerByName();
    console.log(tracker._getVersion());
});
// output: 5.3.8

// with $pt.analytics, you would write:
$pt.analytics.getVersion(function(version) {
    console.log(version);
});
// output: 5.3.8
```

You can see that `$pt.analytics` takes care of getting the tracker you requested and calling
its `_get*` method automatically, passing the result of the `_get*` method to your callback.

You can use the multiple tracker syntax with these types of methods, but this use case probably
doesn't have a lot of practical application:

```javascript
$pt.analytics("rollupTracker").setAccount("UA-XXXXXXXX-1");
$pt.analytics("siteTracker").setAccount("UA-XXXXXXXX-2");

$pt.analytics("*").getVersion(function(version) {
    console.log(version);
});
// output:
// 5.3.8
// 5.3.8
```

`$pt.analytics` implements all of the current, non-deprecated methods provided by `_gaq.push(...)`
with the `_` removed from the start of the method name. For a reference on how to use these methods, 
please refer to the
<a target="_blank" href="https://developers.google.com/analytics/devguides/collection/gajs/methods/">Google Analytics Documentation</a>.

### `$pt.analytics`

An object that delegates its methods to an opaque object that wraps the GA methods for the default
tracker named `""`.

### `$pt.analytics([trackerName ... | trackerNameArray | "*"])`

This function returns an opaque object that wraps the GA methods bound to the tracker(s) specified by
the names in `trackerName ...`, `trackerNameArray` or all trackers if `"*"` is passed. If no arguments
are passed, the returned opaque object will be bound to the default tracker named `""`.

The function also allows you to mix a variable number of string and array arguments, but this
usage is somewhat obscure. Mixing `"*"` with other arguments will produce undefined results.

Finally, each tracker name should be a valid string name for a tracker as specified by Google Analytics.
Generally, using names that are valid JavaScript variable identifiers should work, i.e. letters,
underscores and digits after the first character. Usage of special characters for identifiers allowed
by JavaScript like `"$"` may work, but you should consult GA's documentation or try it with an experiment
first.

#### Parameters

Parameter           | Description
--------------------|------------
`trackerName ...`   | a variable number of string names for trackers.
`trackerNameArray`  | an array of string names for trackers.
`"*"`               | a special argument that specifies all trackers that have been initialized with `$pt.analytics(...).setAccount(...)`.

#### Returns

An opaque object that wraps the GA methods bound to the specified tracker(s). See the examples in the
discussion above for sample usage.


### `$pt.analytics.load()`

If the Google Analytics ga.js script has not yet loaded, this method loads it using `$pt.scripts.load(...)`.
This method always returns the promise to load the ga.js script, so you can use the return value to
monitor the loading of the ga.js script. However, if this is your purpose, it is more semantically correct
to call `$pt.analytics.promise()`.

#### Parameters

None.

#### Returns

The promise to load the Google Analytics ga.js script.

#### Examples

```javascript
$pt.analytics.load().done(function() {
    console.log("Google Analytics has loaded.");
});
```


### `$pt.analytics.promise()`

Gets the promise to load Google Analytics ga.js script. This will return `null` if one of
`$pt.analytics.load()`, `$pt.analytics.setAccount(...)` or `$pt.analytics(...).setAccount(...)`
has not yet been called.

#### Parameters

None.

#### Returns

The promise to load the Google Analytics ga.js script or `null` if the load has not yet been
initiated.

#### Examples

```javascript
$pt.analytics.load();
$pt.analytics.promise().done(function() {
    console.log("Google Analytics has loaded.");
});
```


### `$pt.analytics.setAccount(account)`
### `$pt.analytics(...).setAccount(account)`

While these are simply methods implemented by the opaque GA wrapper object, they are important, because
they must be called before other `$pt.analytics` methods will work. Calling `setAccount(...)` makes
`$pt.analytics` "aware" of a tracker name, and until it is called, any tracker methods that you call
through `$pt.analytics` will be ignored.

When you call `setAccount(...)`, it calls `$pt.analytics.load()`, so the ga.js script will be loaded 
on-demand as soon as you start to use `$pt.analtyics*` methods. Of course, you can always call 
`$pt.analytics.load()` yourself, but this automatic behavior makes it unnecessary.


#### Parameters

Parameter   | Description
------------|------------
`account`   | your Google Analytics account name string which will be bound to the trackers selected by `$pt.analytics` or `$pt.analytics(...)`.

#### Returns

An opaque object that wraps the GA methods bound to tracker(s) specified by `$pt.analytics` or `$pt.analytics(...)`.
After calling `setAccount(...)`, the other methods on the opaque wrapper object will work as expected.
See the examples in the discussion above for sample usage.

