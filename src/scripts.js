// requires: 

(function($, $pt, window, document) {
    
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
    
})($, $pt, window, document);
