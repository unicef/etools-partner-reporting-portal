import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {property} from '@polymer/decorators';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {GenericObject} from '../../../typings/globals.types';

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


  @property({type: String, computed: '_computeUrl(responsePlanId)', observer: '_fetchPartnerNames'})
  partnerNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String})
  computedValue!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  data = [];

  @property({type: Boolean})
  required!: boolean;


  private _debouncer!: Debouncer;

  static get observers() {
    return ['_computeValue(data, value)'];
  }

  _computeLocationNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterIndicatorLocations(responsePlanId);
  }

  _computeUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterPartnerNames(responsePlanId);
  }

  _computeValue(data: any, value: string) {
    const self = this;
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      function() {
        var index = data.findIndex(function(item: GenericObject) {
          return value === String(item.id);
        });
        const item = data[index === -1 ? 0 : index];
        self.set('computedValue', item ? item.id : '');
      });
  }

  _fetchPartnerNames() {
    const self = this;

    // this.$.partnerNames.abort();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();
    (this.$.partnerNames as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        const data = (self.required ? [] : [{
          id: '',
          title: 'All',
        }]).concat(res.data || []);

        self.set('data', data);
      })
      // @ts-ignore
      .catch(function(err: any) {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.partnerNames as EtoolsPrpAjaxEl).abort();

    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }

}

window.customElements.define('partner-filter', PartnerFilter);
