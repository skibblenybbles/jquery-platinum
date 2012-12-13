/**
 * @license jquery.platinum-array.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

(function($, window, document) {

var $p = $.platinum = $.platinum || { };

////////////////////////////////////////
// source: jquery.platinum-array-base.js
// requires: 

(function($, $p, window, document) {
    
    var 
        // regular arrays
        array = { },
        
        // reverse arrays
        rarray = { };
    
    // run a function for each item in an array
    // includes support for slicing and stepping
    // and allows negative indexing
    array.each = function(array, fn, start, end, step) {
        var i,
            length = array.length,
            step = step || 1;
            start = start === undefined
                ? step > 0
                    ? 0
                    : length -1
                : start < 0
                    ? start + length
                    : start,
            end = end === undefined
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
                fn.call(null, array[i], i);
            }
            
        } else {
            
            // trim the useless ends
            start = Math.min(length - 1, start);
            end = Math.max(-1, end);
            
            // iterate
            for (i = start; i > end; i += step) {
                fn.call(null, array[i], i);
            }
        }
    };
    
    // run a function for each item in an array
    // in reverse
    rarray.each = function(array, fn, start, end, step) {
        array.each(array, fn, end, start, -step);
    };
    
    
    // export the array plugins
    $p.array = array;
    $p.rarray = rarray;
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-array.js
// requires: array-base.js

(function($, $p, window, document) {
    
    var jArray = $p.array,
        jReverse = $p.array.reverse;
    
    $.extend(jArray, {
        
        // run a function for each item in an array
        each: function(array, fn, that) {
            var i;
            for (i = 0; i < array.length; i++) {
                fn.call(that, array[i], i);
            }
        },
        
        // run a function on each item in an array to
        // produce a new array of the resulting values
        map: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                values.push(fn.call(that, array[i], i));
            }
            return values;
        },
        
        // reduce an array by applying a binary operator
        // that accumulates onto an initial value
        reduce: function(array, fn, value, that) {
            var i;
            for (i = 0; i < array.length; i++) {
                value = fn.call(that, value, array[i], i);
            }
            return value;
        },
        
        // run a function on each item in an array until a 
        // falsy result is encountered, then return the
        // final result
        all: function(array, fn, that) {
            var i,
                result = true;
            for (i = 0; i < array.length; i++) {
                result = result && fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array until a
        // truthy result is encountered, then return the
        // finaly result
        any: function(array, fn, that) {
            var i,
                result = false;
            for (i = 0; i < array.length; i++) {
                result = result || fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array and
        // return a new array populated with values
        // from the original array where the function
        // produced a truthy result
        filter: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        },
        
        // run a predicate on each item in an array until a
        // false result (strictly) is encountered, then
        // return whether every result was true
        // (slightly faster than "all")
        every: function(array, fn, that) {
            var i,
                result = true;
            for (i = 0; i < array.length; i++) {
                result = fn.call(that, array[i], i) === true;
                if (result === false) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array until a
        // true result (strictly) is encountered, then
        // return whether any result was true
        // (slightly faster than "any")
        some: function(array, fn, that) {
            var i,
                result = false;
            for (i = 0; i < array.length; i++) {
                result = fn.call(that, array[i], i) === true;
                if (result === true) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array and
        // return a new array populated with values
        // from the original array where the predicate
        // produced a true (strictly) result
        which: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        }
    });
    
    $.extend(jReverse, {
        
        // run a function for each item in an array
        // in reverse
        each: function(array, fn, that) {
            var i = array.length;
            for (i = array.length - 1; i >= 0; i--) {
                fn.call(that, array[i], i);
            }
        },
        
        // run a function on each item in an array in 
        // reverse to produce a new array of the resulting
        // values
        map: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                values.push(fn.call(that, array[i], i));
            }
            return values;
        },
        
        // reduce an array by applying a binary operator
        // that accumulates onto an initial value in reverse
        reduce: function(array, fn, value, that) {
            var i;
            for (i = array.length - 1; i >= 0; i--) {
                value = fn.call(that, value, array[i], i);
            }
            return value;
        },
        
        // run a function on each item in an array in
        // reverse until a falsy result is encountered,
        // then return the final result
        all: function(array, fn, that) {
            var i,
                result = true;
            for (i = array.length - 1; i >= 0; i--) {
                result = result && fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array in
        // reverse until a truthy result is encountered,
        // then return the finaly result
        any: function(array, fn, that) {
            var i,
                result = false;
            for (i = array.length - 1; i >= 0; i--) {
                result = result || fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array in
        // reverse and return a new array populated with
        // values from the original array where the function
        // produced a truthy result
        filter: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        },
        
        // run a predicate on each item in an array in
        // reverse until a false result (strictly) is
        // encountered, then return whether every result
        // was true (slightly faster than "all")
        every: function(array, fn, that) {
            var i,
                result = true;
            for (i = array.length - 1; i >= 0; i--) {
                result = fn.call(that, array[i], i) === true;
                if (result === false) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array in 
        // reverse until a true result (strictly) is 
        // encountered, then return whether any result
        // was true (slightly faster than "any")
        some: function(array, fn, that) {
            var i,
                result = false;
            for (i = array.length - 1; i >= 0; i--) {
                result = fn.call(that, array[i], i) === true;
                if (result === true) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array in
        // reverse and return a new array populated with
        // values from the original array where the
        // predicate produced a true (strictly) result
        which: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        }
    });
    
})($, $p, window, document);


////////////////////////////////////////

})(jQuery, window, document);
