/**
 * @license jquery.platinum-array-base.js
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

})(jQuery, window, document);
