// requires: array-base.js, lang.js

(function($, $pt, window, document) {
    
    var
        // the required plugins
        array = $pt.array,
        lang = $pt.lang,
        
        // the load promise for each requested network
        loadPromises = { },
        
        // the social plugin
        social = { },
        
        // parser methods will be stored here for each social button network
        // each parser method accepts a single DOM node to parse
        parsers = { },
        
        // loader methods will be stored here for each social button network
        // each loader accepts a config object with options relevant for
        // its network, e.g. Facebook needs an "appId" in its options
        loaders = { };
    
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
        
        var parser = parsers[network],
            loadPromise = loadPromises[network],
            readyPromise = lang.ready();
        
        if (parser && loadPromise) {
            
            done = typeof done === "function" ? lang.hitch(this, done) : null;
            delay = Math.max(0, done || 500);
            
            $.when(loadPromise, readyPromise).done(
                lang.hitch(this,
                    function(parser, done, delay) {
                        
                        // parse the buttons
                        array.each(this, parser);
                        
                        // optionally after a delay, run the callback 
                        if (done !== null) {
                            delay === 0 ? done() : setTimeout(done, delay);
                        }
                    },
                    parser, done, delay
                )
            );
        }
        
        return this;
    };
    
    // export the parsers and loaders objects so they can be populated by 
    // each social-<network>.js script
    social.loaders = loaders;
    social.parsers = parsers;
    
    // export the social plugin
    $pt.social = social;
    
})($, $pt, window, document);
