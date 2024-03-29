import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
import {GenericObject} from '../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin PaginationMixin
 */
class ListPaginator extends PaginationMixin(PolymerElement) {
  static get template() {
    return html`
      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>
    `;
  }

  @property({type: Array})
  data!: GenericObject[];

  @property({type: Array, notify: true, computed: '_computePaginated(data, pageSize, pageNumber)'})
  paginated!: string;

  _computePaginated(data: GenericObject[], pageSize: number, pageNumber: number) {
    const start = (pageNumber - 1) * pageSize;

    return data.slice(start, start + pageSize);
  }
}
window.customElements.define('list-paginator', ListPaginator);

export {ListPaginator as ListPaginatorEl};
