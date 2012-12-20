// requires: base.js, social-base.js

(function() {
    
    var 
        // the Pinterest button iframe URL
        url = urlScheme + (secureProtocol ? "assets" : "pinit-cdn") + ".pinterest.com/pinit.html",
        
        // url testing regular expression
        urlRx = /^http(s?):\/\/.+/i,
        
        // layout testing regular expression
        layoutRx = /^none|vertical|horizontal$/,
        
        // layout style configurations
        layout = {
            none: {
                width: 43,
                height: 20
            },
            vertical: {
                width: 43,
                height: 58
            },
            horizontal: {
                width: 90,
                height: 20
            }
        },
        
        // a jQuery port of the HTML5 PinterestPlus button parser script from
        // https://github.com/skibblenybbles/PinterestPlus
        parser = function(node) {
        
            var 
                // conver the node to a jQuery object
                node = $(node),
            
                // is the node valid?
                valid = true,
                
                // query params for the iframe
                query = { },
                
                // the layout we'll use
                layout,
                
                // the current attribute we're processing
                attr;
            
            // required attributes
            attr = node.attr("data-url");
            valid = valid && attr && urlRx.test(attr);
            query["url"] = attr;
            
            attr = node.attr("data-image");
            valid = valid && attr && urlRx.test(attr);
            query["media"] = attr;
            
            // optional attributes
            attr = node.attr("data-layout") || "horizontal";
            valid = valid && attr && layoutRx.test(attr);
            query["layout"] = attr;
            
            attr = node.attr("data-title");
            if (attr) {
                query["title"] = attr;
            }
            
            attr = node.attr("data-description");
            if (attr) {
                query["description"] = attr;
            }
            
            attr = node.attr("data-always-show-count");
            if (attr) {
                query["count"] = "1";
            }
            
            if (valid) {
                
                // valid, so create the iframe and replace the node in the DOM
                layout = query["layout"];
                node.replaceWith(
                    $("<iframe />")
                        .attr({
                            "src": url + "?" + $.param(query),
                            "scrolling": "no",
                            "allowtransparency": "true",
                            "frameborder": "0"
                        })
                        .css("border", "none")
                        .css("width", layout["width"] + "px")
                        .css("height", layout["height"] + "px")
                );
                
            } else {
                
                // invalid, so remove the node from the DOM
                node.remove();
            }
        };
    
    socialPlugins.pinterest = {
        
        loaded: function() {
            
            // register the parser
            socialRegister("pinterest", parser);
        }
    };
    
})();
