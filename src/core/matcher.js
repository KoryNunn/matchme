var reExpr = /([\w\.]+)\s*([\>\<\!\=]\=?)\s*([\w\.]+)/,
    exprLookups = {
        '==': 'equals',
        '>':  'gt',
        '>=': 'gte'
    };

function Matcher(target, opts) {
    // initialise options
    this.opts = opts || {};

    // initialise members
    this.target = target;
    this.passes = true;
}

Matcher.prototype = {
    gt: function(prop, value, result) {
        result = result || this;
        result.passes = result.passes && this.target && this.target[prop] > value;
        
        return this;
    },
    
    gte: function(prop, value, result) {
        result = result || this;
        result.passes = result.passes && this.target && this.target[prop] >= value;
        
        return this;
    },
    
    equals: function(prop, value, result) {
        result = result || this;
        
        if (result.passes && this.target) {
            var testVal = this.target[prop],
                strings = (typeof testVal == 'string' || testVal instanceof String) &&
                    (typeof value == 'string' || value instanceof String);

            // if the test value is a string and the value is a string
            if (strings && (! this.opts.caseSensitive)) {
                result.passes = testVal.toLowerCase() === value.toLowerCase();
            }
            else {
                result.passes = testVal === value;
            }
        }
        
        return this;
    },
    
    query: function(text) {
        var match = reExpr.exec(text);
        while (match) {
            var fnname = exprLookups[match[2]],
                evaluator = this[fnname],
                result = {
                    passes: evaluator ? true : false
                };
                
            if (evaluator) {
                evaluator.call(this, match[1], match[3], result);
            }
            
            text = text.slice(0, match.index) + result.passes + text.slice(match.index + match[0].length);
            match = reExpr.exec(text);
        }
        
        // split the text on
        this.passes = eval(text);
        
        return this;
    }
};