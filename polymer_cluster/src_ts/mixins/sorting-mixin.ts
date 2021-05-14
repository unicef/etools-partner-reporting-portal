import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @mixinFunction
 */
function SortingMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class SortingClass extends baseClass {
    _sortOrderDebouncer!: Debouncer | null;

    _sortOrderChanged(e: CustomEvent) {
      const data = e.detail;
      this._sortOrderDebouncer = Debouncer.debounce(this._sortOrderDebouncer, timeOut.after(100), () => {
        const newParams = Object.assign({}, (this as any).queryParams, {
          sort: data.field + '.' + data.direction
        });

        e.stopPropagation();
        this.set('queryParams', newParams);
      });
    }

    connectedCallback() {
      super.connectedCallback();

      this._sortOrderChanged = this._sortOrderChanged.bind(this);
      this.addEventListener('sort-changed', this._sortOrderChanged as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener('sort-changed', this._sortOrderChanged as any);
      if (this._sortOrderDebouncer && this._sortOrderDebouncer.isActive()) {
        this._sortOrderDebouncer.cancel();
      }
    }
  }
  return SortingClass;
}

export default SortingMixin;
