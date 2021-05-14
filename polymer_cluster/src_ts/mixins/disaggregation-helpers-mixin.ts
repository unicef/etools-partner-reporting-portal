import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DisaggregationHelpersMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DisaggregationHelpersClass extends baseClass {
    private matchers = {
      '(?,?)': function () {
        return /^\((\d*),\s?(\d*)\)$/;
      },

      '(?,?,?)': function () {
        return /^\((\d*),\s?(\d*),\s?(\d*)\)$/;
      },

      '(?,Y)': function (y: string) {
        return new RegExp('^\\((\\d+),\\s?(' + y + ')\\)$');
      },

      '(X,?)': function (x: string) {
        return new RegExp('^\\((' + x + '),\\s?(\\d+)\\)$');
      },

      '(X,Y,?)': function (x: string, y: string) {
        return new RegExp('^\\((' + x + '),\\s?(' + y + '),\\s?(\\d+)\\)$');
      },

      '(X,?,Z)': function (x: string, z: string) {
        return new RegExp('^\\((' + x + '),\\s?(\\d+),\\s?(' + z + ')\\)$');
      },

      '(?,Y,Z)': function (y: string, z: string) {
        return new RegExp('^\\((\\d+),\\s?(' + y + '),\\s?(' + z + ')\\)$');
      },

      '(?,?,Z)': function (z: string) {
        return new RegExp('^\\((\\d+),\\s?(\\d+),\\s?(' + z + ')\\)$');
      }
    };

    private identity(val: any) {
      return val;
    }

    private divideBy(d: number) {
      return function (v: number) {
        return v / d;
      };
    }

    private sumDisaggValues(fields: any[], transform?: (x: number) => number) {
      if (typeof transform === 'undefined') {
        transform = this.identity;
      }

      const result = fields
        .filter(function (field) {
          return ['v', 'd'].every(function (key) {
            return !isNaN(field[key]);
          });
        })
        .reduce(function (acc, curr) {
          ['v', 'd'].forEach(function (key) {
            acc[key] = (acc[key] || 0) + transform!(curr[key]);
          });

          return acc;
        }, {});

      const c = result.d > 0 ? result.v / result.d : 0;
      result.c = isNaN(c) ? 0 : c;

      return result;
    }

    private getCoords(key: string) {
      const match = [this.matchers['(?,?)'](), this.matchers['(?,?,?)']()]
        .map(function (re) {
          return re.exec(key);
        })
        .filter(Boolean)[0];
      if (match) {
        return match.slice(1, 4);
      }
      return [];
    }

    private extractFields(data: GenericObject, re: RegExp) {
      return Object.keys(data)
        .filter(function (k) {
          return re.exec(k);
        })
        .map(function (k) {
          return data[k];
        });
    }

    private formatKey(...args: any[]) {
      const chunks = [].slice.call(args);
      const formatted = '(' + chunks.join(', ') + ')';

      // Normalizes whitespace inconsistencies across keys
      return formatted.replace(/(,)(\s)(\))$/, '$1$3');
    }

    _calculateLevel1(key: string, data: GenericObject) {
      const coords = this.getCoords(key);

      const y = coords[1];

      const yRe = this.matchers['(?,Y)'](y);

      const totals: GenericObject = {};

      // @ts-ignore
      const yKey = this.formatKey(y);

      const yFields = this.extractFields(data, yRe);

      totals[yKey] = this.sumDisaggValues(yFields);

      return totals;
    }

    _calculateLevel2(key: string, data: GenericObject) {
      const coords = this.getCoords(key);

      const x = coords[0];
      const y = coords[1];

      const xRe = this.matchers['(X,?)'](x);
      const yRe = this.matchers['(?,Y)'](y);
      const tRe = this.matchers['(?,Y)']('');

      const tmpTotals1: GenericObject = {};
      const tmpTotals2: GenericObject = {};

      // @ts-ignore
      const xKey = this.formatKey(x, '');
      // @ts-ignore
      const yKey = this.formatKey(y, '');

      const xFields = this.extractFields(data, xRe);
      const yFields = this.extractFields(data, yRe);

      tmpTotals1[xKey] = this.sumDisaggValues(xFields);
      tmpTotals1[yKey] = this.sumDisaggValues(yFields);

      data = Object.assign({}, data, tmpTotals1);

      // @ts-ignore
      const tKey = this.formatKey('');

      const tFields = this.extractFields(data, tRe);

      tmpTotals2[tKey] = this.sumDisaggValues(tFields, this.divideBy(2));

      return Object.assign({}, tmpTotals1, tmpTotals2);
    }

    _calculateLevel3(key: string, data: GenericObject) {
      const coords = this.getCoords(key);

      const x = coords[0];
      const y = coords[1];
      const z = coords[2];

      const xyRe = this.matchers['(X,Y,?)'](x, y);
      const xzRe = this.matchers['(X,?,Z)'](x, z);
      const yzRe = this.matchers['(?,Y,Z)'](y, z);
      const xRe = this.matchers['(X,?)'](x);
      const yRe = this.matchers['(X,?)'](y);
      const zRe = this.matchers['(?,?,Z)'](z);
      const tRe = this.matchers['(?,Y)']('');

      const tmpTotals1: GenericObject = {};
      const tmpTotals2: GenericObject = {};
      const tmpTotals3: GenericObject = {};

      // @ts-ignore
      const xyKey = this.formatKey(x, y);
      // @ts-ignore
      const xzKey = this.formatKey(x, z);
      // @ts-ignore
      const yzKey = this.formatKey(y, z);

      const xyFields = this.extractFields(data, xyRe);
      const xzFields = this.extractFields(data, xzRe);
      const yzFields = this.extractFields(data, yzRe);

      tmpTotals1[xyKey] = this.sumDisaggValues(xyFields);
      tmpTotals1[xzKey] = this.sumDisaggValues(xzFields);
      tmpTotals1[yzKey] = this.sumDisaggValues(yzFields);

      data = Object.assign({}, data, tmpTotals1);

      // @ts-ignore
      const xKey = this.formatKey(x, '');
      // @ts-ignore
      const yKey = this.formatKey(y, '');
      // @ts-ignore
      const zKey = this.formatKey(z, '');

      const xFields = this.extractFields(data, xRe);
      const yFields = this.extractFields(data, yRe);
      const zFields = this.extractFields(data, zRe);

      tmpTotals2[xKey] = this.sumDisaggValues(xFields, this.divideBy(2));
      tmpTotals2[yKey] = this.sumDisaggValues(yFields);
      tmpTotals2[zKey] = this.sumDisaggValues(zFields);

      data = Object.assign({}, data, tmpTotals2);

      // @ts-ignore
      const tKey = this.formatKey('');

      const tFields = this.extractFields(data, tRe);

      tmpTotals3[tKey] = this.sumDisaggValues(tFields, this.divideBy(3));

      return Object.assign({}, tmpTotals1, tmpTotals2, tmpTotals3);
    }
  }
  return DisaggregationHelpersClass;
}

export default DisaggregationHelpersMixin;
