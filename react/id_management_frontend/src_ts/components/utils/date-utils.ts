import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
declare const dayjs: any;

export function prettyDate(dateString: string, format?: string, placeholder?: string) {
  const date = convertDate(dateString);
  return !date ? (placeholder ? placeholder : '') : _utcDate(date, format);
}

function _utcDate(date: any, format?: string) {
  return !date ? '' : dayjs.utc(date).format(format ? format : 'D MMM YYYY');
}

export function convertDate(dateString: string, noZTimezoneOffset?: boolean) {
  if (typeof dateString === 'string' && dateString !== '') {
    dateString = dateString.indexOf('T') === -1 ? dateString + 'T00:00:00' : dateString;
    /**
     * `Z` (zero time offset) will ensure `new Date` will create the date in UTC and then it will apply local timezone
     * and will have the same result in all timezones (for the UTC date).
     * Example:
     *  d = new Date('2018-04-25T00:00:00Z');
     *  d.toString() == "Wed Apr 25 2018 03:00:00 GMT+0300 (EEST)"
     *  d.toGMTString() == "Wed, 25 Apr 2018 00:00:00 GMT"
     * @type {string}
     */
    dateString += noZTimezoneOffset || dateString.indexOf('Z') >= 0 ? '' : 'Z';
    const date = new Date(dateString);
    const isValid = isValidDate(date);
    if (!isValid) {
      logWarn('Date conversion unsuccessful: ' + dateString);
    }
    return isValid ? date : null;
  }
  return null;
}

function _getDateWithoutTimezoneOffset(date: any) {
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset);
}

/**
 * Prepare date from string, adding back the timezone offset.
 * This will make sure datepicker displayed date will be the same with the selected date
 * (eliminates the issue when the selected date was displayed +-1 day)
 */
export function prepareDatepickerDate(dateString: string) {
  const date = convertDate(dateString);
  if (!date) {
    return null;
  }
  return _getDateWithoutTimezoneOffset(date);
}

/*
 * Diff between 2 dates
 */
export function dateDiff(firstDate: any, secondDate: any, unit?: any) {
  if (!unit) {
    unit = 'days';
  }
  if (typeof firstDate === 'string' && firstDate !== '' && typeof secondDate === 'string' && secondDate !== '') {
    firstDate = new Date(firstDate);
    secondDate = new Date(secondDate);
  }

  if (isValidDate(firstDate) && isValidDate(secondDate)) {
    const mFirstDate = dayjs.utc(firstDate);
    const mSecondDate = dayjs.utc(secondDate);
    return mSecondDate.diff(mFirstDate, unit);
  }

  return null;
}

export function getMaxDateStr(d1Str: string, d2Str: string) {
  // TODO: optimize this
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  if (!isValidDate(d1) && isValidDate(d2)) {
    return d2Str;
  } else if (isValidDate(d1) && !isValidDate(d2)) {
    return d1Str;
  } else if (!isValidDate(d1) && !isValidDate(d2)) {
    return null;
  } else {
    if (dayjs.utc(d1).isSameOrBefore(d2)) {
      return d2Str;
    } else {
      return d1Str;
    }
  }
}

export function isFutureDate(dateStr: string) {
  return dayjs.utc().isBefore(dayjs.utc(new Date(dateStr)));
}

export function dateIsBetween(start: any, end: any, current: any) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error('Both start and end dates must valid.');
  }
  const date = current instanceof Date ? current : new Date(current);

  const currentDate = isValidDate(date) ? dayjs() : dayjs(date);
  return currentDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]');
}

export function isValidDate(date: any) {
  return date instanceof Date === false ? false : date.toString() !== 'Invalid Date';
}

export function getTodayDateStr() {
  return dayjs().format('YYYY-MM-DD');
}

export function dateIsBefore(dateToCheckStr: string, dateStr: string) {
  return dayjs(dateToCheckStr).isBefore(dateStr);
}

export function dateIsAfter(dateToCheckStr: string | Date, dateStr: string | Date) {
  return dayjs(dateToCheckStr).isAfter(dateStr);
}

function getShortStrMonths() {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

export function EdgeAcceptableDateParse(strDt: any) {
  // expected dt fromat : 01-Sep-2018

  let date = new Date(strDt + 'Z');
  if (isValidDate(date)) {
    return date;
  }

  const dtArr = strDt.split('-');
  if (dtArr && dtArr.length) {
    let numericMonth = dtArr[1];

    if (isNaN(numericMonth)) {
      numericMonth = getShortStrMonths().indexOf(numericMonth);
    }

    date = new Date(dtArr[2], numericMonth, dtArr[0]);
  }

  return date;
}

export function datesAreEqual(date1: any, date2: any) {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    return false;
  }

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function formatDate(date: Date, format: string) {
  if (!date) {
    return null;
  }
  return dayjs(date).format(format);
}
