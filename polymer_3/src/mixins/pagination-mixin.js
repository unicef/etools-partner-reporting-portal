var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
/**
 * @polymer
 * @mixinFunction
 */
function PaginationMixin(baseClass) {
    class PaginationClass extends baseClass {
        static get observers() {
            return [
                '_updateQueryParams(pageSize, pageNumber)'
            ];
        }
        _computePageSize(queryParams) {
            return Number(queryParams.page_size || 10);
        }
        _computePageNumber(queryParams) {
            return Number(queryParams.page || 1);
        }
        _updateQueryParams(pageSize, pageNumber) {
            const newParams = Object.assign({}, this.queryParams, {
                page_size: pageSize,
                page: pageNumber
            });
            setTimeout(() => {
                this.set('queryParams', newParams);
            });
        }
        _detailsChange(event) {
            // @ts-ignore
            if (!this.openedDetails) {
                return;
            }
            const element = event.detail.row;
            if (event.detail.detailsOpened) {
                this.push('openedDetails', element);
            }
            else {
                // @ts-ignore
                const index = this.openedDetails.indexOf(element);
                if (index !== -1) {
                    this.splice('openedDetails', index, 1);
                }
            }
        }
        _tableContentChanged() {
            //(dci) to be removed, this logic moved to _pageNumberChanged
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
    __decorate([
        property({ type: Object })
    ], PaginationClass.prototype, "queryParams", void 0);
    __decorate([
        property({ type: Number, computed: '_computePageSize(queryParams)' })
    ], PaginationClass.prototype, "pageSize", void 0);
    __decorate([
        property({ type: Number, computed: '_computePageNumber(queryParams)' })
    ], PaginationClass.prototype, "pageNumber", void 0);
    return PaginationClass;
}
export default PaginationMixin;
