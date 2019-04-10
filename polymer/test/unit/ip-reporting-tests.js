var { getDataByKey,
    computeIsClusterApp,
    computeParams,
    computeHidden } = require('../../src/elements/ip-reporting/ip-reporting-indicator-details.js');

describe('frontend tests', function() {
    it('should pass', function() {
        expect(true).toBe(true);
    });
});

describe('IP reporting indicator details observer', function() {
    // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
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

    xit('should equal hello', function() {
        expect(getDataByKey(dataObj, ind)).toBe('hello');
    });

    it('should return undefined if dataDict has no details', function() {
        expect(getDataByKey(badObj, ind)).toBe(undefined);
    });

    it('should return undefined if dataDict is not an object', function() {
        expect(getDataByKey(nullObj, ind)).toBe(undefined);
    });
});

describe('IP reporting indicator details clusterApp function', function() {
    // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
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

describe('IP reporting indicator details computeParams function', function() {
    // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
    var isClusterApp = true;
    var isNotClusterApp = false;
    var trueParams = { hide_children: 1 };

    it('should return empty params object if boolean is false', function() {
        expect(computeParams(isNotClusterApp)).toEqual({});
    });

    it('should return object with hide_children property if boolean is true', function() {
        expect(computeParams(isClusterApp)).toEqual(trueParams);
    });
});

describe('IP reporting indicator details computeIndicatorReportsUrl function', function() {
    // found in polymer/src/endpoints.html
    function _buildUrl(tail) {
        return '/api' + tail;
    }

    // found in polymer/src/endpoints.html
    function indicatorReports(reportableId) {
        return _buildUrl('/indicator/' + reportableId + '/indicator-reports/');
    }

    // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
    function computeIndicatorReportsUrl(indicator) {
        var target_indicator_id = indicator.cluster_partner_indicator_reportable_id
            ? indicator.cluster_partner_indicator_reportable_id
            : indicator.id;
        return indicatorReports(target_indicator_id) + '?limit=2';
    }

    var indicator = { id: 1489 };
    var clusterIndicator = { cluster_partner_indicator_reportable_id: 1489, id: 1490 };

    it('should return correct URL with id', function() {
        expect(computeIndicatorReportsUrl(indicator)).toBe('/api/indicator/1489/indicator-reports/?limit=2');
    });

    it('should use cluster_partner_indicator_reportable_id rather than just id if it exists', function() {
        expect(computeIndicatorReportsUrl(clusterIndicator)).toBe('/api/indicator/1489/indicator-reports/?limit=2')
        expect(computeIndicatorReportsUrl(clusterIndicator)).not.toBe('/api/indicator/1490/indicator-reports/?limit=2')
    });
});

describe('IP reporting indicator details computeHidden function', function() {
    var data = ['test', 'test2'];
    var loading = undefined;
    var definedLoading = true;

    it('should return true', function() {
        expect(computeHidden(data, loading)).toBe(true);
    });

    it('should return length of data array when loading is true', function() {
        expect(computeHidden(data, definedLoading)).toBe(2);
    });
});