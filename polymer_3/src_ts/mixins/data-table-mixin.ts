import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DataTableMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DataTableClass extends baseClass {

    _pageSizeChanged(e: CustomEvent) {
      const change: GenericObject = {
        page_size: e.detail.value
      };

      if (this._pageNumberInitialized) {
        change.page = 1;
      }

      this.set('queryParams', Object.assign({}, this.queryParams, change));
    }

    _pageNumberChanged(e: CustomEvent) {
      this.set('queryParams', Object.assign({}, this.queryParams, {
        page: e.detail.value
      }));

      setTimeout(() => {
        this.set('_pageNumberInitialized', true);
      });
    }

  }
  return DataTableClass;
}

export default DataTableMixin;
