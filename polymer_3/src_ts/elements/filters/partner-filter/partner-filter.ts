import {html} from '@polymer/polymer';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from "../../../endpoints";
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PartnerFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="partnerNames"
        url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
      label="[[localize('partner')]]"
      name="partner"
      value="[[computedValue]]"
      data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }


  @property({type: String, computed: '_computeUrl(responsePlanID)', observer: '_fetchPartnerNames'})
  partnerNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(state.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String})
  computedValue!: string;

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
    return Endpoints.clusterPartnerNames(responsePlanID);
  };

  _computeValue(data, value) {
    this._debouncer = Polymer.Debouncer.debounce('compute-value',
      Polymer.Async.timeOut.after(250),
      function() {
        var index = data.findIndex(function(item) {
          return value === String(item.id);
        });

        this.set('computedValue', data[index === -1 ? 0 : index].id);
      }, 100);
  };

  _fetchPartnerNames() {
    var self = this;

    // this.$.partnerNames.abort();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
    (this.$.activities as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        var data = (self.required ? [] : [{
          id: '',
          title: 'All',
        }]).concat(res.data);

        self.set('data', data);
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  };

  detached() {
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();

    if (Debouncer.isActive('compute-value')) {
      Debouncer.cancel('compute-value');
    }
  };
}

window.customElements.define('partner-filter', PartnerFilter);
