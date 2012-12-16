/**
 * @license jquery.platinum-array.js
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

// define names for the wrapping closure
var array,
    arrayEach;

(function() {
    
    // convert the given array-like object to an Array
    // using optional slicing, stepping and negative indexing
    array = function(iterable, start, end, step) {
        var values = [];
        arrayEach(iterable, function(value) {
            values.push(value);
        }, start, end, step);
        return values;
    };
    
    // run a function for each item in an array-like object
    // if the function returns false (strictly), the loop
    // will terminate
    arrayEach = array.each = function(iterable, fn, start, end, step) {
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

////////////////////////////////////////
// source: jquery.platinum-array.js
// requires: array-base.js

// define names for the wrapping closure
var arrayFilter,
    arrayEvery,
    arraySome,
    arrayAll,
    arrayAny,
    arrayMap,
    arrayReduce;

(function() {
    
    // run a function on each item in any array and
    // return a new array populated with values from
    // the origina array where the function produced
    // a truthy value
    arrayFilter = array.filter = function(iterable, fn, start, end, step) {
        var results = [],
            result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (result) {
                results.push(value);
            }
        }, start, end, step);
        return results;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final result
    arrayEvery = array.every = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (!result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final result
    arraySome = array.some = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final value processed
    arrayAll = array.all = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            if (!fn(value)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final value processed
    arrayAny = array.any = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            if (fn(value)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array to produce
    // a new array of the function's results
    arrayMap = array.map = function(iterable, fn, start, end, step) {
        var results = [];
        arrayEach(iterable, function(value) {
            results.push(fn(value));
        }, start, end, step);
        return results;
    };
    
    // reduce an array by applying a binary operator
    // that accumulates results onto an initial value
    arrayReduce = array.reduce = function(iterable, fn, initial, start, end, step) {
        var result = initial;
        arrayEach(iterable, function(value) {
            result = fn(value, result);
        }, start, end, step);
        return result;
    };
    
})();


////////////////////////////////////////

})(jQuery, window, document);
