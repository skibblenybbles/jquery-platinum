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
                urlScheme + "platform.twitter.com/widgets.js"
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
