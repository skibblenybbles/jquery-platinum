/**
 * @license jquery.platinum-arguments.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

jQuery.platinum = jQuery.platinum || { };

(function(jQuery) {

////////////////////////////////////////
// source: jquery.platinum-arguments.js
// requires: 

(function($) {
    
    $.platinum.arguments = {
        
        // convert the given array-like arguments object to a proper Array,
        // optionally slicing the arguments (positive indices only)
        array: function(args, start, end) {
            
            var values =[],
                i;
                
            start = start || 0;
            end = Math.min(end || args.length, args.length);
            for (i = start; i < end; i++) {
                values.push(args[i]);
            }
            return values;
        }
    };
    
})(jQuery);


////////////////////////////////////////

})(jQuery);
