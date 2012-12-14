// requires: array-base.js, lang.js, scripts.js

(function($, $pt, window, document) {
    
    var 
        // the required plugins
        array = $pt.array,
        lang = $pt.lang,
        scripts = $pt.scripts,
        
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
                array.each(trackers, function(tracker) {
                    if (!allTrackersSet.hasOwnProperty(tracker)) {
                        allTrackers.push(tracker);
                        allTrackersSet[tracker] = false;
                    }
                });
            }
            
            this.trackers = trackers;
        },
        
        // the analytics plugin
        analytics = function() {
            // determine the requested trackers
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
                array.each(arguments, function(arg) {
                    
                    if (typeof arg === "string") {
                        
                        if (!trackersSet.hasOwnProperty(arg)) {
                            trackers.push(arg);
                            trackersSet[arg] = true;
                        }
                        
                    } else if ($.isArray(arg)) {
                        
                        array.each(arg, function(tracker) {
                            
                            if (!trackersSet.hasOwnProperty(tracker)) {
                                trackers.push(tracker);
                                trackersSet[tracker] = true;
                            }
                        });
                    }
                });
            }
            
            return new Analytics(trackers);
        },
        
        // creates a method wrapper for the Analytics prototype 
        // that implements one of the push methods
        wrapPushMethod = function(method) {
            
            return (function(method) {
                
                return function() {
                    
                    var args = array(arguments),
                        commands = [];
                    
                    // for each of our initialized trackers, set up a GA command
                    array.each(this.trackers, function(tracker) {
                        
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
                    array.each(this.trackers, function(tracker) {
                        
                        if (allTrackersSet[tracker]) {
                            
                            commands.push(
                                lang.partial(function(tracker, method, callback, args) {
                                    
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
        ];
    
    // add push methods to the Analytics prototype
    array.each(pushMethods, function(method) {
        Analytics.prototype[method] = wrapPushMethod(method);
    });
    
    // add callback methods to the Analytics prototype
    array.each(callbackMethods, function(method) {
        Analytics.prototype[method] = wrapCallbackMethod(method);
    });
    
    // override setAccount so that we can keep track
    // of which trackers are properly initialized
    Analytics.prototype.setAccount = (function(setAccount) {
        
        return function() {
            
            array.each(this.trackers, function(tracker) {
                allTrackersSet[tracker] = true;
            });
            return setAccount.apply(this, array(arguments));
        };
        
    })(Analytics.prototype.setAccount);
    
    // make the analytics plugin delegate to the methods
    // of an Analytics instance bound to the default tracker, ""
    lang.delegate(analytics, new Analytics([""]));
    
    // load Google Analytics
    window._gaq = window._gaq || [];
    scripts.load(
        (document.location.protocol === "https:" ? "https://ssl" : "http://www") + 
        ".google-analytics.com/ga.js"
    );
    
    // export the anlytics plugin
    $pt.analytics = analytics;
    
})($, $pt, window, document);
