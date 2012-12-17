// requires: base.js, object-base.js, social-base.js

(function() {
    
    socialPlugins.linkedin = {
        
        url: urlScheme + "platform.linkedin.com/in.js?async=true",
        
        loaded: function(key) {
            
            var init = objectGet(window, "IN.init"),
                ready = "___in";

            if (init) {
                
                // set up the global LinkedIn ready callback
                window[ready] = function() {

                    // get the LinkedIn parser
                    var parser = objectGet(window, "IN.parse");

                    // clean up the nasty global
                    delete window[ready];

                    // register the parser
                    if (parser) {
                        socialRegister("linkedin", parser);
                    }
                };

                // intiialize LinkedIn
                init({
                    api_key: key,
                    authorize: true,
                    onLoad: ready
                });
            }
        }
    };
    
})();
