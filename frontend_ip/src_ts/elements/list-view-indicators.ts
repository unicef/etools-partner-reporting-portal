import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import {tableStyles} from '../etools-prp-common/styles/table-styles';
import DataTableMixin from '../etools-prp-common/mixins/data-table-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import './list-view-single-indicator';
import '../etools-prp-common/elements/list-placeholder';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/etools-prp-permissions';
import {store} from '../redux/store';
import {RootState} from '../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('list-view-indicators')
export class ListViewIndicators extends UtilsMixin(
  DataTableMixin(PaginationMixin(LocalizeMixin(connect(store)(LitElement))))
) {
  static styles = css`
    ${layoutStyles},
    :host {
      display: block;
    }
    etools-content-panel::part(ecp-content) {
      padding: 1px 0 0;
    }
    message-box {
      margin: 25px 25px 0;
    }
  `;

  @property({type: Array})
  data: any[] = [];

  @property({type: Boolean})
  loading!: boolean;

  @property({type: Boolean})
  isCustom!: boolean;

  @property({type: Boolean})
  canEdit!: boolean;

  @property({type: Object})
  queryParams!: any;

  @property({type: String})
  query!: string;

  @property({type: Object})
  permissions!: any;

  @property({type: String})
  type!: string;

  @property({type: String})
  appName?: string;

  @property({type: Boolean})
  showProjectContextColumn!: boolean;

  render() {
    return html`
      ${tableStyles}
      <style> ${dataTableStylesLit} </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      <etools-content-panel panel-title="${this.localize('list_of_indicators')}">
        <etools-data-table-header
          id="listHeader"
          label="${this.paginator.visible_range?.[0]}-${this.paginator.visible_range?.[1]} of ${this.paginator.count} ${this.localize(
            'results_to_show'
          )}"
        >
          <etools-data-table-column field="indicator" class="col-2">
            <div class="table-column">${this.localize('indicator')}</div>
          </etools-data-table-column>

          ${this.showProjectContextColumn
            ? html`
                <etools-data-table-column field="content_object_title" class="col-1">
                  <div class="table-column">${this.localize('project_context')}</div>
                </etools-data-table-column>
              `
            : ''}

          <etools-data-table-column field="blueprint.calculation_formula_across_locations" class="col-2">
            <div class="table-column">${this.localize('calc_across_locations')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="blueprint.calculation_formula_across_periods" class="col-2">
            <div class="table-column">${this.localize('calc_across_periods')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="baseline" class="col-1">
            <div class="table-column">${this.localize('baseline')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="target" class="col-1">
            <div class="table-column">${this.localize('target')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="achieved" class="col-1">
            <div class="table-column">${this.localize('achieved')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="progress_percentage" sortable class="col-2">
            <div class="table-column">${this.localize('current_progress')}</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${(e) => (this.visibleRange = e.detail.value)}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>

        ${this.data?.map(
          (indicator) => html`
            <list-view-single-indicator
              .indicator="${indicator}"
              .isCustom="${this.isCustom}"
              .canEdit="${this.canEdit}"
              .type="${this.type}"
            ></list-view-single-indicator>
          `
        )}

        <list-placeholder .data="${this.data}"></list-placeholder>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${(e) => (this.visibleRange = e.detail.value)}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>
      </etools-content-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    this.openedDetails.length = 0;
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  
    if (this.appName !== state.app.current) {
      this.appName = state.app.current;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('type')) {
      this.showProjectContextColumn = this.type === 'pa';
    }

    if (changedProperties.has('data') && this.data?.length) {
      this.paginator = {...this.paginator, count: this.data.length};
      this.requestUpdate();
    }
  }

  private _addEventListeners() {
    this.addEventListener('details-opened-changed', this._detailsChange as EventListener);
  }

  private _removeEventListeners() {
    this.removeEventListener('details-opened-changed', this._detailsChange as EventListener);
  }
}
