import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import {DropdownFormInputEl} from './dropdown-form-input';
import '../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import Endpoints from '../../endpoints';

/**
 * @polymer
 * @customElement
 */
class ClusterDropdownInput extends ReduxConnectedElement {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="clusterNames"
        url="[[clusterNamesUrl]]">
    </etools-prp-ajax>

    <template is="dom-if" if="[[!loading]]">
      <dropdown-form-input
        id="field"
        label="Cluster"
        name="cluster"
        disabled="[[disabled]]"
        required="[[required]]"
        value="{{value}}"
        data="[[data]]">
      </dropdown-forn-input>
    </template>
  `;
  }

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanID)', observer: '_fetchClusterNames'})
  clusterNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Boolean, computed: '_computeLoading(data)'})
  loading = true;

  @property({type: Boolean})
  required = false;

  @property({type: Boolean, notify: true, computed: '_computeInvalid(required, value)'})
  invalid = true;

  @property({type: Array})
  data = [];

  @property({type: Number, notify: true})
  value!: number;


  _computeClusterNamesUrl(responsePlanID: string) {
    return Endpoints.clusterNames(responsePlanID);
  }

  _computeLoading(data: any[]) {
    return !data.length;
  }

  _fetchClusterNames() {
    const self = this;

    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();

    (this.$.clusterNames as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('data', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  }

  _computeInvalid(required: Boolean, value?: Number) {
    return this.required && !value;
  }

  validate() {
    return (this.shadowRoot!.querySelector('#field') as DropdownFormInputEl).validate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('cluster-dropdown-input', ClusterDropdownInput);

export {ClusterDropdownInput as ClusterDropdownInputEl};
