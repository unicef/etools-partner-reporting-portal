import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import {tableStyles} from '../etools-prp-common/styles/table-styles';
import DataTableMixin from '../etools-prp-common/mixins/data-table-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import './list-view-single-indicator';
import '../etools-prp-common/elements/list-placeholder';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/etools-prp-permissions';
import {store} from '../redux/store';
import {RootState} from '../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {repeat} from 'lit/directives/repeat.js';
import {classMap} from 'lit/directives/class-map.js';
@customElement('list-view-indicators')
export class ListViewIndicators extends UtilsMixin(DataTableMixin(PaginationMixin(connect(store)(LitElement)))) {
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
      <style>
        ${layoutStyles} ${dataTableStylesLit} :host {
          display: block;
        }
        etools-content-panel::part(ecp-content) {
          padding: 1px 0 0;
        }
        message-box {
          margin: 25px 25px 0;
        }
      </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      <etools-content-panel panel-title="${translate('LIST_OF_INDICATORS')}">
        <etools-data-table-header
          .label="${this.paginator.visible_range?.[0]}-${this.paginator.visible_range?.[1]} of ${this.paginator
            .count} ${translate('RESULTS_TO_SHOW')}"
        >
          <etools-data-table-column
            field="indicator"
            class=${classMap({'col-3': this.showProjectContextColumn, 'col-4': !this.showProjectContextColumn})}
          >
            <div class="table-column">${translate('INDICATOR')}</div>
          </etools-data-table-column>

          ${this.showProjectContextColumn
            ? html`
                <etools-data-table-column field="content_object_title" class="col-1">
                  <div class="table-column">${translate('PROJECT_CONTEXT')}</div>
                </etools-data-table-column>
              `
            : ''}

          <etools-data-table-column field="blueprint.calculation_formula_across_locations" class="col-1">
            <div class="table-column">${translate('CALC_ACROSS_LOCATIONS')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="blueprint.calculation_formula_across_periods" class="col-1">
            <div class="table-column">${translate('CALC_ACROSS_PERIODS')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="baseline" class="col-1">
            <div class="table-column">${translate('BASELINE')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="target" class="col-1">
            <div class="table-column">${translate('TARGET')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="achieved" class="col-1">
            <div class="table-column">${translate('ACHIEVED')}</div>
          </etools-data-table-column>

          <etools-data-table-column field="progress_percentage" sortable class="col-2">
            <div class="table-column">${translate('CURRENT_PROGRESS')}</div>
          </etools-data-table-column>

          <etools-data-table-column class="col-1"></etools-data-table-column>
        </etools-data-table-header>

        ${repeat(
          this.data || [],
          (indicator) => indicator.id,
          (indicator) => html`<list-view-single-indicator
            .indicator="${indicator}"
            .isCustom="${this.isCustom}"
            .canEdit="${this.canEdit}"
            .type="${this.type}"
          ></list-view-single-indicator> `
        )}

        <list-placeholder .data="${this.data}"></list-placeholder>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </etools-content-panel>
    `;
  }

  paginatorChanged() {
    this._paginatorChanged();
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails.subSubRouteName !== 'indicators') {
      return;
    }

    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (state.indicators.all !== undefined && !isJsonStrMatch(this.data, state.indicators.all)) {
      this.data = state.indicators.all;
    }

    if (state.indicators?.count !== undefined && this.paginator?.count !== state.indicators.count) {
      this.paginator = {...this.paginator, count: state.indicators.count};
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
  }
}
