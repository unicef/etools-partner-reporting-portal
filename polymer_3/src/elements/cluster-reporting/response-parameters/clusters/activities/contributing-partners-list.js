var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DataTableMixin from '../../../../../mixins/data-table-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import PaginationMixin from '../../../../../mixins/pagination-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/app-route/app-route';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../etools-prp-ajax';
import '../../../../labelled-item';
import '../../../../list-placeholder';
import '../../../../project-status';
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
class ContributingPartnersList extends LocalizeMixin(UtilsMixin(DataTableMixin(RoutingMixin(PaginationMixin(ReduxConnectedElement))))) {
    constructor() {
        super(...arguments);
        this.detailsOpened = false;
        this.openedDetails = [];
    }
    static get template() {
        // language=HTML
        return html `
    ${sharedStyles} ${tableStyles}
    <style include="data-table-styles app-grid-style">
      :host {
        display: block;

        --app-grid-columns: 5;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 5;
        --links-width: calc((100% / 5 * 3) - 30px);

        --ecp-content: {
          padding: 0;
        };
      }

      .app-grid {
        margin: -var(--app-grid-gutter);
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .links {
        flex-basis: var(--links-width);
        max-width: var(--links-width);
      }

      a {
        text-decoration: none;
        color: var(--theme-primary-color);
      }

      .wrapper {
        position: relative;
      }

      .cell-activity {
        text-align: right;
      }

      .cell-activity {
        color: var(--theme-primary-color);
        text-transform: uppercase;
      }

      .row-data {
        width: 100%;
      }

      .value {
        font-size: 12px;
      }

      .truncate {
        @apply --truncate;
      }
    </style>

    <iron-location
      query="{{query}}">
    </iron-location>

    <iron-query-params
      params-string="{{query}}"
      params-object="{{queryParams}}">
    </iron-query-params>

    <div class="wrapper">
      <etools-content-panel no-header>
        <etools-data-table-header
            label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
          <etools-data-table-column field="cluster">
            <div class="table-column">[[localize('partner')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="cluster">
            <div class="table-column">[[localize('focal_point')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="status">
            <div class="table-column">[[localize('email')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="project">
            <div class="table-column">[[localize('phone_number')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="">
            <div class="table-column">&nbsp;</div>
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
            items="[[data]]"
            initial-count="[[pageSize]]">
          <etools-data-table-row details-opened="[[detailsOpened]]">
            <div slot="row-data">
              <div class="table-cell table-cell--text">
                [[item.title]]
              </div>
              <div class="table-cell table-cell--text">
                <!-- TODO: get 'focal point' -->
                [[_withDefault(item.focal_point)]]
              </div>
              <div class="table-cell table-cell--text">
                [[_withDefault(item.email)]]
              </div>
              <div class="table-cell table-cell--text">
                [[_withDefault(item.phone_number)]]
              </div>
              <div class="table-cell table-cell--text cell-activity">
                <a href="[[_getActivityUrl(_baseUrlCluster, activityId, item.partner_activities)]]">[[localize('see_activity')]]</a>
              </div>
            </div>
            <div slot="row-data-details">
              <div class="row-data">
                <div class="app-grid">
                  <div class="item full-width">
                    <labelled-item label="[[localize('partner_projects')]]">
                      <div class="value">
                        <template
                            is="dom-repeat"
                            items="[[item.partner_projects]]"
                            as="project"><template is="dom-if" if="[[!_equals(index, 0)]]" restamp="true">,</template>
                          <a href="[[_getProjectUrl(_baseUrlCluster, project.id)]]">[[project.title]]</a></template>
                      </div>
                    </labelled-item>
                  </div>
                  <div class="item">
                    <labelled-item label="[[localize('cluster')]]">
                      <div class="value truncate">
                        [[item.cluster]]
                      </div>
                    </labelled-item>
                  </div>
                  <div class="item">
                    <labelled-item label="[[localize('address')]]">
                      <div class="value truncate">
                        [[_formatAddress(item.street_address, item.city, item.postal_code)]]
                      </div>
                    </labelled-item>
                  </div>
                  <div class="item links">
                    <labelled-item label="[[localize('links')]]">
                      <div class="value">
                        <template
                            is="dom-repeat"
                            items="[[item.links]]"
                            as="link"><template is="dom-if" if="[[!_equals(index, 0)]]" restamp="true">,</template>
                          <a href="[[link]]" target="_blank">[[link]]</a></template>
                      </labelled-item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </etools-data-table-row>
        </template>

        <list-placeholder
            data="[[data]]"
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
      </div>
    </etools-content-panel>
    `;
    }
    _computeCurrentPartners(activityId, allPartners) {
        if (!allPartners) {
            return;
        }
        return allPartners[activityId] || [];
    }
    _computeCurrentPartnersCount(activityId, allPartnersCount) {
        if (!allPartnersCount) {
            return;
        }
        return allPartnersCount[activityId] || 0;
    }
    _getActivityUrl(_baseUrlCluster, activityId, partner_activities) {
        if (!partner_activities) {
            return;
        }
        const id = (partner_activities.filter(function (activity) {
            return Number(activity.cluster_activity) === Number(activityId);
        })[0] || {}).id;
        return this.buildUrl(_baseUrlCluster, '/response-parameters/clusters/activity/' + id + '/overview');
    }
    _getProjectUrl(_baseUrlCluster, projectId) {
        return this.buildUrl(_baseUrlCluster, '/response-parameters/partners/project/' + projectId + '/overview');
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
    property({ type: Number })
], ContributingPartnersList.prototype, "activityId", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.clusterActivities.partners)' })
], ContributingPartnersList.prototype, "allPartners", void 0);
__decorate([
    property({ type: Array, computed: '_computeCurrentPartners(activityId, allPartners)' })
], ContributingPartnersList.prototype, "data", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.clusterActivities.partnersCount)' })
], ContributingPartnersList.prototype, "allPartnersCount", void 0);
__decorate([
    property({ type: Number, computed: '_computeCurrentPartnersCount(activityId, allPartnersCount)' })
], ContributingPartnersList.prototype, "totalResults", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterActivities.loading)' })
], ContributingPartnersList.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], ContributingPartnersList.prototype, "detailsOpened", void 0);
__decorate([
    property({ type: Array })
], ContributingPartnersList.prototype, "openedDetails", void 0);
window.customElements.define('contributing-partners-list', ContributingPartnersList);
export { ContributingPartnersList as ContributingPartnersListEl };
