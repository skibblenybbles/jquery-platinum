/**
 * @license jquery.platinum-analytics.js
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
    })(window.$pt),
    
    // the clousure and global $pt and $.platinum values
    $pt = window.$pt = $.platinum = $.platinum || { };

// set up noConflict()
$pt.noConflict = noConflict;

////////////////////////////////////////
// source: jquery.platinum-array-base.js
// requires: 

// define names for the wrapping closure
var array,
    arrayEach;

(function() {
    
    // convert the given array-like object to an Array
    // using optional slicing, stepping and negative indexing
    array = function(iterable, start, end, step) {
        var values = [];
        arrayEach(iterable, function(value) {
            values.push(value);
        }, start, end, step);
        return values;
    };
    
    // run a function for each item in an array-like object
    // if the function returns false (strictly), the loop
    // will terminate
    arrayEach = array.each = function(iterable, fn, start, end, step) {
        var i,
            value,
            length = iterable.length,
            step = step || 1;
            start = typeof start !== "number"
                ? step > 0
                    ? 0
                    : length -1
                : start < 0
                    ? start + length
                    : start,
            end = typeof end !== "number"
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
                value = fn.call(null, iterable[i]);
                if (value === false) {
                    return;
                }
            }
            
        } else {
            
            // trim the useless ends
            start = Math.min(length - 1, start);
            end = Math.max(-1, end);
            
            // iterate
            for (i = start; i > end; i += step) {
                value = fn.call(null, iterable[i]);
                if (value === false) {
                    return;
                }
            }
        }
    };
    
    // export the array plugin
    $pt.array = array;
    
})();

////////////////////////////////////////
// source: jquery.platinum-lang.js
// requires: array-base.js

// define names for the wrapping closure
var lang,
    langHitch,
    langPartial,
    langDelegate,
    langReady;

(function() {
    
    var         
        // the document ready promise
        readyPromise = new $.Deferred();
    
    // set up the document ready promise
    $(document).ready(function() {
        readyPromise.resolve();
    });
    
    // the lang plugin
    lang = { };
    
    // create a function with its "this" bound to the "that" argument
    // and curry any additional arguments
    langHitch = lang.hitch = function(that, fn) {
        return (function(that, fn, args) {
            return function() {
                return fn.apply(that, args.concat(array(arguments)));
            };
        })(that, fn, array(arguments, 2));
    };

    // create an unbound function with curried arguments
    langPartial = lang.partial = function(fn) {
        return (function(fn, args) {
            return function() {
                return fn.apply(null, args.concat(array(arguments)));
            };
        })(fn, array(arguments, 1));
    };
    
    // for the given target object, delegate all methods that 
    // appear in the source object but not in the target
    // excluding "constructor"
    langDelegate = lang.delegate = function(target, source) {
        var name;
        for (name in source) {
            if (typeof source[name] === "function" &&
                name !== "constructor" &&
                !(name in target)
            ) {
                target[name] = lang.hitch(source, source[name]);
            }
        }
    };
    
    // return a promise that gets fulfilled when the document is ready
    langReady = lang.ready = function() {
        return readyPromise;
    };
    
    // export the lang plugin
    $pt.lang = lang;
    
})();

////////////////////////////////////////
// source: jquery.platinum-scripts.js
// requires: 

// define names for the wrapping closure
var scripts,
    scriptsLoad;

(function() {
    
    // the scripts plugin
    scripts = { };
    
    // return a promise to load a script
    scriptsLoad = scripts.load = function(url, options) {
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

////////////////////////////////////////
// source: jquery.platinum-analytics.js
// requires: array-base.js, lang.js, scripts.js

// define names for the wrapping closure
var analytics;

(function() {
    
    var 
        // all known trackers as an Array for easy iteration
        allTrackers = [],
        
        // all known trackers mapped to a boolean indicating whether
        // "setAccount" has been called for the tracker
        // commands sent to a tracker will be ignored until "setAccount"
        // is called
        allTrackersSet = { },
        
        // the Analytics constructor
        Analytics = function(trackers) {
            
            // update all known trackers, but skip
            // if we were passed all trackers
            if (trackers !== allTrackers) {                
                arrayEach(trackers, function(tracker) {
                    if (!allTrackersSet.hasOwnProperty(tracker)) {
                        allTrackers.push(tracker);
                        allTrackersSet[tracker] = false;
                    }
                });
            }
            
            this.trackers = trackers;
        },
        
        // the Analytics prototype to be populated below
        AnalyticsPrototype = { },
        
        // creates a method wrapper for the Analytics prototype 
        // that implements one of the push methods
        wrapPushMethod = function(method) {
            
            return (function(method) {
                
                return function() {
                    
                    var args = array(arguments),
                        commands = [];
                    
                    // for each of our initialized trackers, set up a GA command
                    arrayEach(this.trackers, function(tracker) {
                        
                        if (allTrackersSet[tracker]) {
                            
                            commands.push([(tracker.length === 0 ? "" : tracker + ".") + method].concat(args));
                        }
                    });
                    
                    // push the commands
                    window._gaq.push.apply(window._gaq, commands);
                    return this;
                };
                
            })("_" + method);
        },
        
        // creates a method wrapper for the Analytics prototype
        // that implements one of the callback methods
        wrapCallbackMethod = function(method) {
            
            return (function(method) {
                
                return function(callback) {
                    
                    var args = array(arguments, 1),
                        commands = [];
                    
                    if (typeof callback !== "function") {
                        return;
                    }
                    
                    // for each of our initialized trackers, create a function that 
                    // will call the tracker's method and invoke the given callback,
                    // passing it the value returned by the tracker's method
                    // and the tracker object
                    arrayEach(this.trackers, function(tracker) {
                        
                        if (allTrackersSet[tracker]) {
                            
                            commands.push(
                                langPartial(function(tracker, method, callback, args) {
                                    
                                    // get the requested tracker
                                    tracker = window._gat._getTrackerByName(tracker);
                                    
                                    // run the callback with the tracker method's result
                                    callback(tracker[method].apply(tracker, args), tracker);
                                    
                                }, tracker, method, callback, args)
                            );
                        }
                    });
                    
                    // push the commands
                    window._gaq.push.apply(window._gaq, commands);
                    return this;
                };
                
            })("_" + method);
        },
        
        // all of the non-deprecated Google Analytics methods that
        // can be called with Array arguments to _gaq.push(...)
        // (as of 12/11/2012)
        pushMethods = [
            "addIgnoredOrganic",
            "addIgnoredRef",
            "addItem",
            "addOrganic",
            "addTrans",
            "clearIgnoredOrganic",
            "clearIgnoredRef",
            "clearOrganic",
            "cookiePathCopy",
            "deleteCustomVar",
            "getName",
            "setAccount",
            "link",
            "linkByPost",
            "setAllowAnchor",
            "setAllowLinker",
            "setCampContentKey",
            "setCampMediumKey",
            "setCampNameKey",
            "setCampNOKey",
            "setCampSourceKey",
            "setCampTermKey",
            "setCampaignCookieTimeout",
            "setCampaignTrack",
            "setClientInfo",
            "setCookiePath",
            "setCustomVar",
            "setDetectFlash",
            "setDetectTitle",
            "setDomainName",
            "setLocalGifPath",
            "setLocalRemoteServerMode",
            "setLocalServerMode",
            "setReferrerOverride",
            "setRemoteServerMode",
            "setSampleRate",
            "setSiteSpeedSampleRate",
            "setSessionCookieTimeout",
            "setVisitorCookieTimeout",
            "trackEvent",
            "trackPageview",
            "trackSocial",
            "trackTiming",
            "trackTrans"
        ],
        
        // all of the non-deprecated Google Analytics methods that
        // can be called with callback function arguments to _gaq.push(...)
        // (as of 12/11/2012)
        callbackMethods = [
            "getAccount",
            "getClientInfo",
            "getDetectFlash",
            "getDetectTitle",
            "getLinkerUrl",
            "getLocalGifPath",
            "getServiceMode",
            "getVersion",
            "getVisitorCustomVar"
        ],
        
        // the promise to load the Google Analytics script
        loadPromise = null;
    
    // create the analytics plugin
    analytics = function() {
        // determine the requested trackers
        // and avoid duplicates using the "set"
        var trackers = [],
            trackersSet = { };
        
        // determine the requested trackers based on the passed arguments
        if (arguments.length === 0) {
            
            // for no arguments, just use this
            return this;
            
        } else if (arguments.length === 1 && arguments[0] === "*") {
            
            // use all trackers
            trackers = allTrackers;
        
        } else {
            
            // each passed argument may be a string or Array
            arrayEach(arguments, function(arg) {
                
                if (typeof arg === "string") {
                    
                    if (!trackersSet.hasOwnProperty(arg)) {
                        trackers.push(arg);
                        trackersSet[arg] = true;
                    }
                    
                } else if ($.isArray(arg)) {
                    
                    arrayEach(arg, function(tracker) {
                        
                        if (!trackersSet.hasOwnProperty(tracker)) {
                            trackers.push(tracker);
                            trackersSet[tracker] = true;
                        }
                    });
                }
            });
        }
        
        return new Analytics(trackers);
    }
    
    // loads Google Analytics ga.js
    analytics.load = function() {
        
        if (loadPromise === null) {
            
            // initialize the Google Analytics command queue and load ga.js
            window._gaq = window._gaq || [];
            loadPromise = scriptsLoad(
                (document.location.protocol === "https:" ? "https://ssl" : "http://www") + 
                ".google-analytics.com/ga.js"
            ).promise();
        }
        
        return loadPromise;
    };
    
    // get the promise to load Google Analytics ga.js
    analytics.promise = function() {
        return loadPromise;
    };
    
    // add push methods to the Analytics prototype
    arrayEach(pushMethods, function(method) {
        AnalyticsPrototype[method] = wrapPushMethod(method);
    });
    
    // add callback methods to the Analytics prototype
    arrayEach(callbackMethods, function(method) {
        AnalyticsPrototype[method] = wrapCallbackMethod(method);
    });
    
    // override setAccount so that we can keep track
    // of which trackers are properly initialized
    AnalyticsPrototype.setAccount = (function(setAccount) {
        
        return function() {
            
            // make sure GA has loaded
            analytics.load();
            
            // set each tracker as initialized
            arrayEach(this.trackers, function(tracker) {
                allTrackersSet[tracker] = true;
            });
            return setAccount.apply(this, array(arguments));
        };
        
    })(AnalyticsPrototype.setAccount);
    
    // set the Analytics prototype
    Analytics.prototype = AnalyticsPrototype;
    
    // make the analytics plugin delegate to the methods
    // of an Analytics instance bound to the default tracker, ""
    langDelegate(analytics, new Analytics([""]));
    
    // export the anlytics plugin
    $pt.analytics = analytics;
    
})();


////////////////////////////////////////

})(jQuery, window, document);
