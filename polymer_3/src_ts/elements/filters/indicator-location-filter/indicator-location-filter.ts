import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';

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

    <etools-prp-ajax
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
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
    const self = this;
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
    (this.$.locationNames as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All',
        }].concat(res.data || []));
      })
      // @ts-ignore
      .catch(function(err) {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('indicator-location-filter', IndicatorLocationFilter);
