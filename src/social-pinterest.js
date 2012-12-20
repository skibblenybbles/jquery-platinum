// requires: base.js, object-base.js, social-base.js

(function() {
    
    var 
        // the Pinterest button iframe URL
        url = urlScheme + (secureProtocol ? "assets" : "pinit-cdn") + ".pinterest.com/pinit.html",
        
        // layout style configurations
        layouts = {
            "none": {
                "width": "43px",
                "height": "20px"
            },
            "vertical": {
                "width": "43px",
                "height": "58px"
            },
            "horizontal": {
                "width": "90px",
                "height": "20px"
            }
        },
        
        // url testing regular expression
        rxUrl = /^http(s?):\/\/.+/i,
        
        // URL cleaner
        cleanUrl = function(value) {
            return rxUrl.test(value) && value;
        },
        
        // layout cleaner
        cleanLayout = function(value) {
            value = value || "horizontal";
            return layouts.hasOwnProperty(value) && value;
        },
        
        // count cleaner
        cleanCount = function(value) {
            return value && "1";
        },
        
        // Pinterest button attributes mapped to an array containing
        // the data-* attribute name from the HTML5 tag and a cleaning 
        // function to transform the attribute
        attrs = {
            "url": ["url", cleanUrl],
            "media": ["image", cleanUrl],
            "layout": ["layout", cleanLayout],
            "count": ["always-show-count", cleanCount],
            "title": ["title"],
            "description": ["description"]
        },
        
        // a jQuery port of the HTML5 PinterestPlus button parser script from
        // https://github.com/skibblenybbles/PinterestPlus
        parse = function() {
            
            var
                // convert the node to a jQuery object
                node = $(this),
                
                // is the node valid?
                valid = true,
                
                // query params for the iframe
                query = { };
            
            // process each of the Pinterest button attributes
            objectEachOwned(attrs, function(attr, config) {
                var data = "data-" + config[0],
                    clean = config[1],
                    value = node.attr(data);
                value = clean ? clean(value) : value;
                query[attr] = value;
                valid = valid && value !== false;
                return valid;
            });
            
            if (valid) {
                
                // valid, so create the iframe and replace the node in the DOM
                node.replaceWith(
                    $("<iframe />")
                        .attr({
                            "src": url + "?" + $.param(query),
                            "scrolling": "no",
                            "allowtransparency": "true",
                            "frameborder": "0"
                        })
                        .css("border", "none")
                        .css(layouts[query["layout"]])
                );
                
            } else {
                
                // invalid, so remove the node from the DOM
                node.remove();
            }
        },
        
        // the node parser that invokes parse() for each Pinterest
        // button tag found in the given DOM node
        parser = function(node) {
            $(node).find(".pin-it-button").each(parse);
        };
    
    socialPlugins.pinterest = {
        
        loaded: function() {
            
            // register the parser
            socialRegister("pinterest", parser);
        }
    };
    
})();
