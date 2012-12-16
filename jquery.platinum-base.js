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

// define "shortcut" names for the wrapping closure
var
    // JavaScript's objects
    Array = window.Array,
    Boolean = window.Boolean,
    Object = window.Object,
    Math = window.Math,
    Number = window.Number,
    String = window.String,
    undefined,
    
    // simpler type checkers than jQuery's
    // these are used to determine argument types and are not necessarily as
    // efficient as inline code, but they guarantee type-checking consistency
    // and reduce the minified output slightly
    isArray = function(obj) {
        return obj instanceof Array;
    },
    isFunction = function(obj) {
        return typeof obj === "function";
    },
    isNumber = function(obj) {
        return typeof obj === "number" || obj instanceof Number;
    },
    isString = function(obj) {
        return typeof obj === "string" || obj instanceof String;
    },
    
    // jQuery's objects and methods
    $Deferred = $.Deferred,
    $ajax = $.ajax,
    $extend = $.extend,
    
    // are we using the secure protocol?
    secureProtocol = document.location.protocol === "https:",
    
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
