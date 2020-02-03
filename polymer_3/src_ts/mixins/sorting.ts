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
      this._sortOrderDebouncer = Debouncer.debounce(this._sortOrderDebouncer,
        timeOut.after(100),
        () => {
          var newParams = Object.assign({}, this.queryParams, {
            sort: data.field + '.' + data.direction,
          });

          e.stopPropagation();
          this.set('queryParams', newParams);
        });
    }

    attached() {
      this._sortOrderChanged = this._sortOrderChanged.bind(this);
      this.addEventListener('sort-changed', this._sortOrderChanged as any);
    }

    detached() {
      this.removeEventListener('sort-changed', this._sortOrderChanged as any);
    }

  }
  return SortingClass;
}

export default SortingMixin;


