/**
 * @license jquery.platinum.js
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
// source: jquery.platinum-array-base.js
// requires: base.js

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
            start = !isNumber(start)
                ? step > 0
                    ? 0
                    : length -1
                : start < 0
                    ? start + length
                    : start,
            end = !isNumber(end)
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
// requires: base.js, array-base.js

// define names for the wrapping closure
var lang,
    langHitch,
    langPartial,
    langDelegate,
    langReady;

(function() {
    
    var         
        // the document ready promise
        readyPromise = $Deferred();
    
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
            if (!(name in target) &&
                isFunction(source[name]) &&
                name !== "constructor"
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
// requires: base.js

// define names for the wrapping closure
var scripts,
    scriptsLoad;

(function() {
    
    // the scripts plugin
    scripts = { };
    
    // return a promise to load a script
    scriptsLoad = scripts.load = function(url, options) {
        // allow override of any option except for dataType, cache and url
        options = $extend(options || { }, {
            dataType: "script",
            cache: true,
            url: url
        });
        return $ajax(options);
    };
    
    // export the scripts plugin
    $pt.scripts = scripts;
    
})();

////////////////////////////////////////
// source: jquery.platinum-analytics.js
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
                (secureProtocol ? "https://ssl" : "http://www") + 
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
// source: jquery.platinum-array.js
// requires: base.js, array-base.js

// define names for the wrapping closure
var arrayFilter,
    arrayEvery,
    arraySome,
    arrayAll,
    arrayAny,
    arrayMap,
    arrayReduce;

(function() {
    
    // run a function on each item in any array and
    // return a new array populated with values from
    // the origina array where the function produced
    // a truthy value
    arrayFilter = array.filter = function(iterable, fn, start, end, step) {
        var results = [],
            result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (result) {
                results.push(value);
            }
        }, start, end, step);
        return results;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final result
    arrayEvery = array.every = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (!result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final result
    arraySome = array.some = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            result = fn(value);
            if (result) {
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a falsy result
    // is encountered and return the final value processed
    arrayAll = array.all = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            if (!fn(value)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array until a truthy result
    // is encountered and return the final value processed
    arrayAny = array.any = function(iterable, fn, start, end, step) {
        var result;
        arrayEach(iterable, function(value) {
            if (fn(value)) {
                result = value;
                return false;
            }
        }, start, end, step);
        return result;
    };
    
    // run a function on each item in an array to produce
    // a new array of the function's results
    arrayMap = array.map = function(iterable, fn, start, end, step) {
        var results = [];
        arrayEach(iterable, function(value) {
            results.push(fn(value));
        }, start, end, step);
        return results;
    };
    
    // reduce an array by applying a binary operator
    // that accumulates results onto an initial value
    arrayReduce = array.reduce = function(iterable, fn, initial, start, end, step) {
        var result = initial;
        arrayEach(iterable, function(value) {
            result = fn(value, result);
        }, start, end, step);
        return result;
    };
    
})();

////////////////////////////////////////
// source: jquery.platinum-object-base.js
// requires: base.js, array-base.js, lang.js

// define names for the wrapping closure
var object,
    objectExists,
    objectGet,
    objectEach;

(function() {
    
    // the object plugin
    object = { };
    
    // does the dotted string name exist in the given object?
    objectExists = object.exists = function(obj, path) {
        var found = false;
        arrayEach(path.split("."), function(name) {
            found = name in obj;
            obj = obj[name];
            return found;
        });
        return found;
    };
    
    // get the dotted string name from the given object,
    // being careful to keep a function in the final position
    // bound to its owner
    objectGet = object.get = function(obj, path) {
        var found = false,
            owner;
        arrayEach(path.split("."), function(name) {
            found = name in obj;
            owner = obj;
            obj = obj[name];
            return found;
        });
        return found
            ? isFunction(obj)
                ? langHitch(owner, obj)
                : obj
            : undefined;
    };
    
    // call a function that accepts two arguments for key
    // and value for each property in an object, with a
    // choice to optionally filter out the properties for which
    // obj.hasOwnProperty() is false
    objectEach = object.each = function(obj, owns, fn) {
        var key;
        for (key in obj) {
            if (!owns || obj.hasOwnProperty(key)) {
                fn(key, obj[key]);
            }
        }
    };
    
    // export the object plugin
    $pt.object = object;
    
})();

////////////////////////////////////////
// source: jquery.platinum-social-base.js
// requires: base.js, lang.js

// define names for the wrapping closure
var social,
    socialParsers,
    socialLoaders;

(function() {
    
    var
        // the load promise for each requested network
        loadPromises = { },
        
        // parser methods will be stored here for each social button network
        // each parser method will be called with its "this" set to a
        // jQuery DOM query
        parsers = { },
        
        // loader methods will be stored here for each social button network
        // each loader accepts a config object with options relevant for
        // its network, e.g. Facebook needs an "appId" in its options
        // each loader method should return a promise to load its social
        // button network
        loaders = { };
    
    // export the social plugin for the wrapping closure
    social = { };
    
    // export the parsers and loaders objects for the wrapping closure
    // so they can be populated by each social-<network>.js script
    socialLoaders = loaders;
    socialParsers = parsers;
    
    // load and configure a social button script
    social.load = function(network, config) {
        
        var loader = loaders[network];
        
        // does the requested network exist?
        if (!loader) {
            return null;
        }
        
        // do we need to load and configure the network?
        if (!loadPromises.hasOwnProperty(network)) {
            loadPromises[network] = loader(config);
        }
        return loadPromises[network];
    };
    
    // get the promise to load a social button script
    social.promise = function(network) {
        var promise = loadPromises[network];
        return promise ? promise : null;
    };
    
    // create the jQuery social button plugin
    // after the requested network has finished loading and then upon
    // $(document).ready(), this plugin calls the social button network's
    // underlying DOM parser to convert any social button HTML tags contained
    // in the query to social buttons
    //
    // two optional parameters are are useful for hooking "fade-in" functionality
    // for social buttons using animation or CSS3 transitions:
    // done: a callback that will be called with its "this" context set
    //      to this query after the social buttons have been parsed
    // delay: the number of milliseconds to wait before running the done
    //      callback (defaults to 500)
    $.fn.social = function(network, done, delay) {
        
        var parse = parsers[network],
            loadPromise = loadPromises[network],
            readyPromise = langReady();
        
        if (parse && loadPromise) {
            
            parse = lang.hitch(this, parse);
            done = isFunction(done) ? langHitch(this, done) : null;
            delay = Math.max(0, done || 500);
            
            $.when(loadPromise, readyPromise).done(langHitch(this, function(parse, done, delay) {
                
                // parse the buttons
                parse();
                
                // optionally after a delay, run the callback 
                if (done !== null) {
                    delay === 0 ? done() : setTimeout(done, delay);
                }
            }, parse, done, delay));
        }
        
        return this;
    };
    
    // export the social plugin
    $pt.social = social;
    
})();

////////////////////////////////////////
// source: jquery.platinum-social-google.js
// requires: base.js, array-base.js, object-base.js, lang.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        loadPromise = null,
        parser = null;
    
    loaders.google = function(config) {
        
        var ready;
        
        if (loadPromise === null) {
            
            // tell Google+ that we'll parse button tags manually
            window.___gcfg = {
                parsetags: "explicit"
            };
            
            // we'll resolve this deferred when Google+ is ready to use
            ready = $Deferred();
            
            // load the script
            scriptsLoad(
                "https://apis.google.com/js/plusone.js"
            ).done(langPartial(function(ready) {
                // store the parser and trigger the ready deferred
                parser = objectGet(window, "gapi.plusone.go");
                if (parser) {
                    ready.resolve();
                }
            }, ready));
            
            // keep the promise
            loadPromise = ready.promise();
        }
        return loadPromise;
    };
    
    parsers.google = function() {
        
        if (parser) {
            
            // parse each node in this query
            arrayEach(this, parser);
        }
    };

})();

////////////////////////////////////////
// source: jquery.platinum-social-facebook.js
// requires: base.js, array-base.js, object-base.js, lang.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        loadPromise = null,
        parser = null;
    
    loaders.facebook = function(config) {
        
        var ready;
        
        if (loadPromise === null) {
            
            // we'll resolve this deferred when Facebook is ready to use
            ready = $Deferred();
            
            // load the script
            scriptsLoad(
                (secureProtocol ? "https:" : "http:") +
                "//connect.facebook.net/en_US/all.js"
            ).done(langPartial(function(ready, config) {
                var init = objectGet(window, "FB.init");
                if (init) {
                    
                    // tell Facebook that we'll parse tags manually
                    config = $extend(config || { }, {
                        xfbml: false
                    });
                    
                    // intiialize Facebook with the configuration, store the 
                    // parser and trigger the ready deferred
                    init(config);
                    parser = objectGet(window, "FB.XFBML.parse");
                    if (parser) {
                        ready.resolve();
                    }
                }
            }, ready, config));
            
            // keep the promise
            loadPromise = ready.promise();
        }
        
        return loadPromise;
    };
    
    parsers.facebook = function(node) {
        
        if (parser) {
            
            // parse each node in this query
            arrayEach(this, parser);
        }
    };

})();

////////////////////////////////////////
// source: jquery.platinum-social-twitter.js
// requires: base.js, array-base.js, object-base.js, lang.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        loadPromise = null,
        parser = null;
    
    loaders.twitter = function(config) {
        
        var ready;
        
        if (loadPromise === null) {
            
            // we'll resolve this deferred when Twitter is ready to use
            ready = $Deferred();
            
            // load the script
            scriptsLoad(
                (secureProtocol ? "https:" : "http:") +
                "//platform.twitter.com/widgets.js"
            ).done(langPartial(function(ready) {
                // store the parser and trigger the ready deferred
                parser = objectGet(window, "twttr.widgets.load");
                if (parser) {
                    ready.resolve();
                }
            }, ready));
            
            // keep the promise
            loadPromise = ready.promise();
        }
        
        return loadPromise;
    };
    
    parsers.twitter = function(node) {
        
        if (parser) {
            
            // Twitter finally allows us to pass DOM nodes to
            // twttr.widgets.load(...)
            arrayEach(this, parser);
        }
    };

})();

////////////////////////////////////////
// source: jquery.platinum-social-linkedin.js
// requires: base.js, array-base.js, object-base.js, lang.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        loadPromise = null,
        parser = null;
    
    loaders.linkedin = function(config) {
        
        var ready;
        
        if (loadPromise === null) {
            
            // tell Linked in to prompt users for authorization
            config = $extend(config || { }, {
                authorize: true
            });
            
            // we'll resolve this deferred when LinkedIn is ready to use
            ready = $Deferred();
            
            // load the script
            scriptsLoad(
                (secureProtocol ? "https:" : "http:") +
                "//platform.linkedin.com/in.js?async=true"
            ).done(langPartial(function(ready, config) {
                
                var init = objectGet(window, "IN.init"),
                    readyCallback = "___linkedinready";
                
                if (init) {
                    
                    // tell LinkedIn to prompt users for authorization
                    // and set the name for the global LinkedIn ready callback
                    config = $extend(config || { }, {
                        authorize: true,
                        onLoad: readyCallback
                    });
                    
                    // set up the global LinkedIn ready callback
                    window[readyCallback] = langPartial(function(ready) {
                        // store the parser, trigger the ready deferred
                        // and clean up the nasty global
                        parser = objectGet(window, "IN.parse");
                        if (parser) {
                            ready.resolve();
                        }
                        delete window[readyCallback];
                    }, ready);
                    
                    // intiialize LinkedIn with the configuration
                    init(config);
                }
                
            }, ready, config));
            
            // keep the promise
            loadPromise = ready.promise();
        }
        
        return loadPromise;
    };
    
    parsers.linkedin = function(node) {
        
        if (parser) {
            
            // parse each node in this query
            arrayEach(this, parser);
        }
    };

})();

////////////////////////////////////////
// source: jquery.platinum-social.js
// requires: social-base.js, social-google.js, social-facebook.js, social-twitter.js, social-linkedin.js
// requires all of the dependencies to build the full jquery.platinum-social.js suite

////////////////////////////////////////
// source: jquery.platinum-platinum.js
// requires: analytics.js, array.js, lang.js, object-base.js, scripts.js, social.js
// requires all of the dependencies to build the full jquery.platinum.js suite


////////////////////////////////////////

})(jQuery, window, document);
