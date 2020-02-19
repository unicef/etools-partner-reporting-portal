import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from "../../../endpoints";
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';

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

    <etools-prp-ajax
        id="partnerProjects"
        url="[[partnerProjectsUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="Partner Projects"
        name="partner_projects"
        value="[[value]]"
        data="[[data]]">
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

  _computeLocationNamesUrl(responsePlanID: string) {
    return Endpoints.clusterIndicatorLocations(responsePlanID);
  };

  static get observers() {
    return ['_computeValue(data, value)'];
  }


  _computeUrl(responsePlanID: string) {
    return Endpoints.plannedActions(responsePlanID);
  };

  _fetchPartnerProjects() {
    var self = this;

    // this.$.partnerProjects.abort();
    (this.$.partnerProjects as EtoolsPrpAjaxEl).abort();
    (this.$.partnerProjects as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('data', res.data.results);
      })
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling
      });
  };

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.partnerProjects as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('partner-project-filter-multi', PartnerProjectFilterMulti);
