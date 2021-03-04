import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DisaggregationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DisaggregationClass extends baseClass {
    // Used to display rows for two and three disaggregations.
    // It will NOT work for one and zero disaggregations.
    _determineRows(self: any, rows: GenericObject[], columns: GenericObject[]) {
      const rowsForDisplay: GenericObject[] = [];

      rows.forEach(function (x) {
        let formatted = '';

        const rowData = columns.map(function (z: GenericObject) {
          formatted = self._formatDisaggregationIds([x.id, z.id]);

          return {
            key: formatted,
            data: self.data.disaggregation[formatted]
          };
        });

        formatted = self._formatDisaggregationIds([x.id]);

        rowsForDisplay.push({
          title: x.value,
          data: rowData,
          id: x.id,
          total: {
            key: formatted,
            data: self.data.disaggregation[formatted]
          }
        });
      });

      return rowsForDisplay;
    }

    // Accepts a list of disaggregation IDs, sorts them, and
    // structures them in "()" format for lookup.
    _formatDisaggregationIds(unsortedIds: any[]) {
      // IDs must be in ascending order.
      const ids = unsortedIds.sort(function (a, b) {
        return a - b;
      });
      let sortedString = '';

      if (ids.length === 1) {
        sortedString = ids[0] + ',';
      } else {
        sortedString = ids.join(', ');
      }

      return '(' + sortedString + ')';
    }
  }
  return DisaggregationClass;
}

export default DisaggregationMixin;
