// requires: jquery.platinum-base.js

(function($) {
    
    $.platinum.array = {
        
        // run a function for each item in an array
        each: function(array, fn, that) {
            var i;
            for (i = 0; i < array.length; i++) {
                fn.call(that, array[i], i);
            }
        }
    };
    
    $.platinum.array.reverse = {
        
        // run a function for each item in an array
        // in reverse
        each: function(array, fn, that) {
            var i = array.length;
            for (i = array.length - 1; i >= 0; i--) {
                fn.call(that, array[i], i);
            }
        }
    };
    
})(jQuery);