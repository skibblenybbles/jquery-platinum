/**
 * @license jquery.platinum-scripts.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

jQuery.platinum = jQuery.platinum || { };

(function(jQuery) {

////////////////////////////////////////
// source: jquery.platinum-scripts.js
// requires: 

(function($) {
    
    $.platinum.scripts = {
        
        // return a promise to load a script
        load: function(url, options) {
            
            // allow override of any option except for 
            // dataType, cache, and url
            options = $.extend(
                options || { }, 
                {
                    dataType: "script",
                    cache: true,
                    url: url
                }
            );
            
            return $.ajax(options);
        }
    };
    
})(jQuery);


////////////////////////////////////////

})(jQuery);
