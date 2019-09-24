const IndicatorDetailsUtils = require('../../src/elements/ip-reporting/js/ip-reporting-indicator-details.js');

const {getDataByKey,
    computeIsClusterApp,
    computeParams,
    computeHidden,
    bucketByLocation} = IndicatorDetailsUtils;

describe('IpReportingIndicatorDetails functions', () => {
    describe('clusterApp function', () => {
        // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
        const appName = 'cluster-reporting';
        const ipName = 'ip-reporting';
    
        it('should return true if name is cluster-reporting', () => {
            expect(computeIsClusterApp(appName)).toBe(true);
        });
    
        it('should return false if name is not cluster-reporting', () => {
            expect(computeIsClusterApp(ipName)).toBe(false);
        });
    
        it('should return false if invalid name or empty string is given', () => {
            expect(computeIsClusterApp('')).toBe(false);
        });
    });
    
    describe('computeParams function', () => {
        // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
        const isClusterApp = true;
        const isNotClusterApp = false;
        const trueParams = {hide_children: 1};
    
        it('should return empty params object if boolean is false', () => {
            expect(computeParams(isNotClusterApp)).toEqual({});
        });
    
        it('should return object with hide_children property if boolean is true', () => {
            expect(computeParams(isClusterApp)).toEqual(trueParams);
        });
    });
    
    describe('computeIndicatorReportsUrl function', () => {
        // found in polymer/src/endpoints.html
        const _buildUrl = tail => '/api' + tail;
    
        // found in polymer/src/endpoints.html
        const indicatorReports = reportableId => _buildUrl('/indicator/' + reportableId + '/indicator-reports/');
    
        // found in polymer/src/elements/ip-reporting/ip-reporting-indicator-details.js
        const computeIndicatorReportsUrl = indicator => {
            const target_indicator_id = indicator.cluster_partner_indicator_reportable_id
                ? indicator.cluster_partner_indicator_reportable_id
                : indicator.id;
            return indicatorReports(target_indicator_id) + '?limit=2';
        };
    
        const indicator = {id: 1489};
        const clusterIndicator = {cluster_partner_indicator_reportable_id: 1489, id: 1490};
    
        it('should return correct URL with id', () => {
            expect(computeIndicatorReportsUrl(indicator)).toBe('/api/indicator/1489/indicator-reports/?limit=2');
        });
    
        it('should use cluster_partner_indicator_reportable_id rather than just id if it exists', () => {
            expect(computeIndicatorReportsUrl(clusterIndicator)).toBe('/api/indicator/1489/indicator-reports/?limit=2');
            expect(computeIndicatorReportsUrl(clusterIndicator))
                .not.toBe('/api/indicator/1490/indicator-reports/?limit=2');
        });
    });
    
    describe('computeHidden function', () => {
        const data = ['test', 'test2'];
        const loading = undefined;
        const definedLoading = true;
    
        it('should return true', () => {
            expect(computeHidden(data, loading)).toBe(true);
        });
    
        it('should return length of data array when loading is true', () => {
            expect(computeHidden(data, definedLoading)).toBe(2);
        });
    });
    
    describe('bucketByLocation function', () => {
        let data;
        const bigData = [{
            id: 0,
            indicator_location_data: [{ 
                location: { 
                    id: 81,
                    title: 'title1'
                }
            }]
        },
        {
            id: 1,
            indicator_location_data: [{
                location: {
                    id: 25,
                    title: 'title4'
                }
            }]
        }];
    
        const greatExpectations = [{
            reportInfo: {
                previous: {
                    id: 1,
                    indicator_location_data: [{ 
                        location: { 
                            id: 25,
                            title: 'title4'
                        }
                    }]
                },
            },
            previous: { 
                location: { 
                    id: 25,
                    title: 'title4'
                }
            },
            name: 'title4'
        },
        {
            reportInfo: {
                current: {
                    id: 0,
                    indicator_location_data: [{ 
                        location: { 
                            id: 81,
                            title: 'title1'
                        }
                    }]
                },
            },
            current: { 
                location: { 
                    id: 81,
                    title: 'title1'
                }
            },
            name: 'title1'
        }];
    
        it('should return an empty array', () => {
            expect(bucketByLocation(data)).toEqual([]);
        });
    
        it('should return locationList array when given bigData', () => {
            expect(bucketByLocation(bigData)).toEqual(greatExpectations);
        });
    });
});
