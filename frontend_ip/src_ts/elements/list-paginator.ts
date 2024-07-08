import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('list-paginator')
export class ListPaginator extends PaginationMixin(LitElement) {
  @property({type: Array})
  data: any[] = [];

  @property({type: Array})
  paginated!: any[];

  render() {
    return html`
      <iron-location query="${this.query}"> </iron-location>
      <iron-query-params
        .paramsString="${this.query}"
        .paramsObject="${this.queryParams}"
        @params-string-changed=${(e) => (this.query = e.detail.value)}
        @params-object-changed=${(e) => (this.queryParams = e.detail.value)}
      >
      </iron-query-params>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('data') || changedProperties.has('pageSize') || changedProperties.has('pageNumber')) {
      this.paginated = this._computePaginated(this.data, this.pageSize, this.pageNumber);
      fireEvent(this, 'paginated-changed', {paginated: this.paginated});
    }
  }

  private _computePaginated(data: any[], pageSize: number, pageNumber: number): any[] {
    const start = (pageNumber - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }
}
