// requires: array-base.js

(function($, $p, window, document) {
    
    var 
        // the array plugin
        array = $p.array,
        
        // define the array plugin
        lang = {
                    
            // a function that returns its argument
            identity: function(value) {
                return value;
            },
        
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
    
    // export the array plugin
    $p.lang = lang;
    
})($, $p, window, document);
