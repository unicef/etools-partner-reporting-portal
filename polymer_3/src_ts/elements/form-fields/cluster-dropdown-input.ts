import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import {DropdownFormInputEl} from './dropdown-form-input';
import '../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import Endpoints from '../../endpoints';
import {GenericObject} from '../../typings/globals.types';

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

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanId)', observer: '_fetchClusterNames'})
  clusterNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

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

  _computeClusterNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterNames(responsePlanId);
  }

  _computeLoading(data: any[]) {
    return !data.length;
  }

  _fetchClusterNames() {
    if (!this.clusterNamesUrl) {
      return;
    }

    const self = this;
    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();

    (this.$.clusterNames as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: GenericObject) => {
        self.set('data', res.data);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _computeInvalid(required: boolean, value?: number) {
    return required && !value;
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
