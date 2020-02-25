import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from "../../../endpoints";


/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ClusterPartnerFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax id="partnerNames" url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter label="[[localize('partner')]]" name="partner" value="[[value]]" data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }


  @property({type: String, computed: '_computePartnerNamesUrl(responsePlanID)', observer: '_fetchPartnerNames'})
  partnerNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.app.current)'})
  data = [];

  @property({type: String})
  value!: string;

  _computePartnerNamesUrl(responsePlanID: string) {
    return Endpoints.clusterPartnerNames(responsePlanID);
  }

  _fetchPartnerNames() {
    var self = this;
    const thunk = (this.$.partnerNames as EtoolsPrpAjaxEl).thunk();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All',
        }].concat(res.data));
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('cluster-partner-filter', ClusterPartnerFilter);
