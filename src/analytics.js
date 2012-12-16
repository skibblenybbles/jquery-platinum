// requires: base.js, array-base.js, lang.js, scripts.js

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
                    
                    if (!isFunction(callback)) {
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
                
                if (isString(arg)) {
                    
                    if (!trackersSet.hasOwnProperty(arg)) {
                        trackers.push(arg);
                        trackersSet[arg] = true;
                    }
                    
                } else if (isArray(arg)) {
                    
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
                (isProtocolSecure ? protocolHttps + "//ssl" : protocolHttp + "//www") + 
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
