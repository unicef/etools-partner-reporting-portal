import Settings from '../settings';
/**
 * @polymer
 * @mixinFunction
 */
function UtilsMixin(baseClass) {
    const pdListStatuses = {
        Signed: 'signed',
        Active: 'active',
        Suspended: 'suspended',
        Ended: 'ended',
        Closed: 'closed',
        Terminated: 'terminated',
        All: 'all'
    };
    const buildQuery = (chunks) => {
        // @ts-ignore
        return chunks.map((chunk) => {
            switch (typeof chunk) {
                case 'string':
                    return chunk;
                case 'object':
                    return buildQuery(Object.keys(chunk).map(function (key) {
                        return [
                            encodeURIComponent(key),
                            encodeURIComponent(chunk[key])
                        ].join('=');
                    }));
            }
        }).join('&');
    };
    class UtilsClass extends baseClass {
        _equals(a, b) {
            return a === b;
        }
        _forEach(selector, fn) {
            [].forEach.call(this.shadowRoot.querySelector(selector), fn, this);
        }
        _toLowerCaseLocalized(text, localize) {
            const localizedText = localize(text);
            if (localizedText) {
                return localizedText.toLowerCase();
            }
            return text;
        }
        _localizeLowerCased(text, localize) {
            return text ? localize(text.split(' ').join('_').toLowerCase()) : '';
        }
        _singularLocalized(text, localize) {
            return localize(text).substring(0, text.length - 1);
        }
        _withDefault(value, defaultValue, localize) {
            if (typeof defaultValue === 'undefined') {
                defaultValue = '...';
            }
            if (pdListStatuses[value] !== undefined) {
                return localize(pdListStatuses[value]);
            }
            return value == null /* undefinded & null */ ? // jshint ignore:line
                defaultValue : value;
        }
        _withDefaultFrom(obj, key, defaultValue) {
            if (typeof defaultValue === 'undefined') {
                defaultValue = '...';
            }
            return obj[key] || defaultValue;
        }
        _debug(val) {
            return JSON.stringify(val, null, 2);
        }
        _log(val) {
            console.log('_log', val);
        }
        _toNumber(val) {
            return Number(val);
        }
        _capitalizeFirstLetter(text, localize) {
            if (localize !== undefined) {
                return localize(text);
            }
            if (text) {
                return text[0].toUpperCase() + text.substring(1);
            }
        }
        _notFound() {
            window.location.href = '/not-found';
        }
        _clone(val) {
            if (val) {
                return JSON.parse(JSON.stringify(val));
            }
            return val;
            // (dci) must check this !!!!
            // const typeStr = Object.prototype.toString.call(val);
            // const self = this;
            // switch (typeStr) {
            //   case '[object Array]':
            //     return val.map(self._clone);
            //   case '[object Object]':
            //     return val.map(x => Object.assign({}, x));
            //   default:
            //     return val;
            // }
        }
        _deferred() {
            const defer = {};
            defer.promise = new Promise(function (resolve, reject) {
                defer.resolve = resolve;
                defer.reject = reject;
            });
            return defer;
        }
        _toPercentage(value) {
            return value == null /* undefinded & null */ ? // jshint ignore:line
                value : Math.floor(value * 100) + '%';
        }
        _formatIndicatorValue(indicatorType, value, percentize) {
            if (value == null /* undefinded & null */) { // jshint ignore:line
                return value;
            }
            const _value = value.toFixed(2);
            switch (indicatorType) {
                case 'percentage':
                    if (!percentize) {
                        return this._toPercentage(value);
                    }
                    return percentize === 1 ? Math.floor(_value) + '%' : _value + '%';
                case 'ratio':
                    return _value + '/1';
                default:
                    return _value;
            }
        }
        _displayClusterHeader(subpage, needsHeaderList) {
            if (needsHeaderList.indexOf(subpage) >= 0) {
                return true;
            }
            return false;
        }
        _commaSeparated(items) {
            if (!items) {
                return '';
            }
            return items.join(', ');
        }
        _commaSeparatedDictValues(items, key) {
            const newList = (items || []).map(function (item) {
                return item[key];
            });
            return this._commaSeparated(newList);
        }
        _commaSeparatedValues(list) {
            return (list || []).join(', ');
        }
        _formatAddress(street, city, zip) {
            if (!(street || city || zip)) {
                return undefined;
            }
            else if (!street) {
                return city + ' ' + zip;
            }
            else {
                return street + ',' + city + ' ' + zip;
            }
        }
        _fieldsAreValid() {
            let valid = true;
            const fields = this.shadowRoot.querySelectorAll('.validate');
            fields.forEach(function (field) {
                field.validate();
            });
            fields.forEach(function (field) {
                if (field.invalid) {
                    valid = false;
                }
            });
            return valid;
        }
        _dateRangeValid(start, end) {
            const startField = this.shadowRoot.querySelector(start);
            const endField = this.shadowRoot.querySelector(end);
            if (!startField || !endField) {
                return true;
            }
            const startValue = startField.value;
            const endValue = endField.value;
            if (!Date.parse(startValue) || !Date.parse(endValue)) {
                if (startField.required) {
                    startField.invalid = true;
                }
                if (endField.required) {
                    endField.invalid = true;
                }
                return false;
            }
            if (new Date(startField.value) >= new Date(endField.value)) {
                startField.invalid = true;
                endField.invalid = true;
                return false;
            }
            startField.invalid = false;
            endField.invalid = false;
            return true;
        }
        _withDefaultParams(queryParams) {
            return Object.assign({}, queryParams, {
                page: 1,
                page_size: 10
            });
        }
        _appendQuery(url) {
            if (url === undefined) {
                return;
            }
            return url + '?' + buildQuery([].slice.call(arguments, 1));
        }
        _cloneNode(node) {
            const newNode = node.cloneNode(true);
            for (let prop in node.properties) {
                try {
                    newNode[prop] = node[prop];
                    // eslint-disable-next-line no-empty
                }
                catch (err) { }
            }
            return newNode;
        }
        _identity(arg) {
            return arg;
        }
        _truncate(str, len) {
            return str.slice(0, len) + (str.length > len ? '…' : '');
        }
        _cancelDebouncers(debouncers) {
            debouncers.forEach(debouncer => {
                if (debouncer && debouncer.isActive && debouncer.isActive()) {
                    debouncer.cancel();
                }
            }, this);
        }
        _prop(obj, key) {
            return obj[key];
        }
        _omit(src, keys) {
            return Object.keys(src)
                .filter((key) => {
                return keys.indexOf(key) === -1;
            })
                .reduce((acc, key) => {
                acc[key] = src[key];
                return acc;
            }, {});
        }
        _normalizeDate(date) {
            return moment(date, Settings.dateFormat).startOf('day').toDate();
        }
    }
    return UtilsClass;
}
export default UtilsMixin;
