import {html} from '@polymer/polymer';
import "@polymer/iron-location/iron-location";
import "@polymer/iron-location/iron-query-params";
import "../dropdown-filter/searchable-dropdown-filter.html";
import "../../etools-prp-ajax.html";
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterMixin from '../../../mixins/filter-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from "../../../endpoints";
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 * @appliesMixin FilterDependenciesMixin
 */
class CheckboxFilter extends UtilsMixin(FilterMixin(FilterDependenciesMixin(ReduxConnectedElement))) {
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
        id="activities"
        url="[[activitiesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="Activity"
        name="activity"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }

  // properties: {
  //   queryParams: Object,

  //   value: String,
  // },

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeActivitiesUrl(responsePlanId)'})
  activitiesUrl = '';

  @property({type: Array, computed: 'getReduxStateArray(state.app.current)'})
  data = [];

  @property({type: Object})
  defaultParams = {page_size: 99999};

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchActivities(activitiesUrl, params)'];
  }

  _computeActivitiesUrl(responsePlanId: string) {
    return Endpoints.partnerActivityList(responsePlanId);
  };

  _fetchActivities() {
    this.debounce('fetch-activities', function() {
      var self = this;

      activities.abort();

      this.$.activities.thunk()()
        .then(function(res) {
          self.set('data', [{
            id: '',
            title: 'All',
          }].concat(res.data.results));
        })
        .catch(function(err) { // jshint ignore:line
          // TODO: error handling
        });
    }, 100);
  };

  detached() {
    this.$.activities.abort();

    if (this.isDebouncerActive('fetch-activities')) {
      this.cancelDebouncer('fetch-activities');
    }
  };
}

window.customElements.define('checkbox-filter', CheckboxFilter);
