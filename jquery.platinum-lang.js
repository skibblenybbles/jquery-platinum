/**
 * @license jquery.platinum-lang.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

(function($, window, document) {

var
    // a function for resolving conflicts with the global $pt variable name
    // restores the previous $pt variable and returns $.platinum
    noConflict = (function(pt) {
        return function() {
            var $pt = window.$pt;
            window.$pt = pt;
            return $pt;
        }
    })(window.$pt),
    
    // the clousure and global $pt and $.platinum values
    $pt = window.$pt = $.platinum = $.platinum || { };

// set up noConflict()
$pt.noConflict = noConflict;

////////////////////////////////////////
// source: jquery.platinum-array-base.js
// requires: 

(function() {
    
    var 
        // convert the given array-like object to an Array
        // using optional slicing, stepping and negative indexing
        array = function(iterable, start, end, step) {
            var values = [];
            array.each(iterable, function(value) {
                values.push(value);
            }, start, end, step);
            return values;
        };
    
    // run a function for each item in an array-like object
    // if the function returns false (strictly), the loop
    // will terminate
    array.each = function(iterable, fn, start, end, step) {
        var i,
            value,
            length = iterable.length,
            step = step || 1;
            start = typeof start !== "number"
                ? step > 0
                    ? 0
                    : length -1
                : start < 0
                    ? start + length
                    : start,
            end = typeof end !== "number"
                ? step > 0
                    ? length
                    : -1
                : end < 0
                    ? end + length
                    : end;
        
        if (step > 0) {
            
            // trim the useless ends
            start = Math.max(0, start);
            end = Math.min(length, end);
            
            // iterate
            for (i = start; i < end; i += step) {
                value = fn.call(null, iterable[i]);
                if (value === false) {
                    return;
                }
            }
            
        } else {
            
            // trim the useless ends
            start = Math.min(length - 1, start);
            end = Math.max(-1, end);
            
            // iterate
            for (i = start; i > end; i += step) {
                value = fn.call(null, iterable[i]);
                if (value === false) {
                    return;
                }
            }
        }
    };
    
    // export the array plugin
    $pt.array = array;
    
})();

// define names for the wrapping closure
var array = $pt.array,
    arrayEach = array.each;

////////////////////////////////////////
// source: jquery.platinum-lang.js
// requires: array-base.js

(function() {
    
    var 
        // the lang plugin
        lang = { },
        
        // the document ready promise
        readyPromise = new $.Deferred();
    
    // set up the document ready promise
    $(document).ready(function() {
        readyPromise.resolve();
    });
    
    // create a function with its "this" bound to the "that" argument
    // and curry any additional arguments
    lang.hitch = function(that, fn) {
        return (function(that, fn, args) {
            return function() {
                return fn.apply(that, args.concat(array(arguments)));
            };
        })(that, fn, array(arguments, 2));
    };

    // create an unbound function with curried arguments
    lang.partial = function(fn) {
        return (function(fn, args) {
            return function() {
                return fn.apply(null, args.concat(array(arguments)));
            };
        })(fn, array(arguments, 1));
    };
    
    // for the given target object, delegate all methods that 
    // appear in the source object but not in the target
    // excluding "constructor"
    lang.delegate = function(target, source) {
        var name;
        for (name in source) {
            if (typeof source[name] === "function" &&
                name !== "constructor" &&
                !(name in target)
            ) {
                target[name] = lang.hitch(source, source[name]);
            }
        }
    };
    
    // return a promise that gets fulfilled when the document is ready
    lang.ready = function() {
        return readyPromise;
    };
    
    // export the lang plugin
    $pt.lang = lang;
    
})();

// define names for the wrapping closure
var lang = $pt.lang,
    langHitch = lang.hitch,
    langPartial = lang.partial,
    langDelegate = lang.delegate,
    langReady = lang.ready;


////////////////////////////////////////

})(jQuery, window, document);
