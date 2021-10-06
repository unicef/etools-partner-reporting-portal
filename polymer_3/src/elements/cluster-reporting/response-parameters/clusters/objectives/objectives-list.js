var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DataTableMixin from '../../../../../mixins/data-table-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import PaginationMixin from '../../../../../mixins/pagination-mixin';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '../../../../etools-prp-ajax';
import '../../../../page-body';
import { sharedStyles } from '../../../../../styles/shared-styles';
import { tableStyles } from '../../../../../styles/table-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin PaginationMixin
 */
class ClustersObjectivesList extends LocalizeMixin(DataTableMixin(RoutingMixin(PaginationMixin(UtilsMixin(ReduxConnectedElement))))) {
    static get template() {
        // language=HTML
        return html `
    ${sharedStyles} ${tableStyles}
      <style include="data-table-styles iron-flex">
      :host {
        display: block;
      }

      div#action {
        margin-bottom: 25px;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }

      .wrapper {
        position: relative;
      }

      etools-data-table-column {
        display: flex;
      }
    </style>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <iron-query-params
        params-string="{{anchorQuery}}"
        params-object="{{anchorQueryParams}}">
    </iron-query-params>

    <div class="wrapper">
      <etools-data-table-header
          no-collapse
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
        <etools-data-table-column field="title" flex-3 sortable>
          <span class="table-column">[[localize('cluster_objective_title')]]</span>
        </etools-data-table-column>
        <etools-data-table-column field="cluster" sortable>
          <span class="table-column">[[localize('cluster')]]</span>
        </etools-data-table-column>
      </etools-data-table-header>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <template
          id="list"
          is="dom-repeat"
          items="[[objectives]]"
          as="objective"
          initial-count="[[pageSize]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell table-cell--text" flex-3>
              <a href="[[_detailUrl(objective.id, anchorQuery)]]">[[objective.title]]</a>
            </div>
            <div class="table-cell table-cell--text">
              [[objective.cluster_title]]
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <etools-loading active="[[loading]]"></etools-loading>
    </div>
    `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _detailUrl(id, query) {
        const path = '/response-parameters/clusters/objective/' + id;
        return this.buildUrl(this._baseUrlCluster, path) + '?' + query;
    }
}
__decorate([
    property({ type: Object })
], ClustersObjectivesList.prototype, "queryParams", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterObjectives.loading)' })
], ClustersObjectivesList.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.clusterObjectives.all)' })
], ClustersObjectivesList.prototype, "objectives", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterObjectives.count)' })
], ClustersObjectivesList.prototype, "totalResults", void 0);
__decorate([
    property({ type: Object, computed: '_withDefaultParams(queryParams)' })
], ClustersObjectivesList.prototype, "anchorQueryParams", void 0);
window.customElements.define('clusters-objectives-list', ClustersObjectivesList);
export { ClustersObjectivesList as ClustersObjectivesListEl };
