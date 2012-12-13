// requires: array-base.js

(function($, $p, window, document) {
    
    var array = $p.array;
    
    // run a function on each item in any array and
    // return a new array populated with values from
    // the origina array where the function produced
    // a truthy value
    array.filter = function(iterable, fn, start, end, step) {
        var results = [],
            result;
        array.each(iterable, function(value, i) {
            result = fn(value, i);
            if (result) {
                results.push(value);
            }
        }, start, end, step);
        return results;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final result
    array.every = function(iterable, fn, start, end, step) {
        var result;
        array.each(iterable, function(value, i) {
            result = fn(value, i);
            if (!result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final result
    array.some = function(iterable, fn, start, end, step) {
        var result;
        array.each(iterable, function(value, i) {
            result = fn(value, i);
            if (result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final value processed
    array.all = function(iterable, fn, start, end, step) {
        var result;
        array.each(iterable, function(value, i) {
            if (!fn(value, i)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final value processed
    array.any = function(iterable, fn, start, end, step) {
        var result;
        array.each(iterable, function(value, i) {
            if (fn(value, i)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array to produce
    // a new array of the function's results
    array.map = function(iterable, fn, start, end, step) {
        var results = [];
        array.each(iterable, function(value, i) {
            results.push(fn(value, i));
        }, start, end, step);
        return results;
    };
    
    // reduce an array by applying a binary operator
    // that accumulates results onto an initial value
    array.reduce = function(iterable, fn, initial, start, end, step) {
        var result = initial;
        array.each(iterable, function(value, i) {
            result = fn(value, result, i);
        }, start, end, step);
        return result;
    };
    
    
})($, $p, window, document);
