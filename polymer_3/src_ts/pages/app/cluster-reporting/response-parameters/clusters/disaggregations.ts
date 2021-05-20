import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../../etools-prp-common/mixins/routing-mixin';
import {CreationModalDisaggregationEl} from '../../../../../elements/cluster-reporting/response-parameters/clusters/disaggregations/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/disaggregations/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/disaggregations/disaggregations-list';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../etools-prp-common/elements/etools-prp-permissions';
import '../../../../../etools-prp-common/elements/page-body';
import {tableStyles} from '../../../../../etools-prp-common/styles/table-styles';
import {buttonsStyles} from '../../../../../etools-prp-common/styles/buttons-styles';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';
import Endpoints from '../../../../../etools-prp-common/endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fetchClusterDisaggregationsList} from '../../../../../etools-prp-common/redux/actions/clusterDisaggregations';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class Disaggregations extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
    ${tableStyles} ${buttonsStyles}
    <style include="iron-flex data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="disaggregations"
        url="[[disaggregationsUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>

      <template
        is="dom-if"
        if="[[_canAddDisaggregation(permissions)]]"
        restamp="true">
      <cluster-disaggregations-modal id="modal"></cluster-disaggregations-modal>

      <div id="action">
        <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
          [[localize('add_disaggregation')]]
        </paper-button>
      </div>
    </template>

      <clusters-disaggregations-list></clusters-disaggregations-list>
    </page-body>
  </template>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  disaggregationsUrl!: string;

  static get observers() {
    return ['_clusterDisaggregationsAjax(queryParams, disaggregationsUrl)'];
  }

  private _clusterDisaggregationsAjaxDebouncer!: Debouncer;

  _onSuccess() {
    this._clusterDisaggregationsAjax(this.queryParams);
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as CreationModalDisaggregationEl).open();
  }

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }

    return Endpoints.responseParametersClusterDisaggregations(responsePlanID);
  }

  _clusterDisaggregationsAjax(queryParams: GenericObject) {
    if (!this.disaggregationsUrl) {
      return;
    }

    this._clusterDisaggregationsAjaxDebouncer = Debouncer.debounce(
      this._clusterDisaggregationsAjaxDebouncer,
      timeOut.after(300),
      () => {
        const thunk = (this.$.disaggregations as EtoolsPrpAjaxEl).thunk();
        if (!Object.keys(queryParams).length) {
          return;
        }
        (this.$.disaggregations as EtoolsPrpAjaxEl).abort();
        this.reduxStore
          .dispatch(fetchClusterDisaggregationsList(thunk))
          // @ts-ignore
          .catch((_err: GenericObject) => {
            //   // TODO: error handling.
          });
      }
    );
  }

  _canAddDisaggregation(permissions: GenericObject) {
    return permissions.createClusterEntities;
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('disaggregation-added', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('disaggregation-added', this._onSuccess);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    if (this._clusterDisaggregationsAjaxDebouncer && this._clusterDisaggregationsAjaxDebouncer.isActive()) {
      this._clusterDisaggregationsAjaxDebouncer.cancel();
    }
  }
}

window.customElements.define('clusters-disaggregations', Disaggregations);

export {Disaggregations as ClustersDisaggregationsEl};
