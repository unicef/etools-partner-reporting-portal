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
import '@polymer/paper-tooltip/paper-tooltip';
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
import '../list-placeholder';
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
class ProjectListTable extends DataTableMixin(PaginationMixin(RoutingMixin(UtilsMixin(LocalizeMixin(ReduxConnectedElement))))) {
    constructor() {
        super(...arguments);
        this.openedDetails = [];
    }
    static get template() {
        return html `
      ${tableStyles}
      <style include="data-table-styles iron-flex">
        :host {
          display: block;
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
              label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
            <etools-data-table-column field="title" sortable>
              <div class="table-column">[[localize('project')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="clusters" sortable>
              <div class="table-column">[[localize('cluster')]]</div>
            </etools-data-table-column>
            <template is="dom-if" if="[[_equals(page, 'response-parameters')]]">
              <etools-data-table-column field="partner" sortable>
                <div class="table-column">[[localize('partner')]]</div>
              </etools-data-table-column>
            </template>
            <etools-data-table-column field="status" sortable>
              <div class="table-column">[[localize('status')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="Location">
              <div class="table-column">[[localize('location')]]</div>
            </etools-data-table-column>
            <etools-data-table-column field="ocha">
              <div class="table-column">[[localize('from_ocha')]]</div>
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
              items="[[projects]]"
              as="project"
              initial-count="[[pageSize]]">
            <etools-data-table-row>
              <div slot="row-data">
                <div class="table-cell table-cell--text">
                  <a href="[[_detailUrl(project, anchorQuery)]]">[[project.title]]</a>
                  <paper-tooltip>[[project.title]]</paper-tooltip>
                </div>
                <div class="table-cell table-cell--text">
                  [[_commaSeparatedDictValues(project.clusters, 'title')]]
                </div>
                <template is="dom-if" if="[[_equals(page, 'response-parameters')]]">
                  <div class="table-cell table-cell--text">
                    [[project.partner]]
                  </div>
                </template>
                <div class="table-cell table-cell--text">
                  <project-status status="[[project.status]]"></project-status>
                </div>
                <div class="table-cell table-cell--text">
                  [[_commaSeparatedDictValues(project.locations, 'title')]]
                </div>
                <div class="table-cell table-cell--text">
                  <template
                      is="dom-if"
                      if="[[project.is_ocha_imported]]">
                    <iron-icon icon="icons:check"></iron-icon>
                  </template>
                </div>
              </div>
              <div slot="row-data-details">
                <div slot="row-data">
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('start_date')]]</span>
                    [[project.start_date]]
                    <span class="label">[[localize('total_budget')]]</span>
                    [[project.total_budget]]
                  </div>
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('end_date')]]</span>
                    [[project.end_date]]
                    <span class="label">[[localize('funding_source')]]</span>
                    [[project.funding_source]]
                  </div>
                  <div class="table-cell table-cell--text">
                    <span class="label">[[localize('part_of_a_joint_response_plan')]]</span>
                    [[project.response_plan_title]]
                  </div>
                </div>
              </div>
            </etools-data-table-row>
          </template>

          <list-placeholder
              data="[[projects]]"
              loading="[[loading]]">
          </list-placeholder>

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
    _detailUrl(project, query) {
        let path = '/response-parameters/partners/project/' + project.id;
        if (this.page === 'planned-action') {
            path = '/planned-action/project/' + project.id;
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
        this.openedDetails.length = 0;
    }
}
__decorate([
    property({ type: String })
], ProjectListTable.prototype, "page", void 0);
__decorate([
    property({ type: String })
], ProjectListTable.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], ProjectListTable.prototype, "queryParams", void 0);
__decorate([
    property({ type: Array, observer: '_tableContentChanged', computed: 'getReduxStateArray(rootState.partnerProjects.all)' })
], ProjectListTable.prototype, "projects", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.partnerProjects.loading)' })
], ProjectListTable.prototype, "loading", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.partnerProjects.count)' })
], ProjectListTable.prototype, "totalResults", void 0);
__decorate([
    property({ type: String })
], ProjectListTable.prototype, "projectId", void 0);
__decorate([
    property({ type: Array })
], ProjectListTable.prototype, "openedDetails", void 0);
__decorate([
    property({ type: String })
], ProjectListTable.prototype, "anchorQuery", void 0);
__decorate([
    property({ type: Object, computed: '_withDefaultParams(queryParams)' })
], ProjectListTable.prototype, "anchorQueryParams", void 0);
window.customElements.define('project-list-table', ProjectListTable);
