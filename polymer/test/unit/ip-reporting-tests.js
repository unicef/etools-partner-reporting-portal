
describe('frontend tests', function() {
    it('should pass', function() {
        expect(true).toBe(true);
    });
});

describe('IP reporting indicator details observer', function() {
    // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
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

    it('should equal hello', function() {
        expect(getDataByKey(dataObj, ind)).toBe('hello');
    });
    it('should return undefined if dataDict has no details', function() {
        expect(getDataByKey(badObj, ind)).toBe(undefined);
    });
    it('should return undefined if dataDict is not an object', function() {
        expect(getDataByKey(nullObj, ind)).toBe(undefined);
    })
});

describe('IP reporting indicator details clusterApp function', function() {
    function computeIsClusterApp(name) {
        return name === 'cluster-reporting';
    }

    var appName = 'cluster-reporting';
    var ipName = 'ip-reporting';

    it('should return true if name is cluster-reporting', function() {
        expect(computeIsClusterApp(appName)).toBe(true);
    });
    it('should return false if name is not cluster-reporting', function() {
        expect(computeIsClusterApp(ipName)).toBe(false);
    });
    it('should return false if invalid name or empty string is given', function() {
        expect(computeIsClusterApp('')).toBe(false);
    });
});