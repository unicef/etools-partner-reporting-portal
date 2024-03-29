import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]"
        option-label="name">
    </searchable-dropdown-filter>
  </template>
  `;
  }

  @property({type: String, computed: '_computeLocationNamesUrl(responsePlanId)', observer: '_fetchLocationNames'})
  locationNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computeLocationNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterLocationNames(responsePlanId);
  }

  _fetchLocationNames() {
    if (!this.locationNamesUrl) {
      return;
    }

    const thunk = (this.$.locationNames as EtoolsPrpAjaxEl).thunk();
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set(
          'data',
          [
            {
              id: '',
              name: 'All'
            }
          ].concat(res.data.results || [])
        );
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('cluster-location-filter', ClusterLocationFilter);
