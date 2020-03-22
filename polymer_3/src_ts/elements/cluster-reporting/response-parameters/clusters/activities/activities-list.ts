import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DataTableMixin from '../../../../../mixins/data-table-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import PaginationMixin from '../../../../../mixins/pagination-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '../../../../etools-prp-ajax';
import {sharedStyles} from '../../../../../styles/shared-styles';
import {tableStyles} from '../../../../../styles/table-styles';
import {GenericObject} from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin PaginationMixin
 */
class ClustersActivityList extends LocalizeMixin
                                  (DataTableMixin
                                  (RoutingMixin
                                  (PaginationMixin(UtilsMixin(ReduxConnectedElement))))) {
  public static get template() {
    // language=HTML
    return html`
    ${sharedStyles} ${tableStyles}
    <style include="data-table-styles  iron-flex">
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
      <template is="dom-if" if="[[!isMinimalList]]" restamp="true">
        <etools-data-table-column field="title" flex-3 sortable>
          <div class="table-column">[[localize('cluster_activity_title')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="cluster">
          <div class="table-column">[[localize('cluster')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="cluster_objective" sortable>
           <div class="table-column">[[localize('cluster_objective_title')]]</div>
        </etools-data-table-column>
      </template>
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
        items="[[activities]]"
        as="activity"
        initial-count="[[pageSize]]">
      <etools-data-table-row no-collapse>
        <div slot="row-data">
          <div class="table-cell table-cell--text" flex-3>
            <a href="[[_detailUrl(activity.id, anchorQuery)]]">[[activity.title]]</a>
          </div>
          <template is="dom-if" if="[[!isMinimalList]]" restamp="true">
            <div class="table-cell table-cell--text">
              [[activity.cluster_title]]
            </div>
            <div class="table-cell table-cell--text">
              [[activity.cluster_objective_title]]
           </div>
          </template>
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

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterActivities.loading)'})
  loading!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(rootState.clusterActivities.all)'})
  activities!: any[];

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterActivities.count)'})
  totalResults!: number;

  @property({type: Boolean})
  isMinimalList = false;

  @property({type: Object, computed: '_withDefaultParams(queryParams)'})
  anchorQueryParams!: GenericObject;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as any).open();
  }

  _detailUrl(id: string, query: string) {
    const path = '/response-parameters/clusters/activity/' + id;
    return this.buildUrl(this._baseUrlCluster, path) + '?' + query;
  }
}

window.customElements.define('clusters-activities-list', ClustersActivityList);

export {ClustersActivityList as ClustersActivitiesListEl};
