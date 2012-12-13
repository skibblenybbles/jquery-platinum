/**
 * @license jquery.platinum.js
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
    
    $p.scripts = {
        
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
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-array-base.js
// requires: 

(function($, $p, window, document) {
    
    var 
        // regular arrays
        array = { },
        
        // reverse arrays
        rarray = { };
    
    // run a function for each item in an array
    // includes support for slicing and stepping
    // and allows negative indexing
    array.each = function(array, fn, start, end, step) {
        var i,
            length = array.length,
            step = step || 1;
            start = start === undefined
                ? step > 0
                    ? 0
                    : length -1
                : start < 0
                    ? start + length
                    : start,
            end = end === undefined
                ? step > 0
                    ? length
                    : -1
                : end < 0
                    ? end + length
                    : end;
        
        if (step > 0) {
            
            // trim the useless ends
            start = Math.max(0, start);
            end = Math.min(length, end);
            
            // iterate
            for (i = start; i < end; i += step) {
                fn.call(null, array[i], i);
            }
            
        } else {
            
            // trim the useless ends
            start = Math.min(length - 1, start);
            end = Math.max(-1, end);
            
            // iterate
            for (i = start; i > end; i += step) {
                fn.call(null, array[i], i);
            }
        }
    };
    
    // run a function for each item in an array
    // in reverse
    rarray.each = function(array, fn, start, end, step) {
        array.each(array, fn, end, start, -step);
    };
    
    
    // export the array plugins
    $p.array = array;
    $p.rarray = rarray;
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-lang.js
// requires: array-base.js

(function($, $p, window, document) {
    
    var 
        // the array plugin
        array = $p.array,
        
        // define the array plugin
        lang = {
                    
            // a function that returns its argument
            identity: function(value) {
                return value;
            },
        
            // create a function bound to "this" with curried arguments
            hitch: function(that, fn) {
                return (function(that, fn, args) {
                    return function() {
                        return fn.apply(that, args.concat(arguments));
                    };
                })(that, fn, jArguments(arguments, 2));
            },
        
            // create an unbound function with curried arguments
            partial: function(fn) {
                return (function(fn, args) {
                    return function() {
                        return fn.apply(null, args.concat(arguments));
                    };
                })(fn, jArguments(arguments, 1));
            }
        };
    
    // export the array plugin
    $p.lang = lang;
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-analytics.js
// requires: scripts.js, lang.js

(function($, $p, window, document) {
    
    var 
        // the required plugins
        jScripts = $p.scripts,
        jLang = $p.lang,
        jArguments = $p.arguments,
        
        // all of the non-deprecated Google Analytics pageTracker methods,
        // (as of 12/11/2012)
        methods = {
            "addIgnoredOrganic": "_addIgnoredOrganic",
            "addIgnoredRef": "_addIgnoredRef",
            "addItem": "_addItem",
            "addOrganic": "_addOrganic",
            "addTrans": "_addTrans",
            "clearIgnoredOrganic": "_clearIgnoredOrganic",
            "clearIgnoredRef": "_clearIgnoredRef",
            "clearOrganic": "_clearOrganic",
            "cookiePathCopy": "_cookiePathCopy",
            "deleteCustomVar": "_deleteCustomVar",
            "getName": "_getName",
            "setAccount": "_setAccount",
            "getAccount": "_getAccount",
            "getClientInfo": "_getClientInfo",
            "getDetectFlash": "_getDetectFlash",
            "getDetectTitle": "_getDetectTitle",
            "getLinkerUrl": "_getLinkerUrl",
            "getLocalGifPath": "_getLocalGifPath",
            "getServiceMode": "_getServiceMode",
            "getVersion": "_getVersion",
            "getVisitorCustomVar": "_getVisitorCustomVar",
            "link": "_link",
            "linkByPost": "_linkByPost",
            "setAllowAnchor": "_setAllowAnchor",
            "setAllowLinker": "_setAllowLinker",
            "setCampContentKey": "_setCampContentKey",
            "setCampMediumKey": "_setCampMediumKey",
            "setCampNameKey": "_setCampNameKey",
            "setCampNOKey": "_setCampNOKey",
            "setCampSourceKey": "_setCampSourceKey",
            "setCampTermKey": "_setCampTermKey",
            "setCampaignCookieTimeout": "_setCampaignCookieTimeout",
            "setCampaignTrack": "_setCampaignTrack",
            "setClientInfo": "_setClientInfo",
            "setCookiePath": "_setCookiePath",
            "setCustomVar": "_setCustomVar",
            "setDetectFlash": "_setDetectFlash",
            "setDetectTitle": "_setDetectTitle",
            "setDomainName": "_setDomainName",
            "setLocalGifPath": "_setLocalGifPath",
            "setLocalRemoteServerMode": "_setLocalRemoteServerMode",
            "setLocalServerMode": "_setLocalServerMode",
            "setReferrerOverride": "_setReferrerOverride",
            "setRemoteServerMode": "_setRemoteServerMode",
            "setSampleRate": "_setSampleRate",
            "setSiteSpeedSampleRate": "_setSiteSpeedSampleRate",
            "setSessionCookieTimeout": "_setSessionCookieTimeout",
            "setVisitorCookieTimeout": "_setVisitorCookieTimeout",
            "trackEvent": "_trackEvent",
            "trackPageview": "_trackPageview",
            "trackSocial": "_trackSocial",
            "trackTiming": "_trackTiming",
            "trackTrans": "_trackTrans"
        },
        
        // a function to create a method wrapper for each pageTracker method
        wrapMethod = function(name) {
            
            // is this a _get* method?
            if (name.substring(0, 4) === "_get") {
                
                // create a function that calls the given callback with
                // the value returned by the async GA _get* method
                return lang.partial(function(method) {
                    
                    return function() {
                        
                        var callback = arguments[0];
                        // the first parameter must be a function
                        if (typeof callback !== "function") {
                            return;
                        }
                        
                        // create the callback that will run the given callback
                        window._gaq.push(lang.partial(function(method, callback, args) {
                                
                            return function() {
                                // get the default tracker
                                var tracker = window._gat._getTrackerByName();

                                // run the callback with the tracker method's result
                                callback(tracker[method].apply(tracker, args));
                            };
                        
                        }, method, callback, jArguments(arguments, 1)));
                    };
                }, methods[name]);
                
            } else {
                
                // create a function that pushes the command into the global queue
                return lang.partial(function(method) {
                    
                    return function() {
                        
                        window._gaq.push([method].concat(arguments));
                    };
                    
                }, methods[name]);
            }
        },
        
        // load GA only once
        once = false,
        
        // the analytics plugin
        analytics = function(account, track) {
            var method;
        
            if (once) {
                return;
            }
            once = true;
        
            // populate with all of the GA method wrappers
            for (method in methods) {
                analytics[method] = wrapMethod(method);
            }
            
            // create the global GA command queue
            window._gaq = window._gaq || [];
            
            // intialize the account?
            if (account) {
                analytics.setAccount(account);
            }
            
            // track the pageview?
            if (track) {
                analytics.trackPageview();
            }
        
            // load GA
            jScripts.load(
                (document.location.protocol === "https:" ? "https://ssl" : "http://www") + 
                ".google-analytics.com/ga.js"
            );
        };
    
    // export the anlytics plugin
    $p.analytics = analytics;
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-array.js
// requires: array-base.js

(function($, $p, window, document) {
    
    var jArray = $p.array,
        jReverse = $p.array.reverse;
    
    $.extend(jArray, {
        
        // run a function for each item in an array
        each: function(array, fn, that) {
            var i;
            for (i = 0; i < array.length; i++) {
                fn.call(that, array[i], i);
            }
        },
        
        // run a function on each item in an array to
        // produce a new array of the resulting values
        map: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                values.push(fn.call(that, array[i], i));
            }
            return values;
        },
        
        // reduce an array by applying a binary operator
        // that accumulates onto an initial value
        reduce: function(array, fn, value, that) {
            var i;
            for (i = 0; i < array.length; i++) {
                value = fn.call(that, value, array[i], i);
            }
            return value;
        },
        
        // run a function on each item in an array until a 
        // falsy result is encountered, then return the
        // final result
        all: function(array, fn, that) {
            var i,
                result = true;
            for (i = 0; i < array.length; i++) {
                result = result && fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array until a
        // truthy result is encountered, then return the
        // finaly result
        any: function(array, fn, that) {
            var i,
                result = false;
            for (i = 0; i < array.length; i++) {
                result = result || fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array and
        // return a new array populated with values
        // from the original array where the function
        // produced a truthy result
        filter: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        },
        
        // run a predicate on each item in an array until a
        // false result (strictly) is encountered, then
        // return whether every result was true
        // (slightly faster than "all")
        every: function(array, fn, that) {
            var i,
                result = true;
            for (i = 0; i < array.length; i++) {
                result = fn.call(that, array[i], i) === true;
                if (result === false) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array until a
        // true result (strictly) is encountered, then
        // return whether any result was true
        // (slightly faster than "any")
        some: function(array, fn, that) {
            var i,
                result = false;
            for (i = 0; i < array.length; i++) {
                result = fn.call(that, array[i], i) === true;
                if (result === true) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array and
        // return a new array populated with values
        // from the original array where the predicate
        // produced a true (strictly) result
        which: function(array, fn, that) {
            var i,
                values = [];
            for (i = 0; i < array.length; i++) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        }
    });
    
    $.extend(jReverse, {
        
        // run a function for each item in an array
        // in reverse
        each: function(array, fn, that) {
            var i = array.length;
            for (i = array.length - 1; i >= 0; i--) {
                fn.call(that, array[i], i);
            }
        },
        
        // run a function on each item in an array in 
        // reverse to produce a new array of the resulting
        // values
        map: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                values.push(fn.call(that, array[i], i));
            }
            return values;
        },
        
        // reduce an array by applying a binary operator
        // that accumulates onto an initial value in reverse
        reduce: function(array, fn, value, that) {
            var i;
            for (i = array.length - 1; i >= 0; i--) {
                value = fn.call(that, value, array[i], i);
            }
            return value;
        },
        
        // run a function on each item in an array in
        // reverse until a falsy result is encountered,
        // then return the final result
        all: function(array, fn, that) {
            var i,
                result = true;
            for (i = array.length - 1; i >= 0; i--) {
                result = result && fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array in
        // reverse until a truthy result is encountered,
        // then return the finaly result
        any: function(array, fn, that) {
            var i,
                result = false;
            for (i = array.length - 1; i >= 0; i--) {
                result = result || fn.call(that, array[i], i);
                if (!result) {
                    return result;
                }
            }
            return result;
        },
        
        // run a function on each item in an array in
        // reverse and return a new array populated with
        // values from the original array where the function
        // produced a truthy result
        filter: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        },
        
        // run a predicate on each item in an array in
        // reverse until a false result (strictly) is
        // encountered, then return whether every result
        // was true (slightly faster than "all")
        every: function(array, fn, that) {
            var i,
                result = true;
            for (i = array.length - 1; i >= 0; i--) {
                result = fn.call(that, array[i], i) === true;
                if (result === false) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array in 
        // reverse until a true result (strictly) is 
        // encountered, then return whether any result
        // was true (slightly faster than "any")
        some: function(array, fn, that) {
            var i,
                result = false;
            for (i = array.length - 1; i >= 0; i--) {
                result = fn.call(that, array[i], i) === true;
                if (result === true) {
                    break;
                }
            }
            return result;
        },
        
        // run a predicate on each item in an array in
        // reverse and return a new array populated with
        // values from the original array where the
        // predicate produced a true (strictly) result
        which: function(array, fn, that) {
            var i,
                values = [];
            for (i = array.length - 1; i >= 0; i--) {
                if (fn.call(that, array[i], i)) {
                    values.push(array[i], i);
                }
            }
            return values;
        }
    });
    
})($, $p, window, document);

////////////////////////////////////////
// source: jquery.platinum-platinum.js
// requires: analytics.js, array-base.js, array.js, lang.js, scripts.js

// This file is used to generate the full minified output by the build script.


////////////////////////////////////////

})(jQuery, window, document);
