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
    
    // the URL scheme to use for generated URL strings
    urlScheme = "http" + (secureProtocol ? "s" : "") + "://",
    
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
        // the document ready Deferred and promise
        readyDeferred = $Deferred(),
        readyPromise = readyDeferred.promise();
    
    // set up the document ready promise
    $(document).ready(function() {
        readyDeferred.resolve();
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
    
    // call a function that accepts two arguments, key
    // and value, for each property in an object
    // if the function returns false (strictly), the loop
    // will terminate
    objectEach = object.each = function(obj, fn) {
        var key,
            value;
        for (key in obj) {
            value = fn(key, obj[key]);
            if (value === false) {
                return;
            }
        }
    },
    
    // call a function that accepts two arguments, key
    // and value, for each proprety owned by an object,
    // that is, each property for which obj.hasOwnProperty((key)
    // is true
    // if the function returns false (strictly), the loop
    // will terminate
    objectEachOwned = object.eachOwned = function(obj, fn) {
        objectEach(obj, function(key, value) {
            if (obj.hasOwnProperty(key)) {
                return fn(key, value);
            }
        });
    };
    
    // export the object plugin
    $pt.object = object;
    
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
// source: jquery.platinum-social-base.js
// requires: base.js, array-base.js, lang.js, scripts.js

// define names for the wrapping closure
var social,
    socialPlugins,
    socialRegister;

(function() {
    
    var
        // the load promise for each requested network
        promises = { },
        
        // the parser method for each social button network
        // each parser accepts a single DOM node argument
        parsers = { };
    
    // export the social plugin for the wrapping closure
    social = { };
    
    // export the social plugins object for the wrapping closure that each
    // social-<network>.js  script will populate with an url property and
    // a loaded() callback functions
    socialPlugins = { };
    
    // export the register function for the wrapping closure that each
    // social-<network>.js script will call from its loaded() callback
    // once the network's parser is ready
    socialRegister = function(network, parser) {
        // store the network's parser and resolve its promise
        if (promises[network]) {
            parsers[network] = parser;
            promises[network].resolve();
        }
    };
    
    // load and initialize a social button script
    social.load = function(network, key) {
        
        var plugin = socialPlugins[network],
            loaded;
        
        // does the requested network exist?
        if (!plugin) {
            return null;
        }
        
        // do we need to load and configure the network?
        if (!promises[network]) {
            
            promises[network] = $Deferred.promise();
            
            // if necessary, load the script, then call its loaded method
            loaded = lang.hitch(plugin, plugin.loaded, key);
            if (plugin.url) {
                scriptsLoad(plugin.url).done(loaded);
            } else {
                loaded();
            }
        }
        
        return promises[network];
    };
    
    // get the promise to load a social button script
    social.promise = function(network) {
        var promise = promises[network];
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
            loadPromise = promises[network],
            readyPromise = langReady();
        
        if (parse && loadPromise) {
            
            parse = lang.hitch(this, parse);
            done = isFunction(done) ? langHitch(this, done) : null;
            delay = Math.max(0, done || 500);
            
            $.when(loadPromise, readyPromise).done(langHitch(this, function(parse, done, delay) {
                
                // parse each node in this query
                arrayEach(this, parse);
                
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
// requires: base.js, object-base.js, social-base.js

(function() {
    
    socialPlugins.google = {
        
        url: "https://apis.google.com/js/plusone.js",
        
        loaded: function() {
            
            // register the parser
            var parser = objectGet(window, "gapi.plusone.go");
            if (parser) {
                socialRegister("google", parser);
            }
        }
    };
    
})();


////////////////////////////////////////

})(jQuery, window, document);
