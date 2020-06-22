import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class PartnerProjectFilterMulti extends ReduxConnectedElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="partnerProjects" url="[[partnerProjectsUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi label="Partner Projects" name="partner_projects" value="[[value]]" data="[[data]]">
      </dropdown-filter-multi>
    `;
  }

  @property({type: String, computed: '_computePartnerProjectsUrl(responsePlanId)', observer: '_fetchPartnerProjects'})
  partnerProjectsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  data = [];

  _computePartnerProjectsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.plannedActions(responsePlanId);
  }

  _fetchPartnerProjects() {
    if (!this.partnerProjectsUrl) {
      return;
    }

    const self = this;
    (this.$.partnerProjects as EtoolsPrpAjaxEl).abort();
    (this.$.partnerProjects as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        self.set('data', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.partnerProjects as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('partner-project-filter-multi', PartnerProjectFilterMulti);
