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
                urlScheme + "platform.linkedin.com/in.js?async=true"
            ).done(langPartial(function(ready, config) {
                
                var init = objectGet(window, "IN.init"),
                    readyCallback = "___in";
                
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
