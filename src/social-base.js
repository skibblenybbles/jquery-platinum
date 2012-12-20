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
