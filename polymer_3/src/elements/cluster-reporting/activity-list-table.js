var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import '@polymer/app-route/app-route';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icons/iron-icons';
import DataTableMixin from '../../mixins/data-table-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import Endpoints from '../../endpoints';
import '../project-status';
import '../page-body';
import '../list-placeholder';
import '../../redux/actions';
import { tableStyles } from '../../styles/table-styles';
/**
* @polymer
* @customElement
* @appliesMixin DataTableMixin
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin PaginationMixin
* @appliesMixin RoutingMixin
*/
class ActivityListTable extends DataTableMixin(UtilsMixin(LocalizeMixin(PaginationMixin(RoutingMixin(ReduxConnectedElement))))) {
    constructor() {
        super(...arguments);
        this.openedDetails = [];
        this.projects = {};
    }
    static get template() {
        // language=HTML
        return html `
    ${tableStyles}
    <style include="data-table-styles iron-flex">
      :host {
        display: block;
      }

      div[slot='row-data-details'] {
        display: flex;
        flex-direction: column;
      }

      div[slot='row-data-details'] .table-cell--text {
        font-size: 12px;
      }

      .label {
        display: block;
        padding-top: 10px;
        color: var(--paper-grey-600);
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
    <etools-prp-ajax id="projects" url="[[projectsUrl]]">
    </etools-prp-ajax>
    <iron-location query="{{query}}">
    </iron-location>
    <iron-query-params params-string="{{query}}" params-object="{{queryParams}}">
    </iron-query-params>
    <iron-query-params params-string="{{anchorQuery}}" params-object="{{anchorQueryParams}}">
    </iron-query-params>
    <div class="wrapper">
      <etools-content-panel no-header>
        <etools-data-table-header
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
          <etools-data-table-column field="title" sortable>
            <div class="table-column">[[localize('activity')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="cluster">
            <div class="table-column">[[localize('cluster')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="cluster_activity" sortable>
            <div class="table-column">[[localize('cluster_activity')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="cluster_objective">
            <div class="table-column">[[localize('cluster_objective')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="is_custom">
            <div class="table-column">[[localize('custom')]]</div>
          </etools-data-table-column>
          <template is="dom-if" if="[[_equals(page, 'response-parameters')]]">
            <etools-data-table-column field="partner" sortable>
              <div class="table-column">[[localize('partner')]]</div>
            </etools-data-table-column>
          </template>
        </etools-data-table-header>
        <etools-data-table-footer page-size="[[pageSize]]" page-number="[[pageNumber]]" total-results="[[totalResults]]"
          visible-range="{{visibleRange}}" on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
        </etools-data-table-footer>
        <template id="list" is="dom-repeat" items="[[activities]]" as="activity" initial-count="[[pageSize]]">
          <etools-data-table-row details-opened="[[detailsOpened]]">
            <div slot="row-data">
              <div class="table-cell table-cell--text">
                <a href="[[_detailUrl(activity, anchorQuery)]]">[[activity.title]]</a>
              </div>
              <div class="table-cell table-cell--text"> [[activity.cluster.name]] </div>
              <div class="table-cell table-cell--text">
                <template is="dom-if" if="[[activity.cluster_activity]]"> [[activity.cluster_activity.title]]
                </template>
                <template is="dom-if" if="[[!activity.cluster_activity]]"> — </template>
              </div>
              <div class="table-cell table-cell--text"> [[activity.cluster_objective.title]] </div>
              <div class="table-cell">
                <template is="dom-if" if="[[activity.is_custom]]">
                  <iron-icon icon="check"></iron-icon>
                </template>
                <template is="dom-if" if="[[!activity.is_custom]]"> — </template>
              </div>
              <template is="dom-if" if="[[_equals(page, 'response-parameters')]]">
                <div class="table-cell table-cell--text"> [[activity.partner.title]] </div>
              </template>
            </div>
            <div slot="row-data-details">
              <template is="dom-repeat" items="[[activity.projects]]">
                <div slot="row-data">
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('title')]]</span> [[_getTitle(item.project_id)]] </div>
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('status')]]</span>
                    <project-status status="[[item.status]]"></project-status>
                  </div>
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('start_date')]]</span> [[item.start_date]] </div>
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('end_date')]]</span> [[item.end_date]] </div>
                </div>
              </template>
            </div>
          </etools-data-table-row>
        </template>
        <list-placeholder data="[[activities]]" loading="[[loading]]">
        </list-placeholder>
        <etools-data-table-footer page-size="[[pageSize]]" page-number="[[pageNumber]]" total-results="[[totalResults]]"
          visible-range="{{visibleRange}}" on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
        </etools-data-table-footer>
        <etools-loading active="[[loading]]"></etools-loading>
    </div>
    </etools-content-panel>
  `;
    }
    static get observers() {
        return [
            '_getProjects(responsePlanID)'
        ];
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _detailUrl(activity, query) {
        let path = '/response-parameters/partners/activity/' + activity.id;
        if (this.page === 'planned-action') {
            path = '/planned-action/activity/' + activity.id;
        }
        // Query string is passed to construct the back button.
        return this.buildUrl(this._baseUrlCluster, path) + '?' + query;
    }
    _getProjects() {
        if (Object.keys(this.projects).length !== 0 || !this.responsePlanID) {
            return;
        }
        var self = this;
        this.set('projectsUrl', Endpoints.plannedActions(this.responsePlanID));
        this.$.projects.thunk()()
            .then((res) => {
            const allProjects = {};
            res.data.results.forEach((project) => {
                allProjects[project.id] = project;
            });
            self.set('projects', allProjects);
        });
    }
    _getTitle(projectId) {
        if (this.projects[projectId] === undefined) {
            return;
        }
        return this.projects[projectId].title;
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
        this.openedDetails.length = 0;
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], ActivityListTable.prototype, "page", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.partnerActivities.all)', observer: '_tableContentChanged' })
], ActivityListTable.prototype, "activities", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.partnerActivities.loading)' })
], ActivityListTable.prototype, "loading", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.partnerActivities.count)' })
], ActivityListTable.prototype, "totalResults", void 0);
__decorate([
    property({ type: Object, computed: '_withDefaultParams(queryParams)' })
], ActivityListTable.prototype, "anchorQueryParams", void 0);
__decorate([
    property({ type: Array })
], ActivityListTable.prototype, "openedDetails", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ActivityListTable.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Object })
], ActivityListTable.prototype, "projects", void 0);
window.customElements.define('activity-list-table', ActivityListTable);
