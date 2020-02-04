"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @polymer
 * @mixinFunction
 */
function DateMixin(baseClass) {
    var DateClass = /** @class */ (function (_super) {
        __extends(DateClass, _super);
        function DateClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DateClass.prototype.prettyDate = function (dateString, format) {
            if (!format) {
                format = 'D MMM YYYY';
            }
            if (typeof dateString === 'string' && dateString !== '') {
                var date = this.getUTCDate(dateString);
                if (date.toString() !== 'Invalid Date') {
                    // using moment.utc() ensures that the date will not be changed
                    // no matter timezone the user has set
                    return moment.utc(date).format(format);
                }
            }
            return '';
        };
        DateClass.prototype.prepareDate = function (dateString) {
            if (typeof dateString === 'string' && dateString !== '') {
                var date = new Date(dateString);
                if (date.toString() === 'Invalid Date') {
                    date = new Date();
                }
                return date;
            }
            else {
                return new Date();
            }
        };
        /**
         * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
         * Make sure you also have the data-selector attribute set on the input field.
         */
        DateClass.prototype.openDatePicker = function (event) {
            var id = event.target.getAttribute('data-selector');
            if (id) {
                var datepickerId = '#' + id;
                var datePicker = this.shadowRoot.querySelector(datepickerId);
                if (datePicker) {
                    datePicker.open = true;
                }
            }
        };
        DateClass.prototype.dateDiff = function (firstDateString, secondDateString, unit) {
            if (!unit) {
                unit = 'days';
            }
            if (typeof firstDateString === 'string' && firstDateString !== '' &&
                typeof secondDateString === 'string' && secondDateString !== '') {
                var firstDate = this.getUTCDate(firstDateString);
                var secondDate = this.getUTCDate(secondDateString);
                if (firstDate.toString() !== 'Invalid Date' && secondDate.toString() !== 'Invalid Date') {
                    var mFirstDate = moment.utc(firstDate);
                    var mSecondDate = moment.utc(secondDate);
                    return mSecondDate.diff(mFirstDate, unit);
                }
            }
            return null;
        };
        DateClass.prototype.getMaxDateStr = function (d1Str, d2Str) {
            // TODO: optimize this
            var d1 = this.getUTCDate(d1Str);
            var d2 = this.getUTCDate(d2Str);
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
                if (moment.utc(d1).isSameOrBefore(d2)) {
                    return d2Str;
                }
                else {
                    return d1Str;
                }
            }
        };
        DateClass.prototype.isFutureDate = function (dateStr) {
            return moment.utc().isBefore(moment.utc(this.getUTCDate(dateStr)));
        };
        DateClass.prototype.getUTCDate = function (dateStr) {
            return new Date(dateStr + ' UTC');
        };
        return DateClass;
    }(baseClass));
    return DateClass;
}
exports.default = DateMixin;
