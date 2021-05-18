import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/app-route/app-route.js';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import DataTableMixin from '../../mixins/data-table-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/project-status';
import '../../etools-prp-common/elements/page-body';
import {tableStyles} from '../../styles/table-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin UtilsMixin
 */
class ContactsTable extends DataTableMixin(PaginationMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
  public static get template() {
    return html`
      ${tableStyles}
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
            label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] results to show">
          <etools-data-table-column field="cluster">
            <div class="table-column">Cluster</div>
          </etools-data-table-column>
          <etools-data-table-column field="partner">
            <div class="table-column">Partner</div>
          </etools-data-table-column>
          <etools-data-table-column field="focalPoint">
            <div class="table-column">Focal Point</div>
          </etools-data-table-column>
          <etools-data-table-column field="email">
            <div class="table-column">Email</div>
          </etools-data-table-column>
          <etools-data-table-column field="phone">
            <div class="table-column">Phone Number</div>
          </etools-data-table-column>
          <etools-data-table-column field="">
            <div class="table-column">&nbsp;</div>
          </etools-data-table-column>
          <etools-data-table-column field="">
            <div class="table-column">&nbsp;</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <template
            id="list"
            is="dom-repeat"
            items="[[contacts]]"
            as="contact"
            initial-count="[[pageSize]]">
          <etools-data-table-row details-opened="[[detailsOpened]]">
            <div slot="row-data">
              <div class="table-cell table-cell--text">
                [[contact.cluster]]
              </div>
              <div class="table-cell table-cell--text">
                  [[contact.partner]]
              </div>
              <div class="table-cell table-cell--text">
                  [[contact.focal_point]]
              </div>
              <div class="table-cell table-cell--text">
                  [[contact.email]]
              </div>
              <div class="table-cell table-cell--text">
                  [[contact.phone_number]]
              </div>
              <div class="table-cell table-cell--text">
                  <a href="#">PROJECTS</a>
              </div>
              <div class="table-cell table-cell--text">
                  <a href="#">ACTIVITIES</a>
              </div>
            </div>
            <div slot="row-data-details" class="row-details-expanded-wrapper">
              <div slot="row-data">
                  <div class="table-cell table-cell--text">
                      <span class="label">Address</span>
                      [[contact.address]]
                      <span class="label">Links</span>
                      [[contact.links]]
                  </div>
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

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.contacts.loading)'})
  loading!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(rootState.contacts.all)'})
  disaggregations!: GenericObject[];

  @property({type: Number, computed: 'getReduxStateValue(rootState.contacts.count)'})
  totalResults!: number;

  @property({type: Boolean})
  detailsOpened = false;

  @property({type: Array})
  openedDetails: any[] = [];

  _addEventListeners() {
    this._tableContentChanged = this._tableContentChanged.bind(this);
    this.addEventListener('page-number-changed', this._tableContentChanged);
    this._detailsChange = this._detailsChange.bind(this);
    this.addEventListener('details-opened-changed', this._detailsChange as any);
  }

  _removeEventListeners() {
    this.removeEventListener('page-number-changed', this._tableContentChanged);
    this.removeEventListener('details-opened-changed', this._detailsChange as any);
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

window.customElements.define('contacts-table', ContactsTable);
