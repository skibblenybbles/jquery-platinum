// requires: base.js, array-base.js, lang.js

// define names for the wrapping closure
var object,
    objectExists,
    objectGet,
    objectEach;

(function() {
    
    // the object plugin
    object = { };
    
    // does the dotted string name exist in the given object?
    objectExists = object.exists = function(obj, path) {
        var found = false;
        arrayEach(path.split("."), function(name) {
            found = name in obj;
            obj = obj[name];
            return found;
        });
        return found;
    };
    
    // get the dotted string name from the given object,
    // being careful to keep a function in the final position
    // bound to its owner
    objectGet = object.get = function(obj, path) {
        var found = false,
            owner;
        arrayEach(path.split("."), function(name) {
            found = name in obj;
            owner = obj;
            obj = obj[name];
            return found;
        });
        return found
            ? isFunction(obj)
                ? langHitch(owner, obj)
                : obj
            : undefined;
    };
    
    // call a function that accepts two arguments for key
    // and value for each property in an object, with a
    // choice to optionally filter out the properties for which
    // obj.hasOwnProperty() is false
    // if the function returns false (strictly), the loop
    // will terminate
    objectEach = object.each = function(obj, owns, fn) {
        var key,
            value;
        for (key in obj) {
            if (!owns || obj.hasOwnProperty(key)) {
                value = fn(key, obj[key]);
                if (value === false) {
                    return;
                }
            }
        }
    };
    
    // export the object plugin
    $pt.object = object;
    
})();
