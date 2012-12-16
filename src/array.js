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
