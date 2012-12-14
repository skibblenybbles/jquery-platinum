// requires: array-base.js

(function($, $pt, window, document) {
    
    var array = $pt.array,
        lang = { };
    
    // create a function with its "this" bound to the "that" argument
    // and curry any additional arguments
    lang.hitch = function(that, fn) {
        return (function(that, fn, args) {
            return function() {
                return fn.apply(that, args.concat(array(arguments)));
            };
        })(that, fn, array(arguments, 2));
    };

    // create an unbound function with curried arguments
    lang.partial = function(fn) {
        return (function(fn, args) {
            return function() {
                return fn.apply(null, args.concat(array(arguments)));
            };
        })(fn, array(arguments, 1));
    };
    
    // export the lang plugin
    $pt.lang = lang;
    
})($, $pt, window, document);
