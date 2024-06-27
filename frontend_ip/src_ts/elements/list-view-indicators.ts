import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import {tableStyles} from '../etools-prp-common/styles/table-styles';
import DataTableMixin from '../etools-prp-common/mixins/data-table-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
import './list-view-single-indicator';
import '../etools-prp-common/elements/list-placeholder';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/etools-prp-permissions';
import {store} from '../redux/store';
import {RootState} from '../typings/redux.types';

@customElement('list-view-indicators')
export class ListViewIndicators extends UtilsMixin(
  DataTableMixin(PaginationMixin(LocalizeMixin(connect(store)(LitElement))))
) {
  static styles = css`
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
  data!: any[];

  @property({type: Boolean})
  loading!: boolean;

  @property({type: Boolean})
  isCustom!: boolean;

  @property({type: Boolean})
  canEdit!: boolean;

  @property({type: Number})
  totalResults!: number;

  @property({type: Object})
  queryParams!: any;

  @property({type: String})
  query!: string;

  @property({type: Number})
  pageSize!: number;

  @property({type: Number})
  pageNumber!: number;

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

      <iron-location query="${this.query}"></iron-location>
      <iron-query-params params-string="${this.query}" params-object="${this.queryParams}"></iron-query-params>

      <etools-prp-permissions permissions="${JSON.stringify(this.permissions)}"></etools-prp-permissions>

      <etools-content-panel panel-title="${this.localize('list_of_indicators')}">
        <etools-data-table-header
          id="listHeader"
          label="${this.visibleRange?.[0]}-${this.visibleRange?.[1]} of ${this.totalResults} ${this.localize(
            'results_to_show'
          )}"
        >
          <etools-data-table-column field="indicator">
            <div class="table-column">${this.localize('indicator')}</div>
          </etools-data-table-column>

          ${this.showProjectContextColumn
            ? html`
                <etools-data-table-column field="content_object_title">
                  <div class="table-column">${this.localize('project_context')}</div>
                </etools-data-table-column>
              `
            : ''}

          <etools-data-table-column field="blueprint.calculation_formula_across_locations">
            <div class="table-column">${this.localize('calc_across_locations')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="blueprint.calculation_formula_across_periods">
            <div class="table-column">${this.localize('calc_across_periods')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="baseline">
            <div class="table-column">${this.localize('baseline')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="target">
            <div class="table-column">${this.localize('target')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="achieved">
            <div class="table-column">${this.localize('achieved')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="progress_percentage" sortable flex-2>
            <div class="table-column">${this.localize('current_progress')}</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <etools-data-table-footer
          page-size="${this.pageSize}"
          page-number="${this.pageNumber}"
          total-results="${this.totalResults}"
          .visible-range="${this.visibleRange}"
          @page-size-changed="${this._pageSizeChanged}"
          @page-number-changed="${this._pageNumberChanged}"
        >
        </etools-data-table-footer>

        ${this.data?.map(
          (indicator) => html`
            <list-view-single-indicator
              indicator="${indicator}"
              .isCustom="${this.isCustom}"
              .canEdit="${this.canEdit}"
              .type="${this.type}"
            ></list-view-single-indicator>
          `
        )}

        <list-placeholder .data="${this.data}"></list-placeholder>

        <etools-data-table-footer
          page-size="${this.pageSize}"
          page-number="${this.pageNumber}"
          total-results="${this.totalResults}"
          .visible-range="${this.visibleRange}"
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
    if (this.appName !== state.app.current) {
      this.appName = state.app.current;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('type')) {
      this.showProjectContextColumn = this.type === 'pa';
    }
  }

  private _addEventListeners() {
    this.addEventListener('details-opened-changed', this._detailsChange as EventListener);
  }

  private _removeEventListeners() {
    this.removeEventListener('details-opened-changed', this._detailsChange as EventListener);
  }
}
