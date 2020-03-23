import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import {GenericObject} from "../../../typings/globals.types";


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


  @property({type: String, computed: '_computePartnerNamesUrl(responsePlanId)', observer: '_fetchPartnerNames'})
  partnerNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computePartnerNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterPartnerNames(responsePlanId);
  }

  _fetchPartnerNames() {
    if (!this.partnerNamesUrl) {
      return;
    }

    const self = this;
    const thunk = (this.$.partnerNames as EtoolsPrpAjaxEl).thunk();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All'
        }].concat(res.data || []));
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('cluster-partner-filter', ClusterPartnerFilter);
