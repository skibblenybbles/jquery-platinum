// requires: array-base.js, scripts.js, social-base.js

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
