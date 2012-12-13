// requires: array-base.js

(function($, $p, window, document) {
    
    var array = $p.array,
        lang = { };
    
    // create a function with its "this" bound to that that argument
    // and optional curried arguments
    lang.hitch = function(that, fn) {
        return (function(that, fn, args) {
            return function() {
                return fn.apply(that, args.concat(arguments));
            };
        })(that, fn, array(arguments, 2));
    };

    // create an unbound function with curried arguments
    lang.partial = function(fn) {
        return lang.hitch(null, fn, array(arguments, 1));
    };
    
    // export the lang plugin
    $p.lang = lang;
    
})($, $p, window, document);
