
describe('frontend tests', function() {
    it('should pass', function() {
        expect(true).toBe(true);
    });
});

describe('IP Reporting indicator details observer', function() {
    function getDataByKey(dataDict, indicator) {
        if (dataDict.details) {
            this.data = dataDict.details[indicator.id];
            return this.data;  // Not in original function! For testing purposes only
        }
    }

    var dataObj = {
        details: {
            1: 'hello'
        }
    }
    var ind = {
        id: 1
    }
    var badObj = {
        deets: 'howdy'
    }
    var nullObj = '';

    it('should pass', function() {
        expect(getDataByKey(dataObj, ind)).toBe('hello');
    });
    it('should not pass if dataDict has no details', function() {
        expect(getDataByKey(badObj, ind)).toBe(undefined);
    });
    it('should not pass if dataDict is not an object', function() {
        expect(getDataByKey(nullObj, ind)).toBe(undefined);
    })
});