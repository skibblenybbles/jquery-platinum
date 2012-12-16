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
