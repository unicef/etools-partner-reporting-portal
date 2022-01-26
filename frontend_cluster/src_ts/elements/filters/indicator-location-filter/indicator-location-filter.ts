import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="locationNames" url="[[locationNamesUrl]]"> </etools-prp-ajax>

      <searchable-dropdown-filter
        label="[[localize('location')]]"
        option-label="name"
        name="location"
        value="[[value]]"
        data="[[data]]"
      >
      </searchable-dropdown-filter>
    `;
  }

  @property({type: String, computed: '_computeLocationNamesUrl(responsePlanId)', observer: '_fetchLocationNames'})
  locationNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  data = [];

  _computeLocationNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterIndicatorLocations(responsePlanId);
  }

  _fetchLocationNames() {
    if (!this.locationNamesUrl) {
      return;
    }

    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
    (this.$.locationNames as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set(
          'data',
          [
            {
              id: '',
              name: 'All'
            }
          ].concat(res.data || [])
        );
      })
      // @ts-ignore
      .catch((_err) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('indicator-location-filter', IndicatorLocationFilter);
