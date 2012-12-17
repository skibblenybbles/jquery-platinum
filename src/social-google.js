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
