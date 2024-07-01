import {LitElement} from 'lit';
import {Constructor} from '../etools-prp-common/typings/globals.types';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc';
import dayJsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(dayJsUtc);
dayjs.extend(dayJsSameOrBefore);

/**
 * @polymer
 * @mixinFunction
 */
function DateMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DateClass extends baseClass {
    prettyDate(dateString: string, format?: string) {
      if (!format) {
        format = 'D MMM YYYY';
      }
      if (typeof dateString === 'string' && dateString !== '') {
        const date = this.getUTCDate(dateString);
        if (date.toString() !== 'Invalid Date') {
          // using dayjs.utc() ensures that the date will not be changed
          // no matter timezone the user has set
          return dayjs.utc(date).format(format);
        }
      }
      return '';
    }

    prepareDate(dateString: string) {
      if (typeof dateString === 'string' && dateString !== '') {
        let date = new Date(dateString);
        if (date.toString() === 'Invalid Date') {
          date = new Date();
        }
        return date;
      } else {
        return new Date();
      }
    }

    /**
     * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
     * Make sure you also have the data-selector attribute set on the input field.
     */
    openDatePicker(event: CustomEvent) {
      const id = (event.target as any).getAttribute('data-selector');
      if (id) {
        const datepickerId = '#' + id;
        const datePicker = this.shadowRoot!.querySelector(datepickerId);
        if (datePicker) {
          (datePicker as any).open = true;
        }
      }
    }

    dateDiff(firstDateString: string, secondDateString: string, unit?: string) {
      if (!unit) {
        unit = 'days';
      }
      if (
        typeof firstDateString === 'string' &&
        firstDateString !== '' &&
        typeof secondDateString === 'string' &&
        secondDateString !== ''
      ) {
        const firstDate = this.getUTCDate(firstDateString);
        const secondDate = this.getUTCDate(secondDateString);
        if (firstDate.toString() !== 'Invalid Date' && secondDate.toString() !== 'Invalid Date') {
          const mFirstDate = dayjs.utc(firstDate);
          const mSecondDate = dayjs.utc(secondDate);
          return mSecondDate.diff(mFirstDate, unit as any);
        }
      }
      return null;
    }

    getMaxDateStr(d1Str: string, d2Str: string) {
      // TODO: optimize this
      const d1 = this.getUTCDate(d1Str);
      const d2 = this.getUTCDate(d2Str);
      if (d1.toString() === 'Invalid Date' && d2.toString() !== 'Invalid Date') {
        return d2Str;
      } else if (d1.toString() !== 'Invalid Date' && d2.toString() === 'Invalid Date') {
        return d1Str;
      } else if (d1.toString() === 'Invalid Date' && d2.toString() === 'Invalid Date') {
        return null;
      } else {
        if (dayjs.utc(d1).isSameOrBefore(d2)) {
          return d2Str;
        } else {
          return d1Str;
        }
      }
    }

    isFutureDate(dateStr: string) {
      return dayjs.utc().isBefore(dayjs.utc(this.getUTCDate(dateStr)));
    }

    getUTCDate(dateStr: string) {
      return new Date(dateStr + ' UTC');
    }
  }
  return DateClass;
}

export default DateMixin;
