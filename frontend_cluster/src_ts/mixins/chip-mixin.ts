import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../etools-prp-common/typings/globals.types';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function ChipMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ChipClass extends baseClass {
    @property({type: Boolean, observer: '_setDefaults'})
    _adding = false;

    _open(e: CustomEvent) {
      e.preventDefault();

      this.set('_adding', true);
    }

    _close() {
      this.set('_adding', false);
    }
  }
  return ChipClass;
}

export default ChipMixin;
