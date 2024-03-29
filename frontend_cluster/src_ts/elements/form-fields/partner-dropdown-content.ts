import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../endpoints';
import '../../etools-prp-common/elements/etools-prp-permissions';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class PartnerDropdownContent extends ReduxConnectedElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="partnerNames" url="[[partnerNamesUrl]]" params="[[params]]"> </etools-prp-ajax>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>
    `;
  }

  @property({type: String, computed: '_computePartnerNamesUrl(responsePlanID)', observer: '_fetchPartnerNames'})
  partnerNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Array, notify: true})
  partners = [];

  @property({type: Object, computed: '_computeParams(clusters)'})
  params!: GenericObject;

  public static get observers() {
    return ['_fetchPartnerNames(partnerNamesUrl, params)'];
  }

  _computePartnerNamesUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.clusterPartnerNames(responsePlanID);
  }

  _computeParams(clusters: any[]) {
    if (clusters) {
      return {clusters: clusters.join(',')};
    }
    return {};
  }

  _fetchPartnerNames() {
    if (!this.partnerNamesUrl) {
      return;
    }

    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
    (this.$.partnerNames as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set('partners', res.data);
      })
      // @ts-ignore
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('partner-dropdown-content', PartnerDropdownContent);

export {PartnerDropdownContent as PartnerDropdownContentEl};
