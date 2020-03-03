import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import LocalizeMixin from '../../../mixins/localize-mixin';
import RoutingMixin from '../../../mixins/routing-mixin';
import {tableStyles} from '../../../styles/table-styles'
import '../../report-status';
import '../../frequency-of-reporting';
//<link rel="import" href="../../etools-prp-progress-bar.html">
import '../../etools-prp-progress-bar-alt';
import '../../labelled-item';
import '../../list-placeholder';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class ActivitiesList extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${tableStyles}
      <style include="iron-flex iron-flex-factors data-table-styles">
      :host {
        display: block;

        --ecp-content: {
          padding: 0;
        };
      }

      .cell-is-cluster {
        text-align: center;
      }

      .reportables {
        width: 100%;
      }

      .reportable:not(:last-child) {
        margin-bottom: 1em;
      }

      .value {
        font-size: 12px;
      }


      a {
        text-decoration: none;
        color: var(--theme-primary-color);
      }

      footer {
        padding: 16px;
        text-align: right;
        text-transform: uppercase;
      }
    </style>

    <etools-content-panel panel-title="[[localize('list_of_my_project_activities')]]">
      <etools-data-table-header no-title>
        <etools-data-table-column field="cluster">
          <div class="table-column">[[localize('cluster')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="status">
          <div class="table-column flex-2">[[localize('status')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="title" flex-2>
          <div class="table-column">[[localize('activity')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="is_cluster">
          <div class="table-column cell-is-cluster">[[localize('cluster_activity')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="location">
          <div class="table-column">[[localize('location')]]</div>
        </etools-data-table-column>
      </etools-data-table-header>

      <template
          is="dom-repeat"
          items="[[data]]"
          as="activity">
        <etools-data-table-row
            on-opened-changed="_handleOpenedChanged"
            no-animation>
          <div slot="row-data">
            <div class="table-cell table-cell--text">
              [[activity.cluster.name]]
            </div>
            <div class="table-cell table-cell--text">
              <report-status status="[[activity.status]]"></report-status>
            </div>
            <div class="table-cell table-cell--text" flex-2>
              [[activity.title]]
            </div>
            <div class="table-cell cell-is-cluster">
              <template
                  is="dom-if"
                  if="[[activity.is_cluster]]">
                <iron-icon icon="check"></iron-icon>
              </template>
              <template
                  is="dom-if"
                  if="[[!activity.is_cluster]]">
                -
              </template>
            </div>
            <div class="table-cell">
              [[activity.location]]
            </div>
          </div>

          <div slot="row-data-details">
            <div class="reportables layout vertical">
              <template
                  is="dom-repeat"
                  items="[[activity.reportables]]"
                  as="reportable">
                <div class="reportable layout horizontal">
                  <div class="table-cell table-cell--text">
                    <labelled-item label="[[localize('start_date')]]">
                      <span class="value">[[reportable.start_date]]</span>
                    </labelled-item>
                  </div>
                  <div class="table-cell table-cell--text">
                    <labelled-item label="[[localize('end_date')]]">
                      <span class="value">[[reportable.end_date]]</span>
                    </labelled-item>
                  </div>
                  <div class="table-cell table-cell--text" flex-2>
                    <labelled-item label="[[localize('project')]]">
                      <span class="value">[[activity.project.title]]</span>
                    </labelled-item>
                  </div>
                  <div class="table-cell">&nbsp;</div>
                  <div class="table-cell table-cell--text">
                    <labelled-item label="[[localize('frequency_of_reporting')]]">
                      <span class="value">
                        <frequency-of-reporting
                            type="[[reportable.frequency]]">
                        </frequency-of-reporting>
                    </labelled-item>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <list-placeholder
          data="[[data]]"
          loading="[[loading]]">
      </list-placeholder>

      <footer>
        <a href="[[activitiesUrl]]">[[localize('see_more')]]</a>
      </footer>

      <etools-loading active="[[loading]]"></etools-loading>
    </etools-content-panel>
    `;
  }

  @property({type: Array})
  detailsOpened = [];

  @property({type: Array, computed: 'getReduxStateArray(rootState.clusterDashboardData.data.my_project_activities)', observer: '_collapseAll'})
  data!: any[];

  @property({type: String, computed: '_computeActivitiesUrl(_baseUrlCluster)'})
  activitiesUrl!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  _collapseAll(){
    this.detailsOpened.slice().forEach(function (row: any) {
      row.detailsOpened = false;
    });
  }

  _handleOpenedChanged(e: CustomEvent, data: any[]) {
    var row = e.target;
    var openedIndex = this.detailsOpened.indexOf(row);

    if (!data.value) {
      if (openedIndex !== -1) {
        this.splice('detailsOpened', openedIndex, 1);
      }

      return;
    }

    this.push('detailsOpened', row);
  }

  _computeActivitiesUrl (baseUrl: string) {
    return this.buildUrl(baseUrl, '/planned-action/activities');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._collapseAll();
    this.set('detailsOpened.length', 0);
  }
}

window.customElements.define('activities-list', ActivitiesList);

export {ActivitiesList as ActivitiesListEl};
