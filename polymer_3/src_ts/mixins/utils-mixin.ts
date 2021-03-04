import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import Settings from '../settings';
declare const dayjs: any;

/**
 * @polymer
 * @mixinFunction
 */
function UtilsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  const pdListStatuses: GenericObject = {
    Signed: 'signed',
    Active: 'active',
    Suspended: 'suspended',
    Ended: 'ended',
    Closed: 'closed',
    Terminated: 'terminated',
    All: 'all'
  };

  const buildQuery = (chunks: any[]): string => {
    // @ts-ignore
    return chunks
      .map((chunk) => {
        switch (typeof chunk) {
          case 'string':
            return chunk;

          case 'object':
            return buildQuery(
              Object.keys(chunk).map((key) => {
                return [encodeURIComponent(key), encodeURIComponent(chunk[key])].join('=');
              })
            );
        }
      })
      .join('&');
  };

  class UtilsClass extends baseClass {
    _equals(a: any, b: any) {
      return a === b;
    }

    _forEach(selector: any, fn: any) {
      [].forEach.call(this.shadowRoot!.querySelector(selector), fn, this);
    }

    _toLowerCaseLocalized(text: string, localize: any) {
      const localizedText = localize(text);
      if (localizedText) {
        return localizedText.toLowerCase();
      }
      return text;
    }

    _localizeLowerCased(text: string, localize: (x: string) => string) {
      return text ? localize(text.split(' ').join('_').toLowerCase()) : '';
    }

    _singularLocalized(text: string, localize: (x: string) => string) {
      return localize(text).substring(0, text.length - 1);
    }

    _withDefault(value: any, defaultValue?: any, localize?: (x: string) => string) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = '...';
      }

      if (pdListStatuses[value] !== undefined && localize) {
        return localize(pdListStatuses[value]);
      }

      return value == null /* undefinded & null */ // jshint ignore:line
        ? defaultValue
        : value;
    }

    _withDefaultFrom(obj: GenericObject, key: string, defaultValue: any) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = '...';
      }

      return obj[key] || defaultValue;
    }

    _debug(val: any) {
      return JSON.stringify(val, null, 2);
    }

    _log(val: any) {
      console.log('_log', val);
    }

    _toNumber(val: string) {
      return Number(val);
    }

    _capitalizeFirstLetter(text: string, localize?: (x: string) => string) {
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

    _clone(val: any) {
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
      const defer: GenericObject = {};

      defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });

      return defer;
    }

    _toPercentage(value: any) {
      return value == null /* undefinded & null */ // jshint ignore:line
        ? value
        : Math.floor(value * 100) + '%';
    }

    _formatIndicatorValue(indicatorType: any, value: any, percentize: any) {
      if (value == null /* undefinded & null */) {
        // jshint ignore:line
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

    _displayClusterHeader(subpage: any, needsHeaderList: any) {
      if (needsHeaderList.indexOf(subpage) >= 0) {
        return true;
      }
      return false;
    }

    _commaSeparated(items: any) {
      if (!items) {
        return '';
      }
      return items.join(', ');
    }

    _commaSeparatedDictValues(items: any, key: string) {
      const newList = (items || []).map(function (item: any) {
        return item[key];
      });

      return this._commaSeparated(newList);
    }

    _commaSeparatedValues(list: any) {
      return (list || []).join(', ');
    }

    _formatAddress(street: string, city: string, zip: string) {
      if (!(street || city || zip)) {
        return undefined;
      } else if (!street) {
        return city + ' ' + zip;
      } else {
        return street + ',' + city + ' ' + zip;
      }
    }

    _fieldsAreValid() {
      let valid = true;
      const fields = this.shadowRoot!.querySelectorAll('.validate');

      fields.forEach(function (field: any) {
        field.validate();
      });

      fields.forEach(function (field: any) {
        if (field.invalid) {
          valid = false;
        }
      });
      return valid;
    }

    _dateRangeValid(start: any, end: any) {
      const startField = this.shadowRoot!.querySelector(start);
      const endField = this.shadowRoot!.querySelector(end);
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

    _withDefaultParams(queryParams: any) {
      return Object.assign({}, queryParams, {
        page: 1,
        page_size: 10
      });
    }

    _appendQuery(url: string, ...theRestOfArgs: any[]) {
      if (url === undefined) {
        return;
      }

      return url + '?' + buildQuery(theRestOfArgs);
    }

    _cloneNode(node: any) {
      const newNode = node.cloneNode(true);

      for (const prop in node.properties) {
        if (Object.prototype.hasOwnProperty.call(node, prop)) {
          try {
            newNode[prop] = node[prop];
            // eslint-disable-next-line no-empty
          } catch (err) {}
        }
      }

      return newNode;
    }

    _identity(arg: any) {
      return arg;
    }

    _truncate(str: string, len: number) {
      return str.slice(0, len) + (str.length > len ? '…' : '');
    }

    _cancelDebouncers(debouncers: Debouncer[]) {
      debouncers.forEach((debouncer) => {
        if (debouncer && debouncer.isActive && debouncer.isActive()) {
          debouncer.cancel();
        }
      }, this);
    }

    _prop(obj: GenericObject, key: string) {
      return obj[key];
    }

    _omit(src: any, keys: string[]) {
      return Object.keys(src)
        .filter((key) => {
          return keys.indexOf(key) === -1;
        })
        .reduce((acc: any, key) => {
          acc[key] = src[key];

          return acc;
        }, {});
    }

    _normalizeDate(date: any) {
      // date can be in 2 formats: specific 'DD-MMM-YYYY' or the more general 'YYYY-MM-DD'
      // trying to convert using specific format first

      const formattedDate = dayjs(date, Settings.dateFormat, true);
      if (formattedDate.isValid()) {
        return formattedDate.startOf('day').toDate();
      }

      return dayjs(date, Settings.datepickerFormat).startOf('day').toDate();
    }
  }
  return UtilsClass;
}

export default UtilsMixin;
