// requires: base.js, array-base.js, lang.js, scripts.js, social-base.js

(function() {
    
    var loaders = socialLoaders,
        parsers = socialParsers,
        network = "facebook",
        loadPromise = null;
    
    loaders[network] = function(config) {
        
        var deferred;
        
        if (loadPromise === null) {
            
            // tell Facebook that we'll parse tags manually
            config = $extend(config || { }, {
                xfbml: false
            });
            
            // set up the deferred that we'll resolve
            // after Facebook has been initialized
            deferred = $Deferred();
            loadPromise = deferred.promise();
            
            // load the script and initialize
            scriptsLoad(
                (isProtocolSecure ? protocolHttps : protocolHttp) + 
                "//connect.facebook.net/en_US/all.js"
            ).done(langPartial(function(deferred, config) {
                
                if (window.FB) {
                    
                    window.FB.init(config);
                    // the script is now loaded and initialized
                    deferred.resolve();
                }
                
            }, deferred, config));
        }
        
        return loadPromise;
    };
    
    parsers[network] = function(node) {
        
        if (window.FB && window.FB.XFBML) {
            
            // parse each node in this query
            arrayEach(this, window.FB.XFBML.parse);
        }
    };

})();
