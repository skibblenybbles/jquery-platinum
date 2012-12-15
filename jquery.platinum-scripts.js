/**
 * @license jquery.platinum-scripts.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

(function($, window, document) {

var
    // a function for resolving conflicts with the global $pt variable name
    // restores the previous $pt variable and returns $.platinum
    noConflict = (function(pt) {
        return function() {
            var $pt = window.$pt;
            window.$pt = pt;
            return $pt;
        }
    })(window.$pt);

// the global $pt and $.platinum values
window.$pt = $.platinum = $.platinum || { };

// set up noConflict()
window.$pt.noConflict = noConflict;

////////////////////////////////////////
// source: jquery.platinum-scripts.js
// requires: 

(function() {
    
    // the scripts plugin
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
    $pt.scripts = scripts;
    
})();

// define names for the wrapping closure
var scripts = $pt.scripts,
    scriptsLoad = scripts.load;


////////////////////////////////////////

})(jQuery, window, document);
