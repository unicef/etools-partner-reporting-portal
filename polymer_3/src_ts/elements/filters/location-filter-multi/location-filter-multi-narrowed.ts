import {html} from '@polymer/polymer';
import "@polymer/iron-location/iron-location";
import "@polymer/iron-location/iron-query-params";
import "../dropdown-filter/searchable-dropdown-filter.html";
import "../../etools-prp-ajax.html";
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';

import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from "../../../endpoints";
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';


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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('location')]]"
        name="locs"
        value="[[value]]"
        on-value-changed="_onValueChanged"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  `;
  }

  @property({type: String, computed: '_computeLocationsUrl(responsePlanId)'})
  locationsUrl = '';

  @property({type: String, computed: 'getReduxStateArray(state.responsePlans.currentID)'})
  responsePlanId = [];

  @property({type: Array})
  data!: any;

  @property({type: Boolean})
  pending = false;

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchLocations(locationsUrl, params)'];
  }

  _computeActivitiesUrl(responsePlanId: string) {
    return Endpoints.clusterLocationNames(responsePlanId);
  };

  _fetchActivities() {

    this._debouncer = Polymer.Debouncer.debounce('fetch-locations',
      Polymer.Async.timeOut.after(250),
      () => {
        var self = this;
        this.set('pending', true);

        (this.$.locations as EtoolsPrpAjaxEl).abort();
        (this.$.locations as EtoolsPrpAjaxEl).thunk()()
          .then(function(res: any) {
            self.set('pending', false);
            self.set('data', res.data.results);
          })
          .catch(function(err: any) { // jshint ignore:line
            // TODO: error handling
            self.set('pending', false);
          });

      });
  };

  _onValueChanged(e: CustomEvent) {

    if (e.detail.value === '') {
      return;
    }
  };

  detached() {
    (this.$.locations as EtoolsPrpAjaxEl).abort();

    if (Debouncer.isActive('fetch-locations')) {
      Debouncer.cancel('fetch-locations');
    }
  };
}

window.customElements.define('location-filter-multi-narrowed', LocationFilterMultiNarrowed);
