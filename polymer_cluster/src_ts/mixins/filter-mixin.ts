import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 */
function FilterMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class FilterClass extends baseClass {
    @property({type: String})
    label!: string;

    @property({type: String})
    name!: string;

    @property({type: String, computed: '_computeLastValue(value)'})
    lastValue!: string;

    static _debounceDelay = 400;

    _computeLastValue(value: any) {
      return value;
    }

    _filterReady() {
      setTimeout(() => {
        fireEvent(this, 'filter-ready', this.name);
      });
    }

    connectedCallback() {
      super.connectedCallback();

      fireEvent(this, 'register-filter', this.name);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      fireEvent(this, 'deregister-filter', this.name);
    }
  }

  return FilterClass;
}

export default FilterMixin;
