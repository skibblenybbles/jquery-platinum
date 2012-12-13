/**
 * @license jquery.platinum-scripts.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

(function($, window, document) {

var $p = $.platinum = $.platinum || { };

////////////////////////////////////////
// source: jquery.platinum-scripts.js
// requires: 

(function($, $p, window, document) {
    
    var scripts = { };
    
    // return a promise to load a script
    scripts.load = function(url, options) {
        // allow override of any option except for dataType, cache and url
        options = $.extend(options || { }, {
            dataType: "script",
            cache: true,
            url: url
        });
        return $.ajax(options);
    };
    
    // export the scripts plugin
    $p.scripts = scripts;
    
})($, $p, window, document);


////////////////////////////////////////

})(jQuery, window, document);
