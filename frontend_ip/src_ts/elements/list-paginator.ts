import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../typings/redux.types';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('list-paginator')
export class ListPaginator extends PaginationMixin(connect(store)(LitElement)) {
  @property({type: Array})
  data: any[] = [];

  @property({type: Array})
  paginated!: any[];

  render() {
    return html``;
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
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
