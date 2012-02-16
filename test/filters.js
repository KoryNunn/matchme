var matchme = require('matchme'),
    expect = require('chai').expect,
    testdata = require('./helpers/testdata'),
    testArray = [testdata.fred, testdata.bob],
    _ = require('underscore');
    
describe('underscore filter', function() {
    it('can find objects that are called fred', function() {
        var results = matchme.filter(testArray, 'name == fred');
        
        expect(results).to.exist;
        expect(results.length).to.equal(1);
    });

    it('can find objects that are called fred (using underscore)', function() {
        var results = _.filter(testdata, matchme.filter('name == fred'));
        
        expect(results).to.exist;
        expect(results.length).to.equal(1);
    });
});