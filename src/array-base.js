// requires: 

(function($, $p, window, document) {
    
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
                value = fn.call(null, iterable[i], i);
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
                value = fn.call(null, iterable[i], i);
                if (value === false) {
                    return;
                }
            }
        }
    };
    
    // export the array plugin
    $p.array = array;
    
})($, $p, window, document);
