import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import '../settings';

declare const moment: any;


/**
 * @polymer
 * @mixinFunction
 */
function UtilsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {

  const pdListStatuses = {
    Signed: 'signed',
    Active: 'active',
    Suspended: 'suspended',
    Ended: 'ended',
    Closed: 'closed',
    Terminated: 'terminated',
    All: 'all',
  };

  class UtilsClass extends baseClass {



    public _equals (a: any, b: any) {
      return a === b;
    }

    public _forEach (selector: any, fn: any) {
      [].forEach.call(
        let elem = this.shadowRoot.querySelector(selector);
        this.elem.fn;
      );
    }

    public _toLowerCaseLocalized (text: string, localize: any) {
      return localize(text).toLowerCase();
    }

    public _localizeLowerCased (text: string, localize: any) {
      return localize(text.split(' ').join('_').toLowerCase());
    }

    public _singularLocalized (text: string, localize: any) {
      return localize(text).substring(0, text.length - 1);
    }

    public _withDefault (value: any, defaultValue: any, localize: any) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = '...';
      }

      if (pdListStatuses[value] !== undefined) {
        return localize(pdListStatuses[value]);
      }

      return value == null /* undefinded & null */ ? // jshint ignore:line
        defaultValue : value;
    }

    public _withDefaultFrom(obj: GenericObject, key: string, defaultValue: any) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = '...';
      }

      return obj[key] || defaultValue;
    }

    public _debug(val: any) {
      return JSON.stringify(val, null, 2);
    }

    public _log(val: any) {
      console.log('_log', val);
    }

    public _toNumber(val: string) {
      return Number(val);
    }

    public _capitalizeFirstLetter(text: string, localize: any) {
      if (localize !== undefined) {
        return localize(text);
      }

      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
    }

    public _notFound() {
      window.location.href = '/not-found';
    }

    public _clone(val: any) {
      let typeStr = Object.prototype.toString.call(val);

      switch (typeStr) {
        case '[object Array]':
          return val.map(_clone);

        case '[object Object]':
          return Object.keys(val).reduce(function (prev, curr) {
            prev[curr] = _clone(val[curr]);

            return prev;
          }, {});

        default:
          return val;
      }
    }

    public _deferred() {
      let defer = {};

      defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });

      return defer;
    }

    public _toPercentage(value: any) {
      return value == null /* undefinded & null */ ? // jshint ignore:line
        value : Math.floor(value * 100) + '%';
    }

    public _formatIndicatorValue(indicatorType: any, value: any, percentize: any) {
      if (value == null /* undefinded & null */) { // jshint ignore:line
        return value;
      }

      let _value = value.toFixed(2);

      switch (indicatorType) {
        case 'percentage':
          if(!percentize){
            return this._toPercentage(value);
          }
          return percentize === 1 ? Math.floor(_value) + '%' : _value + '%';
        case 'ratio':
          return _value + ':1';
        default:
          return _value;
      }
    }

    public _displayClusterHeader(subpage: any, needsHeaderList: any) {
      if (needsHeaderList.indexOf(subpage) >= 0) {
        return true;
      }
      return false;
    }

    public _commaSeparated(items: any) {
      if (!items) {
        return '';
      }
      return items.join(', ');
    }

    public _commaSeparatedDictValues(items: any, key: string) {
      let newList = (items || []).map(function(item) {
        return item[key];
      });

      return this._commaSeparated(newList);
    }

    public _commaSeparatedValues(list: any) {
      return (list || []).join(', ');
    }

    public _formatAddress(street: string, city: string, zip: string) {
      if (!(street || city || zip)) {
        return undefined;
      } else if (!street) {
        return city + ' ' + zip;
      } else {
        return street + ',' + city + ' ' + zip;
      }
    }

    public _fieldsAreValid() {
      let valid;
      let fields = [].slice.call(
        this.shadowRoot.querySelector('.validate')
      );

      fields.forEach(function (field) {
        field.validate();
      });

      valid = fields.every(function (field) {
        return !field.invalid;
      });

      return valid;
    }

    public _dateRangeValid(start: any, end: any) {
      let startField = this.shadowRoot.querySelector(start);
      let endField = this.shadowRoot.querySelector(end);
      let startValue = startField.value;
      let endValue = endField.value;

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

    public _withDefaultParams(queryParams: any) {
      return Object.assign({}, queryParams, {
        page: 1,
        page_size: 10,
      });
    }

    public _appendQuery(url: string) {
      return url + '?' + buildQuery([].slice.call(arguments, 1));
    }

    public _cloneNode(node: any) {
      let newNode = node.cloneNode(true);

      for (let prop in node.properties) {
        try {
          newNode[prop] = node[prop];
        } catch (err) {}
      }

      return newNode;
    }

    public _identity(arg: any) {
      return arg;
    }

    public _truncate(str: string, len: number) {
      return str.slice(0, len) + (str.length > len ? '…' : '');
    }

    public _cancelDebouncers(debouncers: Debouncer[]) {
      debouncers.forEach(debouncer => {
        if (debouncer.isActive()) {
          debouncer.cancel();
        }
      }, this);
    }

    public _prop(obj: GenericObject, key: string) {
      return obj[key];
    }

    public _omit(src: any, keys: string[]) {
      return Object.keys(src)
        .filter(function (key) {
          return keys.indexOf(key) === -1;
        })
        .reduce(function (acc, key) {
          acc[key] = src[key];

          return acc;
        }, {});
    }

    public _normalizeDate (date: any) {
      return moment(date, App.Settings.dateFormat).startOf('day').toDate();
    }

  }

}

export default UtilsMixin;



