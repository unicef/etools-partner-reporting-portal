import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DataTableMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DataTableClass extends baseClass {

    _pageSizeChanged(e: CustomEvent) {
      let change: GenericObject = {
        page_size: e.detail.value,
      };

      if (this._pageNumberInitialized) {
        change.page = 1;
      }

      this.set('queryParams', Object.assign({}, this.queryParams, change));
    }

    _colapseExpandedDetails() {
      setTimeout(() => {
        const openedDetails = (this.openedDetails as any[]) || [];
        if (openedDetails.length > 0) {
          const tempList = openedDetails.slice();
          tempList.forEach((detail: any) => detail.detailsOpened = false);
        }
      }, 100);
    }

    _pageNumberChanged(e: CustomEvent) {
      this._colapseExpandedDetails();

      this.set('queryParams', Object.assign({}, this.queryParams, {
        page: e.detail.value,
      }));

      setTimeout(() => {
        this.set('_pageNumberInitialized', true);
      });
    }

  }
  return DataTableClass;
}

export default DataTableMixin;
