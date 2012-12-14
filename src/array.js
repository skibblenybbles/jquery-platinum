// requires: array-base.js

(function($, $pt, window, document) {
    
    var array = $pt.array;
    
    // run a function on each item in any array and
    // return a new array populated with values from
    // the origina array where the function produced
    // a truthy value
    array.filter = function(iterable, fn, start, end, step) {
        var results = [],
            result;
        array.each(iterable, function(value) {
            result = fn(value);
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
        array.each(iterable, function(value) {
            result = fn(value);
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
        array.each(iterable, function(value) {
            result = fn(value);
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
        array.each(iterable, function(value) {
            if (!fn(value)) {
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
        array.each(iterable, function(value) {
            if (fn(value)) {
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
        array.each(iterable, function(value) {
            results.push(fn(value));
        }, start, end, step);
        return results;
    };
    
    // reduce an array by applying a binary operator
    // that accumulates results onto an initial value
    array.reduce = function(iterable, fn, initial, start, end, step) {
        var result = initial;
        array.each(iterable, function(value) {
            result = fn(value, result);
        }, start, end, step);
        return result;
    };
    
    
})($, $pt, window, document);
