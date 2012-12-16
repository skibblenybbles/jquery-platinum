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
                urlScheme + "connect.facebook.net/en_US/all.js"
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
