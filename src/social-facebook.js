// requires: base.js, object-base.js, social-base.js

(function() {
    
    socialPlugins.facebook = {
        
        url: urlScheme + "connect.facebook.net/en_US/all.js",
        
        loaded: function(key) {
            
            var init = objectGet(window, "FB.init"),
                parser;
            
            if (init) {
                
                // intiialize Facebook
                init({
                    appId: key,
                    xfbml: false
                });
                
                // register the parser
                parser = objectGet(window, "FB.XFBML.parse");
                if (parser) {
                    socialRegister("facebook", parser);
                }
            }
        }
    };
    
})();
