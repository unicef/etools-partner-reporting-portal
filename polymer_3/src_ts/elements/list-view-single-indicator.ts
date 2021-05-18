import {ReduxConnectedElement} from '../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import {PaperButtonElement} from '@polymer/paper-button/paper-button';
import '@polymer/polymer/lib/elements/dom-if';

import './ip-reporting/ip-reporting-indicator-details';
import './etools-prp-progress-bar';
import './etools-prp-progress-bar-alt';
import './etools-prp-progress-bar-cluster';
import '../etools-prp-common/elements/etools-prp-number';

import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import '../etools-prp-common/elements/etools-prp-permissions';
import '../etools-prp-common/elements/status-badge';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../etools-prp-common/typings/globals.types';
import {tableStyles} from '../styles/table-styles';
import {sharedStyles} from '../styles/shared-styles';
import './cluster-reporting/indicator-editing-modal';
import './cluster-reporting/indicator-locations-modal';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class ListViewSingleIndicator extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      ${tableStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-factors iron-flex-alignment data-table-styles">
        :host {
          display: block;

          --etools-prp-progress-bar-height: 14px;

          --list-row-collapse-wrapper: {
            padding: 0;
            background: white;
          }

          --etools-prp-progress-bar: {
            display: block;
            width: calc(100% - 35px);
          }

          --iron-icon: {
            vertical-align: text-bottom;
          }

          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
        }

        a {
          @apply --link;
        }

        .button-link {
          @apply --link;
          font-size: 13px;
          text-transform: none;
        }

        .indicator-progress {
          margin: 0;
          font-size: 11px;
          line-height: 1;
        }

        .indicator-progress:not(:last-child) {
          margin-bottom: 6px;
        }

        .indicator-progress dt {
          width: 100px;
          margin-right: 10px;
          text-align: right;
          color: var(--theme-secondary-text-color);
        }

        .indicator-progress dd {
          margin: 0;
        }

        etools-prp-progress-bar {
          @apply --etools-prp-progress-bar;
        }

        .table-cell--action {
          text-align: right;
        }

        .locations-warning {
          color: #ffcc00;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <template is="dom-if" if="[[canEdit]]" restamp="true">
        <indicator-edit-modal id="modal-edit" edit-data="[[indicator]]"> </indicator-edit-modal>
      </template>

      <template is="dom-if" if="[[canEditLocations]]" restamp="true">
        <indicator-locations-modal id="modal-locations" edit-data="[[indicator]]"> </indicator-locations-modal>
      </template>

      <etools-data-table-row details-opened="{{detailsOpened}}" on-details-opened-changed="onDetailsOpenedChanged">
        <div slot="row-data">
          <span class="table-cell table-cell--text self-center">
            <template is="dom-if" if="[[_flagIndicator(indicator.target, indicator.baseline, isCustom)]]">
              <status-badge type="error"></status-badge>
            </template>
            [[indicator.blueprint.title]]
            <paper-tooltip>[[indicator.blueprint.title]]</paper-tooltip>
          </span>
          <template
            is="dom-if"
            if="[[_equals(indicator.content_type_key, 'partner.partneractivityprojectcontext')]]"
            restamp="[[true]]"
          >
            <span class="table-cell table-cell--text self-center"> [[indicator.content_object_title]] </span>
          </template>
          <span class="table-cell table-cell--text self-center">
            [[indicator.blueprint.calculation_formula_across_locations]]
          </span>
          <span class="table-cell table-cell--text self-center">
            [[indicator.blueprint.calculation_formula_across_periods]]
          </span>
          <span class="table-cell table-cell--text self-center">
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'number')]]" restamp="true">
              <etools-prp-number value="[[indicator.baseline.v]]"></etools-prp-number>
            </template>
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'percentage')]]" restamp="true">
              <span><etools-prp-number value="[[indicator.baseline.v]]"></etools-prp-number>%</span>
            </template>
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'ratio')]]" restamp="true">
              <span>
                <etools-prp-number value="[[indicator.baseline.v]]"></etools-prp-number>
                /
                <etools-prp-number value="[[indicator.baseline.d]]"></etools-prp-number>
              </span>
            </template>
          </span>
          <span class="table-cell table-cell--text self-center">
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'number')]]" restamp="true">
              <etools-prp-number value="[[indicator.target.v]]"></etools-prp-number>
            </template>
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'percentage')]]" restamp="true">
              <span><etools-prp-number value="[[indicator.target.v]]"></etools-prp-number>%</span>
            </template>
            <template is="dom-if" if="[[_equals(indicator.blueprint.display_type, 'ratio')]]" restamp="true">
              <span>
                <etools-prp-number value="[[indicator.target.v]]"></etools-prp-number>
                /
                <etools-prp-number value="[[indicator.target.d]]"></etools-prp-number>
              </span>
            </template>
          </span>
          <span class="table-cell table-cell--text self-center">
            <etools-prp-number value="[[indicator.achieved.c]]"></etools-prp-number>
          </span>
          <span class="table-cell table-cell--text self-center" flex-2>
            <div class="self-center flex-none">
              <dl class="indicator-progress layout horizontal">
                <dt class="flex-none self-center">[[localize('against_target')]]</dt>
                <dd class="flex-none">
                  <template is="dom-if" if="[[_equals(progressBarType, 'cluster')]]" restamp="true">
                    <etools-prp-progress-bar-cluster
                      display-type="[[indicator.bluepring.display_type]]"
                      number="[[indicator.total_against_target]]"
                    >
                    </etools-prp-progress-bar-cluster>
                  </template>
                  <template is="dom-if" if="[[_equals(progressBarType, 'default')]]" restamp="true">
                    <etools-prp-progress-bar
                      display-type="[[indicator.blueprint.display_type]]"
                      number="[[indicator.total_against_target]]"
                    >
                    </etools-prp-progress-bar>
                  </template>
                </dd>
              </dl>

              <template is="dom-if" if="[[isClusterApp]]" restamp="true">
                <dl class="indicator-progress layout horizontal">
                  <dt class="flex-none self-center">[[localize('against_in_need')]]:</dt>
                  <dd class="flex-none">
                    <etools-prp-progress-bar-alt
                      display-type="[[indicator.blueprint.display_type]]"
                      number="[[indicator.total_against_in_need]]"
                    >
                    </etools-prp-progress-bar-alt>
                  </dd>
                </dl>
              </template>
            </div>
          </span>

          <template is="dom-if" if="[[hasReports]]" restamp="true">
            <span class="table-cell table-cell--text table-cell--action self-center">
              <a href="[[indicatorReportsUrl]]">[[localize('reports')]]</a>
            </span>
          </template>

          <template is="dom-if" if="[[canEdit]]" restamp="true">
            <span class="table-cell table-cell--text table-cell--action self-center">
              <paper-button class="button-link" on-tap="_openModal" data-modal-type="edit"
                >[[localize('edit')]]
                <template is="dom-if" if="[[_showLocationsWarning(indicator, type)]]" restamp="true">
                  <iron-icon class="locations-warning" data-modal-type="edit" icon="icons:error"></iron-icon>
                </template>
              </paper-button>
            </span>
          </template>

          <template is="dom-if" if="[[canEditLocations]]" restamp="true">
            <span class="table-cell table-cell--text table-cell--action self-center">
              <paper-button class="button-link" on-tap="_openModal" data-modal-type="locations"
                >[[localize('locations')]]</paper-button
              >
            </span>
          </template>
        </div>
        <div slot="row-data-details">
          <ip-reporting-indicator-details indicator="[[indicator]]" is-open="[[detailsOpened]]">
          </ip-reporting-indicator-details>
        </div>
      </etools-data-table-row>
    `;
  }

  @property({type: Object})
  indicator!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Boolean})
  detailsOpened = false;

  @property({type: Boolean})
  isCustom!: boolean;

  @property({type: String, computed: '_computeIndicatorReportsUrl(_baseUrlCluster, indicator)'})
  indicatorReportsUrl!: string;

  @property({type: Boolean, computed: '_computeIsClusterApp(appName)'})
  isClusterApp!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  appName!: string;

  @property({type: String})
  type = '';

  @property({type: Boolean, computed: '_computeCanEditLocations(isClusterApp, type, permissions)'})
  canEditLocations!: boolean;

  @property({type: Boolean, computed: '_computeHasReports(isClusterApp, type)'})
  hasReports!: boolean;

  @property({type: String, computed: '_computeProgressBarType(isClusterApp, indicator)'})
  progressBarType!: string;

  _flagIndicator(target: number, baseline: number, isCustom: boolean) {
    return !isCustom && (!target || !baseline);
  }

  _openModal(e: CustomEvent) {
    (this.shadowRoot!.querySelector('#modal-' + (e.target as PaperButtonElement).dataset.modalType) as any).open();
  }

  _computeIsClusterApp(appName: string) {
    return appName === 'cluster-reporting';
  }

  _computeIndicatorReportsUrl(baseUrl: string, indicator: GenericObject) {
    if (!baseUrl || !indicator) {
      return;
    }

    let query_params = 'results?page_size=10&page=1&indicator_type=';

    if (indicator.content_type_key === 'cluster.clusterobjective') {
      query_params += 'cluster_objective';
    } else if (indicator.content_type_key === 'cluster.clusteractivity') {
      query_params += 'cluster_activity';
    } else if (indicator.content_type_key === 'partner.partnerproject') {
      query_params += 'partner_project';
    } else if (indicator.content_type_key === 'partner.partneractivity') {
      query_params += 'partner_activity';
    }

    query_params += '&indicator=' + indicator.id.toString();

    return this.buildUrl(baseUrl, query_params);
  }

  _computeCanEditLocations(isClusterApp: boolean, type: string, permissions: GenericObject) {
    if (!permissions) {
      return;
    }
    return isClusterApp && type === 'ca' && permissions.editIndicatorLocations;
  }

  _computeProgressBarType(isClusterApp: boolean, indicator: GenericObject) {
    if (!indicator) {
      return;
    }

    switch (true) {
      case !isClusterApp && !!indicator.ca_indicator_used_by_reporting_entity:
        return 'cluster';

      // TODO: other cases

      default:
        return 'default';
    }
  }

  _computeHasReports(isClusterApp: boolean, type: string) {
    return isClusterApp && type !== 'ca';
  }

  _showLocationsWarning(indicator: GenericObject, type: string) {
    return !indicator.locations.length && type !== 'ca';
  }

  onDetailsOpenedChanged(event: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('details-opened-changed', {
        detail: {row: event.target, detailsOpened: event.detail.value},
        bubbles: true,
        composed: true
      })
    );
  }
}

window.customElements.define('list-view-single-indicator', ListViewSingleIndicator);
