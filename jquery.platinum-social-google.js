/**
 * @license jquery.platinum-social-google.js
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
            start = maximum(0, start);
            end = minimum(length, end);
            
            // iterate
            for (i = start; i < end; i += step) {
                value = fn.call(null, iterable[i]);
                if (value === false) {
                    return;
                }
            }
            
        } else {
            
            // trim the useless ends
            start = minimum(length - 1, start);
            end = maximum(-1, end);
            
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
        if (!network in loadPromises) {
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
            done = typeof done === "function" ? langHitch(this, done) : null;
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
// requires: base.js, array-base.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        network = "google",
        loadPromise = null;
    
    loaders[network] = function(config) {
        
        if (loadPromise === null) {
            
            // tell Google+ that we'll parse button tags manually
            window.___gcfg = {
                parsetags: "explicit"
            };
            
            // load the script
            loadPromise = scriptsLoad("https://apis.google.com/js/plusone.js").promise();
        }
        return loadPromise;
    };
    
    parsers[network] = function() {
        
        if (window.gapi && window.gapi.plusone) {
            
            // parse each node in this query
            arrayEach(this, window.gapi.plusone.go);
        }
    };

})();


////////////////////////////////////////

})(jQuery, window, document);
