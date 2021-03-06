var exprLookups = {
        '==': ['equals'],
        '>':  ['gt'],
        '>=': ['gte'],
        '<':  ['lt'],
        '<=': ['lte'],
        '!=': ['equals', 'not'],
        '=~': ['regex'],
        '!~': ['regex', 'not']
    },
    wordReplacements = {
        and: '&&',
        or: '||'
    },
    ample = require('./ample');


/**
 * class Matcher
 *
 **/
 
/**
 * new Matcher(target, [opts])
 * - target (Object): the object that match operations will be checked against
 *
 **/
function Matcher(target, opts) {
    // initialise options
    this.opts = opts || {};

    // initialise members
    this.target = target;
    this.ok = true;
}

Matcher.prototype = {
    /** chainable
    * Matcher#gt(prop, value, [result])
    *
    * Check whether the specified property of the target object is greater than 
    * the specified value.  If the optional result argument is passed to the function
    * then the result is passed back in that object. If not the result is stored in
    * the local `ok` property of the matcher instance.  Other comparison methods use
    * the same principle as this function.
    **/
    gt: function(prop, value, result) {
        result = result || this;
        result.ok = result.ok && this.target && this._val(prop) > value;
        
        return this;
    },
    
    /** chainable
    * Matcher#gte(prop, value, [result])
    *
    * Greater than or equal to check.
    **/
    gte: function(prop, value, result) {
        result = result || this;
        result.ok = result.ok && this.target && this._val(prop) >= value;
        
        return this;
    },
    
    /** chainable
    * Matcher#lt(prop, value, [result])
    *
    * Less than property value check
    **/
    lt: function(prop, value, result) {
        result = result || this;
        result.ok = result.ok && this.target && this._val(prop) < value;
        
        return this;
    },
    
    // Test for a property being equal or less than the specified value
    lte: function(prop, value, result) {
        result = result || this;
        result.ok = result.ok && this.target && this._val(prop) <= value;
        
        return this;
    },
    
    // Test for equality of the specified property
    equals: function(prop, value, result) { 
        result = result || this;
        
        if (result.ok && this.target) {
            var testVal = this._val(prop),
                strings = (typeof testVal == 'string' || testVal instanceof String) &&
                    (typeof value == 'string' || value instanceof String);

            // if the test value is a string and the value is a string
            if (strings && (! this.opts.caseSensitive)) {
                result.ok = testVal.toLowerCase() === value.toLowerCase();
            }
            else {
                result.ok = testVal === value;
            }
        }
        
        return this;
    },
    
    not: function(prop, value, result) {
        // invert the passes state
        result = result || this;
        result.ok = !result.ok;
        
        return this;
    },
    
    regex: function(prop, value, result) {
        result = result || this;
        
        // if the result is still ok, then check the regex
        if (result.ok && this.target) {
            var regex = value;
            
            // if the regex is currently a string, then parse into a regular expression
            if (typeof regex == 'string' || regex instanceof String) {
                var match = reRegex.exec(value);
                if (match) {
                    regex = new RegExp(match[1], match[2]);
                }
            }
            
            // if we now have a regex, then update the result ok
            if (regex instanceof RegExp) {
                result.ok = regex.test(this._val(prop));
            }
        }
        
        return this;
    },
    
    query: function(text) {
        var query = new ample();
        this.ok = query.evaluate(text, this.target);
        return this;
    },
    
    _val: function(prop) {
        var value = this.target[prop];

        // if the value is undefined, we'll attempt looking for nested properties
        if (typeof value == 'undefined') {
            var props = prop.split('.');
            if (props.length > 1) {
                value = this.target;
                while (value && props.length) {
                    value = value[props.shift()];
                }
            }
        }
        
        return value;
    }
};

/*
Create a matcher that will execute against the specified target.
*/
var matchme = module.exports = function(target, opts, query) {
    var matcher;
    
    // check for no options being supplied (which is the default)
    if (typeof opts == 'string' || opts instanceof String) {
        query = opts;
        opts = {};
    }
    
    // create the matcher
    matcher = new Matcher(target, opts);
    
    if (typeof query != 'undefined') {
        return matcher.query(query).ok;
    }
    else {
        return matcher;
    }
};

matchme.filter = function(array, query, opts) {
    var matcher;
    
    // if the array has been ommitted (perhaps underscore is being used)
    // then push up arguments and undef the array
    if (typeof array == 'string' || array instanceof String) {
        opts = query;
        query = array;
        array = null;
    }
    
    // create the matcher on a null target
    matcher = new Matcher(null, opts);
    
    if (array) {
        var results = [];
        for (var ii = 0, count = array.length; ii < count; ii++) {
            matcher.target = array[ii];
            if (matcher.query(query).ok) {
                results[results.length] = array[ii];
            }
        }
        
        return results;
    }
    else {
        return function(target) {
            // update the matcher target
            matcher.target = target;
            
            return matcher.query(query).ok;
        };
    }
};