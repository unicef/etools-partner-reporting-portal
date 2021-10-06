var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin PaginationMixin
 */
class ListPaginator extends PaginationMixin(PolymerElement) {
    static get template() {
        return html `
      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>
    `;
    }
    _computePaginated(data, pageSize, pageNumber) {
        const start = (pageNumber - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }
}
__decorate([
    property({ type: Array })
], ListPaginator.prototype, "data", void 0);
__decorate([
    property({ type: Array, notify: true, computed: '_computePaginated(data, pageSize, pageNumber)' })
], ListPaginator.prototype, "paginated", void 0);
window.customElements.define('list-paginator', ListPaginator);
export { ListPaginator as ListPaginatorEl };
