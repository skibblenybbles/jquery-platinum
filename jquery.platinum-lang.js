(function(jQuery) {

// requires:

(function($) {
    
    $.platinum = $.platinum || { };
    
})(jQuery);

////////////////////
// requires: base.js

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

////////////////////
// requires: arguments.js

(function($) {
    
    var jArguments = $.platinum.arguments;
    
    $.platinum.lang = {
        
        // create a function bound to "this" with curried arguments
        hitch: function(that, fn) {
            return (function(that, fn, args) {
                return function() {
                    return fn.apply(that, args.concat(arguments));
                };
            })(that, fn, jArguments(arguments, 2));
        },
        
        // create an unbound function with curried arguments
        partial: function(fn) {
            return (function(fn, args) {
                return function() {
                    return fn.apply(null, args.concat(arguments));
                };
            })(fn, jArguments(arguments, 1));
        }
    };
    
})(jQuery);

////////////////////
})(jQuery);
