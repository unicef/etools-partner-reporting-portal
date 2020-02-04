import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DisaggregationFieldMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DisaggregationFieldClass extends baseClass {

    _toNumericValues(obj: GenericObject) {
      return Object.keys(obj).reduce(function(prev, curr) {
        prev[curr] = Number(obj[curr]);

        return prev;
      }, {});
    }
  }

  return DisaggregationFieldClass;
}

export default DisaggregationFieldMixin;
