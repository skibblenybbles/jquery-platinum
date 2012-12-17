// requires: base.js, object-base.js, social-base.js

(function() {
    
    socialPlugins.twitter = {
        
        url: urlScheme + "platform.twitter.com/widgets.js",
        
        loaded: function() {
            
            // register the parser
            var parser = objectGet(window, "twttr.widgets.load");
            if (parser) {
                socialRegister("twitter", parser);
            }
        }
    };
    
})();
