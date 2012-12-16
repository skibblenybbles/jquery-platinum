/**
 * @license jquery.platinum-base.js
 *
 * Copyright (C) 2012 Mike Kibbel, MetaMetrics, Inc.
 * https://raw.github.com/skibblenybbles/jquery-platinum/master/src/LICENSE
 */

(function($, window, document) {

////////////////////////////////////////
// source: jquery.platinum-base.js
// requires:

// define names for the wrapping closure
var
    // Math's min and max
    minimum = Math.min,
    maximum = Math.max,
    
    // jQuery's Deferred
    $Deferred = $.Deferred,
    
    // jQuery's $.ajax
    $ajax = $.ajax,
    
    // jQuery's $.extend
    $extend = $.extend,
    
    // are we using the secure protocol?
    isProtocolSecure = document.location.protocol === "https:",
    
    // string names for protocols
    protocolHttp = "http:",
    protocolHttps = "https:",
    
    // a function for resolving conflicts with the global $pt variable name
    // restores the previous $pt variable and returns $.platinum
    noConflict = (function(pt) {
        return function() {
            var $pt = window.$pt;
            window.$pt = pt;
            return $pt;
        }
    })(window.$pt),

    // the clousure and global $pt and $.platinum values
    $pt = window.$pt = $.platinum = $.platinum || { };

// set up noConflict()
$pt.noConflict = noConflict;

////////////////////////////////////////

})(jQuery, window, document);
