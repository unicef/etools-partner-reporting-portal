var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/app-route/app-route';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import DataTableMixin from '../../mixins/data-table-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../etools-prp-ajax';
import '../project-status';
import '../page-body';
import { tableStyles } from '../../styles/table-styles';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProjectActivityTable extends DataTableMixin(PaginationMixin(RoutingMixin(UtilsMixin(LocalizeMixin(ReduxConnectedElement))))) {
    constructor() {
        super(...arguments);
        this.pageSize = 1;
        this.openedDetails = [];
    }
    static get template() {
        return html `
      ${tableStyles}
      <style include="data-table-styles iron-flex">
        :host {
          display: block;
        }

        iron-icon {
          color: var(--paper-grey-600);
        }

        a {
          color: var(--theme-primary-color);
        }

        .wrapper {
          position: relative;
        }
      </style>

      <iron-location
        query="{{query}}">
      </iron-location>

      <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
      </iron-query-params>

      <iron-query-params
          params-string="{{anchorQuery}}"
          params-object="{{anchorQueryParams}}">
      </iron-query-params>

      <div class="wrapper">
        <etools-content-panel no-header>
          <etools-data-table-header
              no-collapse
              label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
            <etools-data-table-column field="cluster">
              <div class="table-column">[[localize('cluster')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="status">
              <div class="table-column">[[localize('status')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="project">
              <div class="table-column">[[localize('project_activity')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="cluster">
              <div class="table-column">[[localize('cluster_activity')]]</div>
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

          <template id="list" is="dom-repeat" items="[[data]]" initial-count="[[pageSize]]">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">
                  [[item.cluster.name]]
                </div>
                <div class="table-cell table-cell--text">
                  <project-status status="[[item.status]]"></project-status>
                </div>
                <div class="table-cell table-cell--text">
                  <a href="[[_detailUrl(item, anchorQuery)]]">[[item.title]]</a>
                </div>
                <div class="table-cell table-cell--text">
                  <template is="dom-if" if="[[item.cluster_activity]]">
                    [[item.cluster_activity.title]]
                  </template>
                  <template is="dom-if" if="[[!item.cluster_activity]]">
                    <span role="presentation"> - </span>
                  </template>
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
        </etools-content-panel>
      </div>

    `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _computeCurrentActivitiesCount(projectId, activitiesCountDict) {
        if (!projectId || !activitiesCountDict) {
            return;
        }
        return activitiesCountDict[projectId];
    }
    _computeCurrentActivities(projectId, activitiesDict) {
        if (!projectId || !activitiesDict) {
            return;
        }
        return activitiesDict[projectId];
    }
    _detailUrl(activity, query) {
        let path = '/response-parameters/partners/activity/' + activity.id;
        if (this.page === 'planned-action') {
            path = '/planned-action/activity/' + activity.id;
        }
        // Query string is passed to construct the back button.
        return this.buildUrl(this._baseUrlCluster, path) + '?' + query;
    }
    _addEventListeners() {
        this._tableContentChanged = this._tableContentChanged.bind(this);
        this.addEventListener('page-number-changed', this._tableContentChanged);
        this._detailsChange = this._detailsChange.bind(this);
        this.addEventListener('details-opened-changed', this._detailsChange);
    }
    _removeEventListeners() {
        this.removeEventListener('page-number-changed', this._tableContentChanged);
        this.removeEventListener('details-opened-changed', this._detailsChange);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], ProjectActivityTable.prototype, "page", void 0);
__decorate([
    property({ type: Number })
], ProjectActivityTable.prototype, "pageSize", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.activities)' })
], ProjectActivityTable.prototype, "activitiesDict", void 0);
__decorate([
    property({ type: Number })
], ProjectActivityTable.prototype, "projectId", void 0);
__decorate([
    property({ type: Array, computed: '_computeCurrentActivities(projectId, activitiesDict)' })
], ProjectActivityTable.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.partnerProjects.activitiesLoading)' })
], ProjectActivityTable.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.activitiesCount)' })
], ProjectActivityTable.prototype, "activitiesCountDict", void 0);
__decorate([
    property({ type: Number, computed: '_computeCurrentActivitiesCount(projectId, activitiesCountDict)' })
], ProjectActivityTable.prototype, "totalResults", void 0);
__decorate([
    property({ type: Object, computed: '_withDefaultParams(queryParams)' })
], ProjectActivityTable.prototype, "anchorQueryParams", void 0);
__decorate([
    property({ type: Array })
], ProjectActivityTable.prototype, "openedDetails", void 0);
window.customElements.define('project-activity-table', ProjectActivityTable);
