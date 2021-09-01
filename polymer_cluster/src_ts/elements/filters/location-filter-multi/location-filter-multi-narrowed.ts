import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {property} from '@polymer/decorators';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class LocationFilterMultiNarrowed extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="locations" url="[[locationsUrl]]" params="[[params]]"> </etools-prp-ajax>

      <dropdown-filter-multi
        label="[[localize('location')]]"
        name="locs"
        value="[[value]]"
        on-value-changed="_onValueChanged"
        data="[[data]]"
        disabled="[[pending]]"
      >
      </dropdown-filter-multi>
    `;
  }

  @property({type: String, computed: '_computeLocationsUrl(responsePlanId)'})
  locationsUrl = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: Boolean})
  pending = false;

  @property({type: Object})
  params!: GenericObject;

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchLocations(locationsUrl, params)'];
  }

  private _debouncer!: Debouncer;

  _computeLocationsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterLocationNames(responsePlanId);
  }

  _fetchLocations() {
    if (!this.locationsUrl || !this.params) {
      return;
    }

    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
      this.set('pending', true);

      (this.$.locations as EtoolsPrpAjaxEl).abort();
      (this.$.locations as EtoolsPrpAjaxEl)
        .thunk()()
        .then((res: any) => {
          this.set('pending', false);
          this.set('data', res.data.results);
        })
        .catch((_err: GenericObject) => {
          // TODO: error handling
          this.set('pending', false);
        });
    });
  }

  _onValueChanged(e: CustomEvent) {
    if (e.detail.value === '') {
      return;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();

    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }
}

window.customElements.define('location-filter-multi-narrowed', LocationFilterMultiNarrowed);
