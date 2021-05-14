import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../typings/globals.types';

export function computeIsClusterApp(name: string) {
  return name === 'cluster-reporting';
}

export function computeParams(val: boolean) {
  let params = {};

  if (val === true) {
    params = Object.assign({}, params, {
      hide_children: 1
    });
  }

  return params;
}

export function computeIndicatorReportsUrl(indicator: GenericObject) {
  const target_indicator_id = indicator.cluster_partner_indicator_reportable_id
    ? indicator.cluster_partner_indicator_reportable_id
    : indicator.id;
  return Endpoints.indicatorReports(target_indicator_id) + '?limit=2';
}

export function computeHidden(data: any[], loading: boolean) {
  return !loading || (data && data.length);
}

export function bucketByLocation(data: any[]) {
  // API gives us two objects, one for current reporting period and
  // one for previous. We want to create a list of locations, each with a
  // current and/or previous report.
  const locations: GenericObject = {};

  if (!data) {
    return [];
  }

  data.forEach(function (report, index) {
    let timeframe = 'current';
    if (index === 1) {
      timeframe = 'previous';
    }

    report.indicator_location_data.forEach(function (locationReport: GenericObject) {
      if (locations[locationReport.location.id]) {
        const toUpdate = locations[locationReport.location.id];
        toUpdate[timeframe] = locationReport;
        toUpdate.reportInfo[timeframe] = report;
        locations[locationReport.location.id] = toUpdate;
      } else {
        const newDict: GenericObject = {reportInfo: {}};
        newDict[timeframe] = locationReport;
        newDict.name = locationReport.location.title;
        newDict.reportInfo[timeframe] = report;
        locations[locationReport.location.id] = newDict;
      }
    });
  });

  const locationList: any[] = [];

  Object.keys(locations).forEach(function (i) {
    locationList.push(locations[i]);
  });

  return locationList;
}
