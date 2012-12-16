// requires:

// define "shortcut" names for the wrapping closure
var
    // JavaScript's objects
    Array = window.Array,
    Object = window.Object,
    Math = window.Math,
    Number = window.Number,
    String = window.String,
    undefined,
    
    // jQuery's objects and methods
    $Deferred = $.Deferred,
    $ajax = $.ajax,
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
