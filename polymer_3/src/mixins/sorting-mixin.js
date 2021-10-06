import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
* @polymer
* @mixinFunction
*/
function SortingMixin(baseClass) {
    class SortingClass extends baseClass {
        _sortOrderChanged(e) {
            const data = e.detail;
            const self = this;
            this._sortOrderDebouncer = Debouncer.debounce(this._sortOrderDebouncer, timeOut.after(100), () => {
                const newParams = Object.assign({}, self.queryParams, {
                    sort: data.field + '.' + data.direction
                });
                e.stopPropagation();
                self.set('queryParams', newParams);
            });
        }
        connectedCallback() {
            super.connectedCallback();
            this._sortOrderChanged = this._sortOrderChanged.bind(this);
            this.addEventListener('sort-changed', this._sortOrderChanged);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.removeEventListener('sort-changed', this._sortOrderChanged);
            if (this._sortOrderDebouncer && this._sortOrderDebouncer.isActive()) {
                this._sortOrderDebouncer.cancel();
            }
        }
    }
    return SortingClass;
}
export default SortingMixin;
