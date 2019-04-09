
describe('frontend tests', function() {
    it('should pass', function() {
        expect(true).toBe(true);
    });
});

describe('IP Reporting indicator details observer', function() {
    function getDataByKey(dataDict, indicator) {
        if (dataDict.details) {
            this.data = dataDict.details[indicator.id];
            return this.data;
        }
    }

    var dataObj = {
        details: {
            1: 'hello'
        }
    }
    var ind = { id: 1 }

    it('should pass', function() {
        expect(getDataByKey(dataObj, ind)).toBe('hello');
    });
});