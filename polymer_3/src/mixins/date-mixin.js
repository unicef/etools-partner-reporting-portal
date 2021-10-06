/**
 * @polymer
 * @mixinFunction
 */
function DateMixin(baseClass) {
    class DateClass extends baseClass {
        prettyDate(dateString, format) {
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
        prepareDate(dateString) {
            if (typeof dateString === 'string' && dateString !== '') {
                let date = new Date(dateString);
                if (date.toString() === 'Invalid Date') {
                    date = new Date();
                }
                return date;
            }
            else {
                return new Date();
            }
        }
        /**
         * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
         * Make sure you also have the data-selector attribute set on the input field.
         */
        openDatePicker(event) {
            const id = event.target.getAttribute('data-selector');
            if (id) {
                const datepickerId = '#' + id;
                const datePicker = this.shadowRoot.querySelector(datepickerId);
                if (datePicker) {
                    datePicker.open = true;
                }
            }
        }
        dateDiff(firstDateString, secondDateString, unit) {
            if (!unit) {
                unit = 'days';
            }
            if (typeof firstDateString === 'string' &&
                firstDateString !== '' &&
                typeof secondDateString === 'string' &&
                secondDateString !== '') {
                const firstDate = this.getUTCDate(firstDateString);
                const secondDate = this.getUTCDate(secondDateString);
                if (firstDate.toString() !== 'Invalid Date' && secondDate.toString() !== 'Invalid Date') {
                    const mFirstDate = dayjs.utc(firstDate);
                    const mSecondDate = dayjs.utc(secondDate);
                    return mSecondDate.diff(mFirstDate, unit);
                }
            }
            return null;
        }
        getMaxDateStr(d1Str, d2Str) {
            // TODO: optimize this
            const d1 = this.getUTCDate(d1Str);
            const d2 = this.getUTCDate(d2Str);
            if (d1.toString() === 'Invalid Date' && d2.toString() !== 'Invalid Date') {
                return d2Str;
            }
            else if (d1.toString() !== 'Invalid Date' && d2.toString() === 'Invalid Date') {
                return d1Str;
            }
            else if (d1.toString() === 'Invalid Date' && d2.toString() === 'Invalid Date') {
                return null;
            }
            else {
                if (dayjs.utc(d1).isSameOrBefore(d2)) {
                    return d2Str;
                }
                else {
                    return d1Str;
                }
            }
        }
        isFutureDate(dateStr) {
            return dayjs.utc().isBefore(dayjs.utc(this.getUTCDate(dateStr)));
        }
        getUTCDate(dateStr) {
            return new Date(dateStr + ' UTC');
        }
    }
    return DateClass;
}
export default DateMixin;
