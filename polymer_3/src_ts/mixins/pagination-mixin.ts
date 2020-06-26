import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';
import {property} from '@polymer/decorators';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';

/**
 * @polymer
 * @mixinFunction
 */
function PaginationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class PaginationClass extends baseClass {
    @property({type: Object})
    queryParams!: GenericObject;

    @property({type: Number, computed: '_computePageSize(queryParams)'})
    pageSize!: number;

    @property({type: Number, computed: '_computePageNumber(queryParams)'})
    pageNumber!: number;

    _tableContentDebouncer!: Debouncer | null;

    static get observers() {
      return ['_updateQueryParams(pageSize, pageNumber)'];
    }

    _computePageSize(queryParams: GenericObject) {
      return Number(queryParams.page_size || 10);
    }

    _computePageNumber(queryParams: GenericObject) {
      return Number(queryParams.page || 1);
    }

    _updateQueryParams(pageSize: number, pageNumber: number) {
      const newParams = Object.assign({}, this.queryParams, {
        page_size: pageSize,
        page: pageNumber
      });
      setTimeout(() => {
        this.set('queryParams', newParams);
      });
    }

    _detailsChange(event: CustomEvent) {
      // @ts-ignore
      if (!this.openedDetails) {
        return;
      }
      const element = event.detail.row;
      if (event.detail.detailsOpened) {
        this.push('openedDetails', element);
      } else {
        // @ts-ignore
        const index = this.openedDetails.indexOf(element);
        if (index !== -1) {
          this.splice('openedDetails', index, 1);
        }
      }
    }

    _tableContentChanged() {
      // (dci) to be removed, this logic moved to _pageNumberChanged
      // this._tableContentDebouncer = Debouncer.debounce(this._tableContentDebouncer,
      //   timeOut.after(100),
      //   () => {
      //     const tempList = this.openedDetails.slice();
      //     tempList.forEach((detail: any) => detail.detailsOpened = false);
      //   });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._tableContentDebouncer && this._tableContentDebouncer.isActive()) {
        this._tableContentDebouncer.cancel();
      }
    }
  }
  return PaginationClass;
}

export default PaginationMixin;
