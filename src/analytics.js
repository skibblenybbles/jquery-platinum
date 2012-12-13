// requires: array-base.js scripts.js, lang.js

(function($, $pt, window, document) {
    
    var 
        // the required plugins
        scripts = $pt.scripts,
        lang = $pt.lang,
        
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
                        
                        }, method, callback, array(arguments, 1)));
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
            scripts.load(
                (document.location.protocol === "https:" ? "https://ssl" : "http://www") + 
                ".google-analytics.com/ga.js"
            );
        };
    
    // export the anlytics plugin
    $pt.analytics = analytics;
    
})($, $pt, window, document);
